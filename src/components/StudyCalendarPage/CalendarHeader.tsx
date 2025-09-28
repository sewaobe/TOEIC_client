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
        variant="outlined"
        size="small"
        onClick={handleToday}
        sx={{ borderRadius: 20 }}
      >
        Hôm nay
      </Button>
      {/* Tháng + năm */}
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={handlePrev}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          {`Tháng ${month.getMonth() + 1}, ${month.getFullYear()}`}
        </Typography>
        <IconButton onClick={handleNext}>
          <ArrowForward />
        </IconButton>
      </Box>
      <Box width={60} /> {/* để cân đối */}
    </Box>
  );
};

export default CalendarHeader;
