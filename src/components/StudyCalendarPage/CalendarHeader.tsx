import { Box, Button, IconButton, Typography } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { useCalendarHeaderViewModel } from "../../viewmodels/StudyCalendarPage/useCalendarHeaderViewModel";

interface Props {
  month: Date;
  onChangeMonth: (newMonth: Date) => void;
}

const CalendarHeader: React.FC<Props> = ({ month, onChangeMonth }) => {
  const { handlePrev, handleNext, handleToday } = useCalendarHeaderViewModel(
    month,
    onChangeMonth
  );

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      mb={2}
    >
      {/* Nút Hôm nay */}
      <Button
        variant="contained"
        size="small"
        onClick={handleToday}
        sx={{
          borderRadius: 20,
          textTransform: "none",
          bgcolor: "linear-gradient(90deg, #3B82F6, #2563EB)",
          color: "white",
          px: 2.5,
          "&:hover": { bgcolor: "#2563EB" }
        }}
      >
        Hôm nay
      </Button>

      <Box display="flex" alignItems="center" gap={1}>
        <IconButton sx={{ bgcolor: "grey.100" }} onClick={handlePrev}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          {month.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
        </Typography>
        <IconButton sx={{ bgcolor: "grey.100" }} onClick={handleNext}>
          <ArrowForward />
        </IconButton>
      </Box>
      <Box width={60} /> {/* để cân đối */}
    </Box>
  );
};

export default CalendarHeader;
