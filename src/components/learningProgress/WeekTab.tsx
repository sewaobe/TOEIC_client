import React from "react";
import { Card, CardContent, Typography, Grid, Box, Stack, Chip, LinearProgress, Button } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";

interface WeekTabProps {
  weekActual: number;
  weekPlanned: number;
  weeklyActualPerDay: number[];
  weeklyPlannedPerDay: number[];
  weeklyColors: string[];
}

export const WeekTab: React.FC<WeekTabProps> = ({ weekActual, weekPlanned, weeklyActualPerDay, weeklyPlannedPerDay, weeklyColors }) => {
  return (
    <Grid container spacing={2}>
      {/* Donut Plan vs Actual */}
      <Grid size={{ xs:12, md:6}}>
        <Card sx={{ borderRadius: 3, height: "100%" }}>
          <CardContent>
            <Typography variant="h6">Hoàn thành kế hoạch tuần</Typography>
            <PieChart
              height={300}
              series={[
                {
                  innerRadius: 70,
                  outerRadius: 120,
                  data: [
                    { id: 1, label: "Thực tế", value: weekActual, color: "#1976d2" },
                    { id: 2, label: "Còn thiếu", value: Math.max(0, weekPlanned - weekActual), color: "#90caf9" },
                  ],
                  arcLabel: (it) => `${Math.round((it.value / Math.max(1, weekPlanned)) * 100)}%`,
                  arcLabelMinAngle: 12,
                },
              ]}
            />
            <Stack alignItems="center" spacing={1}>
              <Chip
                color={weekActual >= weekPlanned ? "success" : weekActual > 0.7 * weekPlanned ? "warning" : "default"}
                label={weekActual >= weekPlanned ? "On track" : weekActual > 0.7 * weekPlanned ? "Slightly behind" : "At risk"}
              />
              <Typography variant="caption">Kế hoạch: {weekPlanned}’ · Thực tế: {weekActual}’</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Heatmap + stacked bars */}
      <Grid size={{ xs:12, md:6}}>
        <Card sx={{ borderRadius: 3, mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Heatmap tuần</Typography>
            <Grid container spacing={1}>
              {weeklyActualPerDay.map((m, i) => {
                const intensity = Math.min(1, m / 110);
                return (
                  <Grid key={i} size={{xs:12/7}}>
                    <Box
                      sx={{
                        p: 1,
                        textAlign: "center",
                        borderRadius: 2,
                        bgcolor: `rgba(25,118,210,${0.15 + 0.6 * intensity})`,
                      }}
                    >
                      <Typography variant="caption">D{i + 1}</Typography>
                      <Typography fontWeight={700}>{m}’</Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6">Phân rã hoạt động theo ngày</Typography>
            <Stack spacing={1}>
              {weeklyActualPerDay.map((m, i) => (
                <Stack key={i} direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ width: 28 }} variant="caption">D{i + 1}</Typography>
                  <Box sx={{ flex: 1, display: "flex", height: 10, borderRadius: 5, overflow: "hidden", bgcolor: "action.hover" }}>
                    <Box sx={{ width: `${Math.min(100, (m * 0.4))}%`, bgcolor: weeklyColors[0] }} />
                    <Box sx={{ width: `${Math.min(100, (m * 0.35))}%`, bgcolor: weeklyColors[1] }} />
                    <Box sx={{ width: `${Math.min(100, (m * 0.25))}%`, bgcolor: weeklyColors[2] }} />
                  </Box>
                  <Typography variant="caption">{m}’</Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Streak & Consistency */}
      <Grid size={{ xs:12}}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography>Streak</Typography>
                <Chip icon={<span>🔥</span>} label="10 ngày" color="warning" />
              </Stack>
              <Stack flex={1}>
                <Typography variant="caption">Mức đều đặn (số ngày đạt mục tiêu)</Typography>
                <LinearProgress
                  variant="determinate"
                  value={(weeklyActualPerDay.filter((m, i) => m >= weeklyPlannedPerDay[i]).length / 7) * 100}
                  sx={{ height: 10, borderRadius: 6 }}
                />
              </Stack>
              <Button variant="outlined">Kế hoạch bù +30’ trong 3 ngày</Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
