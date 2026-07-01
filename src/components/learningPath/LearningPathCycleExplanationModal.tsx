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
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { LearningPathCycleExplanationResponse } from "../../services/learning_path_v2.service";

type LearningPathCycleExplanationModalProps = {
  open: boolean;
  data: LearningPathCycleExplanationResponse | null;
  loading?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
};

type ExplanationTab = "overview" | "trace";

const colors = {
  primary: "#2563EB",
  primarySoft: "#EFF6FF",
  primaryBorder: "rgba(37,99,235,0.18)",
  text: "#0F172A",
  muted: "#64748B",
  border: "rgba(148,163,184,0.22)",
  surface: "#FFFFFF",
  softSurface: "#F8FAFC",
  good: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
};

const textSx = {
  title: { fontSize: 20, fontWeight: 850 },
  section: { fontSize: 15, fontWeight: 850 },
  label: { fontSize: 14, fontWeight: 750 },
  helper: { fontSize: 13, fontWeight: 500 },
  caption: { fontSize: 12, fontWeight: 650 },
};

const getApiPayload = <T,>(response: any): T => {
  return (response?.data?.data ?? response?.data) as T;
};

export const unwrapCycleExplanationPayload = getApiPayload<LearningPathCycleExplanationResponse>;

const formatDate = (value?: string | Date | null) => {
  if (!value) return "Chưa có dữ liệu";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có dữ liệu";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatNumber = (value?: number | null, digits = 3) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";
  return String(Math.round(value * 10 ** digits) / 10 ** digits);
};

const getStatusLabel = (status?: string) => {
  if (status === "weak") return "Yếu";
  if (status === "medium") return "Trung bình";
  if (status === "strong") return "Tốt";
  return "";
};

const getStatusColor = (status?: string) => {
  if (status === "weak") return colors.warning;
  if (status === "strong") return colors.good;
  return colors.primary;
};

