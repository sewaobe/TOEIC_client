import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Fade,
  FormHelperText,
  Grid,
  Paper,
  Slider,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Grow,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import InsightsIcon from "@mui/icons-material/Insights";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SchoolIcon from "@mui/icons-material/School";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useNavigate } from "react-router-dom";

// ==========================================================
// Types
// ==========================================================
type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
interface WeeklyPlan { Mon: number; Tue: number; Wed: number; Thu: number; Fri: number; Sat: number; Sun: number; }
interface PlacementPart { name: string; accuracy: number; }
interface PlacementResult { currentScore: number; parts: PlacementPart[]; createdAt: string; }
interface PlanDraft {
  targetScore?: number;
  weeklyPlan?: WeeklyPlan;          // per-day template for a "typical" week
  weeklyTotals?: number[];          // minutes per week (length = weeks)
  endDate?: string;                 // ISO yyyy-mm-dd
  activeStep?: number;
}

// ==========================================================
// Constants / Utils
// ==========================================================
const LS_KEY = "toeic_plan_draft";
const LS_PLACEMENT_KEY = "toeic_placement_result";

const SCORE_MIN = 200;
const SCORE_MAX = 990;
const SCORE_MARKS = [450, 550, 650, 750, 850].map((v) => ({ value: v, label: String(v) }));

const MIN_MINUTES = 30;
const MAX_MINUTES = 240;
const STEP_MINUTES = 15;

const WEEK_LABELS: Record<Weekday, string> = {
  Mon: "Thứ 2", Tue: "Thứ 3", Wed: "Thứ 4", Thu: "Thứ 5", Fri: "Thứ 6", Sat: "Thứ 7", Sun: "Chủ nhật",
};

const DEFAULT_WEEKLY: WeeklyPlan = { Mon: 60, Tue: 60, Wed: 60, Thu: 60, Fri: 60, Sat: 90, Sun: 90 };

// Mock placement result (nếu chưa có trong LS)
const PLACEMENT_MOCK: PlacementResult = {
  currentScore: 520,
  parts: [
    { name: "Listening P1", accuracy: 0.62 },
    { name: "Listening P2", accuracy: 0.55 },
    { name: "Listening P3", accuracy: 0.48 },
    { name: "Listening P4", accuracy: 0.44 },
    { name: "Reading P5", accuracy: 0.58 },
    { name: "Reading P6", accuracy: 0.52 },
    { name: "Reading P7", accuracy: 0.47 },
  ],
  createdAt: new Date().toISOString(),
};

function loadDraft(): PlanDraft {
  try { const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) as PlanDraft : {}; } catch { return {}; }
}
function saveDraft(draft: PlanDraft) { try { localStorage.setItem(LS_KEY, JSON.stringify(draft)); } catch { } }
function ensurePlacement(): PlacementResult {
  try {
    const raw = localStorage.getItem(LS_PLACEMENT_KEY);
    if (raw) return JSON.parse(raw) as PlacementResult;
  } catch { }
  try { localStorage.setItem(LS_PLACEMENT_KEY, JSON.stringify(PLACEMENT_MOCK)); } catch { }
  return PLACEMENT_MOCK;
}

