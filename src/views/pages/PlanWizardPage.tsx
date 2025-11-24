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
import { TargetScoreStep } from "../../components/planWizard/Step1";
import { EndDateStep } from "../../components/planWizard/Step2";
import { DetailedPlanStep } from "../../components/planWizard/Step3";
import { HeaderPlanWizard } from "../../components/planWizard/Header";

/* ==========================================================
   🧭 PlanStepper
========================================================== */
function PlanStepper({ activeStep }: { activeStep: number }) {
  const steps = ["Điểm", "Thời gian kết thúc", "Kế hoạch chi tiết"];
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

/* ==========================================================
   🎯 Main Component
========================================================== */
export default function PlanWizardDemo() {
  const [searchParams] = useSearchParams();
  const scoreString = searchParams.get("score");
  const scoreNumber: number = scoreString ? parseFloat(scoreString) : 0;

  const [activeStep, setActiveStep] = React.useState<number>(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (activeStep > 2) navigate("/programs");
  }, [activeStep]);

  return (
    // ✅ Fake body scroll wrapper
    <Box
      sx={{
        position: "fixed",
        inset: 0, // top, right, bottom, left = 0
        zIndex: 0,
        overflowY: "auto", // chỉ vùng này cuộn được
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
          my: 4
        }}
      >
        {/* Header */}
        <HeaderPlanWizard />

        {/* Card */}
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
            {/* Stepper */}
            <Box sx={{ mb: 3 }}>
              <PlanStepper activeStep={activeStep} />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Nội dung các step (không cuộn riêng nữa) */}
            <Box>
              {activeStep === 0 && (
                <Grow in mountOnEnter unmountOnExit>
                  <Box>
                    <TargetScoreStep score={scoreNumber} />
                  </Box>
                </Grow>
              )}
              {activeStep === 1 && (
                <Fade in mountOnEnter unmountOnExit>
                  <Box>
                    <EndDateStep score={scoreNumber} />
                  </Box>
                </Fade>
              )}
              {activeStep === 2 && (
                <Fade in mountOnEnter unmountOnExit>
                  <Box>
                    <DetailedPlanStep startScore={scoreNumber} />
                  </Box>
                </Fade>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Footer */}
            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
            >
              <Button
                variant="outlined"
                size="large"
                onClick={() => setActiveStep((prev) => prev - 1)}
                disabled={activeStep === 0}
                fullWidth
              >
                Quay lại
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => setActiveStep((prev) => prev + 1)}
                fullWidth
              >
                {activeStep < 2 ? "Tiếp tục" : "Bắt đầu"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
