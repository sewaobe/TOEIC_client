import { Card, CardContent, Typography, Grid, Box, Stack, Chip, CircularProgress, LinearProgress, Stepper, Step, StepLabel } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { Badge, Topic } from "../../types/LearningProgress";
import { WeekProgress } from "../../services/learningPath.service";

interface ProgramTabProps {
  week: number;
  percentProgram: number;
  TOTAL_WEEKS: number;
  cumulativePlanned: number[];
  cumulativeActual: number[];
  topics: Topic[];
  badges: Badge[];
  weeks: WeekProgress[];
}

export const ProgramTab: React.FC<ProgramTabProps> = ({ week, percentProgram, TOTAL_WEEKS, cumulativePlanned, cumulativeActual, topics, badges, weeks }) => {
  // Calculate average progress from weeks
  const avgProgress = weeks.length > 0 
    ? weeks.reduce((sum, w) => sum + w.progress, 0) / weeks.length 
    : percentProgram;

  return (
    <Grid container spacing={2}>
      {/* Big progress ring */}
      <Grid size={{ xs:12, md:4}}>
        <Card sx={{ borderRadius: 3, height: "100%" }}>
          <CardContent>
            <Typography variant="h6">Tiến trình tổng</Typography>
            <Stack alignItems="center" mt={1}>
              <Box position="relative" display="inline-flex">
                <CircularProgress variant="determinate" value={avgProgress} size={140} thickness={5} />
                <Box position="absolute" top={0} left={0} right={0} bottom={0} display="flex" alignItems="center" justifyContent="center">
                  <Typography variant="h5" fontWeight={800}>{avgProgress.toFixed(0)}%</Typography>
                </Box>
              </Box>
              <Typography variant="body2" mt={1}>
                Tuần hiện tại: <b>Tuần {week}</b>
              </Typography>
              <Chip 
                size="small" 
                color={weeks.find(w => w.is_current)?.status === 'completed' ? 'success' : 'warning'}
                label={`${weeks.filter(w => w.status === 'completed').length}/${weeks.length} tuần hoàn thành`}
                sx={{ mt: 1 }} 
              />
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
              {weeks.map((w, i) => (
                <Step key={i} completed={w.status === 'completed'}>
                  <StepLabel 
                    error={w.status === 'lock'}
                  >
                    {`W${w.week_no}`}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {weeks.map((w) => (
                <Chip 
                  key={w.week_no}
                  label={`Tuần ${w.week_no}: ${w.progress.toFixed(0)}%`}
                  size="small"
                  color={
                    w.status === 'completed' ? 'success' :
                    w.status === 'in_progress' ? 'primary' :
                    'default'
                  }
                  variant={w.is_current ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
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
