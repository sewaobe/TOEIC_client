import React from "react";
import { Box, Card, CardContent, Typography, Stack, LinearProgress, Chip, Grid, Avatar, Tooltip, Button } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { DayTask, Session } from "../../types/LearningProgress";
import { durationMin } from "../../utils/learningProgress";

interface Props {
  sessions: Session[];
  day: number;
  week: number;
  dayMinutesActual: number;
  dayMinutesPlanned: number;
  dailyEfficiency: number;
  dayColors: string[];
  dayTasks: DayTask[];
  onDayChange?: (day: number) => void;
  onWeekChange?: (week: number) => void;
  totalWeeks?: number;
}

export const DayTab: React.FC<Props> = ({ 
  sessions, 
  day, 
  week, 
  dayMinutesActual, 
  dayMinutesPlanned, 
  dailyEfficiency, 
  dayColors, 
  dayTasks
}) => (
  <Grid container spacing={2}>
    <Grid size={{ xs:12, md:6}}>
      <Card sx={{ borderRadius: 3, height: "100%" }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Vòng 24h hôm nay</Typography>
            <Chip label={`Tuần ${week} · Ngày ${day}`} size="small" />
          </Stack>
          <PieChart
            height={300}
            series={[{
              innerRadius: 60,
              outerRadius: 120,
              paddingAngle: 1.5,
              cornerRadius: 3,
              data: sessions.map((s, i) => ({ id: i + 1, label: s.activity, value: durationMin(s), color: dayColors[i] })),
              arcLabel: (item) => `${item.value}’`,
              arcLabelMinAngle: 10,
            }]}
          />
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2">Mục tiêu hôm nay</Typography>
              <Chip size="small" label={`${dayMinutesPlanned}’`} />
            </Stack>
            <LinearProgress variant="determinate" value={Math.min(100, (dayMinutesActual / dayMinutesPlanned) * 100)} sx={{ height: 10, borderRadius: 6 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption">Thực tế: {dayMinutesActual}’</Typography>
              <Typography variant="caption">Hiệu quả tổng hợp: <b>{dailyEfficiency}/100</b></Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Grid>

    <Grid size={{ xs:12, md:6}}>
      <Card sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Phiên học hôm nay</Typography>
          <Stack spacing={1.25}>
            {sessions.map((s, i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={1.5} sx={{ p: 1, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Avatar>{i + 1}</Avatar>
                <Box flex={1}>
                  <Typography fontWeight={700}>{s.activity}</Typography>
                  <Typography variant="caption">{s.start}–{s.end} · {durationMin(s)}’ · Đúng {s.correct}/{s.total}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Focus"><Chip size="small" label={`🎯 ${s.focus}/10`} /></Tooltip>
                    <Tooltip title="Hiểu bài"><Chip size="small" label={`🧠 ${s.understanding}/5`} /></Tooltip>
                  </Stack>
                </Box>
                <Button size="small" variant="outlined">Ghi chú</Button>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6">Mục tiêu trong ngày</Typography>
          <Stack spacing={1}>
            {dayTasks.map((t) => (
              <Stack key={t.id} direction="row" justifyContent="space-between" sx={{ p: 1, border: "1px dashed", borderRadius: 2 }}>
                <Typography>{t.text}</Typography>
                <Chip size="small" label={`Impact: ${t.impact}`} />
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);
