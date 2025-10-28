import React from "react";
import { Box, Typography } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

interface SharpGradientCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  colors?: [string, string, string];
  width?: number | string;
  height?: number | string;
  trend?: "up" | "down";
  trendValue?: string;
}

export const SharpGradientCard: React.FC<SharpGradientCardProps> = ({
  icon,
  title,
  description,
  colors = ["#6366F1", "#A855F7", "#EC4899"],
  width = "100%",
  height = 110,
  trend,
  trendValue,
}) => (
  <Box
    sx={{
      width,
      height,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      px: 3,
      py: 1.5,
      background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
      borderRadius: 3,
      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
      transition: "transform 0.25s ease, box-shadow 0.25s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
      },
    }}
  >
    {/* Left side: icon + text */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      {icon && (
        <Box
          sx={{
            fontSize: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            filter: "brightness(1.15)",
          }}
        >
          {icon}
        </Box>
      )}

      <Box sx={{ color: "white", lineHeight: 1.2 }}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {description}
        </Typography>
      </Box>
    </Box>

    {/* Right side: trend indicator */}
    {trend && trendValue && (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          color: trend === "up" ? "#A7F3D0" : "#FECACA",
        }}
      >
        {trend === "up" ? (
          <ArrowUpward sx={{ fontSize: 20 }} />
        ) : (
          <ArrowDownward sx={{ fontSize: 20 }} />
        )}
        <Typography fontWeight={600}>{trendValue}</Typography>
      </Box>
    )}
  </Box>
);

export default SharpGradientCard;
