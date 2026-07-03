import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import StyleOutlinedIcon from "@mui/icons-material/StyleOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import type {
  LearningPathNodeDetailResponse,
  NodeDetailActivity,
  NodeDetailActivityStatus,
  NodeReason,
  RoadmapUnitStatus,
} from "../../services/learning_path_v2.service";

type LearningPathNodeDetailModalProps = {
  open: boolean;
  detail: LearningPathNodeDetailResponse | null;
  loading?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onPrimaryAction?: () => void;
};

const ROADMAP_STATUS_COLORS = {
  completed: {
    main: "#10B981",
    soft: "rgba(16,185,129,0.12)",
    ring: "rgba(16,185,129,0.18)",
    text: "#047857",
  },
  in_cycle: {
    main: "#6366F1",
    soft: "rgba(99,102,241,0.10)",
    ring: "rgba(99,102,241,0.14)",
    text: "#4338CA",
  },
  current: {
    main: "#F97316",
    soft: "rgba(249,115,22,0.14)",
    ring: "rgba(249,115,22,0.22)",
    text: "#C2410C",
  },
  locked: {
    main: "#94A3B8",
    soft: "#F8FAFC",
    ring: "rgba(148,163,184,0.16)",
    text: "#64748B",
  },
};

const REASON_BOX_COLORS = {
  bg: "#F0F9FF",
  border: "#BAE6FD",
  iconBg: "#E0F2FE",
  icon: "#0284C7",
  title: "#0F172A",
  text: "#334155",
};

const ADAPTIVE_BOX_COLORS = {
  bg: "#F8FAFC",
  border: "rgba(148,163,184,0.22)",
  iconBg: "#EEF2FF",
  icon: "#4F46E5",
  title: "#0F172A",
  text: "#475569",
};

const modalTextSx = {
  title: {
    fontSize: 20,
    fontWeight: 900,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 800,
  },
  label: {
    fontSize: 14,
    fontWeight: 800,
  },
  caption: {
    fontSize: 12,
    fontWeight: 700,
  },
  helper: {
    fontSize: 12,
    fontWeight: 600,
  },
};

const modalLayout = {
  contentPadding: { xs: 1.75, sm: 2.1, md: 2.5, lg: 2.8, xl: 3 },
  sectionGap: { xs: 1.5, sm: 1.8, md: 2.05, lg: 2.2, xl: 2.25 },
  previewSize: { xs: 52, sm: 58, md: 62, lg: 66, xl: 68 },
  previewIconSize: { xs: 22, sm: 24, md: 26, lg: 28, xl: 30 },
  previewInnerSize: { xs: 18, sm: 20, md: 22, lg: 23, xl: 24 },
  activityIconSize: { xs: 32, sm: 34, md: 36, lg: 36, xl: 38 },
  chipHeight: { xs: 26, sm: 27, md: 28, lg: 28, xl: 29 },
  metaChipHeight: { xs: 28, sm: 29, md: 30, lg: 30, xl: 31 },
  buttonHeight: { xs: 36, sm: 38, md: 40, lg: 40, xl: 42 },
};

const statusLabel: Record<RoadmapUnitStatus, string> = {
  completed: "Đã hoàn thành",
  in_cycle: "Trong cycle này",
  current: "Đang học",
  locked: "Dự kiến",
};

const getActivityIcon = (typeLabel: string) => {
  if (typeLabel.includes("Flashcard")) {
    return <StyleOutlinedIcon fontSize="small" />;
  }

  if (typeLabel.includes("Quiz")) {
    return <QuizOutlinedIcon fontSize="small" />;
  }

  return <MenuBookOutlinedIcon fontSize="small" />;
};

const getActivityStatusLabel = (status: NodeDetailActivityStatus) => {
  if (status === "completed") return "Hoàn thành";
  if (status === "in_progress") return "Đang học";
  if (status === "upcoming") return "Sắp mở";
  return "Dự kiến";
};

