import { Box } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import StudyCalendar from "../../components/StudyCalendarPage/StudyCalendar";
import CalendarHeader from "../../components/StudyCalendarPage/CalendarHeader";
import { useStudyCalendarPageViewModel } from "../../viewmodels/StudyCalendarPage/useStudyCalendarPageViewModel";
import { CalendarSummary } from "../../components/StudyCalendarPage/CalendarSummary";
import { useState } from "react";
import TimelineView from "../../components/StudyCalendarPage/TimelineView";
import { Skill } from "../../types/Calendar";

const StudyCalendarPage: React.FC = () => {
  const { month, setMonth, selectedDay, setSelectedDay, studies } =
    useStudyCalendarPageViewModel();

  const [view, setView] = useState<'CALENDAR' | 'TIMELINE'>('CALENDAR');
  const [filter, setFilter] = useState<Skill | 'ALL'>('ALL');

  // 2. Tạo hằng số cho 'todayISO'
  // Lấy ngày hiện tại và định dạng thành chuỗi "YYYY-MM-DD"
  const todayISO = new Date().toISOString().split('T')[0];
  return (
    <MainLayout>
      <Box
        sx={{
          p: 3,
          bgcolor: "grey.50",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}
      >
        <Box
          sx={{
            flex: 1,
            maxWidth: "1500px", // giới hạn bề rộng nếu cần
            bgcolor: "white",
            borderRadius: 4,
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            p: 3,
            height: "100%",
            transition: "0.3s",
            "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
          }}>
          <CalendarSummary
            view={view}
            onViewChange={setView} />
        </Box>
        <Box
          sx={{
            flex: 1,
            maxWidth: "1500px", // giới hạn bề rộng nếu cần
            bgcolor: "white",
            borderRadius: 4,
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            p: 3,
            height: "100%",
            transition: "0.3s",
            "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
          }}
        >
          <CalendarHeader month={month} onChangeMonth={setMonth} />
          {view === 'CALENDAR' ? (
            <StudyCalendar
              month={month}
              studies={studies}
              onSelectDay={setSelectedDay}
            />
          ) : (
            <TimelineView filter={filter} todayISO={todayISO}/>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default StudyCalendarPage;
