import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Fade,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Grow,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { TargetScoreStep } from "../../components/planWizard/Step1";
import { EndDateStep } from "../../components/planWizard/Step2";
import { DetailedPlanStep } from "../../components/planWizard/Step3";
import { HeaderPlanWizard } from "../../components/planWizard/Header";
import learningPathV2Service from "../../services/learning_path_v2.service";
import { showSnackbar } from "../../stores/snackbarSlice";

function PlanStepper({ activeStep }: { activeStep: number }) {
  const steps = ["Điểm", "Hạn chót", "Kế hoạch chi tiết"];
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

const createDefaultRange = () => {
  const start = new Date();
  const end = new Date(start);
  end.setDate(start.getDate() + 56);
  return { start, end };
};

const createEmptyWeeklyMinutes = () => ({
  monday: 0,
  tuesday: 0,
  wednesday: 0,
  thursday: 0,
  friday: 0,
  saturday: 0,
  sunday: 0,
});

const MAX_TARGET_SCORE_GAP = 300;

export default function PlanWizardDemo() {
  const [searchParams] = useSearchParams();
  const scoreString = searchParams.get("score");
  const scoreNumber = scoreString ? Number(scoreString) : 0;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeStep, setActiveStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [targetScore, setTargetScore] = React.useState(
    scoreNumber > 0 ? Math.min(990, Math.max(200, scoreNumber + 100)) : 650
  );
  const [planRange, setPlanRange] = React.useState<{
    start: Date | null;
    end: Date | null;
  }>(createDefaultRange);
  const [weeklyMinutesByDay, setWeeklyMinutesByDay] = React.useState<
    Record<string, number>
  >(createEmptyWeeklyMinutes);

  const targetScoreValidationMessage = React.useMemo(() => {
    if (!scoreNumber || scoreNumber <= 0) return "";

    if (targetScore <= scoreNumber) {
      return `Mục tiêu cần cao hơn điểm đầu vào (${scoreNumber}) để hệ thống có cơ sở thiết kế lộ trình tăng trưởng rõ ràng. Vui lòng chọn mục tiêu lớn hơn điểm hiện tại.`;
    }

    const maxAllowedTarget = Math.min(990, scoreNumber + MAX_TARGET_SCORE_GAP);
    const minAllowedTarget = Math.min(990, scoreNumber + 5);
    if (targetScore > maxAllowedTarget) {
      return `Để lộ trình khả thi và đo lường được, hệ thống chỉ hỗ trợ mục tiêu cao hơn tối đa ${MAX_TARGET_SCORE_GAP} điểm so với điểm đầu vào. Với điểm hiện tại ${scoreNumber}, mục tiêu phù hợp nên nằm trong khoảng ${minAllowedTarget}–${maxAllowedTarget}.`;
    }

    return "";
  }, [scoreNumber, targetScore]);

  const buildLearningPathV2SetupPayload = () => {
    if (!targetScore || targetScore <= 0) {
      throw new Error("Thiếu điểm mục tiêu.");
    }

    if (!planRange.end) {
      throw new Error("Thiếu deadline.");
    }

    const dayMinutes = Object.values(weeklyMinutesByDay).map((value) =>
      Number(value || 0)
    );
    const totalWeeklyMinutes = dayMinutes.reduce(
      (sum, minutes) => sum + minutes,
      0
    );
    const daysPerWeek = dayMinutes.filter((minutes) => minutes > 0).length;
    const timePerDay = Math.round(totalWeeklyMinutes / 7);

    if (totalWeeklyMinutes <= 0 || timePerDay <= 0 || daysPerWeek <= 0) {
      throw new Error("Thiếu thời gian học trong tuần.");
    }

    return {
      target_score: targetScore,
      target_completion_date: planRange.end.toISOString(),
      time_per_day: timePerDay,
      days_per_week: daysPerWeek,
    };
  };

  const handleFinishSetup = async () => {
    try {
      setSubmitting(true);
      await learningPathV2Service.setup(buildLearningPathV2SetupPayload());
      navigate("/programs");
    } catch (error: any) {
      console.error("Lưu thiết lập LearningPath v2 thất bại", error);
      dispatch(
        showSnackbar({
          message:
            error?.message ||
            "Không thể lưu thiết lập lộ trình. Vui lòng thử lại.",
          severity: "error",
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (activeStep === 0 && targetScoreValidationMessage) {
      return;
    }

    if (activeStep < 2) {
      setActiveStep((prev) => prev + 1);
      return;
    }

    await handleFinishSetup();
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflowY: "auto",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4ecf5 100%)",
      }}
    >
      <Container
        className="max-w-[1000px] mx-auto p-4 sm:p-6"
        sx={{
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.25)",
          bgcolor: "rgba(255,255,255,0.4)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          py: 6,
          my: 4,
        }}
      >
        <HeaderPlanWizard />

        <Card
          className="!rounded-xl shadow-lg flex-grow"
          sx={{
            border: "1px solid rgba(255,255,255,.15)",
            bgcolor: "rgba(255,255,255,.10)",
            backdropFilter: "blur(16px)",
            display: "flex",
            flexDirection: "column",
            mt: 2,
          }}
        >
          <CardContent
            className="p-4 sm:p-6"
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Box sx={{ mb: 3 }}>
              <PlanStepper activeStep={activeStep} />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              {activeStep === 0 && (
                <Grow in mountOnEnter unmountOnExit>
                  <Box>
                    <TargetScoreStep
                      score={scoreNumber}
                      targetScore={targetScore}
                      onTargetScoreChange={setTargetScore}
                      validationMessage={targetScoreValidationMessage}
                    />
                  </Box>
                </Grow>
              )}
              {activeStep === 1 && (
                <Fade in mountOnEnter unmountOnExit>
                  <Box>
                    <EndDateStep
                      score={scoreNumber}
                      targetScore={targetScore}
                      planRange={planRange}
                      onPlanRangeChange={setPlanRange}
                    />
                  </Box>
                </Fade>
              )}
              {activeStep === 2 && (
                <Fade in mountOnEnter unmountOnExit>
                  <Box>
                    <DetailedPlanStep
                      startScore={scoreNumber}
                      planStart={planRange.start}
                      planEnd={planRange.end}
                      targetScore={targetScore}
                      weeklyMinutesByDay={weeklyMinutesByDay}
                      onWeeklyMinutesByDayChange={setWeeklyMinutesByDay}
                    />
                  </Box>
                </Fade>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
            >
              <Button
                variant="outlined"
                size="large"
                onClick={() => setActiveStep((prev) => prev - 1)}
                disabled={activeStep === 0 || submitting}
                fullWidth
              >
                Quay lại
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleNext}
                disabled={submitting || (activeStep === 0 && Boolean(targetScoreValidationMessage))}
                fullWidth
              >
                {activeStep < 2
                  ? "Tiếp tục"
                  : submitting
                    ? "Đang lưu..."
                    : "Bắt đầu"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
