import { CalendarMonthOutlined, HomeOutlined, InfoOutlined, RestartAlt, ScheduleOutlined } from "@mui/icons-material";
import { Box, Button, Dialog, Divider, Paper, Stack, Typography } from "@mui/material";

interface InactiveLearningPathModalProps {
  open: boolean;
  lastAttempt: string;
  inactiveDays: number;
  onCreateNewPath: () => void;
  onGoHome: () => void;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export function InactiveLearningPathModal({
  open,
  lastAttempt,
  inactiveDays,
  onCreateNewPath,
  onGoHome,
}: InactiveLearningPathModalProps) {
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxWidth: 680,
          m: 2,
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ p: { xs: 3, sm: 5 }, textAlign: "center" }}>
        <Box
          sx={{
            mx: "auto",
            mb: 2.5,
            width: 190,
            height: 130,
            borderRadius: "50%",
            background: "radial-gradient(circle, #fff7f1 0%, #fff 70%)",
            display: "grid",
            placeItems: "center",
            position: "relative",
          }}
        >
          <CalendarMonthOutlined sx={{ color: "#ff6b22", fontSize: 82 }} />
          <ScheduleOutlined sx={{ color: "#c84b19", fontSize: 58, position: "absolute", right: 10, bottom: 5, bgcolor: "white", borderRadius: "50%" }} />
        </Box>

        <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: 25, sm: 31 } }}>
          Chương trình học đã bị vô hiệu hóa
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2, fontSize: 17, lineHeight: 1.55 }}>
          Bạn đã gián đoạn việc học quá lâu nên chương trình học hiện tại không còn phù hợp. Hãy đánh giá lại để hệ thống tạo một lộ trình mới phù hợp với năng lực hiện tại của bạn.
        </Typography>

        <Paper variant="outlined" sx={{ mt: 3, borderColor: "#ffd9c5", borderRadius: 2, overflow: "hidden", textAlign: "left" }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2 }}>
            <CalendarMonthOutlined sx={{ color: "#f45c19" }} />
            <Typography sx={{ flex: 1 }}>Lần học gần nhất</Typography>
            <Typography fontWeight={800}>{formatDate(lastAttempt)}</Typography>
          </Stack>
          <Divider sx={{ mx: 2 }} />
          <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2 }}>
            <ScheduleOutlined sx={{ color: "#f45c19" }} />
            <Typography sx={{ flex: 1 }}>Thời gian gián đoạn</Typography>
            <Typography color="#f4511e" fontWeight={800}>{inactiveDays} ngày</Typography>
          </Stack>
        </Paper>

        <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#fff7f3", textAlign: "left" }}>
          <InfoOutlined sx={{ color: "#f4511e", mt: 0.15 }} />
          <Typography variant="body2" lineHeight={1.5}>
            Theo quy định, khi thời gian gián đoạn vượt quá <Box component="span" color="#f4511e" fontWeight={700}>14 ngày</Box>, chương trình học hiện tại sẽ không còn hợp lệ.
          </Typography>
        </Stack>

        <Button fullWidth variant="contained" size="large" startIcon={<RestartAlt />} onClick={onCreateNewPath} sx={{ mt: 2.5, py: 1.35, borderRadius: 2, bgcolor: "#ff5a14", fontWeight: 700, fontSize: 17, "&:hover": { bgcolor: "#e94e0d" } }}>
          Tạo lộ trình mới
        </Button>
        <Button fullWidth variant="outlined" size="large" startIcon={<HomeOutlined />} onClick={onGoHome} sx={{ mt: 1.25, py: 1.2, borderRadius: 2, color: "text.primary", borderColor: "#d5d9e1", fontWeight: 700, fontSize: 17 }}>
          Về trang chủ
        </Button>
      </Box>
    </Dialog>
  );
}
