import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
} from "@mui/material";
import type { RawAnswer } from "../../utils/mapAnswersToParts";

interface AnswerListSectionProps {
  setSelected: (answer: RawAnswer | null) => void;
  answers: RawAnswer[];
}

export const AnswerListSection = ({ setSelected, answers }: AnswerListSectionProps) => {
  return (
    <Box>
      {/* Tip box */}
      <Box
        sx={{
          bgcolor: "#D8F0E9",
          p: 2,
          borderRadius: 2,
          color: "success.contrastText",
          fontSize: 14,
          mb: 2,
          fontFamily: "Inter, sans-serif",
        }}
      >
        💡 <strong>Tips:</strong> Khi xem chi tiết đáp án, bạn có thể tạo và lưu highlight từ vựng, keywords và note để học và tra cứu lại sau này.
      </Box>

      {/* Render từng Part */}
      {[...new Set(
        answers
          .flatMap((a) => a.tags)
          .map((t) => t?.match(/\[Part (\d+)\]/)?.[1])
          .filter(Boolean)
      )].map((partNo) => {
        const partAnswers = answers.filter((a) =>
          a.tags?.some((t) => t?.includes(`[Part ${partNo}]`))
        );

        return (
          <Box key={partNo} mb={3}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              mb={1}
              sx={{ fontFamily: "Poppins, sans-serif" }}
            >
              Part {partNo}
            </Typography>

            <Stack direction="row" flexWrap="wrap" gap={2} sx={{ pl: 1 }}>
              {partAnswers.map((a) => {
                const status =
                  a.selectedOption === ""
                    ? "skipped"
                    : a.isCorrect
                      ? "correct"
                      : "wrong";

                const label =
                  a.selectedOption === ""
                    ? "chưa trả lời"
                    : a.selectedOption;

                // 🎨 Chọn màu theo trạng thái
                let chipStyle: any = {};
                if (status === "correct") {
                  chipStyle = {
                    bgcolor: "#D1FADF",
                    color: "#065F46",
                    border: "none",
                    fontWeight: 600,
                  };
                } else if (status === "wrong") {
                  chipStyle = {
                    bgcolor: "#FEE2E2",
                    color: "#B91C1C",
                    border: "none",
                    fontWeight: 600,
                  };
                } else {
                  chipStyle = {
                    bgcolor: "#F5F5F5",
                    color: "#555",
                    border: "1px solid #D6D6D6",
                    fontWeight: 500,
                  };
                }

                return (
                  <Box
                    key={a.question_no}
                    sx={{
                      width: { xs: "100%", sm: "45%", md: "30%" },
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <Chip
                      label={a.question_no}
                      variant={status === "skipped" ? "outlined" : "filled"}
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        ...chipStyle,
                        "& .MuiChip-label": { px: 0 },
                      }}
                    />

                    <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                      <strong>{a.correctAnswer}:</strong>{" "}
                      <i className="text-sm">{label}</i>{" "}
                      {status === "correct" && (
                        <Typography
                          component="span"
                          color="success.main"
                          fontWeight={600}
                        >
                          ✓
                        </Typography>
                      )}
                      {status === "wrong" && (
                        <Typography
                          component="span"
                          color="error.main"
                          fontWeight={600}
                        >
                          ✕
                        </Typography>
                      )}{" "}
                      —{" "}
                      <Button
                        size="small"
                        onClick={() => setSelected(a)}
                        sx={{
                          textTransform: "none",
                          p: 0,
                          minWidth: "auto",
                          fontWeight: 600,
                        }}
                      >
                        Chi tiết
                      </Button>
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
};
