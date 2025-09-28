import React from "react";
import { Box, Typography } from "@mui/material";
import StudyCard from "./StudyCard";
import {
  useStudyCalendarViewModel,
  WEEKDAYS,
  toYMD,
  Study,
} from "../../viewmodels/StudyCalendarPage/useStudyCalendarViewModel";

interface Props {
  month: Date;
  studies: Study[];
  onSelectDay: (date: Date) => void;
}

const StudyCalendar: React.FC<Props> = ({ month, studies, onSelectDay }) => {
  const { days, todayStr, getCellBg } = useStudyCalendarViewModel(
    month,
    studies
  );

  return (
    <Box>
      {/* Header CN - T7 */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(7, 1fr)"
        borderBottom="1px solid #e5e7eb"
        mb={1}
      >
        {WEEKDAYS.map((w, i) => (
          <Box key={i} textAlign="center" py={1} fontWeight="bold">
            <Typography variant="caption">{w}</Typography>
          </Box>
        ))}
      </Box>

      {/* Grid ngày */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(7, 1fr)"
        gridAutoRows="1fr"
        gap={1}
        height="100%"
      >
        {days.map((date, idx) => {
          const study = studies.find((s) => s.dateLabel === toYMD(date));
          const isToday = toYMD(date) === todayStr;

          return (
            <Box
              key={idx}
              onClick={() => onSelectDay(date)}
              sx={{
                border: isToday ? "2px solid #2563EB" : "1px solid #e5e7eb",
                borderRadius: 2,
                bgcolor: getCellBg(date),
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": { boxShadow: 3 },
                height: "100%",
              }}
            >
              {/* số ngày */}
              <Box sx={{ p: 0.5, flexShrink: 0 }}>
                {isToday ? (
                  <Box
                    sx={{
                      bgcolor: "#2563EB",
                      color: "white",
                      borderRadius: "50%",
                      width: 26,
                      height: 26,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    {date.getDate()}
                  </Box>
                ) : (
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    {date.getDate()}
                  </Typography>
                )}
              </Box>

              {/* nội dung buổi học */}
              {study && (
                <Box flexGrow={1} display="flex" mt={0.5}>
                  <StudyCard
                    title={`Buổi ${study.dayOfWeek}`}
                    progress={study.progress}
                    status={study.status}
                    sessions={study.sessions}
                    tag={study.tag}
                    note={study.note}
                    sx={{
                      width: "100%",
                      height: "100%",
                      bgcolor: "transparent",
                      boxShadow: "none",
                      border: "none",
                    }}
                  />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default StudyCalendar;
