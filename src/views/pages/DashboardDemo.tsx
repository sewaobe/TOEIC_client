import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
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

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDuration = (seconds?: number) => {
  const value = Number(seconds ?? 0);
  if (!Number.isFinite(value) || value <= 0) return "N/A";
  const minutes = Math.floor(value / 60);
  const remainingSeconds = Math.round(value % 60);
  if (minutes <= 0) return `${remainingSeconds} giây`;
  return `${minutes} phút ${remainingSeconds} giây`;
};

function MetricTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        borderColor: "#DDE3F0",
        bgcolor: "#F8FAFF",
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            color: "#2653D9",
            bgcolor: "#EEF4FF",
            flex: "0 0 auto",
          }}
        >
          {icon}
        </Box>
        <Box minWidth={0}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#6A728C" }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 900, color: "#101A3D" }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

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

  const refreshLearningPathV2Overview = React.useCallback(async () => {
    const refreshedContext = await loadGenerationContext();
    const loadedV2 = await loadV2OverviewIfReady(refreshedContext);

    if (!loadedV2) {
      setOpen(true);
    }
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

  if (hasPlan && plan) {
    return (
      <DashboardLearningPath
        plan={plan}
        onRefresh={refreshLearningPathV2Overview}
      />
    );
  }

  const latestInitialTest = generationContext?.latest_initial_test;
  const learningPath = generationContext?.learning_path;
  const missingRequirements = generationContext?.missing_requirements ?? [];
  const canGenerate = generationContext?.can_generate === true;

  return (
    <MainLayout>
      <Dialog
        open={open}
        onClose={() => {
          if (!creatingPath) setOpen(false);
        }}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid #DDE3F0",
            boxShadow: "0 24px 70px rgba(16, 26, 61, 0.18)",
          },
        }}
      >
        <DialogContent sx={{ p: 0, bgcolor: "#F5F7FB" }}>
          <Box
            sx={{
              px: { xs: 2.5, md: 4 },
              py: { xs: 2.5, md: 3 },
              bgcolor: "#FFFFFF",
              borderBottom: "1px solid #DDE3F0",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#EEF4FF",
                    color: "#2653D9",
                  }}
                >
                  <AutoAwesomeIcon />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 20, fontWeight: 900, color: "#101A3D" }}>
                    Tạo lộ trình LearningPath v2
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: "#4A5578", mt: 0.5 }}>
                    Kiểm tra dữ liệu đầu vào trước khi hệ thống tạo cycle học cá nhân hóa.
                  </Typography>
                </Box>
              </Stack>
              <Chip
                color={canGenerate ? "success" : "warning"}
                variant="outlined"
                icon={canGenerate ? <AssignmentTurnedInIcon /> : <ErrorOutlineIcon />}
                label={canGenerate ? "Sẵn sàng tạo" : "Cần bổ sung dữ liệu"}
                sx={{ fontWeight: 800, borderRadius: 999 }}
              />
            </Stack>
          </Box>

          <Box sx={{ p: { xs: 2.5, md: 4 } }}>
            <Stack spacing={2.5}>
              {loadingGenerationContext ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <Paper
                      variant="outlined"
                      sx={{ p: 2.25, borderRadius: 3, borderColor: "#DDE3F0", bgcolor: "#FFFFFF" }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                        <TrackChangesIcon color="primary" />
                        <Typography fontWeight={900} color="#101A3D">
                          Bài entry test gần nhất
                        </Typography>
                      </Stack>
                      {latestInitialTest ? (
                        <Stack spacing={1.25}>
                          <MetricTile
                            icon={<AssignmentTurnedInIcon fontSize="small" />}
                            label="Điểm đầu vào"
                            value={latestInitialTest.score ?? "N/A"}
                          />
                          <MetricTile
                            icon={<CalendarMonthOutlinedIcon fontSize="small" />}
                            label="Thời điểm nộp"
                            value={formatDateTime(latestInitialTest.submit_at)}
                          />
                          <MetricTile
                            icon={<ScheduleOutlinedIcon fontSize="small" />}
                            label="Thời lượng"
                            value={formatDuration(latestInitialTest.duration)}
                          />
                          <Stack direction="row" flexWrap="wrap" gap={1} mt={0.5}>
                            {(latestInitialTest.parts ?? []).map((part: any) => (
                              <Chip
                                key={part.part_name}
                                size="small"
                                label={`${part.part_name}: ${Math.round(Number(part.accuracy || 0))}%`}
                                sx={{ borderRadius: 999, fontWeight: 700 }}
                              />
                            ))}
                          </Stack>
                        </Stack>
                      ) : (
                        <Alert
                          severity="warning"
                          action={
                            <Button
                              color="inherit"
                              size="small"
                              onClick={() => navigate("/overview-test?type=entry-test")}
                            >
                              Làm entry test
                            </Button>
                          }
                        >
                          Bạn chưa có bài entry test. Hãy hoàn thành bài đánh giá đầu vào để hệ thống có dữ liệu năng lực ban đầu.
                        </Alert>
                      )}
                    </Paper>

                    <Paper
                      variant="outlined"
                      sx={{ p: 2.25, borderRadius: 3, borderColor: "#DDE3F0", bgcolor: "#FFFFFF" }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                        <CalendarMonthOutlinedIcon color="primary" />
                        <Typography fontWeight={900} color="#101A3D">
                          Thiết lập lộ trình
                        </Typography>
                      </Stack>
                      {learningPath ? (
                        <Stack spacing={1.25}>
                          <MetricTile
                            icon={<TrackChangesIcon fontSize="small" />}
                            label="Điểm mục tiêu"
                            value={learningPath.target_score ?? "N/A"}
                          />
                          <MetricTile
                            icon={<CalendarMonthOutlinedIcon fontSize="small" />}
                            label="Hạn hoàn thành"
                            value={formatDate(learningPath.target_completion_date)}
                          />
                          <MetricTile
                            icon={<ScheduleOutlinedIcon fontSize="small" />}
                            label="Nhịp học"
                            value={`${learningPath.time_per_day ?? 0} phút/ngày · ${learningPath.days_per_week ?? 0} ngày/tuần`}
                          />
                        </Stack>
                      ) : (
                        <Alert
                          severity="warning"
                          action={
                            <Button color="inherit" size="small" onClick={() => navigate(`/plan?score=${latestInitialTest.score}`)}>
                              Thiết lập
                            </Button>
                          }
                        >
                          Bạn chưa thiết lập mục tiêu học. Hãy cấu hình điểm mục tiêu, deadline và thời gian học trước khi tạo lộ trình.
                        </Alert>
                      )}
                    </Paper>
                  </Box>

                  {missingRequirements.length > 0 && (
                    <Alert
                      severity="info"
                      sx={{ borderRadius: 2, border: "1px solid #B8D4FF", bgcolor: "#F3F8FF" }}
                    >
                      <Typography fontWeight={800} sx={{ mb: 0.75 }}>
                        Cần hoàn tất trước khi tạo lộ trình
                      </Typography>
                      <Stack spacing={0.75}>
                        {missingRequirements.map((item: string) => (
                          <Stack key={item} direction="row" spacing={1} alignItems="center">
                            <ErrorOutlineIcon sx={{ fontSize: 16 }} />
                            <span>{missingRequirementLabel[item] ?? item}</span>
                          </Stack>
                        ))}
                      </Stack>
                    </Alert>
                  )}
                </>
              )}

              {creatingPath && (
                <Alert
                  severity="info"
                  icon={<CircularProgress size={20} />}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid #B8D4FF",
                    bgcolor: "#F3F8FF",
                    alignItems: "center",
                  }}
                >
                  <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                    Đang tạo lộ trình học cá nhân hóa
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#4A5578", mb: 1 }}>
                    Hệ thống đang phân tích entry test, mục tiêu và thời gian học để sinh cycle đầu tiên.
                  </Typography>
                  <LinearProgress sx={{ borderRadius: 999 }} />
                </Alert>
              )}

              <Divider />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <Typography sx={{ fontSize: 13, color: "#6A728C", maxWidth: 520 }}>
                  Khi bấm tạo, hệ thống sẽ phân tích entry test, mục tiêu và thời gian học để sinh cycle đầu tiên cho LearningPath v2.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleConfirm}
                  disabled={!canGenerate || creatingPath || loadingGenerationContext}
                  startIcon={creatingPath ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 220 },
                    borderRadius: 2,
                    py: 1.25,
                    fontWeight: 900,
                    bgcolor: "#2653D9",
                    "&:hover": { bgcolor: "#1238C8" },
                  }}
                >
                  {creatingPath ? "Đang tạo lộ trình..." : "Tạo lộ trình ngay"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
