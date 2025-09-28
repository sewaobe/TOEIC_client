import { Box, Typography, LinearProgress } from "@mui/material";
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
        p={2.5}
        bgcolor="white"
        borderRadius={3}
        boxShadow="0 4px 12px rgba(0,0,0,0.08)"
        mb={2}
      >
        <Typography variant="h6" fontWeight="bold" mb={1.5}>
          Tiến độ học
        </Typography>

        {/* Số ngày còn lại */}
        <Typography variant="body2" color="text.secondary" mb={1}>
          Số ngày còn lại: <b>{remainingDays}</b>/21 ngày
        </Typography>

        {/* Số cúp */}
        <Box display="flex" alignItems="center" mb={1}>
          <EmojiEventsIcon sx={{ color: "#F59E0B" }} fontSize="small" />
          <Typography ml={0.5} fontWeight={500}>
            {achievedCups}/{totalCups} cúp đã đạt
          </Typography>
        </Box>

        {/* Progress bar */}
        <Box mb={1.5}>
          <Typography variant="body2" mb={0.5}>
            Số Units đạt 2 cúp trở lên
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "#E5E7EB",
              "& .MuiLinearProgress-bar": { bgcolor: "#10B981" },
            }}
          />
        </Box>

        {/* Thông tin chi tiết */}
        <Box>
          <Box display="flex" alignItems="center" mb={0.5}>
            <CheckCircleIcon sx={{ color: "#10B981", fontSize: 18, mr: 0.5 }} />
            <Typography
              fontSize={14}
              sx={{ color: "#059669", fontWeight: 500 }}
            >
              Hoàn thành: {completedUnits}/{totalUnits} Units
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <MenuBookIcon sx={{ color: "#2563EB", fontSize: 18, mr: 0.5 }} />
            <Typography
              fontSize={14}
              sx={{ color: "#2563EB", fontWeight: 500 }}
            >
              Kế hoạch: {plannedUnits}/{totalUnits} Units
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* === Card nhắc nhở xanh === */}
      <Box
        bgcolor="#3B82F6"
        color="white"
        p={2}
        borderRadius={3}
        boxShadow="0 4px 12px rgba(0,0,0,0.08)"
      >
        <Typography fontWeight="bold" fontSize={15}>
          Ồ! Hôm nay bạn có buổi cần hoàn thành. Cố gắng lên nào!
        </Typography>
      </Box>
    </Box>
  );
};

export default StudyOverview;
