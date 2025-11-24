import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
  Tabs,
  Tab,
  Box,
  Alert,
  Collapse,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import useLocalStorage from "../../hooks/useLocalStorage";
import { diffInWeeks } from "../../utils/date";
import { getHoursNeeded } from "../../utils/estimatedStudyHour";
import { WEEKDAYS, redistributeWeeks, redistributeDays } from "../../utils/planDistribution";
import { PieChart } from "@mui/x-charts/PieChart";
import { Weekday } from "../../types/PlanWizard";
import { pieArcClasses, pieClasses } from "@mui/x-charts/PieChart";

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

const MIN_DAY = 0;
const MAX_DAY = 24*60;
const MIN_WEEK = 7 * MIN_DAY;
const MAX_WEEK = 7 * 1440;

// const TimeInput = ({
//   value,
//   min,
//   max,
//   onChange,
//   step = 5,
// }: {
//   value: number;
//   min: number;
//   max: number;
//   onChange: (v: number) => void;
//   step?: number;
// }) => {
//   const clamp = (v: number) => Math.max(min, Math.min(max, v));

//   return (
//     <Stack direction="row" spacing={1} alignItems="center">
//       {/* Nút giảm */}
//       <Button
//         variant="outlined"
//         size="small"
//         onClick={() => onChange(clamp(value - step))}
//         sx={{ minWidth: 38, px: 1 }}
//       >
//         -
//       </Button>

//       {/* TextField nhập phút */}
//       <TextField
//         value={value}
//         size="small"
//         type="number"
//         onChange={(e) => {
//           const raw = Number(e.target.value);
//           if (!isNaN(raw)) onChange(clamp(raw));
//         }}
//         onBlur={(e) => {
//           // auto fix value
//           const raw = Number(e.target.value);
//           onChange(clamp(raw));
//         }}
//         inputProps={{
//           min,
//           max,
//           style: { textAlign: "center", width: 70, fontWeight: 600 },
//         }}
//       />

//       <Typography variant="body2" sx={{ minWidth: 40 }}>
//         phút
//       </Typography>

//       {/* Nút tăng */}
//       <Button
//         variant="outlined"
//         size="small"
//         onClick={() => onChange(clamp(value + step))}
//         sx={{ minWidth: 38, px: 1 }}
//       >
//         +
//       </Button>
//     </Stack>
//   );
// };

