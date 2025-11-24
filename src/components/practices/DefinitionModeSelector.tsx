import { Box, Card, CardContent, Typography, Stack } from "@mui/material";
import { motion } from "framer-motion";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PsychologyIcon from "@mui/icons-material/Psychology";

export type DefinitionMode = "definition" | "guess";

interface DefinitionModeSelectorProps {
  onSelectMode: (mode: DefinitionMode) => void;
}

const DefinitionModeSelector = ({
  onSelectMode,
}: DefinitionModeSelectorProps) => {
  const modes = [
    {
      key: "definition" as DefinitionMode,
      title: "Tự định nghĩa",
      subtitle: "AI chấm điểm",
      description:
        "Nhìn từ vựng, tự viết định nghĩa theo cách hiểu của bạn. AI sẽ chấm điểm và đưa ra phản hồi chi tiết.",
      icon: <AutoAwesomeIcon sx={{ fontSize: 48, color: "#2563eb" }} />,
      gradient: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
    },
    {
      key: "guess" as DefinitionMode,
      title: "Đoán từ",
      subtitle: "So khớp trực tiếp",
      description:
        "Đọc định nghĩa và gợi ý, đoán đúng từ vựng đang được nhắc đến. Hệ thống sẽ kiểm tra ngay lập tức.",
      icon: <PsychologyIcon sx={{ fontSize: 48, color: "#10b981" }} />,
      gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        px: 4,
        py: 6,
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        mb={2}
        sx={{
          background: "linear-gradient(90deg, #2563eb, #8b5cf6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Chọn chế độ luyện tập
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        mb={6}
        textAlign="center"
        maxWidth={600}
      >
        Chọn một trong hai chế độ học từ vựng phù hợp với trình độ và mục tiêu
        của bạn
      </Typography>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={4}
        sx={{ width: "100%", maxWidth: 1000 }}
      >
        {modes.map((mode) => (
          <motion.div
            key={mode.key}
            whileHover={{ scale: 1.03, y: -8 }}
            whileTap={{ scale: 0.98 }}
            style={{ flex: 1 }}
          >
            <Card
              onClick={() => onSelectMode(mode.key)}
              sx={{
                cursor: "pointer",
                borderRadius: 4,
                border: "2px solid transparent",
                background: "#ffffff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                height: "100%",
                "&:hover": {
                  borderColor:
                    mode.key === "definition" ? "#2563eb" : "#10b981",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 80,
                    height: 80,
                    borderRadius: 3,
                    background: mode.gradient,
                    mb: 3,
                    mx: "auto",
                  }}
                >
                  {mode.icon}
                </Box>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  textAlign="center"
                  sx={{ color: "#1e293b", mb: 1 }}
                >
                  {mode.title}
                </Typography>

                <Typography
                  variant="subtitle2"
                  textAlign="center"
                  sx={{
                    color: mode.key === "definition" ? "#2563eb" : "#10b981",
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  {mode.subtitle}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ lineHeight: 1.6 }}
                >
                  {mode.description}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Stack>
    </Box>
  );
};

export default DefinitionModeSelector;
