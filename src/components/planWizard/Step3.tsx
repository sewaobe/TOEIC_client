import { Weekday, WeeklyPlan } from "../../types/PlanWizard";
import { Button, Card, CardContent, Chip, Divider, Grid, Paper, Slider, Stack, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import useLocalStorage from "../../hooks/useLocalStorage";
import { diffInWeeks } from "../../utils/date";
import { getHoursNeeded } from "../../utils/estimatedStudyHour";
import { WEEKDAYS, redistributeWeeks, redistributeDays } from "../../utils/planDistribution";
import { useEffect, useMemo, useState } from "react";

const WEEK_LABELS: Record<Weekday, string> = {
    Mon: "Thứ 2", Tue: "Thứ 3", Wed: "Thứ 4", Thu: "Thứ 5", Fri: "Thứ 6", Sat: "Thứ 7", Sun: "Chủ nhật",
};

const MIN_DAY = 30;          // phút/ngày
const MAX_DAY = 600;         // phút/ngày
const MIN_WEEK = 7 * MIN_DAY; // 210
const MAX_WEEK = 7 * 1440;    // tuỳ bạn, ở đây cho phép tối đa 7 ngày * 1440 phút

export const DetailedPlanStep = () => {
    const [planEnd] = useLocalStorage<string>("plan_end", "");
    const [planStart] = useLocalStorage<string>("plan_start", "");
    const [targetScore] = useLocalStorage<number>("score_target_plan", 650);

    const totalWeek = diffInWeeks(planStart, planEnd);
    const totalHours = getHoursNeeded(400, targetScore);
    const totalMinutes = Math.max(0, Math.round(totalHours * 60));
    const weeklyHours = totalWeek > 0 ? Math.round(totalHours / totalWeek) : 0;

    // phút mỗi tuần (length = totalWeek)
    const [weeklyTotals, setWeeklyTotals] = useLocalStorage<number[]>("weekly_totals", []);
    // phân bổ theo ngày cho từng tuần: key = tuần (string), value = WeeklyPlan
    const [weekDays, setWeekDays] = useLocalStorage<Record<string, WeeklyPlan>>("weekly_days", {});
    // tuần đang chọn để hiển thị panel phải
    const [selectedWeek, setSelectedWeek] = useState<number>(0);

    // helper: tạo WeeklyPlan đều theo tổng phút/tuần
    const makeEvenWeekPlan = (weekTotal: number): WeeklyPlan => {
        const per = Math.max(MIN_DAY, Math.round(weekTotal / 7));
        // chia đều + cân chỉnh dư cho đúng tổng
        const base: WeeklyPlan = { Mon: per, Tue: per, Wed: per, Thu: per, Fri: per, Sat: per, Sun: per };
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

    // Khởi tạo dữ liệu khi số tuần/tổng phút thay đổi hoặc lần đầu vào
    useEffect(() => {
        if (totalWeek <= 0 || totalMinutes <= 0) {
            setWeeklyTotals([]);
            setWeekDays({});
            return;
        }
        if (weeklyTotals.length === totalWeek && Object.keys(weekDays).length === totalWeek) return;

        const evenPerWeek = Math.max(MIN_WEEK, Math.round(totalMinutes / totalWeek));
        // Phân phối đều, phần dư dồn dần từng tuần
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

        const daysMap: Record<string, WeeklyPlan> = {};
        totals.forEach((t, idx) => {
            daysMap[String(idx)] = makeEvenWeekPlan(t);
        });

        setWeeklyTotals(totals);
        setWeekDays(daysMap);
        setSelectedWeek(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalWeek, totalMinutes]);

    // Tổng minutes thực tế (để hiển thị header)
    const actualTotalMinutes = useMemo(
        () => (weeklyTotals.length ? weeklyTotals.reduce((a, b) => a + b, 0) : totalMinutes),
        [weeklyTotals, totalMinutes]
    );

    // --- Handlers --------------------------------------------------------------
    const handleWeekChange = (index: number, newVal: number) => {
        if (!weeklyTotals.length) return;

        // phân phối lại phút giữa các tuần
        const redistributed = redistributeWeeks(weeklyTotals, index, Math.round(newVal), MIN_WEEK, MAX_WEEK);

        // scale phân bổ ngày của TẤT CẢ các tuần theo tổng mới để đảm bảo khớp
        const newWeekDays: Record<string, WeeklyPlan> = { ...weekDays };
        redistributed.forEach((newTotal, i) => {
            const key = String(i + 1);
            const oldPlan = newWeekDays[key] ?? makeEvenWeekPlan(newTotal);
            const oldSum = WEEKDAYS.reduce((a, d) => a + oldPlan[d], 0) || 1;
            // scale theo tỉ lệ + clamp + cân chỉnh tổng
            const scaled: WeeklyPlan = { ...oldPlan };
            WEEKDAYS.forEach((d) => {
                const v = Math.round((oldPlan[d] * newTotal) / oldSum);
                scaled[d] = Math.max(MIN_DAY, Math.min(MAX_DAY, v));
            });
            // fix tổng lệch 1-2 phút
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

    const handleDayChange = (day: Weekday, newVal: number) => {
        const key = String(selectedWeek);
        const cur = weekDays[key];
        if (!cur) return;

        const updated = redistributeDays(cur, day, Math.round(newVal), MIN_DAY, MAX_DAY);

        // đảm bảo tổng ngày = tổng tuần hiện tại
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
    // ---------------------------------------------------------------------------

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
                    <Chip label={`Số tuần: ${totalWeek}`} size="small" variant="outlined" />
                    <Chip label={`TB/tuần: ${weeklyHours * 60} phút (~${weeklyHours} giờ)`} size="small" variant="outlined" />
                    <Chip label={`TB/ngày: ${Math.ceil(weeklyHours * 60 / 7)} phút (~${Math.ceil(weeklyHours / 7)} giờ)`} size="small" variant="outlined" />
                </Stack>
                <Button size="small" variant="contained" startIcon={<AutoFixHighIcon />} onClick={() => {
                    // reset đều lại theo kế hoạch hiện tại
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
                    const daysMap: Record<string, WeeklyPlan> = {};
                    totals.forEach((t, idx) => { daysMap[String(idx + 1)] = makeEvenWeekPlan(t); });
                    setWeeklyTotals(totals);
                    setWeekDays(daysMap);
                    setSelectedWeek(1);
                }}>
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
                            <Stack spacing={1.25} sx={{ pr: 1 }}>
                                {Array.from({ length: totalWeek }, (_, i) => i + 1).map((week) => {
                                    const m = weeklyTotals[week - 1] ?? Math.ceil(weeklyHours * 60);
                                    return (
                                        <Stack key={week} spacing={0.5} onClick={() => setSelectedWeek(week)}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2" color="text.secondary">Tuần {week + 1}</Typography>
                                                <Typography variant="body2" fontWeight={600}>{m} phút • ~{Math.round(m / 60)} giờ</Typography>
                                            </Stack>
                                            <Slider
                                                aria-label={`Phút của tuần ${week}`}
                                                min={MIN_WEEK} max={MAX_WEEK} step={15}
                                                value={m}
                                                onChange={(_, v) => handleWeekChange(week - 1, v as number)}
                                            />
                                            <Divider sx={{ opacity: 0.2 }} />
                                        </Stack>
                                    );
                                })}
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
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Thời gian mỗi ngày trong tuần {selectedWeek}
                            </Typography>
                            <Stack spacing={1}>
                                {WEEKDAYS.map((d) => {
                                    const plan = weekDays[String(selectedWeek)] || makeEvenWeekPlan(Math.ceil(weeklyHours * 60));
                                    const val = plan[d];
                                    return (
                                        <Stack key={d} spacing={0.5}>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2" color="text.secondary">{WEEK_LABELS[d]}</Typography>
                                                <Typography variant="body2" fontWeight={600}>{val} phút</Typography>
                                            </Stack>
                                            <Slider
                                                aria-label={`Phút ngày ${WEEK_LABELS[d]}`}
                                                min={MIN_DAY} max={MAX_DAY} step={5}
                                                value={val}
                                                onChange={(_, v) => handleDayChange(d, v as number)}
                                            />
                                        </Stack>
                                    );
                                })}
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
                                {["abc", "xyz", "cdf", "edf"].map((text, idx) => (
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
};
