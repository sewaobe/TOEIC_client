import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Rating,
  Alert,
  styled,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SpeedIcon from "@mui/icons-material/Speed";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MainLayout from "../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import LearningProgress from "../../components/learningProgress/LearningProgress";
import CloseIcon from "@mui/icons-material/Close";
// Import các icon bạn cần từ thư viện @mui/icons-material
import HeadphonesIcon from "@mui/icons-material/Headphones";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CreateIcon from "@mui/icons-material/Create";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SyncIcon from "@mui/icons-material/Sync";
import FlagIcon from "@mui/icons-material/Flag";
import BookIcon from "@mui/icons-material/Book";
import useLocalStorage from "../../hooks/useLocalStorage";
import { FeedbackLessonModal } from "../../components/modals/FeedbackLessonModal";
import LearningPathRoadmapCanvas from "../../components/learningPath/LearningPathRoadmapCanvas";
import { clearChatRouteState, setChatRouteState } from "../../utils/chatRouteState";
import learningPathV2Service from "../../services/learning_path_v2.service";
import learningPathService from "../../services/learningPath.service";
import { InactiveLearningPathModal } from "../../components/modals/InactiveLearningPathModal";

// Tạo một đối tượng chứa màu sắc để dễ dàng thay đổi và quản lý
const studyDayColors = {
  listening: "#1976d2", // Xanh dương
  reading: "#d32f2f", // Đỏ
  review: "#ed6c02", // Cam
  test: "#2e7d32", // Xanh lá
  default: "rgba(0, 0, 0, 0.54)", // Xám
};
/**
 * Trả về một component icon MUI đã được style sẵn màu sắc.
 * @param {number} dayValue - Giá trị đại diện cho ngày học (0-6).
 */
export function getStyledStudyIcon(dayValue: number) {
  switch (dayValue) {
    case 1:
      return styled(HeadphonesIcon)({ color: studyDayColors.listening });
    case 2:
      return styled(ChatBubbleOutlineIcon)({ color: studyDayColors.listening });
    case 3:
      return styled(CreateIcon)({ color: studyDayColors.reading });
    case 4:
      return styled(ArticleOutlinedIcon)({ color: studyDayColors.reading });
    case 5:
      return styled(MenuBookIcon)({ color: studyDayColors.reading });
    case 6:
      return styled(SyncIcon)({ color: studyDayColors.review });
    case 0:
      return styled(FlagIcon)({ color: studyDayColors.test });
    default:
      return styled(BookIcon)({ color: studyDayColors.default });
  }
}

/**
 * Trả về tên ngày học TOEIC tương ứng với giá trị đầu vào.
 * @param {number} dayValue - Giá trị đại diện cho ngày học (0-6).
 * @returns {string} - Tên của ngày học.
 */
function getStudyDayName(dayValue: number) {
  return `Stage ${dayValue}`;
}
// ===============================================
// Mock data (bạn nối real data sau)
// ===============================================
type DayStatus = "lock" | "todo" | "done" | "progress";
type DayType = "core" | "quiz";

interface Day {
  id: string;
  week: number;
  title: string;
  subtitle: string;
  no: number;
  status: DayStatus;
  progress?: number;
}

interface FeedbackDay {
  id: string;
  title: string;
  subtitle: string;
  no: number;
  status: DayStatus;
  cycleNo: number;
}

interface LearningPathFeedback {
  day_study_id: string | { _id?: string };
  rating: number;
  reasons?: string[];
  comment?: string;
  is_positive?: boolean;
  created_at?: string;
}

