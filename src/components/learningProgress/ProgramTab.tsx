import React from "react";
import { Card, CardContent, Typography, Grid, Box, Stack, Chip, CircularProgress, LinearProgress, Stepper, Step, StepLabel } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { Badge, Topic } from "../../types/LearningProgress";

interface ProgramTabProps {
  week: number;
  percentProgram: number;
  TOTAL_WEEKS: number;
  cumulativePlanned: number[];
  cumulativeActual: number[];
  topics: Topic[];
  badges: Badge[];
}

export const ProgramTab: React.FC<ProgramTabProps> = ({ week, percentProgram, TOTAL_WEEKS, cumulativePlanned, cumulativeActual, topics, badges }) => {
  return (
    <Grid container spacing={2}>
      {/* Big progress ring */}
      <Grid size={{ xs:12, md:4}}>
        <Card sx={{ borderRadius: 3, height: "100%" }}>
          <CardContent>
            <Typography variant="h6">Tiến trình tổng</Typography>
            <Stack alignItems="center" mt={1}>
              <Box position="relative" display="inline-flex">
                <CircularProgress variant="determinate" value={percentProgram} size={140} thickness={5} />
                <Box position="absolute" top={0} left={0} right={0} bottom={0} display="flex" alignItems="center" justifyContent="center">
                  <Typography variant="h5" fontWeight={800}>{percentProgram}%</Typography>
                </Box>
              </Box>
              <Typography variant="body2" mt={1}>Dự kiến hoàn thành: <b>18/12</b></Typography>
              <Chip size="small" color="success" label="+2.5h so với kế hoạch" sx={{ mt: 1 }} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Milestone map */}
      <Grid size={{ xs:12, md:8}}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6">Lộ trình mốc</Typography>
            <Stepper activeStep={week - 1} alternativeLabel>
              {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
                <Step key={i}><StepLabel>{`W${i + 1}`}</StepLabel></Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      </Grid>

      {/* Cumulative chart */}
      <Grid size={{ xs:12}}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6">Giờ tích lũy theo tuần</Typography>
            <LineChart
              height={280}
              series={[
                { curve: "linear", data: cumulativePlanned, label: "Planned (h)" },
                { curve: "linear", data: cumulativeActual, label: "Actual (h)" },
              ]}
              xAxis={[{ scaleType: "point", data: Array.from({ length: TOTAL_WEEKS }, (_, i) => `W${i + 1}`) }]}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Mastery by topic + badges */}
      <Grid size={{ xs:12, md:8}}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6">Mức độ làm chủ theo kỹ năng</Typography>
            <Grid container spacing={2}>
              {topics.map((t) => (
                <Grid key={t.key}  size={{xs:12, md:6}}>
                  <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700}>{t.label}</Typography>
                      <Chip size="small" label={`${t.hours}h`} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">Điểm hiện tại</Typography>
                    <LinearProgress variant="determinate" value={t.score} sx={{ height: 10, borderRadius: 6, my: 1 }} />
                    <Typography variant="caption"><b>{t.score}</b>/100</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs:12, md:4}}>
        <Card sx={{ borderRadius: 3, height: "100%" }}>
          <CardContent>
            <Typography variant="h6">Huy hiệu</Typography>
            <Stack spacing={1}>
              {badges.map((b, i) => (
                <Stack key={i} direction="row" alignItems="center" spacing={1} sx={{ p: 1, border: "1px dashed", borderRadius: 2 }}>
                  <Typography fontSize={20}>{b.icon}</Typography>
                  <Typography>{b.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
