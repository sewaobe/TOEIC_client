// src/components/profile/AchievementSection.tsx
import {
  Card,
  CardContent,
  Typography,
  useTheme,
  Tooltip,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

const achievementVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
} as const;

const AchievementSection: React.FC<{ achievements: any[] }> = ({
  achievements,
}) => {
  const theme = useTheme();
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scroll = (direction: "left" | "right") => {
    let newIndex = currentIndex;
    if (direction === "left" && currentIndex > 0) {
      newIndex = currentIndex - 3;
    } else if (
      direction === "right" &&
      currentIndex < achievements.length - 1
    ) {
      newIndex = currentIndex + 3;
    }

    setCurrentIndex(newIndex);
    itemRefs.current[newIndex]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  return (
    <Card className="rounded-xl shadow-lg">
      <CardContent>
        <Typography
          variant="h6"
          className="font-bold text-text-primary mb-4"
          sx={{ color: theme.palette.primary.main }}
        >
          Thành tích đạt được
        </Typography>

        {/* Hàng chứa nút và list thành tích */}
        <div className="relative flex justify-center">
          {/* Nút trái */}
          {currentIndex > 0 && (
            <IconButton
              onClick={() => scroll("left")}
              className="absolute -left-3  z-10 bg-white/70 dark:bg-black/50 hover:bg-white dark:hover:bg-black"
            >
              <ChevronLeft />
            </IconButton>
          )}

          {/* Container scroll ngang */}
          <div className="flex overflow-hidden flex-1 gap-2">
            {achievements.map((achievement: any, idx) => (
              <motion.div
                key={achievement._id}
                ref={(el) => (itemRefs.current[idx] = el)}
                variants={achievementVariants}
                className="flex-shrink-0 flex flex-col items-center text-center p-4
                 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer min-w-[80px]"
                whileHover={{ scale: 1.1 }}
              >
                <Tooltip title={achievement.name} arrow>
                  <img
                    src={achievement.image}
                    alt={achievement.name}
                    className="w-10 h-10 object-contain"
                  />
                </Tooltip>
              </motion.div>
            ))}
          </div>

          {/* Nút phải */}
          {currentIndex < achievements.length - 1 && (
            <IconButton
              onClick={() => scroll("right")}
              className="absolute -right-3 z-10 bg-white/70 dark:bg-black/50 hover:bg-white dark:hover:bg-black"
            >
              <ChevronRight />
            </IconButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementSection;