interface DashboardLearningPathProps {
  plan: any; // TODO: define đúng type từ backend
}
// ===============================================
// Small UI helpers (glass section / stat item / day item)
// ===============================================
function Section({ children }: { children: React.ReactNode }) {
  return (
    <Card
      variant="outlined"
      className="rounded-3xl"
      sx={{
        borderColor: "rgba(0,0,0,0.06)",
        bgcolor: "background.paper",
      }}
    >
      <CardContent className="p-4 sm:p-6">{children}</CardContent>
    </Card>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Paper
      variant="outlined"
      className="rounded-2xl"
      sx={{
        p: 2.5,
        borderColor: "rgba(0,0,0,0.06)",
        bgcolor: (t) =>
          t.palette.mode === "light" ? "#F8FAFC" : "rgba(255,255,255,0.06)",
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
          sx={{
            p: 1,
            borderRadius: 1.5,
            bgcolor: (t) =>
              t.palette.mode === "light" ? "#EEF2FF" : "rgba(255,255,255,0.08)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" fontWeight={800}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function DayItem({ data, onOpen }: { data: Day; onOpen: (l: Day) => void }) {
  const isLocked = data.status === "lock";
  const isDone = data.status === "done";
  const inProgress = data.status === "progress";

  const IconCustom = getStyledStudyIcon(data.no);

  return (
    <Paper
      variant="outlined"
      className="rounded-xl"
      sx={{
        p: 2.25,
        borderColor: "rgba(0,0,0,0.06)",
        bgcolor: (t) =>
          t.palette.mode === "light" ? "#FFFFFF" : "rgba(255,255,255,0.06)",
        opacity: isLocked ? 0.6 : 1,
        cursor: isLocked ? "not-allowed" : "pointer",
        transition: "all .15s ease",
        "&:hover": !isLocked
          ? {
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            transform: "translateY(-1px)",
          }
          : {},
      }}
      onClick={() => !isLocked && onOpen(data)}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1.5}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <IconCustom />
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {data.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data.subtitle}
            </Typography>
          </Box>
        </Stack>

        {isLocked ? (
          <Chip
            size="small"
            variant="outlined"
            icon={<LockOutlinedIcon />}
            label="Locked"
          />
        ) : isDone ? (
          <Chip
            size="small"
            color="success"
            icon={<CheckCircleIcon />}
            label="Hoàn thành"
            variant="outlined"
          />
        ) : inProgress ? (
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={`Đã làm ${data.progress ?? 0}%`}
          />
        ) : (
          <Chip size="small" color="primary" label="Bắt đầu" />
        )}
      </Stack>
    </Paper>
  );
}

// ===============================================
// Main: Dashboard
// ===============================================
function formatRemainingTime(targetDate?: string | Date | null): string {
  if (!targetDate) return "Chưa đặt hạn";

  const target = targetDate instanceof Date ? targetDate : new Date(targetDate);
  if (Number.isNaN(target.getTime())) return "Chưa đặt hạn";

  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Đã tới hạn";
  if (days === 1) return "1 ngày";
  if (days < 30) return `${days} ngày`;

  return `${Math.ceil(days / 7)} tuần`;
}

const normalizeDayStatus = (status?: string): DayStatus => {
  if (status === "completed" || status === "done") return "done";
  if (status === "in_progress" || status === "progress") return "progress";
  if (status === "lock" || status === "locked") return "lock";
  if (status === "todo") return "todo";
  return "lock";
};

const getFeedbackDayId = (feedback: LearningPathFeedback): string => {
  const dayStudyId = feedback.day_study_id;
  if (typeof dayStudyId === "string") return dayStudyId;
  return String(dayStudyId?._id ?? "");
};

const formatFeedbackDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
};

export default function DashboardLearningPath({
  plan,
  onRefresh,
}: DashboardLearningPathProps & { onRefresh?: () => Promise<void> }) {
  const navigate = useNavigate();
  // support both old shape { learningPath_id: LearningPath } and new shape LearningPath
  const lp = (plan && (plan.learningPath_id ?? plan)) || {};
  const [activeWeek, setActiveWeek] = React.useState<number>(
    (lp.current_week ?? 1) - 1
  );
  const [mockLearningLoading, setMockLearningLoading] = React.useState(false);
  const canShowMockLearning =
    import.meta.env.DEV ||
    import.meta.env.VITE_ENABLE_LEARNING_PATH_MOCK === "true";
  console.log("plan:", plan);
  // map days từ backend
  function mapDays(week: any): Day[] {
    console.log("Week", week);
    return (week?.days || []).map((d: any, idx: number) => ({
      id: String(d?._id ?? d?.id ?? `${week?._id ?? activeWeek}-day-${idx}`),
      week: week.name,
      title: d.display_title || d.title || `Stage ${idx + 1}`,
      subtitle: d.display_subtitle || d.activity_summary || `Stage ${idx + 1}`,
      no: d.dayOfWeek ?? 1,
      status: normalizeDayStatus(d.status),
      progress: d.progress ?? 0,
    }));
  }

  const ENTRY_SCORE = lp.entry_score;
  const TARGET = lp.target_score;
  const DAILY = `${lp.time_per_day} phút/ngày`;
  const REMAINING_TIME = formatRemainingTime(lp.target_completion_date);
  const WEEKS = lp.week_study_ids?.length ?? 0;
  const roadmapId =
    lp?._id ??
    lp?.learning_path_v2?._id ??
    lp?.learningPath_id?._id;

  const WEEK_TOTAL = lp.week_study_ids?.[activeWeek]?.days?.length ?? 0;
  const WEEK_DONE =
    lp.week_study_ids?.[activeWeek]?.days?.filter(
      (d: any) => normalizeDayStatus(d.status) === "done"
    ).length ?? 0;
  const weekPercent = WEEK_TOTAL
    ? Math.round((WEEK_DONE / WEEK_TOTAL) * 100)
    : 0;

  const feedbackItems = React.useMemo<LearningPathFeedback[]>(
    () => (Array.isArray(lp.feedbacks) ? lp.feedbacks : []),
    [lp.feedbacks]
  );

  const feedbackByDayId = React.useMemo(() => {
    return new Map(
      feedbackItems
        .map((feedback) => [getFeedbackDayId(feedback), feedback] as const)
        .filter(([dayId]) => Boolean(dayId))
    );
  }, [feedbackItems]);

  const allFeedbackDays = React.useMemo<FeedbackDay[]>(() => {
    const weeks = Array.isArray(lp.week_study_ids) ? lp.week_study_ids : [];
    return weeks.flatMap((week: any, weekIndex: number) =>
      (week?.days ?? []).map((day: any, dayIndex: number) => ({
        id: String(day?._id ?? day?.id ?? `${week?._id ?? weekIndex}-day-${dayIndex}`),
        title: day?.display_title || day?.title || `Stage ${dayIndex + 1}`,
        subtitle:
          day?.display_subtitle ||
          day?.activity_summary ||
          `Stage ${dayIndex + 1}`,
        no: day?.dayOfWeek ?? 1,
        status: normalizeDayStatus(day?.status),
        cycleNo: week?.no ?? weekIndex + 1,
      }))
    );
  }, [lp.week_study_ids]);

  const pendingFeedbackDays = React.useMemo(
    () =>
      allFeedbackDays.filter(
        (day) => day.status === "done" && !feedbackByDayId.has(day.id)
      ),
    [allFeedbackDays, feedbackByDayId]
  );

  const submittedFeedbackItems = React.useMemo(
    () =>
      allFeedbackDays
        .map((day) => ({
          day,
          feedback: feedbackByDayId.get(day.id),
        }))
        .filter(
          (item): item is { day: FeedbackDay; feedback: LearningPathFeedback } =>
            Boolean(item.feedback)
        ),
    [allFeedbackDays, feedbackByDayId]
  );

  const handleMockLearning = async () => {
    if (!lp?._id || mockLearningLoading) {
      return;
    }

    try {
      setMockLearningLoading(true);
      const response = await learningPathV2Service.mockLearning(String(lp._id)) as any;
      await onRefresh?.();
      alert(
        response?.data?.message ??
          "Đã hoàn thành nhanh các bài học trong tuần. Bài kiểm tra cuối đã sẵn sàng."
      );
    } catch (error: any) {
      alert(
        error?.response?.data?.message ??
          "Không thể mock learning cho cycle hiện tại."
      );
    } finally {
      setMockLearningLoading(false);
    }
  };

  const openDay = (d: Day) => {
    localStorage.setItem("current_day", JSON.stringify(d));
    localStorage.setItem("current_lesson", "");
    localStorage.setItem("vocabularies", "");
    if (lp?._id) {
      localStorage.setItem("learning_path_v2_id", String(lp._id));
    }
    const activeWeekStudyId = lp.week_study_ids?.[activeWeek]?._id;
    if (activeWeekStudyId) {
      localStorage.setItem("learning_path_v2_week_study_id", String(activeWeekStudyId));
    }
    navigate(
      `/lesson?week=${activeWeek + 1}&day=${d.id}${
        lp?._id ? `&learningPathId=${lp._id}` : ""
      }`
    );
  };
  const [lastVisitDate, setLastVisitDate] = useLocalStorage<string>(
    "lastVisitDate",
    ""
  );
  const [isFirstVisitToday, setIsFirstVisitToday] = React.useState(false);
  const [inactiveLearning, setInactiveLearning] = React.useState<{
    lastAttempt: string;
    inactiveDays: number;
  } | null>(null);
  const [learningInactivity, setLearningInactivity] = React.useState<number | null>(null);
  const [feedbackCenterOpen, setFeedbackCenterOpen] = React.useState(false);
  const [feedbackModalDayId, setFeedbackModalDayId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const checkLearningInactivity = async () => {
      try {
        const response = await learningPathService.getLearningProgress();
        const lastAttempt = response?.data?.last_attempt;
        if (!response?.success || !lastAttempt) return;

        const lastAttemptDate = new Date(lastAttempt);
        if (Number.isNaN(lastAttemptDate.getTime())) return;

        const today = new Date();
        const inactiveDays = Math.floor(
          (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
            Date.UTC(lastAttemptDate.getFullYear(), lastAttemptDate.getMonth(), lastAttemptDate.getDate())) /
            86_400_000
        );
        if (inactiveDays >= 8 && inactiveDays <= 14) {
          setLearningInactivity(inactiveDays);
        }
        if (inactiveDays > 14) setInactiveLearning({ lastAttempt, inactiveDays });
      } catch (error) {
        // Progress is supplementary to the dashboard; avoid blocking it on a failed check.
        console.error("Unable to check learning inactivity:", error);
      }
    };

    checkLearningInactivity();
  }, []);

  React.useEffect(() => {
    // Lấy ngày hôm nay theo định dạng 'YYYY-MM-DD'
    const todayStr = new Date().toISOString().split("T")[0];

    // So sánh ngày truy cập cuối cùng đã lưu với ngày hôm nay
    if (lastVisitDate !== todayStr) {
      // Cập nhật state để hiển thị thông báo đặc biệt
      setIsFirstVisitToday(true);

      // QUAN TRỌNG: Cập nhật lại localStorage với ngày hôm nay
      setLastVisitDate(todayStr);
    }

  }, []);

  // Keep activeWeek in sync if plan/current_week changes
  React.useEffect(() => {
    const newWeek = (lp.current_week ?? 1) - 1;
    if (newWeek !== activeWeek) setActiveWeek(newWeek);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  React.useEffect(() => {
    setChatRouteState({
      roadmapId,
    });
    return clearChatRouteState;
  }, [roadmapId]);

  return (
    <MainLayout>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          background: "linear-gradient(135deg, #F5F7FA 0%, #E6EDF6 100%)",
          py: "3%",
          display: "flex",
        }}
      >
        <Container
          className="mx-auto p-4 sm:p-6 flex-1"
          sx={{
            maxWidth: {
              xs: "100%",
              lg: "1200px",
              xl: "1480px",
            },
            borderRadius: "36px",
            border: "1px solid rgba(0,0,0,0.06)",
            bgcolor: (t) =>
              t.palette.mode === "light"
                ? "#FFFFFFCC"
                : "rgba(255,255,255,0.08)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
          }}
        >
          {/* ===== Header ===== */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            gap={2}
            className="sticky top-0 z-10"
            sx={{
              border: "1px solid rgba(0,0,0,0.06)",
              bgcolor: (t) =>
                t.palette.mode === "light"
                  ? "#FFFFFF"
                  : "rgba(255,255,255,0.04)",
              px: 2,
              py: 1.25,
              borderRadius: "16px",
              mb: 2,
            }}
          >
            <SchoolIcon color="primary" />
            <Typography variant="h4" fontWeight={900}>
              Chương trình học
            </Typography>
          </Stack>

          <Alert
            severity={
              learningInactivity === null
                ? "info"
                : learningInactivity >= 14
                  ? "error"
                  : "warning"
            }
            sx={{
              mb: 2,
              borderRadius: 2,
              alignItems: "center",
              "& .MuiAlert-message": { width: "100%" },
            }}
          >
            <Typography fontWeight={700} variant="body2">
              {learningInactivity === null
                ? "Duy trì học tập đều đặn để bảo toàn lộ trình của bạn."
                : learningInactivity === 14
                  ? "Hôm nay là ngày cuối cùng để tiếp tục lộ trình hiện tại."
                  : `Bạn đã gián đoạn ${learningInactivity} ngày, còn ${14 - learningInactivity} ngày để tiếp tục lộ trình.`}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.25 }}>
              Theo quy định, lộ trình sẽ hết hạn khi thời gian gián đoạn vượt quá 14 ngày.
            </Typography>
          </Alert>

          {/* ===== Stat bar ===== */}
          <Section>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <StatItem
                  icon={<SchoolIcon color="primary" />}
                  label="Điểm đầu vào"
                  value={ENTRY_SCORE}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <StatItem
                  icon={<EmojiEventsIcon color="primary" />}
                  label="Mục tiêu điểm"
                  value={TARGET}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <StatItem
                  icon={<SpeedIcon color="secondary" />}
                  label="Thời gian còn lại"
                  value={REMAINING_TIME}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <StatItem
                  icon={<AccessTimeIcon color="success" />}
                  label="Thời lượng"
                  value={DAILY}
                />
              </Grid>
            </Grid>
          </Section>

          <Box sx={{ my: 2.5 }} />

          <LearningPathRoadmapCanvas overview={plan.learning_path_v2} />

          <Box sx={{ my: 2.5 }} />

          {/* ===== Weekly progress ===== */}
          <Section>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
              >
                <Typography variant="h6" fontWeight={800}>
                  Cycle {activeWeek + 1} · {WEEK_DONE}/{WEEK_TOTAL} stage
                </Typography>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress
                    variant="determinate"
                    value={weekPercent}
                    size={44}
                    thickness={4}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      component="div"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      {`${weekPercent}%`}
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              <Divider />

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {Array.from({ length: WEEKS }, (_, i) => {
                  const active = i === activeWeek;
                  return (
                    <Chip
                      key={i}
                      label={`C${i + 1}`}
                      clickable
                      color={active ? "primary" : undefined}
                      variant={active ? "filled" : "outlined"}
                      onClick={() => setActiveWeek(i)}
                      sx={{ borderRadius: 999 }}
                    />
                  );
                })}
              </Stack>
            </Stack>
          </Section>

          <Box sx={{ my: 2.5 }} />

          {/* ===== Days ===== */}
          <Section>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.5 }}
            >
              <Typography variant="h6" fontWeight={800}>
                Danh sách stage
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  size="small"
                  variant={pendingFeedbackDays.length > 0 ? "contained" : "outlined"}
                  onClick={() => setFeedbackCenterOpen(true)}
                  sx={{ borderRadius: 999, fontWeight: 800 }}
                >
                  Feedback · {pendingFeedbackDays.length} chờ · {submittedFeedbackItems.length} đã gửi
                </Button>
                {canShowMockLearning && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleMockLearning}
                    disabled={!lp?._id || mockLearningLoading}
                    sx={{ borderRadius: 999, fontWeight: 800 }}
                  >
                    {mockLearningLoading ? "Đang mock..." : "Mock học nhanh"}
                  </Button>
                )}
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Cycle ${activeWeek + 1}`}
                />
              </Stack>
            </Stack>

            <Grid container spacing={1.5}>
              {/* {DAYS.filter((d) => d.week === 1).map((d) => (
                <Grid size={{ xs: 12, sm: 6 }} key={d.id}>
                  <DayItem data={d} onOpen={openDay} />
                </Grid>
              ))} */}
              {(lp.week_study_ids?.[activeWeek]
                ? mapDays(lp.week_study_ids[activeWeek])
                : []
              ).map((d, index) => (
                <Grid
                  size={{ xs: 12, sm: 6 }}
                  key={`${lp.week_study_ids?.[activeWeek]?._id ?? activeWeek}-${d.id}-${index}`}
                >
                  <DayItem data={d} onOpen={openDay} />
                </Grid>
              ))}
            </Grid>
          </Section>
        </Container>

        <Dialog
          open={feedbackCenterOpen}
          onClose={() => setFeedbackCenterOpen(false)}
          fullWidth
          maxWidth="md"
          disableScrollLock
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Feedback lộ trình học
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Góp ý là tùy chọn. Mỗi stage chỉ gửi feedback một lần.
                </Typography>
              </Box>
              <IconButton onClick={() => setFeedbackCenterOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1.5 }}
                >
                  <Typography variant="subtitle1" fontWeight={800}>
                    Cần góp ý
                  </Typography>
                  <Chip size="small" label={`${pendingFeedbackDays.length} stage`} />
                </Stack>

                {pendingFeedbackDays.length === 0 ? (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    Không có stage nào đang chờ feedback.
                  </Alert>
                ) : (
                  <Stack spacing={1.25}>
                    {pendingFeedbackDays.map((day) => (
                      <Paper
                        key={day.id}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2 }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1.5}
                          alignItems={{ sm: "center" }}
                          justifyContent="space-between"
                        >
                          <Box>
                            <Typography fontWeight={800}>{day.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Cycle {day.cycleNo} · {day.subtitle}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              setFeedbackCenterOpen(false);
                              setFeedbackModalDayId(day.id);
                            }}
                            sx={{ borderRadius: 999, fontWeight: 800 }}
                          >
                            Gửi feedback
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>

              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1.5 }}
                >
                  <Typography variant="subtitle1" fontWeight={800}>
                    Đã góp ý
                  </Typography>
                  <Chip size="small" label={`${submittedFeedbackItems.length} feedback`} />
                </Stack>

                {submittedFeedbackItems.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Bạn chưa gửi feedback nào cho lộ trình này.
                  </Alert>
                ) : (
                  <Stack spacing={1.25}>
                    {submittedFeedbackItems.map(({ day, feedback }) => (
                      <Paper
                        key={day.id}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2 }}
                      >
                        <Stack spacing={1}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1}
                            justifyContent="space-between"
                          >
                            <Box>
                              <Typography fontWeight={800}>{day.title}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Cycle {day.cycleNo} · {day.subtitle}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {formatFeedbackDate(feedback.created_at)}
                            </Typography>
                          </Stack>
                          <Rating value={feedback.rating} readOnly size="small" />
                          {feedback.reasons && feedback.reasons.length > 0 && (
                            <Stack direction="row" spacing={0.75} flexWrap="wrap">
                              {feedback.reasons.map((reason) => (
                                <Chip
                                  key={reason}
                                  size="small"
                                  variant="outlined"
                                  label={reason}
                                />
                              ))}
                            </Stack>
                          )}
                          {feedback.comment && (
                            <Typography variant="body2" color="text.secondary">
                              {feedback.comment}
                            </Typography>
                          )}
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setFeedbackCenterOpen(false)}>Đóng</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isFirstVisitToday}
          onClose={() => setIsFirstVisitToday(false)}
          fullWidth
          maxWidth="md"
          disableScrollLock
          PaperProps={{
            sx: {
              borderRadius: 4,
              p: 2,
              maxHeight: "90vh",
              maxWidth: "1000px",
            },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="h6" fontWeight={800}>
              Tiến trình học
            </Typography>
            <IconButton onClick={() => setIsFirstVisitToday(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ overflowY: "auto", maxHeight: "75vh", pr: 1 }}>
            <LearningProgress />
          </Box>
        </Dialog>
      </Box>
      <FeedbackLessonModal
        open={Boolean(feedbackModalDayId)}
        onClose={() => {
          setFeedbackModalDayId(null);
          onRefresh?.();
        }}
        dayId={feedbackModalDayId ?? ""}
      />
      {inactiveLearning && (
        <InactiveLearningPathModal
          open
          lastAttempt={inactiveLearning.lastAttempt}
          inactiveDays={inactiveLearning.inactiveDays}
          onCreateNewPath={() => navigate("/overview-test?testId=68af851b1918226d4c424e7f&demo_test=true")}
          onGoHome={() => navigate("/home")}
        />
      )}
    </MainLayout>
  );
}
