import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Slider,
  Stack,
  Typography,
  Tabs,
  Tab,
  Box,
  Alert,
  Collapse,
  TextField,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import useLocalStorage from "../../hooks/useLocalStorage";
import { diffInWeeks } from "../../utils/date";
import { getHoursNeeded } from "../../utils/estimatedStudyHour";
import { WEEKDAYS, redistributeWeeks, redistributeDays } from "../../utils/planDistribution";
import { PieChart } from "@mui/x-charts/PieChart";
import { Weekday } from "../../types/PlanWizard";
import { pieArcClasses, pieClasses } from "@mui/x-charts/PieChart";
import { Pulse, Shake } from "../animations/motionWrappers";

// Hàm tạo dải màu HSL đều nhau
const generateColors = (count: number): string[] => {
  return Array.from({ length: count }, (_, i) => {
    const hue = (i * 360) / count; // xoay đều quanh vòng màu
    return `hsl(${hue}, 70%, 50%)`;
  });
};

const WEEK_LABELS: Record<string, string> = {
  Mon: "Thứ 2",
  Tue: "Thứ 3",
  Wed: "Thứ 4",
  Thu: "Thứ 5",
  Fri: "Thứ 6",
  Sat: "Thứ 7",
  Sun: "Chủ nhật",
};

const MIN_DAY = 30;
const MAX_DAY = 600;
const MIN_WEEK = 7 * MIN_DAY;
const MAX_WEEK = 7 * 1440;

const TimeInput = ({
  value,
  min,
  max,
  onChange,
  step = 5,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  step?: number;
}) => {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {/* Nút giảm */}
      <Button
        variant="outlined"
        size="small"
        onClick={() => onChange(clamp(value - step))}
        sx={{ minWidth: 38, px: 1 }}
      >
        -
      </Button>

      {/* TextField nhập phút */}
      <TextField
        value={value}
        size="small"
        type="number"
        onChange={(e) => {
          const raw = Number(e.target.value);
          if (!isNaN(raw)) onChange(clamp(raw));
        }}
        onBlur={(e) => {
          // auto fix value
          const raw = Number(e.target.value);
          onChange(clamp(raw));
        }}
        inputProps={{
          min,
          max,
          style: { textAlign: "center", width: 70, fontWeight: 600 },
        }}
      />

      <Typography variant="body2" sx={{ minWidth: 40 }}>
        phút
      </Typography>

      {/* Nút tăng */}
      <Button
        variant="outlined"
        size="small"
        onClick={() => onChange(clamp(value + step))}
        sx={{ minWidth: 38, px: 1 }}
      >
        +
      </Button>
    </Stack>
  );
};


