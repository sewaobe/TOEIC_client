import { Box, Container, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import MainLayout from "../layouts/MainLayout";
import UserCard from "../../components/profile/UserCard";
import ProgressChart from "../../components/profile/ProgressChart";
import CourseHistory from "../../components/profile/CourseHistory";
import { fetchCurrentUser } from "../../stores/userSlice";
import { RootState, AppDispatch } from "../../stores/store";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const userFromStore = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!userFromStore || !userFromStore.name) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, userFromStore.name]);

  const userData = {
    name: userFromStore.name || "Nguyễn Văn A",
    gmail: userFromStore.gmail || "abc@gmail.com",
    avatarUrl: userFromStore.avatarUrl || "",
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
  };

  if (!userFromStore || !userFromStore.name) {
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
          <Typography variant="h2" component="h1" className="text-center mb-10" sx={{ color: theme.palette.primary.main }}>
            Hồ sơ học viên
          </Typography>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="md:col-span-1 row-span-2">
              <UserCard />
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
