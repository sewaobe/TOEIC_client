import { Box, Typography, LinearProgress, CircularProgress } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useStudyOverviewViewModel } from "../../viewmodels/StudyCalendarPage/useStudyOverviewViewModel";

interface Props {
  remainingDays: number;
  achievedCups: number;
  totalCups: number;
  completedUnits: number;
  totalUnits: number;
  plannedUnits: number;
}

const StudyOverview: React.FC<Props> = ({
  remainingDays,
  achievedCups,
  totalCups,
  completedUnits,
  totalUnits,
  plannedUnits,
}) => {
  const { progressPercent } = useStudyOverviewViewModel(
    completedUnits,
    totalUnits
  );

  return (
    <Box>
      {/* === Card trắng: Tiến độ học === */}
      <Box
        p={3}
        bgcolor="white"
        borderRadius={4}
        boxShadow="0 6px 20px rgba(0,0,0,0.08)"
        mb={3}
      >
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Tiến độ học
        </Typography>

        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Ngày còn lại
            </Typography>
            <Typography fontWeight="bold">{remainingDays}/21</Typography>
          </Box>
          <CircularProgress
            variant="determinate"
            value={progressPercent}
            size={60}
            thickness={5}
            sx={{ color: "#10B981" }}
          />
        </Box>

        {/* Cups & Units */}
        <Box>
          <Typography variant="body2" fontWeight="500" mb={1}>
            🏆 {achievedCups}/{totalCups} cúp
          </Typography>
          <Typography variant="body2" fontWeight="500" mb={1}>
            ✅ {completedUnits}/{totalUnits} Units
          </Typography>
          <Typography variant="body2" fontWeight="500">
            📘 {plannedUnits}/{totalUnits} Kế hoạch
          </Typography>
        </Box>
      </Box>

      <Box
        bgcolor="linear-gradient(90deg,#3B82F6,#2563EB)"
        color="white"
        p={2.5}
        borderRadius={4}
        boxShadow="0 6px 16px rgba(0,0,0,0.1)"
      >
        <Typography fontWeight="bold" fontSize={15}>
          🚀 Hôm nay có buổi học! Cố gắng nào 💪
        </Typography>
      </Box>

    </Box>
  );
};

export default StudyOverview;
