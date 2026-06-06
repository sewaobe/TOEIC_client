import {
  Alert,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { FC, useEffect, useMemo } from "react";
import { addDays, diffInDays, diffInWeeks } from "../../utils/date";
import { getHoursNeeded } from "../../utils/estimatedStudyHour";
import { Pulse, Shake } from "../animations/motionWrappers";

const todayISO = () => new Date().toISOString().slice(0, 10);
const toISODate = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : "";
const fromISODate = (value: string) => new Date(`${value}T00:00:00`);
const minWeekly = 3;
const maxWeekly = 32;

interface IEndDateStep {
  score: number;
  targetScore: number;
  planRange: {
    start: Date | null;
    end: Date | null;
  };
  onPlanRangeChange: (value: { start: Date | null; end: Date | null }) => void;
}

export const EndDateStep: FC<IEndDateStep> = ({
  score,
  targetScore,
  planRange,
  onPlanRangeChange,
}) => {
  const startISO = toISODate(planRange.start) || todayISO();
  const defaultEnd = useMemo(() => addDays(startISO, 56), [startISO]);
  const endISO = toISODate(planRange.end) || defaultEnd;

  useEffect(() => {
    if (!planRange.start || !planRange.end) {
      onPlanRangeChange({
        start: planRange.start ?? fromISODate(startISO),
        end: planRange.end ?? fromISODate(defaultEnd),
      });
    }
  }, [defaultEnd, onPlanRangeChange, planRange.end, planRange.start, startISO]);

  const weeks = diffInWeeks(startISO, endISO);
  const days = diffInDays(startISO, endISO);
  const gap = targetScore - score;
  const totalHours = getHoursNeeded(score, targetScore);
  const weeklyHours = weeks > 0 ? Number((totalHours / weeks).toFixed(1)) : 0;

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
              value={endISO}
              onChange={(event) => {
                const value = event.target.value;
                if (!value) return;
                onPlanRangeChange({
                  start: planRange.start ?? fromISODate(startISO),
                  end: fromISODate(value),
                });
              }}
              inputProps={{ min: startISO }}
              helperText={`Ngày bắt đầu: ${startISO}`}
            />

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {quickPresets.map((preset) => (
                <Button
                  key={preset.label}
                  size="small"
                  variant="outlined"
                  startIcon={<CalendarMonthIcon />}
                  onClick={() =>
                    onPlanRangeChange({
                      start: planRange.start ?? fromISODate(startISO),
                      end: fromISODate(addDays(startISO, preset.addDays)),
                    })
                  }
                >
                  {preset.label}
                </Button>
              ))}
            </Stack>

            {weeklyHours > maxWeekly && (
              <Shake>
                <Pulse>
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    Khối lượng học {weeklyHours} giờ/tuần vượt quá mức tối đa{" "}
                    {maxWeekly} giờ/tuần.
                  </Alert>
                </Pulse>
              </Shake>
            )}

            {weeklyHours > 0 && weeklyHours < minWeekly && (
              <Shake>
                <Pulse>
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    Khối lượng học {weeklyHours} giờ/tuần khá ít. Tối thiểu nên
                    từ {minWeekly} giờ/tuần.
                  </Alert>
                </Pulse>
              </Shake>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={1.5}>
            <Paper elevation={0} className="rounded-2xl" sx={{ p: 2 }}>
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

            <Paper elevation={0} className="rounded-2xl" sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TrendingUpIcon color="secondary" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Ước lượng khối lượng
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Khoảng cách điểm: <b>{gap}</b>. Tổng khoảng <b>{totalHours}</b> giờ học,
                tương đương <b>{weeklyHours}</b> giờ/tuần.
              </Typography>
            </Paper>

            <Paper elevation={0} className="rounded-2xl" sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <InfoOutlinedIcon color="success" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Lưu ý
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Hạn chót thực tế giúp hệ thống phân bổ thời gian học ổn định hơn.
              </Typography>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};
