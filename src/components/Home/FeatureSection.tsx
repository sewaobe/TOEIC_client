import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import {
  SettingsSuggest,
  EmojiObjects,
  StarBorderPurple500Outlined,
} from "@mui/icons-material";

// Định nghĩa kiểu cho props của FeatureItem
interface FeatureItemProps {
  icon: React.ReactElement;
  text: string;
}

// Định nghĩa component con ngay bên trong file này
const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text }) => {
  const theme = useTheme();
  return (
    <div className="flex items-center space-x-2">
      {React.cloneElement(icon, { sx: { color: theme.palette.primary.main, fontSize: 32 } })}
      <Typography
        variant="body2"
        sx={{ color: theme.palette.text.primary }}
        className="text-base"
      >
        {text}
      </Typography>
    </div>
  );
};

const FeatureSection: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      className="flex flex-col gap-4 items-center justify-center text-center 
      p-8 md:p-16 rounded-3xl max-w-6xl m-auto mt-3 mb-3 overflow-hidden"
      sx={{
        background: theme.palette.background.paper,
        boxShadow:
          "rgba(0, 0, 0, 0.12) 0px 2px 4px 0px, rgba(0, 0, 0, 0.12) 0px -2px 4px 0px", // Thêm giá trị bóng đổ âm cho phía trên
      }}
    >
      {/* Tiêu đề */}
      <div>
        <Typography
          variant="h3"
          sx={{
            color: theme.palette.text.primary,
            fontSize: { xs: "2rem", md: "34px" },
          }}
          className="font-bold mb-2"
        >
          <span style={{ color: theme.palette.primary.main }}>
            Mở khóa lộ trình học tập{" "}
          </span>
          <span style={{ color: theme.palette.secondary.main }}>
            cá nhân hóa của bạn
          </span>
        </Typography>
      </div>

      {/* Mô tả */}
      <div>
        <Typography
          variant="body1"
          className="text-base md:text-base mb-6 max-w-5xl"
          sx={{ color: theme.palette.text.secondary }}
        >
          Tập trung vào điểm mạnh của bạn, cải thiện các điểm yếu với các bài học được thiết kế riêng, và duy trì lộ trình với một kế hoạch học tập tùy chỉnh dành riêng cho bạn, đảm bảo tiến bộ nhanh hơn và điểm số cao hơn!
        </Typography>
      </div>

      {/* Danh sách các tính năng */}
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        <FeatureItem
          icon={<SettingsSuggest />}
          text="Ứng dụng công nghệ AI"
        />
        <FeatureItem
          icon={<EmojiObjects />}
          text="Học theo mục tiêu"
        />
        <FeatureItem
          icon={<StarBorderPurple500Outlined />}
          text="Hiệu suất tốt nhất"
        />
      </div>

      {/* Nút */}
      <div>
        <Button
          variant="contained"
          size="large"
          className="rounded-full px-8 py-3 normal-case font-bold"
          sx={{
            // background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            backgroundColor: theme.palette.primary.main,
            color: "#fff",
            "&:hover": {
              boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
            },
          }}
        >
          Bắt đầu ngay!
        </Button>
      </div>
    </Box>
  );
};

export default FeatureSection;