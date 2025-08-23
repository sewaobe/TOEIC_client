import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { Star, FileDownload } from "@mui/icons-material";

const HeroSection: React.FC = () => {
  const theme = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  } as const;

  const imageVariants = {
    initial: { scale: 0.9, opacity: 0, y: 50 },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        delay: 0.5,
      },
    },
  } as const;

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative flex flex-col md:flex-row items-center justify-between p-8 md:p-16 rounded-xl overflow-hidden max-w-6xl mx-auto"
      //   sx={{ background: theme.palette.background.paper }}
    >
      {/* Nội dung bên trái */}
      <Box className="flex flex-col items-center md:items-start text-center md:text-left z-10 md:w-2/3">
        <motion.div variants={itemVariants}>
          <Typography
            variant="h2"
            // Sử dụng sx để kiểm soát font-size trực tiếp
            sx={{
              color: theme.palette.primary.main,
              fontSize: { xs: "3rem", md: "48px" }, // 3rem (~48px) trên mobile, 48px trên desktop
            }}
            className="font-bold mb-2"
          >
            Luyện thi thử {""}
            <span style={{ color: theme.palette.secondary.main }}>
              TOEIC® online 2025
            </span>
          </Typography>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography
            variant="body1"
            className="text-base md:text-lg mb-6 max-w-lg"
            sx={{ color: theme.palette.text.secondary }}
          >
            Chào mừng đến với <strong>TOEIC MASTER</strong>, trang web TOEIC
            cung cấp cho người học các bài luyện tập theo từng part, đề thi thử
            cũng như các bài tập về từ vựng và ngữ pháp. Bắt đầu hành trình
            chinh phục chứng chỉ TOEIC với các bài luyện tập trên trang web của
            chúng tôi ngay hôm nay!
          </Typography>
        </motion.div>
      </Box>

      {/* Hình ảnh và các thẻ floating bên phải */}
      <Box className="relative w-full md:w-1/2 mt-8 md:mt-0 flex justify-center items-center z-10">
        <motion.div
          className="relative w-full h-auto rounded-xl shadow-2xl overflow-hidden"
          variants={imageVariants}
          initial="initial"
          animate="animate"
          style={{ maxWidth: "400px" }}
        >
          <img
            src="https://estudyme.com/_next/image/?url=%2Fimages%2Fapp%2Flegacyhome%2Fstudent.webp&w=640&q=100"
            alt="Smiling student"
            style={{ width: "100%", height: "auto", objectFit: "cover" }}
          />
        </motion.div>

        {/* Floating cards */}
        <motion.div
          className="absolute top-1/4 -right-5 flex items-center p-3 rounded-full shadow-lg"
          style={{ background: theme.palette.background.paper }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
        >
          <Star sx={{ color: theme.palette.secondary.main }} className="mr-2" />
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.primary }}
            className="text-sm"
          >
            <span className="font-bold block">+10K</span>
            <span className="text-xs">5-Star Ratings</span>
          </Typography>
        </motion.div>

        <motion.div
          className="absolute bottom-1/4 -right-5 flex items-center p-3 rounded-full shadow-lg"
          style={{ background: theme.palette.background.paper }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 100 }}
        >
          <FileDownload
            sx={{ color: theme.palette.primary.main }}
            className="mr-2"
          />
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.primary }}
            className="text-sm"
          >
            <span className="font-bold block">+50K</span>
            <span className="text-xs">App downloads</span>
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
};

export default HeroSection;
