import { Box, Grid } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import StudyCalendar from "../../components/StudyCalendarPage/StudyCalendar";
import StudyOverview from "../../components/StudyCalendarPage/StudyOverview";
import CalendarHeader from "../../components/StudyCalendarPage/CalendarHeader";
import { useStudyCalendarPageViewModel } from "../../viewmodels/StudyCalendarPage/useStudyCalendarPageViewModel";

const StudyCalendarPage: React.FC = () => {
  const { month, setMonth, selectedDay, setSelectedDay, studies } =
    useStudyCalendarPageViewModel();

  return (
    <MainLayout>
      <Grid container spacing={2} sx={{ p: 2 }}>
        {/* Lịch bên trái */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 3,
              boxShadow: 2,
              p: 2,
              height: "100%",
            }}
          >
            <CalendarHeader month={month} onChangeMonth={setMonth} />
            <StudyCalendar
              month={month}
              studies={studies}
              onSelectDay={setSelectedDay}
            />
          </Box>
        </Grid>

        {/* Tổng quan bên phải */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 3,
              boxShadow: 2,
              p: 2,
              display: "inline-block",
              width: "100%",
            }}
          >
            <StudyOverview
              remainingDays={21}
              achievedCups={25}
              totalCups={123}
              completedUnits={9}
              totalUnits={41}
              plannedUnits={10}
            />
          </Box>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default StudyCalendarPage;