function MetricBox({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  helper?: string;
}) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: `1px solid ${colors.border}`,
        bgcolor: colors.softSurface,
        minHeight: 92,
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="flex-start">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            bgcolor: "#FFFFFF",
            color: colors.primary,
            border: `1px solid ${colors.primaryBorder}`,
            flex: "0 0 auto",
          }}
        >
          {icon}
        </Box>
        <Box minWidth={0}>
          <Typography sx={{ ...textSx.caption, color: colors.muted }}>
            {label}
          </Typography>
          <Typography sx={{ ...textSx.section, color: colors.text, mt: 0.25 }}>
            {value}
          </Typography>
          {helper && (
            <Typography sx={{ ...textSx.helper, color: colors.muted, mt: 0.3 }}>
              {helper}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

function AbilityEvidence({
  title,
  percent,
  status,
}: {
  title: string;
  percent?: number | null;
  status?: string;
}) {
  const value = typeof percent === "number" ? percent : 0;
  const color = getStatusColor(status);

  return (
    <Box
      sx={{
        p: 1.35,
        borderRadius: 2,
        border: `1px solid ${colors.border}`,
        bgcolor: "#FFFFFF",
        minWidth: 0,
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
        <Typography
          sx={{
            ...textSx.label,
            color: colors.text,
            minWidth: 0,
            overflowWrap: "anywhere",
          }}
        >
          {title}
        </Typography>
        {status && (
          <Chip
            size="small"
            label={getStatusLabel(status)}
            sx={{
              height: 24,
              borderRadius: 999,
              color,
              bgcolor: `${color}12`,
              border: `1px solid ${color}33`,
              ...textSx.caption,
            }}
          />
        )}
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.2}
        sx={{ mt: 1, minWidth: 0 }}
      >
        <LinearProgress
          variant="determinate"
          value={Math.max(0, Math.min(100, value))}
          sx={{
            flex: 1,
            minWidth: 88,
            height: 8,
            borderRadius: 999,
            bgcolor: "rgba(148,163,184,0.18)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
              bgcolor: color,
            },
          }}
        />
        <Typography sx={{ ...textSx.caption, color }}>
          {typeof percent === "number" ? `${percent}%` : "--"}
        </Typography>
      </Stack>
    </Box>
  );
}

function OverviewTab({ data }: { data: LearningPathCycleExplanationResponse }) {
  const cycle = data.cycle;
  const decision = data.decision;
  const evidence = data.evidence;

  if (!cycle) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        {data.message ?? "Chưa có cycle hiện tại để giải thích."}
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 1.3,
        }}
      >
        <MetricBox
          icon={<TrackChangesOutlinedIcon />}
          label="Trọng tâm cycle"
          value={`Part ${cycle.focus_part_type}`}
          helper={cycle.primary_focus_skill_label}
        />
        <MetricBox
          icon={<PsychologyOutlinedIcon />}
          label="Tình huống học"
          value={decision?.scenario_label ?? "Chưa có dữ liệu"}
          helper={cycle.cycle_mode_label}
        />
        <MetricBox
          icon={<SpeedOutlinedIcon />}
          label="Hiệu quả dự kiến"
          value={`${formatNumber(cycle.expected_roi_per_hour)} ROI/giờ`}
          helper={`Gain dự kiến ${formatNumber(cycle.expected_skill_gain)}`}
        />
      </Box>

      <Box
        sx={{
          p: 1.6,
          borderRadius: 2.5,
          border: `1px solid ${colors.primaryBorder}`,
          bgcolor: colors.primarySoft,
        }}
      >
        <Typography sx={{ ...textSx.section, color: colors.text }}>
          Dữ liệu hệ thống dùng để ra quyết định
        </Typography>
        <Stack
          sx={{
            mt: 1.2,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 1.2,
            maxWidth: { md: 760 },
          }}
        >
          <AbilityEvidence
            title={`Part ${cycle.focus_part_type}`}
            percent={evidence?.focus_part?.ability_percent}
            status={evidence?.focus_part?.status}
          />
          <AbilityEvidence
            title={cycle.primary_focus_skill_label}
            percent={evidence?.focus_skill?.ability_percent}
            status={evidence?.focus_skill?.status}
          />
        </Stack>
        <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mt: 1.2 }}>
          <Chip
            label={`Nguồn: ${evidence?.test_type_label ?? "Bài đánh giá gần nhất"}`}
            size="small"
            sx={{ borderRadius: 999, ...textSx.caption }}
          />
          <Chip
            label={`Điểm hiện tại: ${evidence?.current_score ?? "--"}`}
            size="small"
            sx={{ borderRadius: 999, ...textSx.caption }}
          />
          <Chip
            label={`Mục tiêu: ${evidence?.target_score ?? "--"}`}
            size="small"
            sx={{ borderRadius: 999, ...textSx.caption }}
          />
          <Chip
            label={`Thời lượng/tuần: ${evidence?.weekly_available_label ?? "--"}`}
            size="small"
            sx={{ borderRadius: 999, ...textSx.caption }}
          />
        </Stack>
      </Box>

      <Box>
        <Typography sx={{ ...textSx.section, color: colors.text }}>
          Lý do scheduler chọn hướng này
        </Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {(decision?.reasons ?? []).length > 0 ? (
            decision?.reasons.map((reason, index) => (
              <Stack
                key={`${reason}-${index}`}
                direction="row"
                spacing={1}
                alignItems="flex-start"
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  border: `1px solid ${colors.border}`,
                  bgcolor: "#FFFFFF",
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: "#FFFFFF",
                    bgcolor: colors.primary,
                    ...textSx.caption,
                    flex: "0 0 auto",
                  }}
                >
                  {index + 1}
                </Box>
                <Typography sx={{ ...textSx.helper, color: colors.text }}>
                  {reason}
                </Typography>
              </Stack>
            ))
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Chưa có lý do scheduler cho cycle này.
            </Alert>
          )}
        </Stack>
      </Box>

      {(evidence?.top_candidates ?? []).length > 0 && (
        <Box>
          <Typography sx={{ ...textSx.section, color: colors.text }}>
            Các kỹ năng được so sánh ROI
          </Typography>
          <Stack spacing={0.8} sx={{ mt: 1 }}>
            {evidence?.top_candidates.map((candidate) => (
              <Stack
                key={`${candidate.skill_key}-${candidate.part_type}`}
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                sx={{
                  p: 1.15,
                  borderRadius: 2,
                  border: `1px solid ${candidate.is_selected ? colors.primaryBorder : colors.border}`,
                  bgcolor: candidate.is_selected ? colors.primarySoft : "#FFFFFF",
                }}
              >
                <Box minWidth={0}>
                  <Typography sx={{ ...textSx.label, color: colors.text }}>
                    Part {candidate.part_type} · {candidate.skill_label}
                  </Typography>
                  <Typography sx={{ ...textSx.caption, color: colors.muted }}>
                    Ability hiện tại {candidate.current_ability_percent ?? "--"}%
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                  {candidate.is_selected && (
                    <Chip label="Được chọn" size="small" color="primary" sx={{ borderRadius: 999 }} />
                  )}
                  <Chip
                    label={`ROI/giờ ${formatNumber(candidate.expected_roi_per_hour)}`}
                    size="small"
                    sx={{ borderRadius: 999, ...textSx.caption }}
                  />
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}

      <Alert
        icon={<FactCheckOutlinedIcon />}
        severity="info"
        sx={{ borderRadius: 2, alignItems: "center" }}
      >
        Cuối cycle, hệ thống dùng {cycle.assessment_type === "full_test" ? "Full Test" : "Mini Test"} để đo lại năng lực và cập nhật lộ trình.
      </Alert>
    </Stack>
  );
}

function TraceTab({ data }: { data: LearningPathCycleExplanationResponse }) {
  const items = data.decision_trace ?? [];

  if (items.length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Chưa có dấu vết quyết định từ scheduler.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.1}>
      {items.map((item) => (
        <Box
          key={item.log_id}
          sx={{
            p: 1.35,
            borderRadius: 2.5,
            border: `1px solid ${colors.border}`,
            bgcolor: "#FFFFFF",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Box minWidth={0}>
              <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography sx={{ ...textSx.section, color: colors.text }}>
                  Cycle {item.cycle_no ?? "--"}
                </Typography>
                <Chip
                  label={item.scenario_label ?? item.scenario ?? "Chưa có scenario"}
                  size="small"
                  sx={{
                    height: 24,
                    borderRadius: 999,
                    color: colors.primary,
                    bgcolor: colors.primarySoft,
                    border: `1px solid ${colors.primaryBorder}`,
                    ...textSx.caption,
                  }}
                />
                <Chip
                  label={item.trigger_label}
                  size="small"
                  sx={{ height: 24, borderRadius: 999, ...textSx.caption }}
                />
              </Stack>
              <Typography sx={{ ...textSx.helper, color: colors.muted, mt: 0.4 }}>
                {formatDate(item.created_at)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
              {item.focus_part_type && (
                <Chip
                  label={`Part ${item.focus_part_type}`}
                  size="small"
                  sx={{ borderRadius: 999, ...textSx.caption }}
                />
              )}
              {item.cycle_mode_label && (
                <Chip
                  label={item.cycle_mode_label}
                  size="small"
                  sx={{ borderRadius: 999, ...textSx.caption }}
                />
              )}
              <Chip
                label={`ROI/giờ ${formatNumber(item.expected_roi_per_hour)}`}
                size="small"
                sx={{ borderRadius: 999, ...textSx.caption }}
              />
            </Stack>
          </Stack>
          <Divider sx={{ my: 1 }} />
          <Typography sx={{ ...textSx.label, color: colors.text }}>
            {item.primary_focus_skill_label ?? "Chưa có kỹ năng trọng tâm"}
          </Typography>
          {item.reason_summary && (
            <Typography sx={{ ...textSx.helper, color: colors.muted, mt: 0.35 }}>
              {item.reason_summary}
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  );
}

export default function LearningPathCycleExplanationModal({
  open,
  data,
  loading = false,
  errorMessage = null,
  onClose,
}: LearningPathCycleExplanationModalProps) {
  const [activeTab, setActiveTab] = React.useState<ExplanationTab>("overview");

  React.useEffect(() => {
    if (open) setActiveTab("overview");
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: { xs: 2.5, md: 3.5 },
          overflow: "hidden",
          boxShadow: "0 28px 80px rgba(15,23,42,0.28)",
        },
      }}
    >
      <DialogContent sx={{ p: 0, bgcolor: colors.softSurface }}>
        <Box sx={{ p: { xs: 2, md: 2.6 }, bgcolor: "#FFFFFF", borderBottom: `1px solid ${colors.border}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Stack direction="row" spacing={1.4} alignItems="center" minWidth={0}>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  color: colors.primary,
                  bgcolor: colors.primarySoft,
                  border: `1px solid ${colors.primaryBorder}`,
                  flex: "0 0 auto",
                }}
              >
                <LightbulbOutlinedIcon />
              </Box>
              <Box minWidth={0}>
                <Typography sx={{ ...textSx.title, color: colors.text }}>
                  Vì sao cycle này được chọn?
                </Typography>
                <Typography sx={{ ...textSx.helper, color: colors.muted, mt: 0.35 }}>
                  Giải thích dựa trên snapshot năng lực và quyết định của scheduler.
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              variant={activeTab === "overview" ? "contained" : "outlined"}
              startIcon={<InfoOutlinedIcon />}
              onClick={() => setActiveTab("overview")}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
            >
              Tổng quan
            </Button>
            <Button
              variant={activeTab === "trace" ? "contained" : "outlined"}
              startIcon={<TimelineOutlinedIcon />}
              onClick={() => setActiveTab("trace")}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
            >
              Dấu vết quyết định
            </Button>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, md: 2.6 }, minHeight: 360 }}>
          {loading && (
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ p: 2 }}>
              <CircularProgress size={22} />
              <Typography sx={{ ...textSx.helper, color: colors.muted }}>
                Đang tải giải thích từ scheduler...
              </Typography>
            </Stack>
          )}

          {!loading && errorMessage && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {!loading && !errorMessage && data && (
            activeTab === "overview" ? <OverviewTab data={data} /> : <TraceTab data={data} />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
