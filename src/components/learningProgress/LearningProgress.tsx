import { useState, useEffect } from "react";
import { Box, Tabs, Tab, Divider, Stack, Button, Typography, Paper, CircularProgress, Alert } from "@mui/material";
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';

// Components & Utils
import { DayTab } from "./DayTab";
import { WeekTab } from "./WeekTab";
import { ProgramTab } from "./ProgramTab";
import { InteractiveKpiDashboard } from "./KpiStrip";
import { sum, durationMin, generateColors, computePercent, computeDailyEfficiency, transformBackendSessions } from "../../utils/learningProgress";
import { Session, Topic, Badge, DayTask } from "../../types/LearningProgress";
import learningPathService, { LearningProgressResponse } from "../../services/learningPath.service";

// Mock Data
export const TOTAL_WEEKS = 8;
export const DAYS_PER_WEEK = 7;

export const mockSessions: Session[] = [
  { start: "06:30", end: "07:00", activity: "Flashcards", focus: 8, understanding: 4, correct: 24, total: 30 },
  { start: "19:10", end: "19:50", activity: "Reading RC", focus: 7, understanding: 5, correct: 18, total: 22 },
  { start: "21:15", end: "21:35", activity: "Listening", focus: 6, understanding: 4, correct: 12, total: 15 },
];

export const weeklyPlannedPerDay = [90, 90, 90, 90, 90, 60, 60];
export const weeklyActualPerDay = [80, 110, 0, 95, 60, 45, 0];

export const cumulativePlanned = [3, 6.5, 10, 13.5, 17, 20, 24, 28];
export const cumulativeActual = [2.5, 6, 9, 12.2, 15.8, 18.3, 22.7, 26.5];

export const topics: Topic[] = [
  { key: "rc", label: "Reading", hours: 14, score: 62 },
  { key: "lc", label: "Listening", hours: 12, score: 71 },
];

export const badges: Badge[] = [
  { icon: "🏁", label: "Tuần hoàn hảo 7/7" },
  { icon: "🔥", label: "Streak 10 ngày" },
  { icon: "⏱️", label: "100 giờ đầu tiên" },
];

export const dayTasks: DayTask[] = [
  { id: 1, text: "Ôn 30 từ vựng mới", impact: "H" },
  { id: 2, text: "Đọc RC set #3", impact: "M" },
  { id: 3, text: "Nghe podcast 15'", impact: "L" },
];

