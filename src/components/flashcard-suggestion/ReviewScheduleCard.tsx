import React, { useEffect, useMemo, useState } from "react";
import { Box, MenuItem, Paper, Select, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import { ReviewSchedulePoint } from "../../types/UserVocabularyProgressV2";
import userVocabularyProgressV2Service from "../../services/user_vocabulary_progress_v2.service";

interface MiniLineChartProps {
  data: ReviewSchedulePoint[];
}

const MiniLineChart: React.FC<MiniLineChartProps> = ({ data }) => {
  const width = 600;
  const height = 160;
  const paddingX = 32;
  const paddingTop = 22;
  const paddingBottom = 28;
  const maxValue = Math.max(10, ...data.map((point) => point.count));
  const xLabelStep = data.length <= 7 ? 1 : data.length <= 14 ? 2 : 5;
  const points = data
    .map((point, index) => {
      const x =
        paddingX +
        (index * (width - paddingX * 2)) / Math.max(data.length - 1, 1);
      const y =
        height -
        paddingBottom -
        (point.count / maxValue) * (height - paddingTop - paddingBottom);
      return `${x},${y}`;
    })
    .join(" ");

  const ticks = useMemo(() => {
    const middle = Math.round(maxValue / 2);
    return [0, middle, maxValue];
  }, [maxValue]);

  return (
    <Box sx={{ width: "100%", flex: 1, minHeight: 0, overflowX: "auto", pb: 0.5 }}>
      <Box sx={{ position: "relative", minWidth: { xs: 460, sm: data.length > 14 ? 760 : 520 }, height: "100%", minHeight: 160 }}>
        <Box
          component="svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          sx={{ width: "100%", height: "100%", display: "block" }}
        >
          {ticks.map((tick) => {
            const y = height - paddingBottom - (tick / maxValue) * (height - paddingTop - paddingBottom);
            return (
              <g key={tick}>
                <text x="0" y={y + 3} fontSize="9" fill="#64748b">
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
          {data.map((point, index) => {
            const x =
              paddingX +
              (index * (width - paddingX * 2)) / Math.max(data.length - 1, 1);
            const y =
              height -
              paddingBottom -
              (point.count / maxValue) * (height - paddingTop - paddingBottom);
            const shouldShowLabel =
              index === 0 || index === data.length - 1 || index % xLabelStep === 0;
            const shouldShowValue = data.length <= 14 || index % xLabelStep === 0;
            return (
              <g key={`${point.date}-${point.label}`}>
                <circle cx={x} cy={y} r="3.5" fill="#fff" stroke="#2563eb" strokeWidth="2.2" />
                {shouldShowValue && (
                  <text x={x} y={y - 9} textAnchor="middle" fontSize="9" fill="#2563eb" fontWeight="700">
                    {point.count}
                  </text>
                )}
                {shouldShowLabel && (
                  <text x={x} y={height - 6} textAnchor="middle" fontSize="9" fill="#64748b">
                    {point.label}
                  </text>
                )}
              </g>
            );
          })}
        </Box>
        {data.map((point, index) => {
          const xPercent =
            ((paddingX + (index * (width - paddingX * 2)) / Math.max(data.length - 1, 1)) / width) * 100;
          const y =
            height -
            paddingBottom -
            (point.count / maxValue) * (height - paddingTop - paddingBottom);
          const yPercent = (y / height) * 100;

          return (
            <Tooltip
              key={`${point.date}-${point.label}-tooltip`}
              arrow
              title={`${point.label}: ${point.count} từ đến hạn cần ôn`}
            >
              <Box
                sx={{
                  position: "absolute",
                  left: `${xPercent}%`,
                  top: `${yPercent}%`,
                  width: 18,
                  height: 18,
                  transform: "translate(-50%, -50%)",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

const ReviewScheduleCard: React.FC = () => {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(7);
  const [schedule, setSchedule] = useState<ReviewSchedulePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    userVocabularyProgressV2Service
      .getReviewSchedule({ rangeDays })
      .then((data) => {
        if (isMounted) {
          setSchedule(data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [rangeDays]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        minWidth: 0,
        minHeight: { xs: 300, sm: 320 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 1.5, flexShrink: 0 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800 }}>
            Lộ trình ôn tập {rangeDays} ngày tới
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.4 }}>
            Số từ đến hạn cần ôn theo ngày.
          </Typography>
        </Box>
        <Select
          size="small"
          value={String(rangeDays)}
          onChange={(event) => setRangeDays(Number(event.target.value) as 7 | 14 | 30)}
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
      {isLoading ? <Skeleton variant="rounded" sx={{ flex: 1, minHeight: 180 }} /> : <MiniLineChart data={schedule} />}
    </Paper>
  );
};

export default ReviewScheduleCard;
