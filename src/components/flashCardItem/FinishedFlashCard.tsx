import { Card, CardContent, Typography, Stack, Button } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

export default function FinishedFlashCard({
  onStats,
  onRetry,
  onNext,
}: {
  onStats: () => void;
  onRetry: () => void;
  onNext: () => void;
}) {
  return (
    <Card
      className="max-w-lg mx-auto mt-8"
      sx={{
        borderRadius: 4,
        textAlign: "center",
        p: 3,
      }}
    >
      <CardContent>
        <EmojiEventsIcon color="primary" sx={{ fontSize: 60, mb: 1 }} />
        <Typography variant="h6" fontWeight={800} gutterBottom>
          🎉 Bạn đã hoàn thành tất cả từ vựng!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Hãy chọn một hành động tiếp theo để tiếp tục hành trình học tập.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={onStats}
          >
            Xem thống kê
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={onRetry}
          >
            Làm lại
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={onNext}
          >
            Bài tiếp theo
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