export const DetailedPlanStep = ({ startScore }: { startScore?: number }) => {
  const [planEnd] = useLocalStorage<string>("plan_end", "");
  const [planStart] = useLocalStorage<string>("plan_start", "");
  const [targetScore] = useLocalStorage<number>("score_target_plan", 650);

  const totalWeek = diffInWeeks(planStart, planEnd);
  const totalHours = getHoursNeeded(startScore ?? 400, targetScore);
  const totalMinutes = Math.max(0, Math.round(totalHours * 60));
  const weeklyHours = totalWeek > 0 ? parseFloat((totalHours / totalWeek).toFixed(1)) : 0;

  const [weeklyTotals, setWeeklyTotals] = useLocalStorage<number[]>("weekly_totals", []);
  const [weekDays, setWeekDays] = useLocalStorage<Record<string, any>>("weekly_days", {});
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [tab, setTab] = useState(0);
  const [warning, setWarning] = useState<string>("");
  // editing buffers so typing isn't clamped and to allow commit onBlur/Enter
  const [editingCells, setEditingCells] = useState<Record<string, string>>({});
  const [editingWeekTotals, setEditingWeekTotals] = useState<Record<number, string>>({});
  // locked weeks: when true, redistribution preserves that week
  const [lockedWeeks, setLockedWeeks] = useState<Record<number, boolean>>({});

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

  // Allow editing the total minutes for a week and redistribute difference across unlocked weeks
  const handleWeekTotalChange = (weekIndex: number, newTotal: number) => {
    if (!weeklyTotals || weeklyTotals.length === 0) return;
    const idx = weekIndex - 1;
    const oldTotal = weeklyTotals[idx] ?? 0;
    const diff = Math.round(newTotal) - Math.round(oldTotal);
    if (diff === 0) {
      // still mark as locked (user changed then set same)
      setLockedWeeks((prev) => ({ ...prev, [weekIndex]: true }));
      return;
    }

    const totalCurrent = weeklyTotals.reduce((a, b) => a + b, 0);
    const lockedIdxs = Object.entries(lockedWeeks).filter(([k, v]) => v).map(([k]) => Number(k) - 1).filter((i) => i !== idx);
    const lockedSum = lockedIdxs.reduce((s, i) => s + (weeklyTotals[i] || 0), 0);

    const unlockedIdxs = Array.from({ length: weeklyTotals.length }, (_, i) => i).filter((i) => i !== idx && !lockedIdxs.includes(i));

    if (unlockedIdxs.length === 0) {
      // no unlocked weeks to adjust: just set this week's total
      setWeeklyTotals((prev) => {
        const copy = prev && prev.length ? [...prev] : Array(weeklyTotals.length).fill(0);
        copy[idx] = Math.round(newTotal);
        return copy;
      });
      setWeekDays((prev) => ({ ...prev, [String(weekIndex)]: makeEvenWeekPlan(Math.round(newTotal)) }));
      setLockedWeeks((prev) => ({ ...prev, [weekIndex]: true }));
      return;
    }

    const sumUnlockedCurrent = unlockedIdxs.reduce((s, i) => s + (weeklyTotals[i] || 0), 0) || unlockedIdxs.length;
    // new sum for unlocked weeks should absorb the inverse of diff so totalCurrent stays the same
    const newSumUnlocked = Math.max(0, sumUnlockedCurrent - diff);

    const redistributed = [...weeklyTotals];
    redistributed[idx] = Math.round(newTotal);

    unlockedIdxs.forEach((i) => {
      const proportion = (weeklyTotals[i] || 0) / sumUnlockedCurrent;
      redistributed[i] = Math.round(proportion * newSumUnlocked);
    });

    // fix rounding differences
    let adjust = (totalCurrent - lockedSum) - (redistributed[idx] + unlockedIdxs.reduce((s, i) => s + redistributed[i], 0));
    let guard = 0;
    while (adjust !== 0 && guard < 200) {
      for (const i of unlockedIdxs) {
        if (adjust === 0) break;
        redistributed[i] = Math.max(0, redistributed[i] + Math.sign(adjust));
        adjust -= Math.sign(adjust);
      }
      guard++;
    }

    // scale per-day plans for changed weeks
    const newWeekDays: Record<string, any> = { ...weekDays };
    redistributed.forEach((wt, i) => {
      const key = String(i + 1);
      const oldPlan = newWeekDays[key] ?? makeEvenWeekPlan(wt);
      // simple proportional scaling of days
      const oldSum = WEEKDAYS.reduce((a, d) => a + oldPlan[d], 0) || 1;
      const scaled: any = {};
      WEEKDAYS.forEach((d) => {
        scaled[d] = Math.round((oldPlan[d] * wt) / oldSum);
      });
      newWeekDays[key] = scaled;
    });

    setWeeklyTotals(redistributed);
    setWeekDays(newWeekDays);
    setLockedWeeks((prev) => ({ ...prev, [weekIndex]: true }));
  };

  const toggleLockWeek = (weekIndex: number) => {
    setLockedWeeks((prev) => ({ ...prev, [weekIndex]: !prev[weekIndex] }));
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

  // Use currently-distributed weeklyTotals as the source of truth for header display.
  const avgWeeklyMinutes = (weeklyTotals && weeklyTotals.length)
    ? Math.round(weeklyTotals.reduce((a, b) => a + b, 0) / weeklyTotals.length)
    : Math.round(weeklyHours * 60);

  const avgDailyMinutes = Math.ceil(avgWeeklyMinutes / 7);

  // const handleWeekChange = (index: number, newVal: number) => {
  //   if (!weeklyTotals.length) return;

  //   const redistributed = redistributeWeeks(weeklyTotals, index, Math.round(newVal), MIN_WEEK, MAX_WEEK);

  //   const newWeekDays: Record<string, any> = { ...weekDays };
  //   redistributed.forEach((newTotal, i) => {
  //     const key = String(i + 1);
  //     const oldPlan = newWeekDays[key] ?? makeEvenWeekPlan(newTotal);
  //     const oldSum = WEEKDAYS.reduce((a, d) => a + oldPlan[d], 0) || 1;
  //     const scaled: any = { ...oldPlan };
  //     WEEKDAYS.forEach((d) => {
  //       const v = Math.round((oldPlan[d] * newTotal) / oldSum);
  //       scaled[d] = Math.max(MIN_DAY, Math.min(MAX_DAY, v));
  //     });
  //     let adjust = newTotal - WEEKDAYS.reduce((a, d) => a + scaled[d], 0);
  //     let guard = 0;
  //     while (adjust !== 0 && guard < 21) {
  //       guard++;
  //       for (const d of WEEKDAYS) {
  //         if (adjust === 0) break;
  //         const tryVal = scaled[d] + Math.sign(adjust);
  //         if (tryVal >= MIN_DAY && tryVal <= MAX_DAY) {
  //           scaled[d] = tryVal;
  //           adjust -= Math.sign(adjust);
  //         }
  //       }
  //     }
  //     newWeekDays[key] = scaled;
  //   });

  //   setWeeklyTotals(redistributed);
  //   setWeekDays(newWeekDays);
  //   setSelectedWeek(index + 1);
  // };

  // const handleDayChange = (day: string, newVal: number) => {
  //   const key = String(selectedWeek);
  //   const cur = weekDays[key];
  //   if (!cur) return;

  //   const updated = redistributeDays(cur, day as Weekday, Math.round(newVal), MIN_DAY, MAX_DAY);

  //   const weekTotal = weeklyTotals[selectedWeek - 1] ?? WEEKDAYS.reduce((a, d) => a + updated[d], 0);
  //   let adjust = weekTotal - WEEKDAYS.reduce((a, d) => a + updated[d], 0);
  //   let guard = 0;
  //   while (adjust !== 0 && guard < 21) {
  //     guard++;
  //     for (const d of WEEKDAYS) {
  //       if (adjust === 0) break;
  //       const tryVal = updated[d] + Math.sign(adjust);
  //       if (tryVal >= MIN_DAY && tryVal <= MAX_DAY) {
  //         updated[d] = tryVal;
  //         adjust -= Math.sign(adjust);
  //       }
  //     }
  //   }

  //   setWeekDays({ ...weekDays, [key]: updated });
  // };

  // Allow editing a specific week's day cell (used by table where user can edit any week)
  const handleDayChangeForWeek = (weekIndex: number, day: string, newVal: number) => {
    const key = String(weekIndex);
    const cur = weekDays[key] ?? makeEvenWeekPlan(weeklyTotals[weekIndex - 1] ?? Math.ceil(weeklyHours * 60));

    const updated = redistributeDays(cur, day as Weekday, Math.round(newVal), MIN_DAY, MAX_DAY);

    const weekTotal = weeklyTotals[weekIndex - 1] ?? WEEKDAYS.reduce((a, d) => a + updated[d], 0);
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

    // update weekDays and also sync weeklyTotals for that week
    setWeekDays((prev) => ({ ...prev, [key]: updated }));

    const newWeekSum = WEEKDAYS.reduce((a, d) => a + (updated[d] || 0), 0);
    setWeeklyTotals((prev) => {
      const copy = prev && prev.length ? [...prev] : Array(totalWeek).fill(Math.round(actualTotalMinutes / Math.max(1, totalWeek)));
      copy[weekIndex - 1] = newWeekSum;
      return copy;
    });

    // mark week as manual/locked so automatic redistribution avoids it
    setLockedWeeks((prev) => ({ ...prev, [weekIndex]: true }));
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
          <Chip label={`TB/tuần: ${avgWeeklyMinutes} phút (~${(avgWeeklyMinutes / 60).toFixed(1)} giờ)`} size="small" variant="outlined" />
          <Chip
            label={`TB/ngày: ${avgDailyMinutes} phút (~${Math.ceil(avgDailyMinutes / 60)} giờ)`}
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

      {/* Tab 2 - Chỉnh sửa: Bảng tuần x ngày */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined" className="rounded-2xl">
              <CardContent className="p-4">
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Chi tiết phân bổ (Tuần × Ngày)
                </Typography>

                <TableContainer component={Paper} sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
                  <Table size="small" sx={{ width: '100%', tableLayout: 'fixed' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tuần</TableCell>
                        {WEEKDAYS.map((d) => (
                          <TableCell key={d} align="center">
                            {WEEK_LABELS[d]}
                          </TableCell>
                        ))}
                        <TableCell align="center">Tổng (phút)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.from({ length: totalWeek }, (_, idx) => {
                        const weekNo = idx + 1;
                        const plan = weekDays[String(weekNo)] ?? makeEvenWeekPlan(weeklyTotals[idx] ?? Math.ceil(weeklyHours * 60));
                        const rowTotal = WEEKDAYS.reduce((s, d) => s + (plan[d] || 0), 0);
                          return (
                          <TableRow key={weekNo} hover onClick={() => setSelectedWeek(weekNo)}>
                            <TableCell component="th" scope="row" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleLockWeek(weekNo); }}>
                                {lockedWeeks[weekNo] ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                              </IconButton>
                              <span>Tuần {weekNo}</span>
                            </TableCell>
                            {WEEKDAYS.map((d) => {
                              const cellKey = `${weekNo}-${d}`;
                              const editingValue = editingCells[cellKey];
                              return (
                                <TableCell key={d} align="center" sx={{ minWidth: 72, maxWidth: 120, overflow: 'hidden' }}>
                                  <TextField
                                    size="small"
                                    type="number"
                                    value={editingValue ?? String(plan[d] ?? 0)}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      setEditingCells((prev) => ({ ...prev, [cellKey]: v }));
                                    }}
                                    onBlur={() => {
                                      const raw = Number(editingCells[cellKey] ?? plan[d] ?? 0);
                                      const val = Number.isNaN(raw) ? (plan[d] ?? 0) : Math.round(raw);
                                      handleDayChangeForWeek(weekNo, d, val);
                                      setEditingCells((prev) => { const copy = { ...prev }; delete copy[cellKey]; return copy; });
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const raw = Number(editingCells[cellKey] ?? plan[d] ?? 0);
                                        const val = Number.isNaN(raw) ? (plan[d] ?? 0) : Math.round(raw);
                                        handleDayChangeForWeek(weekNo, d, val);
                                        setEditingCells((prev) => { const copy = { ...prev }; delete copy[cellKey]; return copy; });
                                        (e.target as HTMLElement).blur();
                                      }
                                    }}
                                    inputProps={{ style: { textAlign: 'center', width: 64, padding: '6px 8px' } }}
                                  />
                                </TableCell>
                              );
                            })}
                            <TableCell align="center">
                              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={editingWeekTotals[weekNo] ?? String(rowTotal)}
                                  onChange={(e) => setEditingWeekTotals((prev) => ({ ...prev, [weekNo]: e.target.value }))}
                                  onBlur={() => {
                                    const raw = Number(editingWeekTotals[weekNo] ?? rowTotal);
                                    const val = Number.isNaN(raw) ? rowTotal : Math.round(raw);
                                    handleWeekTotalChange(weekNo, val);
                                    setEditingWeekTotals((prev) => { const copy = { ...prev }; delete copy[weekNo]; return copy; });
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const raw = Number(editingWeekTotals[weekNo] ?? rowTotal);
                                      const val = Number.isNaN(raw) ? rowTotal : Math.round(raw);
                                      handleWeekTotalChange(weekNo, val);
                                      setEditingWeekTotals((prev) => { const copy = { ...prev }; delete copy[weekNo]; return copy; });
                                      (e.target as HTMLElement).blur();
                                    }
                                  }}
                                  inputProps={{ style: { textAlign: 'center', width: 80 } }}
                                />
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* (Removed compact edit panel — edits now happen inline in the table) */}
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
