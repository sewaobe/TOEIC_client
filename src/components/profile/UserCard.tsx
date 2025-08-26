// src/components/profile/UserCard.tsx
import { Avatar, Box, Card, CardContent, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import AchievementSection from "./AchievementSection";

const UserCard: React.FC<any> = ({ userData }) => {
  return (
    <motion.div transition={{ type: "spring", stiffness: 300 }}>
      <Card className="rounded-xl shadow-lg bg-background-paper p-4 text-center">
        <CardContent>
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <Avatar sx={{ width: 80, height: 80 }} className="mb-4">
              {userData.name.charAt(0)}
            </Avatar>

            {/* Tên user */}
            <Typography
              variant="h5"
              component="div"
              className="font-bold text-text-primary"
            >
              {userData.name}
            </Typography>

            {/* Level */}
            <Typography variant="body2" className="text-text-secondary mt-1">
              {userData.gmail}
            </Typography>

            {/* Nút chỉnh sửa hồ sơ */}
            <Button
              variant="outlined"
              size="small"
              className="mt-3 rounded-full px-5 normal-case"
              color="primary"
              onClick={() => console.log("Edit profile clicked")}
            >
              Chỉnh sửa hồ sơ
            </Button>
          </div>

          {/* Thông tin điểm và giờ học */}
          <div className="mt-6 space-y-2">
            <Box className="flex justify-between items-center text-left">
              <Typography variant="body2" className="text-text-secondary">
                Điểm TOEIC gần nhất:
              </Typography>
              <Typography variant="h6" className="text-primary-main font-bold">
                {userData.recentScore}
              </Typography>
            </Box>
            <Box className="flex justify-between items-center text-left">
              <Typography variant="body2" className="text-text-secondary">
                Tổng giờ học:
              </Typography>
              <Typography variant="h6" className="text-primary-main font-bold">
                {userData.totalHours}h
              </Typography>
            </Box>
          </div>
        </CardContent>

        {/* Achievement */}
        <div className="md:col-span-2">
          <AchievementSection achievements={userData.achievements} />
        </div>
      </Card>
    </motion.div>
  );
};

export default UserCard;
