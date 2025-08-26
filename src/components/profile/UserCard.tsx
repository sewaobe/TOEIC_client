import { Avatar, Box, Card, CardContent, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import AchievementSection from "./AchievementSection";
import EditProfileForm from "./EditProfileForm";

const UserCard: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");

  const achievements = [
    { id: 1, name: "Tân binh xuất sắc", icon: "🏆" },
    { id: 2, name: "Hoàn thành 100 bài", icon: "💯" },
  ];

  return (
    <motion.div transition={{ type: "spring", stiffness: 300 }}>
      <Card className="rounded-xl shadow-lg bg-background-paper p-4 text-center">
        <CardContent>
          <div className="flex flex-col items-center">
            {/* Chỉ show avatar gốc khi không edit */}
            {!isEditing && (
              <Avatar sx={{ width: 80, height: 80 }} className="mb-4" src={avatarUrl}>
                {!avatarUrl && (user.name || "").charAt(0)}
              </Avatar>
            )}

            {isEditing ? (
              <EditProfileForm
                initialName={user.name || ""}
                initialGmail={user.gmail || ""}
                avatarUrl={avatarUrl}
                onClose={() => setIsEditing(false)}
                onAvatarChange={(newAvatar) => setAvatarUrl(newAvatar)} // cập nhật ngay
              />
            ) : (
              <>
                <Typography variant="h5" className="font-bold text-text-primary">
                  {user.name}
                </Typography>
                <Typography variant="body2" className="text-text-secondary mt-1">
                  {user.gmail}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  className="mt-3 rounded-full px-5 normal-case"
                  color="primary"
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa hồ sơ
                </Button>
              </>
            )}
          </div>

          <div className="mt-6 space-y-2">
            <Box className="flex justify-between items-center text-left">
              <Typography variant="body2" className="text-text-secondary">
                Điểm TOEIC gần nhất:
              </Typography>
              <Typography variant="h6" className="text-primary-main font-bold">780</Typography>
            </Box>
            <Box className="flex justify-between items-center text-left">
              <Typography variant="body2" className="text-text-secondary">
                Tổng giờ học:
              </Typography>
              <Typography variant="h6" className="text-primary-main font-bold">120h</Typography>
            </Box>
          </div>
        </CardContent>

        <div className="md:col-span-2">
          <AchievementSection achievements={achievements} />
        </div>
      </Card>
    </motion.div>
  );
};

export default UserCard;
