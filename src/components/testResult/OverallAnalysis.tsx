import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material"
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import RemoveCircleRoundedIcon from "@mui/icons-material/RemoveCircleRounded";
import FlagCircleRoundedIcon from "@mui/icons-material/FlagCircleRounded";
import KPICounterCard from "../../components/testResult/KPICounterCard";
import CheckIcon from "@mui/icons-material/Check";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { formatDuration } from "../testDetail/TestHistoryTable";

interface SummaryInfoCardProps {
    total_correct_question: number;
    accuracy_correct: number;
    completion_time: number;
}
const SummaryInfoCard = ({ total_correct_question, accuracy_correct, completion_time }: SummaryInfoCardProps) => {
    return (
        <Card
            elevation={0}
            className="rounded-2xl"
            sx={{
                backgroundColor: "#F8F9FA",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                width: "100%",
                height: "fit-content"
            }}
        >
            <CardContent sx={{ padding: "12px" }}>
                <Stack spacing={2}>
                    {/* Kết quả làm bài */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" gap={1}>
                            <CheckIcon fontSize="small" />
                            <Typography variant="body2">Kết quả làm bài</Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={600}>
                            {total_correct_question}/200
                        </Typography>
                    </Stack>

                    {/* Độ chính xác */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" gap={1}>
                            <QueryStatsIcon fontSize="small" />
                            <Typography variant="body2">Độ chính xác</Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={600}>
                            {accuracy_correct || 0}%
                        </Typography>
                    </Stack>

                    {/* Thời gian hoàn thành */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" gap={1}>
                            <AccessTimeIcon fontSize="small" />
                            <Typography variant="body2">Thời gian hoàn thành</Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={600}>
                            {formatDuration(completion_time)}
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

interface OverallAnalysisProps {
    completion_time: number;

    correct_question: number;
    incorrect_question: number;
    skip_question: number;
    total_score: number;

    correct_listening: number;
    correct_reading: number;
}
export const OverallAnalysis = ({
    completion_time,
    correct_question,
    incorrect_question,
    skip_question,
    total_score,
    correct_listening,
    correct_reading }: OverallAnalysisProps) => {
    return (
        <Stack direction={{ xs: "column", md: "row" }} gap={3} alignItems="stretch">
            <Box sx={{ width: { xs: "100%", md: "25%" }, flexShrink: 0 }}>
                <SummaryInfoCard total_correct_question={correct_question + incorrect_question} completion_time={completion_time} accuracy_correct={correct_question * 100 / (correct_question + incorrect_question)} />
            </Box>
            <Stack sx={{ flex: 1, minWidth: 0 }} gap={2}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <KPICounterCard
                            title="Trả lời đúng"
                            caption="Câu hỏi"
                            value={correct_question}
                            icon={<CheckCircleRoundedIcon fontSize="small" />}
                            color="success"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <KPICounterCard
                            title="Trả lời sai"
                            caption="Câu hỏi"
                            value={incorrect_question}
                            icon={<CancelRoundedIcon fontSize="small" />}
                            color="error"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <KPICounterCard
                            title="Bỏ qua"
                            caption="Câu hỏi"
                            value={skip_question}
                            icon={<RemoveCircleRoundedIcon fontSize="small" />}
                            color="warning"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <KPICounterCard
                            title="Điểm"
                            value={total_score}
                            icon={<FlagCircleRoundedIcon fontSize="small" />}
                            color="primary"
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <KPICounterCard
                            title="Listening"
                            caption={`Trả lời đúng ${correct_listening}/100 câu`}
                            value={`${correct_listening * 5}/495`}
                            color="primary"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <KPICounterCard
                            title="Reading"
                            caption={`Trả lời đúng ${correct_reading}/100 câu`}
                            value={`${correct_reading * 5}/495`}
                            color="primary"
                        />
                    </Grid>
                </Grid>
            </Stack>
        </Stack>
    )
}