import { Box, Container, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";
import UserCard from "../../components/profile/UserCard";
import ProgressChart from "../../components/profile/ProgressChart";
import CourseHistory from "../../components/profile/CourseHistory";
import userService from "../../services/user.service";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import { EmptyIcons, EmptySection } from "../../components/common/EmptySection";

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
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const userRedux = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Nếu có token, BE trả về user hiện tại
        if (!userRedux) {
          return;
        }
        const user = await userService.getUserByUsername(`${userRedux.username}`); // hoặc theo token
        setUserData(user.user);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (isEditing === false)
      fetchProfile();
  }, [isEditing]);
  if (loading || !userData) {
    return (
      <MainLayout>
        <Box className="flex justify-center items-center h-screen">
          <Typography>Đang tải dữ liệu...</Typography>
        </Box>
      </MainLayout>
    );
  }
  console.log("ProfilePage userData:", userData.progress);
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
              <UserCard
                user={userData}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="md:col-span-2">
              {userData?.highestTest ? (
                <ProgressChart data={userData.highestTest} />
              ) : (
                <EmptySection
                  title="Chưa có dữ liệu tiến độ"
                  description="Bạn chưa làm bài kiểm tra nào."
                  icon={EmptyIcons.quiz}
                  isCard
                />
              )}
            </motion.div>
            <motion.div variants={itemVariants} className="md:col-span-2">
              {userData?.progress && userData.progress.length > 0 ? (
                <CourseHistory
                  courses={userData.progress.map((p: any) => ({
                    id: p._id,
                    name: p?.learningPath_id?.title ?? "Không rõ",
                    completion: 0,
                  }))}
                />
              ) : (
                <EmptySection
                  title="Chưa có khóa học nào"
                  description="Bạn chưa tham gia khóa học nào."
                  icon={EmptyIcons.school}
                  isCard
                />
              )}
            </motion.div>
          </motion.div>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default ProfilePage;
