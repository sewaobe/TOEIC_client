import React, { useEffect, useMemo, useState } from "react";
import { Box, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { MemoryStatusSummaryItem, MemoryUiBucket } from "../../types/UserVocabularyProgressV2";
import userVocabularyProgressV2Service from "../../services/user_vocabulary_progress_v2.service";
import { memoryStatuses } from "./mockData";

const bucketColor: Record<MemoryUiBucket, string> = {
  mastered: "#10b981",
  active_reviewing: "#2563eb",
  at_risk: "#f59e0b",
  overdue: "#ef4444",
};

const mockMemoryStatuses: MemoryStatusSummaryItem[] = memoryStatuses.map((status) => ({
  bucket: status.bucket,
  label: status.label,
  count: status.value,
  percentage: status.percent,
}));

interface MemoryDonutProps {
  data: MemoryStatusSummaryItem[];
}

const MemoryDonut: React.FC<MemoryDonutProps> = ({ data }) => {
  const segments = useMemo(() => {
    let cursor = 0;

    return data.map((item) => {
      const start = cursor;
      const end = cursor + item.percentage;
      cursor = end;

      return {
        item,
        path: describeDonutArc(66, 66, 48, 14, percentageToAngle(start), percentageToAngle(end)),
      };
    });
  }, [data]);

  const stablePercent = data.find((item) => item.bucket === "mastered")?.percentage ?? 0;

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box
        sx={{
          width: { xs: 160, sm: 180 },
          height: { xs: 160, sm: 180 },
          position: "relative",
          flexShrink: 0,
        }}
      >
        <Box component="svg" viewBox="0 0 132 132" sx={{ width: "100%", height: "100%", display: "block" }}>
          {segments.map(({ item, path }) => (
            <Tooltip key={item.bucket} arrow title={`${item.label}: ${item.count} từ (${Math.round(item.percentage)}%)`}>
              <path
                d={path}
                fill={bucketColor[item.bucket]}
                style={{ cursor: "pointer", transition: "opacity 0.16s ease" }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.opacity = "0.82";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.opacity = "1";
                }}
              />
            </Tooltip>
          ))}
        </Box>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
            {Math.round(stablePercent)}%
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
            Đã vững
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const MemoryStatusCard: React.FC = () => {
  const [statuses, setStatuses] = useState<MemoryStatusSummaryItem[]>(mockMemoryStatuses);

  useEffect(() => {
    let isMounted = true;

    userVocabularyProgressV2Service.getMemoryStatusSummary().then((data) => {
      if (isMounted) {
        setStatuses(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        minWidth: 0,
        height: "100%",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 800 }}>Trạng thái ghi nhớ</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.4 }}>
          Tổng quan trạng thái ghi nhớ của các từ trong hệ thống.
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "120px minmax(0, 1fr)", xl: "132px minmax(0, 1fr)" },
          gap: { xs: 3, sm: 2.5, md: 3 },
          alignItems: "center",
        }}
      >
        <MemoryDonut data={statuses} />
        <Stack spacing={1.4} sx={{ minWidth: 0 }}>
          {statuses.map((status) => (
            <Box key={status.bucket} sx={{ display: "flex", alignItems: "center" }}>
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: bucketColor[status.bucket], flexShrink: 0 }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {status.label}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default MemoryStatusCard;

function percentageToAngle(percentage: number): number {
  return (percentage / 100) * 360 - 90;
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeDonutArc(
  centerX: number,
  centerY: number,
  radius: number,
  strokeWidth: number,
  startAngle: number,
  endAngle: number,
): string {
  const safeEndAngle = endAngle - startAngle >= 360 ? endAngle - 0.01 : endAngle;
  const outerStart = polarToCartesian(centerX, centerY, radius, safeEndAngle);
  const outerEnd = polarToCartesian(centerX, centerY, radius, startAngle);
  const innerRadius = radius - strokeWidth;
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle);
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, safeEndAngle);
  const largeArcFlag = safeEndAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", outerStart.x, outerStart.y,
    "A", radius, radius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
    "L", innerStart.x, innerStart.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerEnd.x, innerEnd.y,
    "Z",
  ].join(" ");
}