const getActivityStatusIcon = (status: NodeDetailActivityStatus) => {
  if (status === "completed") {
    return <CheckIcon sx={{ fontSize: "14px !important" }} />;
  }

  if (status === "in_progress") {
    return <PlayCircleOutlineIcon sx={{ fontSize: "14px !important" }} />;
  }

  if (status === "upcoming") {
    return <PendingActionsOutlinedIcon sx={{ fontSize: "14px !important" }} />;
  }

  return <RouteOutlinedIcon sx={{ fontSize: "14px !important" }} />;
};

const getActivityVisualColor = (status: NodeDetailActivityStatus) => {
  if (status === "completed") return ROADMAP_STATUS_COLORS.completed;
  if (status === "in_progress") return ROADMAP_STATUS_COLORS.current;
  if (status === "upcoming") return ROADMAP_STATUS_COLORS.in_cycle;
  return ROADMAP_STATUS_COLORS.locked;
};

const getActivitySectionTitle = (status: RoadmapUnitStatus) => {
  if (status === "locked") return "Kế hoạch hoạt động dự kiến";
  if (status === "completed") return "Hoạt động đã hoàn thành";
  return "Hoạt động trong bài này";
};

const getActivitySectionHelper = (status: RoadmapUnitStatus) => {
  if (status === "locked") {
    return "Các hoạt động bên dưới là bản xem trước. Nội dung có thể được điều chỉnh nếu kết quả kiểm tra sau này thay đổi.";
  }

  if (status === "in_cycle") {
    return "Các hoạt động sẽ được mở khi bạn học tới Stage tương ứng trong cycle này.";
  }

  if (status === "current") {
    return "Hoàn thành lần lượt các hoạt động để ghi nhận tiến độ cho cycle hiện tại.";
  }

  return "Bạn có thể xem lại nội dung để củng cố trước Mini Test hoặc Full Test.";
};

