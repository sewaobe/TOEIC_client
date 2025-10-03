import React, { useState } from 'react';

// MUI Components
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

// MUI Icons
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

// ---------------- Types ----------------
type Skill = "L" | "R"; // Listening / Reading

interface ProgramLesson {
  id: string;
  scheduledISO: string;
  title: string;
  skill: Skill;
  minutes: number;
}

interface ProgressEntry {
  lessonId: string;
  completedISO: string;
}

// ---------------- Dữ liệu cứng (Mock Data) ----------------
const MOCK_LESSONS: ProgramLesson[] = [
  { id: '2025-09-27-L-0', scheduledISO: '2025-09-27', title: 'LC: Shadowing 10’', skill: 'L', minutes: 10 },
  { id: '2025-09-28-R-0', scheduledISO: '2025-09-28', title: 'RC: Vocab 20 từ (ETS)', skill: 'R', minutes: 20 },
  { id: '2025-09-28-L-0', scheduledISO: '2025-09-28', title: 'LC: Mini test 10 câu', skill: 'L', minutes: 15 },
  { id: '2025-09-29-R-0', scheduledISO: '2025-09-29', title: 'RC: Reading Part 7 – 1 bài', skill: 'R', minutes: 30 },
  { id: '2025-09-30-R-0', scheduledISO: '2025-09-30', title: 'RC: Grammar – thì/điều kiện', skill: 'R', minutes: 25 },
];

const MOCK_PROGRESS: ProgressEntry[] = [
  // Bài học sớm
  { lessonId: '2025-09-28-L-0', completedISO: '2025-09-27' },
  // Bài học đúng hạn
  { lessonId: '2025-09-27-L-0', completedISO: '2025-09-27' },
  // Bài học muộn
  { lessonId: '2025-09-29-R-0', completedISO: '2025-10-01' },
];

// ---------------- Component Props ----------------
// Giờ đây component chỉ cần nhận 'filter' và 'todayISO'
interface TimelineViewProps {
  filter: Skill | "ALL";
  todayISO: string;
}

// ---------------- Component ----------------
export default function TimelineView({ filter, todayISO }: TimelineViewProps) {
  // --- STATE ---
  // Sử dụng state nội bộ để quản lý tiến trình, khởi tạo từ dữ liệu cứng
  const [progress, setProgress] = useState<ProgressEntry[]>(MOCK_PROGRESS);

  // --- HANDLERS ---
  // Các hàm xử lý giờ nằm bên trong component và cập nhật state nội bộ
  const handleCompleteToday = (lessonId: string) => {
    if (progress.some((p) => p.lessonId === lessonId)) return; // Tránh hoàn thành lại
    const newProgressEntry: ProgressEntry = { lessonId, completedISO: todayISO };
    setProgress([...progress, newProgressEntry]);
  };

  const handleUncomplete = (lessonId: string) => {
    setProgress(progress.filter((p) => p.lessonId !== lessonId));
  };

  // --- LOGIC ---
  const isDone = (id: string) => progress.some((p) => p.lessonId === id);
  const doneDate = (id: string) => progress.find((p) => p.lessonId === id)?.completedISO;

  const statusBadge = (lesson: ProgramLesson): { label: string; color: 'success' | 'primary' | 'warning' | 'default'; variant: 'filled' | 'outlined' } => {
    const done = progress.find((p) => p.lessonId === lesson.id);
    if (!done) return { label: "Chưa xong", color: "default", variant: 'outlined' };
    if (done.completedISO < lesson.scheduledISO) return { label: "Sớm", color: "success", variant: 'filled' };
    if (done.completedISO === lesson.scheduledISO) return { label: "Đúng hạn", color: "primary", variant: 'filled' };
    return { label: "Muộn", color: "warning", variant: 'filled' };
  };

  // --- RENDER ---
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: 'grey.300' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
          <CalendarMonthOutlinedIcon fontSize="small" />
          <Typography variant="body1" fontWeight="medium">
            Dòng chảy chương trình
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Bấm “Học xong hôm nay” để unlock sớm/muộn
        </Typography>
      </Stack>
      <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
        <Stack spacing={1.5}>
          {MOCK_LESSONS // Sử dụng trực tiếp MOCK_LESSONS
            .filter((l) => (filter === "ALL" ? true : l.skill === filter))
            .map((lesson) => {
              const { label, color, variant } = statusBadge(lesson);
              const finished = isDone(lesson.id);
              const when = doneDate(lesson.id);

              return (
                <Paper key={lesson.id} variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, borderColor: 'grey.300' }}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                      <Chip label={lesson.scheduledISO} size="small" variant="outlined" />
                      <Chip label={label} color={color} variant={variant} size="small" />
                      {finished && when && (
                        <Chip label={`Xong: ${when}`} size="small" variant="outlined" />
                      )}
                    </Stack>
                    <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
                      {`[${lesson.skill}] ${lesson.title}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ~{lesson.minutes} phút
                    </Typography>
                  </Box>
                  
                  <Box>
                    {finished ? (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleUncomplete(lesson.id)}
                        sx={{ textTransform: 'none', color: 'text.secondary', borderColor: 'grey.400' }}
                      >
                        Bỏ đánh dấu
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleCompleteToday(lesson.id)}
                        sx={{ textTransform: 'none' }}
                      >
                        Học xong hôm nay
                      </Button>
                    )}
                  </Box>
                </Paper>
              );
            })}
        </Stack>
      </Box>
    </Paper>
  );
}