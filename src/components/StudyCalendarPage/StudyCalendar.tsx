import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
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
  const { days, todayStr } = useStudyCalendarViewModel(month, studies);
  const numRows = Math.ceil(days.length / 7);

  return (
    <Box
      display="grid"
      gridTemplateColumns={`repeat(7, calc((90vw) / 7))`} // auto fit theo chiều ngang màn hình
      gridTemplateRows={`50px repeat(${numRows}, calc((100vh) / ${numRows}))`}
      border="1px solid #e5e7eb"
    >
      {/* Header */}
      {WEEKDAYS.map((w, i) => (
        <Box
          key={i}
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            borderRight: i < 6 ? "1px solid #e5e7eb" : undefined,
            bgcolor: "grey.100",
            fontWeight: "bold",
            py: 1,
          }}
        >
          <Typography variant="caption">{w}</Typography>
        </Box>
      ))}

      {/* Các ngày */}
      {days.map((date, idx) => {
        const study = studies.find((s) => s.dateLabel === toYMD(date));
        const isToday = toYMD(date) === todayStr;
        const inCurrentMonth = date.getMonth() === month.getMonth(); // Kiểm tra ngày có thuộc tháng hiện tại không

        return (
          <Box
            key={idx}
            sx={{
              borderTop: "1px solid #e5e7eb",
              borderRight: (idx + 1) % 7 !== 0 ? "1px solid #e5e7eb" : undefined,
              cursor: "pointer",
              transition: "all 0.25s ease",
              "&:hover": { bgcolor: "grey.50" },
              // Làm mờ các ngày không thuộc tháng hiện tại
              backgroundColor: inCurrentMonth ? "ffffff" : "grey.200",
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => onSelectDay(date)}
          >
            {/* Thanh ngang + 3 móc khuyên */}
            <Box
              sx={{
                position: "absolute",
                top: 8,
                // THAY ĐỔI QUAN TRỌNG Ở ĐÂY
                left: "10%",  // <-- Tạo khoảng trống 10% bên trái
                right: "10%", // <-- Tạo khoảng trống 10% bên phải
                // ============================
                height: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around", // space-around để đẹp hơn
              }}
            >
              {/* Đường kẻ ngang */}
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  height: '1.5px',
                  bgcolor: "grey.300",
                  transform: "translateY(-50%)",
                }}
              />
              {/* 3 khuyên tròn */}
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    border: "1.5px solid",
                    borderColor: 'grey.400',
                    bgcolor: "white",
                    zIndex: 1,
                  }}
                />
              ))}
            </Box>

            <Card
              sx={{
                height: '100%',
                borderRadius: 0,
                border: isToday ? "2px solid #2563EB" : "none",
                boxSizing: 'border-box', // Đảm bảo border không làm thay đổi kích thước
                boxShadow: "none",
                bgcolor: 'transparent' // Nền trong suốt để không che mất Box cha
              }}
            >
              <CardContent
                sx={{
                  pt: 4, // Tăng padding top để không bị đè lên khuyên
                  px: 1,
                  pb: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{
                    mb: 0.5,
                    color: isToday ? "primary.main" : "text.primary",
                  }}
                >
                  {date.getDate()}
                </Typography>

                {study  && (
                  <>
                    <Typography variant="caption" fontWeight="bold" color="primary" noWrap>
                      Buổi {study.dayOfWeek}
                    </Typography>
                    {study.sessions.slice(0, 2).map((s, i) => (
                      <Typography key={i} variant="caption" noWrap sx={{ color: "text.secondary" }}>
                        • {s.name}
                      </Typography>
                    ))}
                    {study.sessions.length > 2 && (
                      <Typography variant="caption" sx={{ mt: 0.5, color: "primary.main", fontWeight: 500 }}>
                        + Xem chi tiết
                      </Typography>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        );
      })}
    </Box>
  );
};

export default StudyCalendar;