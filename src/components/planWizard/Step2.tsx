import { Alert, Button, Grid, Paper, Snackbar, Stack, TextField, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { FC, useEffect, useMemo, useState } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { diffInDays, diffInWeeks, addDays } from "../../utils/date"; // nơi bạn đặt 3 util trên
import { getHoursNeeded } from "../../utils/estimatedStudyHour";
import { useDispatch } from "react-redux";
import { showSnackbar } from "../../stores/snackbarSlice";
import { Pulse, Shake } from "../animations/motionWrappers";

// helper: YYYY-MM-DD hôm nay
const todayISO = () => new Date().toISOString().slice(0, 10);
const minWeekly = 3;
const maxWeekly = 32;

interface IEndDateStep {
    score: number
}
export const EndDateStep: FC<IEndDateStep> = ({ score }) => {
    // start date có thể tuỳ, mặc định hôm nay
    const [startISO] = useLocalStorage<string>("plan_start", todayISO());

    // end date: mặc định +56 ngày (8 tuần), và sẽ persist ngay nếu chưa có
    const defaultEnd = useMemo(() => addDays(startISO, 56), [startISO]);
    const [endISO, setEndISO] = useLocalStorage<string>("plan_end", defaultEnd);

    // lấy target từ localStorage (bước trước)
    const [targetScore] = useLocalStorage<number>("score_target_plan", 650);

    // đảm bảo có key khi mount (trường hợp hook cũ CHƯA tự ghi initial)
    useEffect(() => {
        if (localStorage.getItem("plan_end") == null) {
            localStorage.setItem("plan_end", JSON.stringify(defaultEnd));
        }
    }, [defaultEnd]);

    const weeks = diffInWeeks(startISO, endISO);
    const days = diffInDays(startISO, endISO);

    // tính thời gian dựa vô gap điểm
    const gap = targetScore - score;
    const totalHours = getHoursNeeded(score, targetScore);
    const weeklyHours = weeks > 0 ? parseFloat((totalHours / weeks).toFixed(1)) : 0;

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
                            value={endISO}                 // <-- dùng ISO string
                            onChange={(e) => {
                                const v = e.target.value;    // YYYY-MM-DD
                                if (v) setEndISO(v);         // set + persist
                            }}
                            inputProps={{ min: startISO }}  // không cho chọn trước ngày bắt đầu
                            helperText={`Chọn hạn chót để hệ thống phân bổ tải học. Ngày bắt đầu: ${startISO}`}
                        />

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {quickPresets.map((p) => (
                                <Button
                                    key={p.label}
                                    size="small"
                                    variant="outlined"
                                    startIcon={<CalendarMonthIcon />}
                                    onClick={() => setEndISO(addDays(startISO, p.addDays))}
                                >
                                    {p.label}
                                </Button>
                            ))}
                        </Stack>

                        {weeklyHours > maxWeekly && (
                            <Shake>
                                <Pulse>
                                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                                        Khối lượng học {weeklyHours} giờ/tuần vượt quá mức tối đa {maxWeekly} giờ/tuần.
                                        Bạn có thể bị quá tải.
                                    </Alert>
                                </Pulse>
                            </Shake>
                        )}

                        {weeklyHours < minWeekly && (
                            <Shake>
                                <Pulse>
                                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                                        Khối lượng học (~${weeklyHours} giờ/tuần) quá ít. Tối thiểu nên từ ${minWeekly.toFixed(2)} giờ/tuần.
                                    </Alert>
                                </Pulse>
                            </Shake>
                        )}
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    {/* Info cards */}
                    <Stack spacing={1.5}>
                        <Paper
                            elevation={0}
                            className="rounded-2xl"
                            sx={{
                                p: 2,
                                border: "1px solid rgba(255,255,255,.15)",
                                bgcolor: "rgba(255,255,255,.06)",
                                backdropFilter: "blur(12px)",
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center">
                                <AccessTimeIcon color="primary" />
                                <Typography variant="subtitle2" fontWeight={700}>
                                    Đếm ngược
                                </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Còn <b>{weeks}</b> tuần / <b>{days}</b> ngày đến hạn chót.
                            </Typography>
                        </Paper>

                        <Paper
                            elevation={0}
                            className="rounded-2xl"
                            sx={{
                                p: 2,
                                border: "1px solid rgba(255,255,255,.15)",
                                bgcolor: "rgba(255,255,255,.06)",
                                backdropFilter: "blur(12px)",
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center">
                                <TrendingUpIcon color="secondary" />
                                <Typography variant="subtitle2" fontWeight={700}>
                                    Ước lượng khối lượng
                                </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Khoảng cách điểm: <b>{gap}</b> → tổng ~<b>{totalHours}</b> giờ học.<br />
                                Gợi ý: ~ <b>{weeklyHours}</b> giờ/tuần.
                            </Typography>
                        </Paper>

                        <Paper
                            elevation={0}
                            className="rounded-2xl"
                            sx={{
                                p: 2,
                                border: "1px solid rgba(255,255,255,.15)",
                                bgcolor: "rgba(255,255,255,.06)",
                                backdropFilter: "blur(12px)",
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center">
                                <InfoOutlinedIcon color="success" />
                                <Typography variant="subtitle2" fontWeight={700}>
                                    Mẹo nhỏ
                                </Typography>
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
};
