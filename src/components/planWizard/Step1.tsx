import { Alert, Box, Slider, Stack, Typography } from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import useLocalStorage from "../../hooks/useLocalStorage";
import { FC } from "react";

interface ITargetScoreStep {
    score: number;
}
const SCORE_MARKS = [450, 550, 650, 750, 850].map((v) => ({ value: v, label: String(v) }));

function getScoreHint(score: number) {
    if (score < 450) return { icon: <TipsAndUpdatesIcon sx={{ mr: 1 }} />, title: "Khởi động nền tảng", text: "Từ vựng cơ bản, trọng âm, cấu trúc câu. Bài tập ngắn hằng ngày.", tone: "secondary" as const };
    if (score < 650) return { icon: <InsightsIcon sx={{ mr: 1 }} />, title: "Củng cố kỹ năng", text: "Tăng tốc Part 2–4, skimming, từ vựng theo chủ đề, mô phỏng ETS.", tone: "primary" as const };
    if (score < 850) return { icon: <InsightsIcon sx={{ mr: 1 }} />, title: "Tối ưu hiệu suất", text: "Chiến lược từng Part, quản lý thời gian, phân tích lỗi theo đề.", tone: "success" as const };
    return { icon: <EmojiEventsIcon sx={{ mr: 1 }} />, title: "Nâng cấp đỉnh cao", text: "Finetune chiến thuật, đề full ETS, từ vựng học thuật & bẫy ngữ pháp.", tone: "success" as const };
}

export const TargetScoreStep: FC<ITargetScoreStep> = ({ score }) => {
    const [value, setValue] = useLocalStorage<number>("score_target_plan", score);

    const hint = getScoreHint(value);
    return (
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Box flex={1}>
                <Typography variant="h6" sx={{ mb: 1 }}>Mục tiêu điểm TOEIC</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                    Điểm đầu vào hiện tại: <b>{score}</b>. Điều chỉnh mục tiêu để hệ thống lên kế hoạch phù hợp.
                </Alert>
                <Slider
                    aria-label="Chọn mục tiêu điểm TOEIC"
                    value={value}
                    min={200}
                    max={990}
                    step={5}
                    marks={SCORE_MARKS}
                    valueLabelDisplay="on"
                    onChange={(_, v) => setValue(Array.isArray(v) ? v[0] : v)}
                />
                {/* {!!error && <FormHelperText error sx={{ mt: 1 }}>{error}</FormHelperText>} */}
            </Box>

            {/* Hint */}
            <Stack
                className="rounded-2xl"
                sx={{
                    border: "1px solid", borderColor: "rgba(255,255,255,.15)",
                    bgcolor: "rgba(255,255,255,.10)", backdropFilter: "blur(16px)",
                    p: 2.5, minWidth: { md: 280 }, flex: { xs: "unset", md: "0 0 320px" },
                }}
            >
                <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                    {hint.icon}
                    <Typography color={`${hint.tone}.main`} fontWeight={700}>{hint.title}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">{hint.text}</Typography>
            </Stack>
        </Stack>
    );
}
