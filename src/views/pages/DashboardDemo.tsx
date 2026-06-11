import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardLearningPath from "./DashboardLearningPath";
import learningPathV2Service from "../../services/learning_path_v2.service";

const missingRequirementLabel: Record<string, string> = {
  initial_assessment: "Thiếu bài entry test.",
  learning_path_setup: "Thiếu thiết lập lộ trình.",
  target_completion_date: "Thiếu deadline.",
  time_setup: "Thiếu thời gian học.",
};

const unwrapApiData = (response: any) => response?.data ?? response;

const toDashboardPlanFromV2Overview = (overview: any, generationContext: any) => {
  const learningPath = overview?.learning_path;
  const weekStudies = overview?.week_studies ?? [];
  const currentCycle = overview?.current_cycle;
  const entryScore = generationContext.latest_initial_test.score;

  const weekStudyIds =
    weekStudies.length > 0
      ? weekStudies.map((week: any) => ({
          ...week,
          days:
            currentCycle?.week_study?._id === week._id
              ? currentCycle?.day_studies ?? week.days ?? []
              : week.days ?? [],
        }))
      : currentCycle?.week_study
        ? [
            {
              ...currentCycle.week_study,
              days: currentCycle.day_studies ?? [],
            },
          ]
        : [];

  return {
    learningPath_id: {
      ...learningPath,
      entry_score: entryScore,
      week_study_ids: weekStudyIds,
    },
    learning_path_v2: overview,
  };
};

