import React from "react";
import { Box, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";
import { schedulePoints } from "./mockData";

const MiniLineChart = () => {
  const width = 600;
  const height = 120;
  const paddingX = 24;
  const paddingY = 16;
  const maxValue = 60;
  const points = schedulePoints
    .map((point, index) => {
      const x =
        paddingX +
        (index * (width - paddingX * 2)) / (schedulePoints.length - 1);
      const y =
        height -
        paddingY -
        (point.value / maxValue) * (height - paddingY * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Box sx={{ width: "100%", overflowX: "auto", pb: 0.5 }}>
      <Box
        component="svg"
        viewBox={`0 0 ${width} ${height}`}
        sx={{ minWidth: { xs: 460, sm: 520 }, width: "100%" }}
      >
        {[0, 20, 40, 60].map((tick) => {
          const y = height - paddingY - (tick / maxValue) * (height - paddingY * 2);
          return (
            <g key={tick}>
              <text x="0" y={y + 4} fontSize="11" fill="#64748b">
                {tick}
              </text>
              <line x1="28" y1={y} x2={width - 8} y2={y} stroke="#e2e8f0" />
            </g>
          );
        })}
        <polyline
          points={points}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {schedulePoints.map((point, index) => {
          const x =
            paddingX +
            (index * (width - paddingX * 2)) / (schedulePoints.length - 1);
          const y =
            height -
            paddingY -
            (point.value / maxValue) * (height - paddingY * 2);
          return (
            <g key={point.label}>
              <circle cx={x} cy={y} r="5" fill="#fff" stroke="#2563eb" strokeWidth="3" />
              <text x={x} y={y - 12} textAnchor="middle" fontSize="12" fill="#2563eb" fontWeight="700">
                {point.value}
              </text>
              <text x={x} y={height - 2} textAnchor="middle" fontSize="11" fill="#64748b">
                {point.label}
              </text>
            </g>
          );
        })}
      </Box>
    </Box>
  );
};

const ReviewScheduleCard: React.FC = () => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, sm: 2.5 },
      borderRadius: 3,
      border: "1px solid #e2e8f0",
      minWidth: 0,
    }}
  >
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      sx={{ mb: 1 }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800 }}>
          Lộ trình ôn tập 7 ngày tới
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.4 }}>
          Số từ đến hạn cần ôn theo ngày.
        </Typography>
      </Box>
      <Select
        size="small"
        defaultValue="7"
        sx={{
          minWidth: 128,
          height: 34,
          borderRadius: 2,
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        <MenuItem value="7">7 ngày tới</MenuItem>
        <MenuItem value="14">14 ngày tới</MenuItem>
        <MenuItem value="30">30 ngày tới</MenuItem>
      </Select>
    </Stack>
    <MiniLineChart />
  </Paper>
);

export default ReviewScheduleCard;