function ReasonCard({ reason }: { reason: NodeReason }) {
  return (
    <Box
      sx={{
        p: { xs: 1.35, sm: 1.55, md: 1.75, lg: 1.9, xl: 2 },
        borderRadius: 3,
        bgcolor: REASON_BOX_COLORS.bg,
        border: `1px solid ${REASON_BOX_COLORS.border}`,
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1, sm: 1.15, md: 1.25 }}
        alignItems="flex-start"
      >
        <Box
          sx={{
            width: modalLayout.activityIconSize,
            height: modalLayout.activityIconSize,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: REASON_BOX_COLORS.iconBg,
            color: REASON_BOX_COLORS.icon,
            flex: "0 0 auto",
          }}
        >
          <LightbulbOutlinedIcon fontSize="small" />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              ...modalTextSx.label,
              fontWeight: { xs: 850, sm: 850, md: 900, lg: 900, xl: 900 },
              color: REASON_BOX_COLORS.title,
            }}
          >
            {reason.title}
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              ...modalTextSx.helper,
              color: REASON_BOX_COLORS.text,
              lineHeight: 1.55,
            }}
          >
            {reason.text}
          </Typography>

          {Boolean(reason.evidence?.length) && (
            <Stack
              direction="row"
              spacing={0.75}
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 1.1 }}
            >
              {reason.evidence.map((item) => (
                <Chip
                  key={`${reason.type}-${item.label}-${item.value}`}
                  label={`${item.label}: ${item.value}`}
                  size="small"
                  sx={{
                    height: modalLayout.chipHeight,
                    borderRadius: 999,
                    ...modalTextSx.caption,
                    color:
                      item.tone === "warning"
                        ? "#B45309"
                        : item.tone === "good"
                          ? "#047857"
                          : "#334155",
                    bgcolor:
                      item.tone === "warning"
                        ? "rgba(245,158,11,0.12)"
                        : item.tone === "good"
                          ? "rgba(16,185,129,0.12)"
                          : "#FFFFFF",
                    border: "1px solid rgba(148,163,184,0.2)",
                    "& .MuiChip-label": { px: 0.9 },
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

function NodeStatusPreview({ status }: { status: RoadmapUnitStatus }) {
  const colors = ROADMAP_STATUS_COLORS[status];

  return (
    <Box
      sx={{
        width: modalLayout.previewSize,
        height: modalLayout.previewSize,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: status === "completed" ? colors.main : "#FFFFFF",
        border:
          status === "completed"
            ? "none"
            : status === "locked"
              ? `2px solid ${ROADMAP_STATUS_COLORS.locked.main}`
              : `3px solid ${colors.main}`,
        boxShadow:
          status === "current"
            ? `0 0 0 8px ${ROADMAP_STATUS_COLORS.current.soft}, 0 14px 32px ${ROADMAP_STATUS_COLORS.current.ring}`
            : status === "completed"
              ? `0 12px 28px ${ROADMAP_STATUS_COLORS.completed.ring}`
              : "0 10px 24px rgba(15,23,42,0.08)",
      }}
    >
      {status === "completed" ? (
        <CheckIcon
          sx={{ color: "#FFFFFF", fontSize: modalLayout.previewIconSize }}
        />
      ) : status === "current" ? (
        <Box
          sx={{
            width: modalLayout.previewInnerSize,
            height: modalLayout.previewInnerSize,
            borderRadius: "50%",
            bgcolor: ROADMAP_STATUS_COLORS.current.main,
          }}
        />
      ) : status === "locked" ? (
        <RouteOutlinedIcon
          sx={{
            color: ROADMAP_STATUS_COLORS.locked.text,
            fontSize: modalLayout.previewIconSize,
          }}
        />
      ) : (
        <Box
          sx={{
            width: modalLayout.previewInnerSize,
            height: modalLayout.previewInnerSize,
            borderRadius: "50%",
            bgcolor: "transparent",
          }}
        />
      )}
    </Box>
  );
}

function ActivityRow({ activity }: { activity: NodeDetailActivity }) {
  const isCompleted = activity.status === "completed";
  const isInProgress = activity.status === "in_progress";
  const isPlanned = activity.status === "planned";
  const color = getActivityVisualColor(activity.status);

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 1.1, md: 1.25, lg: 1.3, xl: 1.35 },
        borderRadius: 2.5,
        display: "grid",
        gridTemplateColumns: {
          xs: "auto minmax(0,1fr)",
          sm: "auto minmax(0,1fr) auto",
          md: "auto minmax(0,1fr) auto auto",
        },
        alignItems: { xs: "flex-start", sm: "center" },
        gap: { xs: 1, sm: 1.1, md: 1.25, lg: 1.25, xl: 1.3 },
        bgcolor: isInProgress
          ? ROADMAP_STATUS_COLORS.current.soft
          : isPlanned
            ? "#F8FAFC"
            : "#FFFFFF",
        border: `1px solid ${isInProgress
            ? ROADMAP_STATUS_COLORS.current.ring
            : isCompleted
              ? ROADMAP_STATUS_COLORS.completed.ring
              : isPlanned
                ? "rgba(148,163,184,0.22)"
                : ROADMAP_STATUS_COLORS.in_cycle.ring
          }`,
      }}
    >
      <Box
        sx={{
          width: modalLayout.activityIconSize,
          height: modalLayout.activityIconSize,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          color: color.text,
          bgcolor: isPlanned ? "#FFFFFF" : color.soft,
          border: isPlanned ? "1px solid rgba(148,163,184,0.18)" : "none",
        }}
      >
        {getActivityIcon(activity.type_label)}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            ...modalTextSx.label,
            color: isPlanned ? "#475569" : "#0F172A",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={activity.title}
        >
          {activity.title}
        </Typography>

        <Typography sx={{ ...modalTextSx.helper, color: "#64748B", mt: 0.2 }}>
          {activity.type_label}
        </Typography>
      </Box>

      <Chip
        size="small"
        icon={getActivityStatusIcon(activity.status)}
        label={getActivityStatusLabel(activity.status)}
        sx={{
          height: modalLayout.chipHeight,
          borderRadius: 999,
          ...modalTextSx.caption,
          color: color.text,
          bgcolor: isPlanned ? "#FFFFFF" : color.soft,
          border: isPlanned ? "1px solid rgba(148,163,184,0.2)" : "none",
          gridColumn: { xs: "2 / 3", sm: "auto" },
          justifySelf: { xs: "flex-start", sm: "auto" },
          "& .MuiChip-icon": { color: color.text },
          "& .MuiChip-label": { px: 0.8 },
        }}
      />

      <Stack
        direction="row"
        alignItems="center"
        spacing={0.4}
        sx={{
          gridColumn: { xs: "2 / 3", sm: "auto" },
          justifySelf: { xs: "flex-start", md: "auto" },
        }}
      >
        <TimerOutlinedIcon sx={{ fontSize: 15, color: "#94A3B8" }} />
        <Typography sx={{ ...modalTextSx.caption, color: "#64748B" }}>
          {activity.estimated_minutes} phút
        </Typography>
      </Stack>
    </Box>
  );
}

export default function LearningPathNodeDetailModal({
  open,
  detail,
  loading = false,
  errorMessage = null,
  onClose,
  onPrimaryAction,
}: LearningPathNodeDetailModalProps) {
  const status = detail?.status ?? "locked";
  const colors = ROADMAP_STATUS_COLORS[status];

  const reasons = detail?.explanation?.reasons ?? [];
  const activities = detail?.activities ?? [];
  const primaryAction = detail?.primary_action ?? {
    label: "Đã hiểu",
    enabled: true,
  };

  const adaptiveNote =
    detail?.explanation?.adaptive_note ??
    "Roadmap có thể được tối ưu lại sau Mini Test / Full Test.";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          m: { xs: 1.25, sm: 2, md: 3 },
          width: { xs: "calc(100% - 20px)", sm: "calc(100% - 64px)", md: "100%" },
          maxHeight: { xs: "calc(100% - 20px)", sm: "calc(100% - 64px)" },
          borderRadius: { xs: 2.5, sm: 3, md: 3.25, lg: 3.5, xl: 4 },
          overflow: "hidden",
          boxShadow: "0 28px 80px rgba(15,23,42,0.28)",
        },
      }}
      BackdropProps={{
        sx: {
          bgcolor: "rgba(15,23,42,0.34)",
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }} className="no-scrollbar">
        <Box sx={{ p: modalLayout.contentPadding }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={{ xs: 1, sm: 1.5, md: 2 }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1.25, sm: 1.5, md: 2 }}
              alignItems={{ xs: "center", sm: "center" }}
              sx={{ minWidth: 0, flex: 1 }}
            >
              <NodeStatusPreview status={status} />

              <Box sx={{ minWidth: 0 }}>
                <Chip
                  label={detail?.status_label ?? statusLabel[status]}
                  size="small"
                  sx={{
                    height: modalLayout.chipHeight,
                    mb: 1,
                    borderRadius: 999,
                    ...modalTextSx.caption,
                    color: colors.text,
                    bgcolor: colors.soft,
                    border: `1px solid ${colors.ring}`,
                    "& .MuiChip-label": { px: 1 },
                  }}
                />

                <Typography
                  sx={{
                    ...modalTextSx.title,
                    color: "#071947",
                    lineHeight: 1.25,
                    overflowWrap: "anywhere",
                  }}
                >
                  {detail?.title ??
                    (loading ? "Đang tải chi tiết bài học..." : "Chi tiết bài học")}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.6,
                    ...modalTextSx.label,
                    fontWeight: { xs: 700, sm: 700, md: 700, lg: 750, xl: 750 },
                    color: "#64748B",
                  }}
                >
                  {detail
                    ? `Part ${detail.part_type} · ${detail.skill_group}`
                    : "TOEIC Smart"}
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>

          {detail && (
            <Stack
              direction="row"
              spacing={{ xs: 0.75, sm: 0.9, md: 1 }}
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: modalLayout.sectionGap }}
            >
              <Chip
                icon={<FlagOutlinedIcon />}
                label={detail.roadmap_context_label}
                sx={metaChipSx}
              />

              <Chip
                icon={<AutoAwesomeOutlinedIcon />}
                label={detail.unit_type_label}
                sx={metaChipSx}
              />

              <Chip
                icon={<TimerOutlinedIcon />}
                label={`${detail.planned_minutes} phút`}
                sx={metaChipSx}
              />

              {detail.short_tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  icon={<LocalOfferOutlinedIcon />}
                  label={tag}
                  sx={metaChipSx}
                />
              ))}
            </Stack>
          )}

          {loading && (
            <Box
              sx={{
                mt: modalLayout.sectionGap,
                p: { xs: 2, sm: 2.25, md: 2.5 },
                borderRadius: 3,
                border: "1px solid rgba(148,163,184,0.18)",
                bgcolor: "#F8FAFC",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <CircularProgress size={20} />
                <Typography sx={{ ...modalTextSx.helper, color: "#475569" }}>
                  Đang tải lý do bài học này xuất hiện trong lộ trình...
                </Typography>
              </Stack>
            </Box>
          )}

          {errorMessage && !loading && (
            <Alert
              severity="warning"
              sx={{
                mt: modalLayout.sectionGap,
                borderRadius: 2,
                "& .MuiAlert-message": {
                  ...modalTextSx.helper,
                },
              }}
            >
              {errorMessage}
            </Alert>
          )}

          {!loading && !errorMessage && reasons.length > 0 && (
            <Stack spacing={1} sx={{ mt: modalLayout.sectionGap }}>
              {reasons.map((reason) => (
                <ReasonCard
                  key={`${reason.type}-${reason.title}`}
                  reason={reason}
                />
              ))}
            </Stack>
          )}

          {!loading && !errorMessage && detail && reasons.length === 0 && (
            <Box
              sx={{
                mt: modalLayout.sectionGap,
                p: { xs: 1.4, sm: 1.6, md: 1.8, lg: 2, xl: 2 },
                borderRadius: 3,
                bgcolor: REASON_BOX_COLORS.bg,
                border: `1px solid ${REASON_BOX_COLORS.border}`,
              }}
            >
              <Stack
                direction="row"
                spacing={{ xs: 1, sm: 1.15, md: 1.25 }}
                alignItems="flex-start"
              >
                <Box
                  sx={{
                    width: modalLayout.activityIconSize,
                    height: modalLayout.activityIconSize,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: REASON_BOX_COLORS.iconBg,
                    color: REASON_BOX_COLORS.icon,
                    flex: "0 0 auto",
                  }}
                >
                  <LightbulbOutlinedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      ...modalTextSx.label,
                      fontWeight: { xs: 850, sm: 850, md: 900, lg: 900, xl: 900 },
                      color: REASON_BOX_COLORS.title,
                    }}
                  >
                    Vì sao bài này xuất hiện?
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      ...modalTextSx.helper,
                      color: REASON_BOX_COLORS.text,
                      lineHeight: 1.55,
                    }}
                  >
                    Bài này nằm trong lộ trình học hiện tại của bạn. Hệ thống sẽ
                    tiếp tục cập nhật lộ trình sau Mini Test / Full Test.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          <Box
            sx={{
              mt: { xs: 1.1, sm: 1.2, md: 1.35, lg: 1.45, xl: 1.5 },
              p: { xs: 1.25, sm: 1.4, md: 1.55, lg: 1.65, xl: 1.75 },
              borderRadius: 2.5,
              bgcolor: ADAPTIVE_BOX_COLORS.bg,
              border: `1px solid ${ADAPTIVE_BOX_COLORS.border}`,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Box
                sx={{
                  width: { xs: 28, sm: 30, md: 32, lg: 32, xl: 34 },
                  height: { xs: 28, sm: 30, md: 32, lg: 32, xl: 34 },
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: ADAPTIVE_BOX_COLORS.iconBg,
                  color: ADAPTIVE_BOX_COLORS.icon,
                  flex: "0 0 auto",
                }}
              >
                {status === "completed" ? (
                  <ReplayOutlinedIcon fontSize="small" />
                ) : (
                  <RouteOutlinedIcon fontSize="small" />
                )}
              </Box>

              <Box>
                <Typography
                  sx={{
                    ...modalTextSx.caption,
                    color: ADAPTIVE_BOX_COLORS.title,
                    fontWeight: { xs: 750, sm: 750, md: 800, lg: 800, xl: 850 },
                  }}
                >
                  Ghi chú về lộ trình thích ứng
                </Typography>

                <Typography
                  sx={{
                    mt: 0.35,
                    ...modalTextSx.helper,
                    color: ADAPTIVE_BOX_COLORS.text,
                    lineHeight: 1.55,
                  }}
                >
                  {adaptiveNote}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ my: modalLayout.sectionGap }} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={0.75}
            sx={{ mb: 1.25 }}
          >
            <Box>
              <Typography
                sx={{
                  ...modalTextSx.label,
                  fontWeight: { xs: 850, sm: 850, md: 900, lg: 900, xl: 900 },
                  color: "#0F172A",
                }}
              >
                {getActivitySectionTitle(status)}
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  ...modalTextSx.helper,
                  color: "#64748B",
                  lineHeight: 1.45,
                }}
              >
                {getActivitySectionHelper(status)}
              </Typography>
            </Box>

            <Typography
              sx={{
                ...modalTextSx.caption,
                color: "#64748B",
                flex: "0 0 auto",
              }}
            >
              {loading ? "Đang tải" : `${activities.length} hoạt động`}
            </Typography>
          </Stack>

          {loading ? (
            <Box
              sx={{
                p: { xs: 1.25, sm: 1.5, md: 1.75 },
                borderRadius: 2.5,
                bgcolor: "#F8FAFC",
                border: "1px solid rgba(148,163,184,0.18)",
              }}
            >
              <Typography sx={{ ...modalTextSx.helper, color: "#64748B" }}>
                Đang tải kế hoạch hoạt động...
              </Typography>
            </Box>
          ) : activities.length > 0 ? (
            <Stack spacing={1}>
              {activities.map((activity) => (
                <ActivityRow key={activity.order} activity={activity} />
              ))}
            </Stack>
          ) : (
            <Box
              sx={{
                p: { xs: 1.25, sm: 1.5, md: 1.75 },
                borderRadius: 2.5,
                bgcolor: "#F8FAFC",
                border: "1px solid rgba(148,163,184,0.18)",
              }}
            >
              <Typography sx={{ ...modalTextSx.helper, color: "#64748B" }}>
                Chưa có hoạt động để hiển thị cho bài này.
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: modalLayout.sectionGap }} />

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            justifyContent="flex-end"
            spacing={1}
          >
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                height: modalLayout.buttonHeight,
                borderRadius: 2,
                textTransform: "none",
                ...modalTextSx.label,
                px: 2.2,
                borderColor: "rgba(148,163,184,0.36)",
                color: "#334155",
              }}
            >
              Đóng
            </Button>

            <Button
              variant="contained"
              disabled={loading || !primaryAction.enabled}
              onClick={onPrimaryAction}
              sx={{
                height: modalLayout.buttonHeight,
                borderRadius: 2,
                textTransform: "none",
                ...modalTextSx.label,
                fontWeight: { xs: 850, sm: 850, md: 900, lg: 900, xl: 900 },
                px: 2.4,
                bgcolor: colors.main,
                boxShadow: `0 10px 24px ${colors.ring}`,
                "&:hover": {
                  bgcolor: colors.main,
                  filter: "brightness(0.96)",
                },
              }}
            >
              {primaryAction.label}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

const metaChipSx = {
  height: modalLayout.metaChipHeight,
  borderRadius: 999,
  bgcolor: "#F8FAFC",
  border: "1px solid rgba(148,163,184,0.2)",
  color: "#334155",
  ...modalTextSx.caption,
  "& .MuiChip-icon": {
    color: "#64748B",
    fontSize: 16,
  },
  "& .MuiChip-label": {
    px: 0.9,
  },
};