export default function DashboardDemo() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [hasPlan, setHasPlan] = React.useState(false);
  const [plan, setPlan] = React.useState<any | null>(null);
  const [open, setOpen] = React.useState(false);
  const [generationContext, setGenerationContext] = React.useState<any>(null);
  const [loadingGenerationContext, setLoadingGenerationContext] =
    React.useState(false);
  const [creatingPath, setCreatingPath] = React.useState(false);

  const loadGenerationContext = React.useCallback(async () => {
    try {
      setLoadingGenerationContext(true);
      const response = await learningPathV2Service.getGenerationContext();
      const context = unwrapApiData(response);
      setGenerationContext(context);
      return context;
    } catch (error) {
      console.error("Tải generation context LearningPath v2 thất bại", error);
      setGenerationContext(null);
      return null;
    } finally {
      setLoadingGenerationContext(false);
    }
  }, []);

  const loadV2OverviewIfReady = React.useCallback(async (context: any) => {
    const learningPath = context?.learning_path;
    const learningPathId = learningPath?._id;
    const hasCycle = (learningPath?.week_study_ids?.length ?? 0) > 0;

    if (!learningPathId || !hasCycle) {
      return false;
    }

    const overviewResponse = await learningPathV2Service.getOverview(
      learningPathId
    );
    const overview = unwrapApiData(overviewResponse);
    setPlan(toDashboardPlanFromV2Overview(overview, context));
    setHasPlan(true);
    setOpen(false);
    return true;
  }, []);

  React.useEffect(() => {
    const fetchPlan = async () => {
      try {
        const context = await loadGenerationContext();
        const loadedV2 = await loadV2OverviewIfReady(context);
        if (loadedV2) return;
        setOpen(true);
      } catch (error) {
        console.error("Tải lộ trình học thất bại", error);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [loadGenerationContext, loadV2OverviewIfReady]);

  const handleConfirm = async () => {
    const learningPathId = generationContext?.learning_path?._id;

    if (!learningPathId) {
      alert("Chưa có thiết lập lộ trình. Vui lòng hoàn tất /plan trước.");
      return;
    }

    if (!generationContext?.can_generate) {
      alert("Chưa đủ dữ liệu để tạo lộ trình.");
      return;
    }

    try {
      setCreatingPath(true);
      await learningPathV2Service.initialGeneration(learningPathId);

      const refreshedContext = await loadGenerationContext();

      const overviewResponse = await learningPathV2Service.getOverview(
        learningPathId
      );
      const overview = unwrapApiData(overviewResponse);
      setPlan(toDashboardPlanFromV2Overview(overview, refreshedContext));
      setHasPlan(true);
      setOpen(false);
    } catch (error) {
      console.error("Tạo LearningPath v2 thất bại", error);
      alert("Không thể tạo lộ trình. Vui lòng thử lại.");
    } finally {
      setCreatingPath(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (hasPlan && plan) return <DashboardLearningPath plan={plan} />;

  const latestInitialTest = generationContext?.latest_initial_test;
  const learningPath = generationContext?.learning_path;
  const missingRequirements = generationContext?.missing_requirements ?? [];
  const canGenerate = generationContext?.can_generate === true;

  return (
    <MainLayout>
      <Modal
        open={open}
        onClose={() => {
          if (!creatingPath) setOpen(false);
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
            minWidth: { xs: 320, sm: 560 },
            maxWidth: 720,
          }}
        >
          <Stack spacing={2.5}>
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                Tạo lộ trình LearningPath v2
              </Typography>
              <Typography color="text.secondary">
                Dữ liệu được lấy từ entry test và thiết lập đã lưu trong DB.
              </Typography>
            </Box>

            {loadingGenerationContext ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Stack spacing={1}>
                  <Typography fontWeight={700}>Bài entry test gần nhất</Typography>
                  {latestInitialTest ? (
                    <Box>
                      <Typography>
                        Điểm: {latestInitialTest.score ?? "N/A"}
                      </Typography>
                      <Typography>
                        Thời điểm nộp:{" "}
                        {latestInitialTest.submit_at
                          ? new Date(
                              latestInitialTest.submit_at
                            ).toLocaleString()
                          : "N/A"}
                      </Typography>
                      <Typography>
                        Thời lượng: {latestInitialTest.duration ?? 0} giây
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                        {(latestInitialTest.parts ?? []).map((part: any) => (
                          <Chip
                            key={part.part_name}
                            size="small"
                            label={`${part.part_name}: ${Math.round(
                              Number(part.accuracy || 0)
                            )}%`}
                          />
                        ))}
                      </Stack>
                    </Box>
                  ) : (
                    <Alert
                      severity="warning"
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          onClick={() =>
                            navigate("/overview-test?type=entry-test")
                          }
                        >
                          Làm entry test
                        </Button>
                      }
                    >
                      Bạn chưa có bài entry test.
                    </Alert>
                  )}
                </Stack>

                <Divider />

                <Stack spacing={1}>
                  <Typography fontWeight={700}>Thiết lập lộ trình</Typography>
                  {learningPath ? (
                    <Box>
                      <Typography>
                        Điểm mục tiêu: {learningPath.target_score ?? "N/A"}
                      </Typography>
                      <Typography>
                        Hạn chót:{" "}
                        {learningPath.target_completion_date
                          ? new Date(
                              learningPath.target_completion_date
                            ).toLocaleDateString()
                          : "N/A"}
                      </Typography>
                      <Typography>
                        Thời gian/ngày: {learningPath.time_per_day ?? 0} phút
                      </Typography>
                      <Typography>
                        Số ngày học/tuần: {learningPath.days_per_week ?? 0}
                      </Typography>
                    </Box>
                  ) : (
                    <Alert
                      severity="warning"
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          onClick={() => navigate("/plan")}
                        >
                          Thiết lập
                        </Button>
                      }
                    >
                      Bạn chưa thiết lập mục tiêu học.
                    </Alert>
                  )}
                </Stack>

                {missingRequirements.length > 0 && (
                  <Alert severity="info">
                    <Stack spacing={0.5}>
                      {missingRequirements.map((item: string) => (
                        <span key={item}>
                          {missingRequirementLabel[item] ?? item}
                        </span>
                      ))}
                    </Stack>
                  </Alert>
                )}
              </>
            )}

            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={!canGenerate || creatingPath || loadingGenerationContext}
              fullWidth
            >
              {creatingPath ? "Đang tạo lộ trình..." : "Tạo lộ trình ngay"}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </MainLayout>
  );
}