export default function LearningProgress() {
  const [tab, setTab] = useState(0);
  const [week, setWeek] = useState(4);
  const [day, setDay] = useState(3);

  // API state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<LearningProgressResponse | null>(null);

  // Additional data states
  const [dayData, setDayData] = useState<any>(null);
  const [weekStatsData, setWeekStatsData] = useState<any>(null);
  const [cumulativeData, setCumulativeData] = useState<any>(null);

  // Track current IDs for fetching detailed data
  const [currentDayId, setCurrentDayId] = useState<string | null>(null);
  const [selectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Loading states for individual tabs
  const [loadingDay, setLoadingDay] = useState(false);
  const [loadingWeek, setLoadingWeek] = useState(false);

  // Fetch learning progress data
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await learningPathService.getLearningProgress();

        if (response.success && response.data) {
          setProgressData(response.data);
          // Set current week from API
          setWeek(response.data.current_week);

          // Fetch additional data
          await Promise.all([
            fetchCumulativeStats(),
          ]);
        } else {
          setError(response.message || "Không thể lấy dữ liệu tiến độ");
        }
      } catch (err: any) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
        console.error("Error fetching learning progress:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // Fetch cumulative stats
  const fetchCumulativeStats = async () => {
    try {
      const response = await learningPathService.getCumulativeStats();
      if (response.success && response.data) {
        setCumulativeData(response.data);
      }
    } catch (err) {
      console.error("Error fetching cumulative stats:", err);
    }
  };

  // Fetch week stats when week changes
  useEffect(() => {
    if (progressData && progressData.weeks.length > 0) {
      const currentWeekData = progressData.weeks.find((w) => w.week_no === week);
      if (currentWeekData && currentWeekData._id) {
        fetchWeekStats(currentWeekData._id);

        // Set current day ID (default to first day of the week)
        if (currentWeekData.days && currentWeekData.days.length > 0) {
          const dayIndex = Math.min(day, currentWeekData.days.length - 1);
          const currentDay = currentWeekData.days[dayIndex];
          if (currentDay && currentDay._id) {
            setCurrentDayId(currentDay._id);
          }
        }
      }
    }
  }, [week, day, progressData]);

  // Fetch day detail when day or dayId changes
  useEffect(() => {
    if (currentDayId) {
      fetchDayDetail(currentDayId, selectedDate);
    }
  }, [currentDayId, selectedDate]);

  // Fetch week stats
  const fetchWeekStats = async (weekId: string) => {
    try {
      setLoadingWeek(true);
      const response = await learningPathService.getWeekStats(weekId);
      if (response.success && response.data) {
        setWeekStatsData(response.data);
      }
    } catch (err) {
      console.error("Error fetching week stats:", err);
    } finally {
      setLoadingWeek(false);
    }
  };

  // Fetch day detail
  const fetchDayDetail = async (dayId: string, date: string) => {
    try {
      setLoadingDay(true);
      const response = await learningPathService.getDayDetail(dayId, date);
      if (response.success && response.data) {
        setDayData(response.data);
      }
    } catch (err) {
      console.error("Error fetching day detail:", err);
    } finally {
      setLoadingDay(false);
    }
  };

  // Handler for day selection
  const handleDayChange = (newDay: number) => {
    setDay(newDay);
    if (progressData && progressData.weeks.length > 0) {
      const currentWeekData = progressData.weeks.find((w) => w.week_no === week);
      if (currentWeekData && currentWeekData.days) {
        const dayIndex = Math.min(newDay, currentWeekData.days.length - 1);
        const selectedDay = currentWeekData.days[dayIndex];
        if (selectedDay && selectedDay._id) {
          setCurrentDayId(selectedDay._id);
        }
      }
    }
  };

  // Handler for week selection
  const handleWeekChange = (newWeek: number) => {
    setWeek(newWeek);
  };

  const percentProgram = computePercent(TOTAL_WEEKS, DAYS_PER_WEEK, week, day);

  // Transform backend sessions to frontend format, fallback to mock if unavailable
  const transformedSessions = transformBackendSessions(dayData?.sessions);
  const sessions = transformedSessions.length > 0 ? transformedSessions : mockSessions;
  
  const dayMinutesActual = dayData?.metrics?.dayMinutesActual || sum(sessions.map(durationMin));
  const dayMinutesPlanned = dayData?.metrics?.dayMinutesPlanned || 90;
  const dailyEfficiency = dayData?.metrics?.dailyEfficiency || computeDailyEfficiency(sessions);
  const dayColors = generateColors(sessions.length);

  const weekPlanned = weekStatsData?.weekPlanned || sum(weeklyPlannedPerDay);
  const weekActual = weekStatsData?.weekActual || sum(weeklyActualPerDay);
  const weeklyActualPerDayData = weekStatsData?.weeklyActualPerDay || weeklyActualPerDay;
  const weeklyPlannedPerDayData = weekStatsData?.weeklyPlannedPerDay || weeklyPlannedPerDay;
  const weeklyColors = generateColors(7);

  // Use cumulative data from API
  const cumulativePlannedData = cumulativeData?.cumulativePlanned || cumulativePlanned;
  const cumulativeActualData = cumulativeData?.cumulativeActual || cumulativeActual;

  // Animation Variants for Tab Content
  const tabContentVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // No data state
  if (!progressData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Chưa có dữ liệu tiến độ học tập</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, width: "100%", mx: "auto" }}>
      <InteractiveKpiDashboard progressData={progressData} />

      {/* Week & Day Selector */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 3,
          borderColor: 'grey.300',
          mt: 3,
          mb: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          justifyContent="center"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" fontWeight={700} color="primary" sx={{ minWidth: 50 }}>
              Tuần:
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {progressData.weeks.map((w) => (
                <Button
                  key={w.week_no}
                  size="small"
                  variant={week === w.week_no ? "contained" : "outlined"}
                  onClick={() => handleWeekChange(w.week_no)}
                  disabled={w.status === 'lock'}
                  sx={{
                    minWidth: 45,
                    height: 40,
                    fontWeight: week === w.week_no ? 700 : 400,
                  }}
                  color={
                    w.status === 'completed' ? 'success' :
                      w.status === 'in_progress' ? 'primary' :
                        'inherit'
                  }
                >
                  {w.week_no}
                </Button>
              ))}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" fontWeight={700} color="primary" sx={{ minWidth: 50 }}>
              Ngày:
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                const currentWeekData = progressData.weeks.find((w) => w.week_no === week);
                const dayData = currentWeekData?.days?.[d];
                const isDayLocked = dayData?.status === 'lock';

                return (
                  <Button
                    key={d}
                    size="small"
                    variant={day === d ? "contained" : "outlined"}
                    onClick={() => handleDayChange(d)}
                    disabled={isDayLocked}
                    sx={{
                      minWidth: 45,
                      height: 40,
                      fontWeight: day === d ? 700 : 400,
                    }}
                    color={
                      dayData?.status === 'completed' ? 'success' :
                        dayData?.status === 'in_progress' ? 'warning' :
                          'inherit'
                    }
                  >
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d]}
                  </Button>
                );
              })}
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* === UPGRADED TABS UI === */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 1,
          borderRadius: '24px',
          borderColor: 'grey.300',
          mt: 4,
          mb: 3,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          TabIndicatorProps={{ sx: { display: 'none' } }} // Ẩn indicator
        >
          <Tab
            icon={<CalendarTodayOutlinedIcon />}
            iconPosition="start"
            label="Ngày"
            sx={{
              borderRadius: '18px', // Bo tròn cho từng tab
              transition: 'all 0.3s',
              "&.Mui-selected": {
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 'bold',
              },
            }}
          />
          <Tab
            icon={<DateRangeOutlinedIcon />}
            iconPosition="start"
            label="Tuần"
            sx={{
              borderRadius: '18px',
              transition: 'all 0.3s',
              "&.Mui-selected": {
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 'bold',
              },
            }}
          />
          <Tab
            icon={<TimelineOutlinedIcon />}
            iconPosition="start"
            label="Chương trình"
            sx={{
              borderRadius: '18px',
              transition: 'all 0.3s',
              "&.Mui-selected": {
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 'bold',
              },
            }}
          />
        </Tabs>
      </Paper>

      {/* === ANIMATED TAB CONTENT === */}
      <Box>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            {tab === 0 && (
              loadingDay ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <DayTab
                  sessions={sessions}
                  day={day}
                  week={week}
                  dayMinutesActual={dayMinutesActual}
                  dayMinutesPlanned={dayMinutesPlanned}
                  dailyEfficiency={dailyEfficiency}
                  dayColors={dayColors}
                  dayTasks={dayTasks}
                />
              )
            )}

            {tab === 1 && (
              loadingWeek ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <WeekTab
                  weekActual={weekActual}
                  weekPlanned={weekPlanned}
                  weeklyActualPerDay={weeklyActualPerDayData}
                  weeklyPlannedPerDay={weeklyPlannedPerDayData}
                  weeklyColors={weeklyColors}
                />
              )
            )}

            {tab === 2 && (
              <ProgramTab
                week={week}
                percentProgram={percentProgram}
                TOTAL_WEEKS={progressData.weeks.length}
                cumulativePlanned={cumulativePlannedData}
                cumulativeActual={cumulativeActualData}
                topics={topics}
                badges={badges}
                weeks={progressData.weeks}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Box>

      <Divider sx={{ my: 3 }} />
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          Đạt 90’ hôm nay để giữ streak. Thiếu 20’? Học thêm mini 10’ × 2 trước ngủ 😴
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained">Bắt đầu học</Button>
          <Button variant="outlined">Ghi nhận phiên</Button>
        </Stack>
      </Stack>
    </Box>
  );
}