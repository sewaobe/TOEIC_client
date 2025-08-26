import { Box, Container, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";
import UserCard from "../../components/profile/UserCard";
import ProgressChart from "../../components/profile/ProgressChart";
import CourseHistory from "../../components/profile/CourseHistory";
import userService from "../../services/user.service";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        console.log("Fetched user data:", user);

        // chỉ lấy name và gmail từ API (dùng biến user)
        setUserData({
          name: user.fullname || "Nguyễn Văn A",
          gmail: user.email || "abc@gmail.com",

          // phần còn lại mock cứng
          totalHours: 120,
          recentScore: 780,
          progress: { listening: 80, reading: 75 },
          achievements: [
            { id: 1, name: "Tân binh xuất sắc", icon: "🏆" },
            { id: 2, name: "Hoàn thành 100 bài", icon: "💯" },
          ],
          courses: [
            { id: 1, name: "TOEIC Căn bản", completion: 100 },
            { id: 2, name: "Luyện đề TOEIC", completion: 60 },
          ],
        });
      } catch (err) {
        console.error("Failed to fetch user", err);

        // fallback toàn bộ mock
        setUserData({
          name: "Nguyễn Văn A",
          gmail: "abc@gmail.com",
          totalHours: 120,
          recentScore: 780,
          progress: { listening: 80, reading: 75 },
          achievements: [
            { id: 1, name: "Tân binh xuất sắc", icon: "🏆" },
            { id: 2, name: "Hoàn thành 100 bài", icon: "💯" },
          ],
          courses: [
            { id: 1, name: "TOEIC Căn bản", completion: 100 },
            { id: 2, name: "Luyện đề TOEIC", completion: 60 },
          ],
        });
      }
    };
    fetchUser();
  }, []);

  if (!userData) {
    return (
      <MainLayout>
        <Box className="flex justify-center items-center h-screen">
          <Typography>Đang tải dữ liệu...</Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box className="bg-background-default text-text-primary min-h-screen p-8 md:p-12">
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            className="text-center mb-10"
            sx={{ color: theme.palette.primary.main }}
          >
            Hồ sơ học viên
          </Typography>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="md:col-span-1 row-span-2"
            >
              <UserCard userData={userData} />
            </motion.div>
            <motion.div variants={itemVariants} className="md:col-span-2">
              <ProgressChart data={userData.progress} />
            </motion.div>
            <motion.div variants={itemVariants} className="md:col-span-2">
              <CourseHistory courses={userData.courses} />
            </motion.div>
          </motion.div>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default ProfilePage;