export const DetailedPlanStep = () => {
  const [planEnd] = useLocalStorage<string>("plan_end", "");
  const [planStart] = useLocalStorage<string>("plan_start", "");
  const [targetScore] = useLocalStorage<number>("score_target_plan", 650);

  const totalWeek = diffInWeeks(planStart, planEnd);
  const totalHours = getHoursNeeded(400, targetScore);
  const totalMinutes = Math.max(0, Math.round(totalHours * 60));
  const weeklyHours = totalWeek > 0 ? parseFloat((totalHours / totalWeek).toFixed(1)) : 0;

  const [weeklyTotals, setWeeklyTotals] = useLocalStorage<number[]>("weekly_totals", []);
  const [weekDays, setWeekDays] = useLocalStorage<Record<string, any>>("weekly_days", {});
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [tab, setTab] = useState(0);
  const [warning, setWarning] = useState<string>("");

  useEffect(() => {
    // Chỉ kiểm tra khi có dữ liệu
    if (!weeklyTotals || weeklyTotals.length === 0) {
      setWarning("");
      return;
    }

    // Tìm số phút học cao nhất trong tất cả các tuần
    const maxMinutesInAnyWeek = Math.max(...weeklyTotals);
    const maxHoursInAnyWeek = maxMinutesInAnyWeek / 60;

    // So sánh với ngưỡng đã định nghĩa
    if (maxHoursInAnyWeek > 32) {
      setWarning(
        `Khối lượng học ${weeklyHours} giờ/tuần vượt quá mức tối đa 32 giờ/tuần. Bạn nên nới lỏng thời gian học để đạt được hiệu quả tốt nhất.`
      );
    } else {
      // Nếu không có tuần nào vượt ngưỡng, xóa cảnh báo
      setWarning("");
    }

  }, [weeklyTotals]);

  const makeEvenWeekPlan = (weekTotal: number) => {
    const per = Math.max(MIN_DAY, Math.round(weekTotal / 7));
    const base: any = { Mon: per, Tue: per, Wed: per, Thu: per, Fri: per, Sat: per, Sun: per };
    let sum = WEEKDAYS.reduce((a, d) => a + base[d], 0);
    let adjust = Math.max(0, weekTotal) - sum;
    let idx = 0;
    while (adjust !== 0 && idx < 21) {
      for (const d of WEEKDAYS) {
        if (adjust === 0) break;
        const tryVal = base[d] + Math.sign(adjust);
        if (tryVal >= MIN_DAY && tryVal <= MAX_DAY) {
          base[d] = tryVal;
          adjust -= Math.sign(adjust);
        }
      }
      idx++;
    }
    return base;
  };

  useEffect(() => {
    if (totalWeek <= 0 || totalMinutes <= 0) {
      setWeeklyTotals([]);
      setWeekDays({});
      return;
    }
    if (weeklyTotals.length === totalWeek && Object.keys(weekDays).length === totalWeek) return;

    const evenPerWeek = Math.max(MIN_WEEK, Math.round(totalMinutes / totalWeek));
    const totals = Array(totalWeek).fill(evenPerWeek);
    let diff = totalMinutes - totals.reduce((a, b) => a + b, 0);
    let i = 0;
    while (diff !== 0 && i < 3 * totalWeek) {
      const k = i % totalWeek;
      const tryVal = totals[k] + Math.sign(diff);
      if (tryVal >= MIN_WEEK && tryVal <= MAX_WEEK) {
        totals[k] = tryVal;
        diff -= Math.sign(diff);
      }
      i++;
    }

    const daysMap: Record<string, any> = {};
    totals.forEach((t, idx) => {
      daysMap[String(idx)] = makeEvenWeekPlan(t);
    });

    setWeeklyTotals(totals);
    setWeekDays(daysMap);
    setSelectedWeek(1);
  }, [totalWeek, totalMinutes]);

  const actualTotalMinutes = useMemo(
    () => (weeklyTotals.length ? weeklyTotals.reduce((a, b) => a + b, 0) : totalMinutes),
    [weeklyTotals, totalMinutes]
  );

  const handleWeekChange = (index: number, newVal: number) => {
    if (!weeklyTotals.length) return;

    const redistributed = redistributeWeeks(weeklyTotals, index, Math.round(newVal), MIN_WEEK, MAX_WEEK);

    const newWeekDays: Record<string, any> = { ...weekDays };
    redistributed.forEach((newTotal, i) => {
      const key = String(i + 1);
      const oldPlan = newWeekDays[key] ?? makeEvenWeekPlan(newTotal);
      const oldSum = WEEKDAYS.reduce((a, d) => a + oldPlan[d], 0) || 1;
      const scaled: any = { ...oldPlan };
      WEEKDAYS.forEach((d) => {
        const v = Math.round((oldPlan[d] * newTotal) / oldSum);
        scaled[d] = Math.max(MIN_DAY, Math.min(MAX_DAY, v));
      });
      let adjust = newTotal - WEEKDAYS.reduce((a, d) => a + scaled[d], 0);
      let guard = 0;
      while (adjust !== 0 && guard < 21) {
        guard++;
        for (const d of WEEKDAYS) {
          if (adjust === 0) break;
          const tryVal = scaled[d] + Math.sign(adjust);
          if (tryVal >= MIN_DAY && tryVal <= MAX_DAY) {
            scaled[d] = tryVal;
            adjust -= Math.sign(adjust);
          }
        }
      }
      newWeekDays[key] = scaled;
    });

    setWeeklyTotals(redistributed);
    setWeekDays(newWeekDays);
    setSelectedWeek(index + 1);
  };

  const handleDayChange = (day: string, newVal: number) => {
    const key = String(selectedWeek);
    const cur = weekDays[key];
    if (!cur) return;

    const updated = redistributeDays(cur, day as Weekday, Math.round(newVal), MIN_DAY, MAX_DAY);

    const weekTotal = weeklyTotals[selectedWeek - 1] ?? WEEKDAYS.reduce((a, d) => a + updated[d], 0);
    let adjust = weekTotal - WEEKDAYS.reduce((a, d) => a + updated[d], 0);
    let guard = 0;
    while (adjust !== 0 && guard < 21) {
      guard++;
      for (const d of WEEKDAYS) {
        if (adjust === 0) break;
        const tryVal = updated[d] + Math.sign(adjust);
        if (tryVal >= MIN_DAY && tryVal <= MAX_DAY) {
          updated[d] = tryVal;
          adjust -= Math.sign(adjust);
        }
      }
    }

    setWeekDays({ ...weekDays, [key]: updated });
  };

  const weeklyPieData = weeklyTotals.map((m, i) => ({
    id: i,
    value: m,
    label: `Tuần ${i + 1}`,
    color: generateColors(weeklyTotals.length)[i],
  }));

  const dailyPieData = WEEKDAYS.map((d, idx) => ({
    id: idx,
    value: weekDays[String(selectedWeek)]?.[d] || 0,
    label: WEEK_LABELS[d],
    color: generateColors(WEEKDAYS.length)[idx],
  }));

  console.log("weeklyPieData", weeklyPieData);
  console.log("dailyPieData", dailyPieData);

  return (
    <Stack spacing={3}>
      {/* Header */}
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
          <Typography variant="subtitle1" fontWeight={700}>
            Tổng quan kế hoạch
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label={`Số tuần: ${totalWeek}`} size="small" variant="outlined" />
          <Chip label={`TB/tuần: ${weeklyHours * 60} phút (~${weeklyHours} giờ)`} size="small" variant="outlined" />
          <Chip
            label={`TB/ngày: ${Math.ceil((weeklyHours * 60) / 7)} phút (~${Math.ceil(weeklyHours / 7)} giờ)`}
            size="small"
            variant="outlined"
          />
        </Stack>
        <Button
          size="small"
          variant="contained"
          startIcon={<AutoFixHighIcon />}
          onClick={() => {
            if (totalWeek <= 0) return;
            const evenPerWeek = Math.max(MIN_WEEK, Math.round(actualTotalMinutes / totalWeek));
            const totals = Array(totalWeek).fill(evenPerWeek);
            let diff = actualTotalMinutes - totals.reduce((a, b) => a + b, 0);
            let i = 0;
            while (diff !== 0 && i < 3 * totalWeek) {
              const k = i % totalWeek;
              const tryVal = totals[k] + Math.sign(diff);
              if (tryVal >= MIN_WEEK && tryVal <= MAX_WEEK) {
                totals[k] = tryVal;
                diff -= Math.sign(diff);
              }
              i++;
            }
            const daysMap: Record<string, any> = {};
            totals.forEach((t, idx) => {
              daysMap[String(idx + 1)] = makeEvenWeekPlan(t);
            });
            setWeeklyTotals(totals);
            setWeekDays(daysMap);
            setSelectedWeek(1);
          }}
        >
          Gợi ý tự động
        </Button>
      </Paper>

      <Collapse in={!!warning}>
        {/* Dùng !!warning để chuyển chuỗi thành boolean (true/false) */}
        <Alert severity="warning" variant="filled" sx={{ borderRadius: 2, mb: warning ? 3 : 0 }}>
          {warning}
        </Alert>
      </Collapse>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="📊 Biểu đồ" />
          <Tab label="✏️ Chỉnh sửa" />
        </Tabs>
      </Box>

      {/* Tab 1 - Biểu đồ */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" className="rounded-2xl">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Biểu đồ tổng quan thời gian theo tuần
                </Typography>
                <PieChart
                  series={[
                    {
                      data: weeklyPieData,
                      innerRadius: 40,
                      outerRadius: 120,
                      paddingAngle: 2,
                      highlightScope: { fade: 'global', highlight: 'item' },
                      faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                      arcLabel: (item) => `${item.label}`, // hoặc `${item.value} phút`
                      arcLabelMinAngle: 20, // chỉ hiện label nếu slice đủ lớn
                    }
                  ]}
                  height={300}
                  onItemClick={(e, d) => setSelectedWeek(d.dataIndex + 1)}

                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" className="rounded-2xl">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Biểu đồ phân bổ thời gian trong tuần {selectedWeek}
                </Typography>
                <PieChart
                  series={[{ data: dailyPieData, innerRadius: 40, outerRadius: 120, paddingAngle: 2, highlightScope: { fade: 'global', highlight: 'item' }, }]}
                  height={300}
                  sx={{
                    [`.${pieClasses.series}[data-series="outer"] .${pieArcClasses.root}`]: {
                      opacity: 0.6,
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2 - Chỉnh sửa */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card variant="outlined" className="rounded-2xl">
              <CardContent className="p-4">
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Tổng thời gian từng tuần
                </Typography>
                <Stack spacing={1.25} sx={{ pr: 1 }}>
                  {Array.from({ length: totalWeek }, (_, i) => i + 1).map((week) => {
                    const m = weeklyTotals[week - 1] ?? Math.ceil(weeklyHours * 60);
                    return (
                      <Stack key={week} spacing={0.5} onClick={() => setSelectedWeek(week)}>

                        {/* Tuần + TimeInput cùng hàng */}
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={2}
                        >
                          {/* Label Tuần */}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ minWidth: 70 }}
                          >
                            Tuần {week}
                          </Typography>

                          {/* TimeInput */}
                          <TimeInput
                            value={m}
                            min={MIN_WEEK}
                            max={MAX_WEEK}
                            step={15}
                            onChange={(v) => {
                              React.startTransition(() => handleWeekChange(week - 1, v))
                            }}
                          />
                        </Stack>

                        <Divider sx={{ opacity: 0.2 }} />
                      </Stack>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card variant="outlined" className="rounded-2xl">
              <CardContent className="p-4">
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Thời gian mỗi ngày trong tuần {selectedWeek}
                </Typography>
                <Stack spacing={1}>
                  {WEEKDAYS.map((d) => {
                    const plan = weekDays[String(selectedWeek)] || makeEvenWeekPlan(Math.ceil(weeklyHours * 60));
                    const val = plan[d];
                    return (
                      <Stack
                        key={d}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                      >
                        {/* Tên ngày */}
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 70 }}>
                          {WEEK_LABELS[d]}
                        </Typography>

                        {/* TimeInput nằm cùng hàng */}
                        <TimeInput
                          value={val}
                          min={MIN_DAY}
                          max={MAX_DAY}
                          step={5}
                          onChange={(v) => {
                            React.startTransition(() => handleDayChange(d, v))
                          }}
                        />
                      </Stack>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      <Grid size={{ xs: 12, md: 12 }}>
        <Card variant="outlined" className="rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <TipsAndUpdatesIcon color="primary" />
              <Typography variant="h6" fontWeight={800}>
                Vì sao gợi ý như vậy?
              </Typography>
            </Stack>
            <Stack spacing={1.25}>
              {["Giữ cân bằng tổng thời gian", "Phân bổ hợp lý từng ngày", "Tối ưu hiệu suất học", "Dễ dàng điều chỉnh"].map(
                (text, idx) => (
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
                    <Chip size="small" color="primary" label={idx + 1} sx={{ fontWeight: 700, minWidth: 28 }} />
                    <Typography variant="body2" sx={{ lineHeight: 1.55 }}>
                      {text}
                    </Typography>
                  </Paper>
                )
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Stack>
  );
};
