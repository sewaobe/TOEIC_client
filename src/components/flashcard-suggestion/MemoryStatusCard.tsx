import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { memoryStatuses } from "./mockData";

const MemoryDonut = () => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Box
      sx={{
        width: { xs: 112, sm: 132 },
        height: { xs: 112, sm: 132 },
        borderRadius: "50%",
        background:
          "conic-gradient(#10b981 0 48%, #2563eb 48% 90%, #ef4444 90% 98%, #cbd5e1 98% 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
        "&::after": {
          content: '""',
          position: "absolute",
          width: { xs: 70, sm: 82 },
          height: { xs: 70, sm: 82 },
          borderRadius: "50%",
          bgcolor: "background.paper",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
          78%
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
          Tổng
        </Typography>
      </Box>
    </Box>
  </Box>
);

const MemoryStatusCard: React.FC = () => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, sm: 2.5 },
      borderRadius: 3,
      border: "1px solid #e2e8f0",
      minWidth: 0,
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
        gridTemplateColumns: { xs: "1fr", sm: "150px 1fr", md: "180px 1fr" },
        gap: { xs: 2, sm: 1.5, md: 2 },
        alignItems: "center",
      }}
    >
      <MemoryDonut />
      <Stack spacing={1.4} sx={{ minWidth: 0 }}>
        {memoryStatuses.map((status) => (
          <Box
            key={status.label}
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: status.color, flexShrink: 0 }} />
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {status.label}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
              {status.value} ({status.percent}%)
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  </Paper>
);

export default MemoryStatusCard;