function sumWeek(w: WeeklyPlan) { return Object.values(w).reduce((a, b) => a + b, 0); }
function toHours(min: number) { return (min / 60).toFixed(1); }
function clamp(n: number, min: number, max: number) { return Math.min(Math.max(n, min), max); }
function diffInDays(fromISO: string, toISO: string) {
  const a = new Date(fromISO); const b = new Date(toISO);
  return Math.max(0, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}
function diffInWeeks(fromISO: string, toISO: string) {
  return Math.max(1, Math.ceil(diffInDays(fromISO, toISO) / 7));
}
function addDays(iso: string, days: number) {
  const d = new Date(iso); d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ==========================================================
// Pedagogy helpers (heuristic dựa trên nghiên cứu giáo dục)
// ==========================================================
function getScoreHint(score: number) {
  if (score < 450) return { icon: <TipsAndUpdatesIcon sx={{ mr: 1 }} />, title: "Khởi động nền tảng", text: "Từ vựng cơ bản, trọng âm, cấu trúc câu. Bài tập ngắn hằng ngày.", tone: "secondary" as const };
  if (score < 650) return { icon: <InsightsIcon sx={{ mr: 1 }} />, title: "Củng cố kỹ năng", text: "Tăng tốc Part 2–4, skimming, từ vựng theo chủ đề, mô phỏng ETS.", tone: "primary" as const };
  if (score < 850) return { icon: <InsightsIcon sx={{ mr: 1 }} />, title: "Tối ưu hiệu suất", text: "Chiến lược từng Part, quản lý thời gian, phân tích lỗi theo đề.", tone: "success" as const };
  return { icon: <EmojiEventsIcon sx={{ mr: 1 }} />, title: "Nâng cấp đỉnh cao", text: "Finetune chiến thuật, đề full ETS, từ vựng học thuật & bẫy ngữ pháp.", tone: "success" as const };
}

/** Dải gợi ý tổng phút/tuần theo gap */
function suggestWeeklyTotalRange(gap: number): [number, number] {
  if (gap <= 100) return [180, 300];   // 3–5h
  if (gap <= 200) return [360, 540];   // 6–9h
  return [600, 840];                   // 10–14h
}

/** Liên tục: chọn 1 điểm trong dải dựa vào số tuần còn lại */
function chooseWeeklyTotal(gap: number, weeks: number): number {
  const [minW, maxW] = suggestWeeklyTotalRange(gap);
  const t = Math.max(0, Math.min(1, weeks <= 6 ? 0.8 : weeks >= 16 ? 0.35 : (16 - weeks) / 20 + 0.35));
  const val = Math.round(minW + (maxW - minW) * t);
  return clamp(val, 210, 900);
}

/** Trọng số từ placement (để giải thích interleaving) */
function weightsFromPlacement(parts: PlacementPart[]) {
  const lack = parts.map(p => ({ name: p.name, w: 1 - clamp(p.accuracy, 0, 1) }));
  const total = lack.reduce((a, b) => a + b.w, 0) || 1;
  const normalized = lack.map(p => ({ name: p.name, w: p.w / total }));
  const listenSum = normalized.filter(p => p.name.startsWith("Listening")).reduce((a, b) => a + b.w, 0);
  const biasL = clamp(listenSum, 0.45, 0.55);
  const k = listenSum ? biasL / listenSum : 1;
  return normalized.map(p =>
    p.name.startsWith("Listening")
      ? { ...p, w: p.w * k }
      : { ...p, w: p.w * ((1 - biasL) / (1 - listenSum || 1)) }
  );
}

/** Phân bổ ngày trong 1 tuần (spacing + timeboxing): 5 ngày nặng, 2 ngày nhẹ */
function distributeDaily(totalMin: number): WeeklyPlan {
  const heavyDays: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Sat"];
  const lightDays: Weekday[] = ["Fri", "Sun"];
  const heavyAlloc = Math.round(totalMin * 0.18);
  const lightAlloc = Math.round(totalMin * 0.14);
  const w: WeeklyPlan = { ...DEFAULT_WEEKLY };
  heavyDays.forEach(d => w[d] = clamp(heavyAlloc, MIN_MINUTES, MAX_MINUTES));
  lightDays.forEach(d => w[d] = clamp(lightAlloc, MIN_MINUTES, MAX_MINUTES));
  let diff = totalMin - sumWeek(w);
  const order: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  let i = 0;
  while (diff !== 0 && i < 200) {
    const day = order[i % 7];
    const step = diff > 0 ? STEP_MINUTES : -STEP_MINUTES;
    const next = w[day] + step;
    if (next >= MIN_MINUTES && next <= MAX_MINUTES) { w[day] = next; diff -= step; }
    i++;
  }
  return w;
}

/** Gợi ý: trả về weeklyTotals[] (mỗi tuần) + dailyTemplate (per-day) + rationale */
function autoSuggestPlan(placement: PlacementResult, targetScore: number, startISO: string, endISO: string) {
  const weeks = diffInWeeks(startISO, endISO);
  const days = diffInDays(startISO, endISO);
  const gap = Math.max(0, targetScore - placement.currentScore);

  const weeklyTotal = chooseWeeklyTotal(gap, weeks);
  const weeklyTotals = Array.from({ length: weeks }, () => weeklyTotal); // để bạn thay thuật toán tuần sau

  const dailyTemplate = distributeDaily(weeklyTotal);
  const weights = weightsFromPlacement(placement.parts);

  const rationale = [
    `Khoảng cách mục tiêu: ${gap} điểm · ${weeks} tuần (${days} ngày) đến hạn chót → ~${Math.round(weeklyTotal / 60)} giờ/tuần.`,
    `Áp dụng spacing (giãn cách) + interleaving (đan xen Listening/Reading) theo điểm yếu đầu vào.`,
    `Timeboxing 25–50’/block + nghỉ 5–10’; trần ${MAX_MINUTES}’/ngày để tránh quá tải.`,
    `Ví dụ trọng số kỹ năng: ${weights.slice(0, 3).map(w => `${w.name} ${Math.round(w.w * 100)}%`).join(" · ")} ...`,
  ];
  return { weeklyTotals, dailyTemplate, weeklyTotal, rationale, weeks, days };
}

// ==========================================================
// Step 1 — Target score
// ==========================================================
function TargetScoreStep(props: { value?: number; onChange: (v: number) => void; error?: string | null; placement: PlacementResult; }) {
  const { value = 650, onChange, error, placement } = props;
  const hint = getScoreHint(value);
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
      <Box flex={1}>
        <Typography variant="h6" sx={{ mb: 1 }}>Mục tiêu điểm TOEIC</Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Điểm đầu vào hiện tại: <b>{placement.currentScore}</b> (mock). Điều chỉnh mục tiêu để hệ thống lên kế hoạch phù hợp.
        </Alert>
        <Slider
          aria-label="Chọn mục tiêu điểm TOEIC"
          value={value}
          min={SCORE_MIN}
          max={SCORE_MAX}
          step={5}
          marks={SCORE_MARKS}
          valueLabelDisplay="on"
          onChange={(_, v) => onChange(v as number)}
        />
        {!!error && <FormHelperText error sx={{ mt: 1 }}>{error}</FormHelperText>}
      </Box>

      {/* Hint */}
      <Stack
        className="rounded-2xl"
        sx={{
          border: "1px solid", borderColor: "rgba(255,255,255,.15)",
          bgcolor: "rgba(255,255,255,.10)", backdropFilter: "blur(16px)",
          p: 2.5, minWidth: { md: 280 }, flex: { xs: "unset", md: "0 0 320px" },
        }}
      >
        <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
          {hint.icon}
          <Typography color={`${hint.tone}.main`} fontWeight={700}>{hint.title}</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">{hint.text}</Typography>
      </Stack>
    </Stack>
  );
}

// ==========================================================
// Step 2 — End date selection (with extras)
// ==========================================================
function EndDateStep(props: {
  endDate?: string;
  onChangeEndDate: (iso: string) => void;
  startISO: string;
  targetScore: number;
  placement: PlacementResult;
}) {
  const { endDate, onChangeEndDate, startISO, targetScore, placement } = props;
  const todayISO = startISO;
  const computedEnd = endDate ?? addDays(todayISO, 7 * 8); // default +8 tuần
  const weeks = diffInWeeks(todayISO, computedEnd);
  const days = diffInDays(todayISO, computedEnd);
  const gap = Math.max(0, targetScore - placement.currentScore);
  const weeklyTotal = chooseWeeklyTotal(gap, weeks);

  const quickPresets = [
    { label: "4 tuần", addDays: 28 },
    { label: "8 tuần", addDays: 56 },
    { label: "12 tuần", addDays: 84 },
  ];

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={1.5}>
            <Typography variant="h6">Chọn ngày kết thúc</Typography>
            <TextField
              type="date"
              size="medium"
              fullWidth
              aria-label="Chọn ngày kết thúc"
              value={computedEnd}
              onChange={(e) => onChangeEndDate(e.target.value)}
              helperText="Chọn hạn chót để hệ thống phân bổ tải học."
            />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {quickPresets.map(p => (
                <Button
                  key={p.label}
                  size="small"
                  variant="outlined"
                  startIcon={<CalendarMonthIcon />}
                  onClick={() => onChangeEndDate(addDays(todayISO, p.addDays))}
                >
                  {p.label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          {/* Info cards */}
          <Stack spacing={1.5}>
            <Paper
              elevation={0}
              className="rounded-2xl"
              sx={{ p: 2, border: "1px solid rgba(255,255,255,.15)", bgcolor: "rgba(255,255,255,.06)", backdropFilter: "blur(12px)" }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon color="primary" />
                <Typography variant="subtitle2" fontWeight={700}>Đếm ngược</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Còn <b>{weeks}</b> tuần / <b>{days}</b> ngày đến hạn chót.
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              className="rounded-2xl"
              sx={{ p: 2, border: "1px solid rgba(255,255,255,.15)", bgcolor: "rgba(255,255,255,.06)", backdropFilter: "blur(12px)" }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <TrendingUpIcon color="secondary" />
                <Typography variant="subtitle2" fontWeight={700}>Ước lượng khối lượng</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Khoảng cách điểm: <b>{gap}</b> → gợi ý ~ <b>{Math.round(weeklyTotal / 60)}</b> giờ/tuần (có thể điều chỉnh ở bước tiếp theo).
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              className="rounded-2xl"
              sx={{ p: 2, border: "1px solid rgba(255,255,255,.15)", bgcolor: "rgba(255,255,255,.06)", backdropFilter: "blur(12px)" }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <InfoOutlinedIcon color="success" />
                <Typography variant="subtitle2" fontWeight={700}>Mẹo nhỏ</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Chọn hạn chót thực tế. Nhiều tuần hơn ⇒ khối lượng mỗi tuần nhẹ hơn nhưng cần bền bỉ hơn.
              </Typography>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

// ==========================================================
// Step 3 — Detailed plan (refined layout)
// ==========================================================
function DetailedPlanStep(props: {
  weeklyTotals: number[];
  onChangeWeekTotal: (weekIndex: number, minutes: number) => void;
  dailyTemplate: WeeklyPlan;
  onChangeDaily: (d: Weekday, minutes: number) => void;
  onAutoSuggest: () => void;
  rationale: string[];
}) {
  const { weeklyTotals, onChangeWeekTotal, dailyTemplate, onChangeDaily, onAutoSuggest, rationale } = props;

  const avgWeek = weeklyTotals.length
    ? Math.round(weeklyTotals.reduce((a, b) => a + b, 0) / weeklyTotals.length)
    : 0;

  return (
    <Stack spacing={3}>
      {/* Header summary bar */}
      <Paper
        elevation={0}
        className="rounded-2xl"
        sx={{
          p: 2,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid rgba(255,255,255,.15)",
          bgcolor: "rgba(255,255,255,.06)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <AccessTimeIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>Tổng quan kế hoạch</Typography>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label={`Số tuần: ${weeklyTotals.length}`} size="small" variant="outlined" />
          <Chip label={`TB/tuần: ${avgWeek} phút (~${toHours(avgWeek)} giờ)`} size="small" variant="outlined" />
          <Chip label={`TB/ngày mẫu: ${Math.round(sumWeek(dailyTemplate) / 7)} phút`} size="small" variant="outlined" />
        </Stack>
        <Button size="small" variant="contained" startIcon={<AutoFixHighIcon />} onClick={onAutoSuggest}>
          Gợi ý tự động
        </Button>
      </Paper>

      {/* Two-column cards */}
      <Grid container spacing={3}>
        {/* Left card — Week totals */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            variant="outlined"
            className="rounded-2xl"
            sx={{ borderColor: "rgba(255,255,255,.15)", bgcolor: "rgba(255,255,255,.06)", backdropFilter: "blur(10px)" }}
          >
            <CardContent className="p-4">
              <Typography variant="h6" sx={{ mb: 2 }}>Tổng thời gian từng tuần</Typography>
              <Stack spacing={1.25} sx={{ maxHeight: 380, pr: 1 }}>
                {weeklyTotals.map((m, i) => (
                  <Stack key={i} spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">Tuần {i + 1}</Typography>
                      <Typography variant="body2" fontWeight={600}>{m} phút • ~{toHours(m)} giờ</Typography>
                    </Stack>
                    <Slider
                      aria-label={`Phút của tuần ${i + 1}`}
                      min={210} max={900} step={15}
                      value={m}
                      onChange={(_, v) => onChangeWeekTotal(i, v as number)}
                    />
                    <Divider sx={{ opacity: 0.2 }} />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right card — Daily template */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            variant="outlined"
            className="rounded-2xl"
            sx={{ borderColor: "rgba(255,255,255,.15)", bgcolor: "rgba(255,255,255,.06)", backdropFilter: "blur(10px)" }}
          >
            <CardContent className="p-4">
              <Typography variant="h6" sx={{ mb: 2 }}>Thời gian mỗi ngày (mẫu 1 tuần)</Typography>
              <Stack spacing={1}>
                {(Object.keys(WEEK_LABELS) as Weekday[]).map((d) => (
                  <Stack key={d} spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">{WEEK_LABELS[d]}</Typography>
                      <Typography variant="body2" fontWeight={600}>{dailyTemplate[d]} phút</Typography>
                    </Stack>
                    <Slider
                      aria-label={`Phút ngày ${WEEK_LABELS[d]}`}
                      min={MIN_MINUTES} max={MAX_MINUTES} step={STEP_MINUTES}
                      value={dailyTemplate[d]}
                      onChange={(_, v) => onChangeDaily(d, v as number)}
                    />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Full-width rationale section (vertical, eye-catching) */}
        <Grid size={{ xs: 12 }}>
          <Card
            variant="outlined"
            className="rounded-2xl"
            sx={{
              borderColor: "rgba(255,255,255,.15)",
              bgcolor: "rgba(255,255,255,.06)",
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent className="p-4 sm:p-5">
              {/* Header */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <TipsAndUpdatesIcon color="primary" />
                <Typography variant="h6" fontWeight={800}>
                  Vì sao gợi ý như vậy?
                </Typography>
              </Stack>

              {/* Vertical explanation list */}
              <Stack spacing={1.25}>
                {rationale.map((text, idx) => (
                  <Paper
                    key={idx}
                    elevation={0}
                    className="rounded-xl"
                    sx={{
                      p: 1.25,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      border: "1px solid rgba(255,255,255,.15)",
                      bgcolor: "rgba(255,255,255,.08)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <Chip
                      size="small"
                      color="primary"
                      label={idx + 1}
                      sx={{ fontWeight: 700, minWidth: 28 }}
                    />
                    <Typography variant="body2" sx={{ lineHeight: 1.55 }}>
                      {text}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

// ==========================================================
// PlanStepper
// ==========================================================
function PlanStepper({ activeStep }: { activeStep: number }) {
  const steps = ["Điểm", "Thời gian kết thúc", "Kế hoạch chi tiết"];
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}><StepLabel>{label}</StepLabel></Step>
      ))}
    </Stepper>
  );
}

// ==========================================================
// Main component
// ==========================================================
export default function PlanWizardDemo() {
  const placement = React.useMemo(() => ensurePlacement(), []);
  const todayISO = React.useMemo(() => new Date().toISOString().slice(0, 10), []);

  const initial = React.useMemo<PlanDraft>(() => {
    const d = loadDraft();
    return {
      targetScore: d.targetScore ?? Math.max(placement.currentScore + 130, 650),
      weeklyPlan: d.weeklyPlan ?? DEFAULT_WEEKLY,
      weeklyTotals: d.weeklyTotals ?? [],
      endDate: d.endDate,
      activeStep: d.activeStep ?? 0,
    };
  }, [placement.currentScore]);

  const [activeStep, setActiveStep] = React.useState<number>(initial.activeStep ?? 0);
  const [targetScore, setTargetScore] = React.useState<number>(initial.targetScore ?? 650);
  const [endDate, setEndDate] = React.useState<string | undefined>(initial.endDate);
  const [weeklyTotals, setWeeklyTotals] = React.useState<number[]>(initial.weeklyTotals ?? []);
  const [dailyTemplate, setDailyTemplate] = React.useState<WeeklyPlan>(initial.weeklyPlan ?? DEFAULT_WEEKLY);
  const [rationale, setRationale] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<{ targetScore?: string | null; endDate?: string | null; }>({});

  // Auto save
  React.useEffect(() => {
    saveDraft({ targetScore, weeklyPlan: dailyTemplate, weeklyTotals, endDate, activeStep });
  }, [targetScore, dailyTemplate, weeklyTotals, endDate, activeStep]);

  // Suggestion logic
  const runAutoSuggest = React.useCallback(() => {
    const untilISO = endDate ?? addDays(todayISO, 56);
    const { weeklyTotals: wt, dailyTemplate: templ, rationale: rs } =
      autoSuggestPlan(placement, targetScore, todayISO, untilISO);
    setWeeklyTotals(wt);
    setDailyTemplate(templ);
    setRationale(rs);
  }, [endDate, placement, targetScore, todayISO]);

  React.useEffect(() => {
    if (!weeklyTotals.length) runAutoSuggest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeWeekTotal = (idx: number, minutes: number) => {
    setWeeklyTotals((prev) => {
      const copy = [...prev]; copy[idx] = clamp(Math.round(minutes), 210, 900);
      return copy;
    });
  };
  const handleChangeDaily = (d: Weekday, minutes: number) => {
    setDailyTemplate((prev) => ({ ...prev, [d]: clamp(Math.round(minutes), MIN_MINUTES, MAX_MINUTES) }));
  };

  // Validation
  const validateCurrent = React.useCallback(() => {
    const e: typeof errors = {};
    if (activeStep === 0) {
      if (typeof targetScore !== "number" || targetScore < SCORE_MIN || targetScore > SCORE_MAX) {
        e.targetScore = "Vui lòng chọn mục tiêu hợp lệ (200–990).";
      }
    } else if (activeStep === 1) {
      if (!endDate) e.endDate = "Vui lòng chọn ngày kết thúc.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [activeStep, endDate, targetScore, errors]);

  const canNext = React.useMemo(() => {
    if (activeStep === 0)
      return typeof targetScore === "number" && targetScore >= SCORE_MIN && targetScore <= SCORE_MAX;
    if (activeStep === 1)
      return !!endDate;
    if (activeStep === 2)
      return weeklyTotals.length > 0;
    return false;
  }, [activeStep, targetScore, endDate, weeklyTotals.length]);
  const navigate = useNavigate();
  const handleNext = () => {
    if (!validateCurrent()) return;
    if (activeStep === 1) {
      // Sau khi chọn endDate xong, sinh lại dữ liệu cho Step 3
      runAutoSuggest();
    }
    if (activeStep < 2) setActiveStep((s) => s + 1);
    else {
      const plan = { targetScore, endDate, weeklyTotals, dailyTemplate, placement };
      // eslint-disable-next-line no-console
      console.log("PLAN_READY:", plan);
      navigate("/programs")
    }
  };
  const handleBack = () => setActiveStep((s) => Math.max(0, s - 1));

  // UI
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        // nền đẹp mắt hơn
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4ecf5 100%)", // pastel neutral gradient
        // có thể thử theme.palette.grey[100] hoặc ảnh pattern subtle
        display: "flex",
        flexDirection: "column",
        paddingY: "3%"
      }}
    >
      <Container
        className="max-w-[1000px] mx-auto p-4 sm:p-6 min-h-screen"
        sx={{
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.25)",
          bgcolor: "rgba(255,255,255,0.4)", // translucent khác với card trắng
          backdropFilter: "blur(20px)",     // morphin/glassy effect
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header sticky */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          className="relative top-0 z-10"
          sx={{
            border: "1px solid", borderColor: "rgba(255,255,255,.15)",
            bgcolor: "rgba(255,255,255,.10)", backdropFilter: "blur(16px)",
            px: 2, py: 1, borderRadius: "16px", mb: 2,
          }}
        >
          <Button
            onClick={handleBack} // hoặc logic của bạn
            startIcon={<ArrowBackIosNewIcon fontSize="small" />}
            color="inherit"
            size="small"
            variant="text"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 1.25,
              py: 0.5,
              lineHeight: 1.2,
              borderRadius: 999,
              // glassy pill
              bgcolor: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(8px)",
              transition: "all .2s ease",
              // text/icon màu xám trung tính để dịu mắt
              "& .MuiButton-startIcon": { mr: 0.5 },
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.16)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                transform: "translateY(-1px)",
              },
              "&:active": {
                transform: "translateY(0px)",
                boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
              },
            }}
          >
            Quay lại
          </Button>


          <Stack direction="row" alignItems="center" spacing={1}>
            <SchoolIcon color="primary" />
            <Typography variant="h4" fontWeight={800} letterSpacing={0.2}>
              Tạo lộ trình học
            </Typography>
          </Stack>

          <Box width={40} /> {/* spacer */}
        </Stack>

        {/* Card */}
        <Card
          className="!rounded-xl shadow-lg"
          sx={{ border: "1px solid rgba(255,255,255,.15)", bgcolor: "rgba(255,255,255,.10)", backdropFilter: "blur(16px)" }}
        >
          <CardContent className="p-4 sm:p-6">
            {/* Stepper */}
            <Box sx={{ mb: 3 }}>
              <PlanStepper activeStep={activeStep} />
            </Box>

            <Divider className="my-4" />

            {/* Steps */}
            <Box sx={{ minHeight: 320 }}>
              {activeStep === 0 && (
                <Grow in mountOnEnter unmountOnExit>
                  <Box>
                    <TargetScoreStep
                      value={targetScore}
                      onChange={setTargetScore}
                      error={errors.targetScore}
                      placement={placement}
                    />
                  </Box>
                </Grow>
              )}

              {activeStep === 1 && (
                <Fade in mountOnEnter unmountOnExit>
                  <Box>
                    <EndDateStep
                      endDate={endDate}
                      onChangeEndDate={setEndDate}
                      startISO={todayISO}
                      targetScore={targetScore}
                      placement={placement}
                    />
                    {!!errors.endDate && <FormHelperText error sx={{ mt: 1 }}>{errors.endDate}</FormHelperText>}
                  </Box>
                </Fade>
              )}

              {activeStep === 2 && (
                <Fade in mountOnEnter unmountOnExit>
                  <Box>
                    <DetailedPlanStep
                      weeklyTotals={weeklyTotals}
                      onChangeWeekTotal={handleChangeWeekTotal}
                      dailyTemplate={dailyTemplate}
                      onChangeDaily={handleChangeDaily}
                      onAutoSuggest={runAutoSuggest}
                      rationale={rationale}
                    />
                  </Box>
                </Fade>
              )}
            </Box>

            <Divider className="my-4" />

            {/* Footer actions */}
            <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={2} justifyContent="space-between">
              <Button variant="outlined" size="large" onClick={handleBack} disabled={activeStep === 0} fullWidth>
                Quay lại
              </Button>
              <Button variant="contained" size="large" onClick={handleNext} disabled={!canNext} fullWidth>
                {activeStep < 2 ? "Tiếp tục" : "Bắt đầu"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
