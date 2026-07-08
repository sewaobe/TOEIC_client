import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Divider,
    Card,
    CardContent,
    Grid,
    Chip,
    Stack,
} from "@mui/material"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
    CheckCircleOutline,
    ErrorOutline,
    TrendingUp,
    School,
    AutoAwesome,
    Analytics,
    QueryStats,
    Hearing,
    BarChart as BarIcon,
} from "@mui/icons-material"
import { LineChart, BarChart } from "@mui/x-charts"
import type {
    DictationAIFeedbackResponse,
    DictationRecommendation,
} from "../../types/DictationProgress"

interface DictationAIAnalysisProps {
    loading?: boolean
    analysis?: any
    currentDifficulty?: string
    onConfirm: () => void
}

const normalizeAccuracyValue = (value: unknown) => {
    const numeric =
        typeof value === "number" ? value : parseFloat(String(value).replace("%", ""))
    if (!Number.isFinite(numeric)) return 0
    return numeric <= 1 ? numeric * 100 : numeric
}

const truncateLabel = (text: string, max = 18) =>
    text.length > max ? `${text.slice(0, max)}...` : text

const formatPartType = (partType?: number, partLabel?: string) => {
    if (partLabel) return partLabel
    if (!partType) return "Không rõ Part"
    return `Part ${partType}`
}

const formatRecommendationGoal = (goal?: DictationRecommendation["recommendationGoal"]) => {
    switch (goal) {
        case "increase_difficulty":
            return "Tăng độ khó"
        case "build_reflex":
            return "Luyện phản xạ"
        case "reinforce_foundation":
            return "Củng cố"
        case "retry_current":
            return "Luyện lại"
        case "move_to_less_supported_mode":
            return "Làm lại ở medium"
        case "same_level_stabilization":
            return "Ổn định cùng mức"
        default:
            return null
    }
}

const isStructuredFeedback = (data: any): data is DictationAIFeedbackResponse =>
    Boolean(
        data &&
        data.feedback &&
        data.charts &&
        Array.isArray(data.recommendations) &&
        typeof data.summary?.performanceBand === "string",
    )

export default function DictationAIAnalysis({
    loading,
    analysis,
    currentDifficulty,
    onConfirm,
}: DictationAIAnalysisProps) {
    const navigate = useNavigate()
    const structured = isStructuredFeedback(analysis)
    const feedback = structured ? analysis.feedback : null
    const recommendations = structured ? analysis.recommendations.slice(0, 3) : []

    const overallText = structured ? feedback?.overall : analysis?.summary
    const sentenceAccuracyInsights = structured
        ? feedback?.sentenceAccuracyInsights ?? []
        : analysis?.chart_insights?.accuracy_over_time?.map(
            (item: string, idx: number) => `Câu ${idx + 1}: ${item}`,
        ) ?? []
    const commonMistakeInsights = structured
        ? feedback?.commonMistakeInsights ?? []
        : analysis?.chart_insights?.common_mistakes ?? []
    const listeningNotes = structured
        ? commonMistakeInsights
        : analysis?.chart_insights?.pronunciation_patterns ?? []
    const strengths = structured ? feedback?.strengths ?? [] : analysis?.strengths ?? []
    const weaknesses = structured ? feedback?.weaknesses ?? [] : analysis?.weaknesses ?? []
    const tips = structured ? feedback?.tips ?? [] : analysis?.improvement_tips ?? []
    const legacyRecommendedFocus = !structured ? analysis?.recommended_focus ?? [] : []

    const accuracyData = structured
        ? analysis.charts.accuracyBySentence.map((item) => ({
            x: item.index + 1,
            y: normalizeAccuracyValue(item.accuracy),
        }))
        : analysis?.chart_insights?.accuracy_over_time?.map((item: any, idx: number) => ({
            x: idx + 1,
            y: normalizeAccuracyValue(item),
        })) || []

    const mistakesData = structured
        ? analysis.charts.frequentMistakes.map((item) => ({
            x: truncateLabel(item.text),
            y: item.count,
        }))
        : analysis?.chart_insights?.common_mistakes?.map((item: string) => ({
            x: truncateLabel(item),
            y: 1,
        })) || []

    const handleOpenRecommendation = (item: DictationRecommendation) => {
        const difficulty = item.suggestedDifficulty || currentDifficulty || "easy"
        navigate(`/practice-skill/dictation/${item.dictationId}?difficulty=${difficulty}`)
    }

    const renderTextList = (items: string[], emptyText: string) => (
        items.length ? (
            <ul>
                {items.map((item, index) => (
                    <li key={`${item}-${index}`}>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {item}
                        </Typography>
                    </li>
                ))}
            </ul>
        ) : (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {emptyText}
            </Typography>
        )
    )

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{
                width: "min(1080px, 95%)",
                mx: "auto",
                py: 6,
                minHeight: "100vh",
            }}
        >
            {loading ? (
                <Box textAlign="center" mt={20}>
                    <CircularProgress sx={{ color: "#7c3aed" }} />
                    <Typography mt={2}>
                        AI đang phân tích bài luyện của bạn...
                    </Typography>
                </Box>
            ) : (
                <>
                    <Box
                        sx={{
                            background: "linear-gradient(90deg,#2563eb,#7c3aed)",
                            borderRadius: "24px",
                            color: "white",
                            p: 5,
                            mb: 4,
                            textAlign: "center",
                            boxShadow: "0 8px 24px rgba(37,99,235,0.3)",
                        }}
                    >
                        <Typography
                            variant="h4"
                            fontWeight={800}
                            sx={{
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundImage:
                                    "linear-gradient(90deg,#f9fafb,#e0e7ff,#f5d0fe)",
                            }}
                        >
                            Phân tích bài luyện Dictation
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, mt: 1.5 }}>
                            Báo cáo chi tiết về độ chính xác, lỗi thường gặp và bài luyện nên học tiếp.
                        </Typography>
                    </Box>

                    <Card
                        sx={{
                            mb: 4,
                            borderRadius: 3,
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        }}
                    >
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Analytics color="primary" />
                                <Typography variant="h6" fontWeight={700} color="primary">
                                    Tổng quan kết quả
                                </Typography>
                            </Box>

                            <Typography
                                variant="body1"
                                color="text.secondary"
                                mb={3}
                                sx={{ lineHeight: 1.6 }}
                            >
                                {overallText}
                            </Typography>

                            <Box display="flex" flexDirection="column" gap={3}>
                                <Box>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <QueryStats color="primary" />
                                        <Typography fontWeight={700} fontSize={16}>
                                            Độ chính xác qua từng câu
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        {sentenceAccuracyInsights.length ? (
                                            sentenceAccuracyInsights.map((item: string, idx: number) => (
                                                <Box
                                                    key={`${item}-${idx}`}
                                                    sx={{
                                                        bgcolor: "rgba(37,99,235,0.08)",
                                                        color: "#1e3a8a",
                                                        px: 1.5,
                                                        py: 0.5,
                                                        borderRadius: "10px",
                                                        fontSize: 14,
                                                        lineHeight: 1.5,
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {item}
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography variant="body2" sx={{ opacity: 0.6 }}>
                                                Chưa có dữ liệu độ chính xác.
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                <Divider sx={{ borderColor: "#e2e8f0" }} />

                                <Box>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <ErrorOutline color="error" />
                                        <Typography fontWeight={700} fontSize={16}>
                                            Từ sai phổ biến
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        {commonMistakeInsights.length ? (
                                            commonMistakeInsights.map((item: string, idx: number) => (
                                                <Box
                                                    key={`${item}-${idx}`}
                                                    sx={{
                                                        bgcolor: "rgba(239,68,68,0.08)",
                                                        color: "#b91c1c",
                                                        px: 1.5,
                                                        py: 0.5,
                                                        borderRadius: "10px",
                                                        fontSize: 14,
                                                        lineHeight: 1.5,
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {item}
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography variant="body2" sx={{ opacity: 0.6 }}>
                                                Không có lỗi đáng kể.
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                <Divider sx={{ borderColor: "#e2e8f0" }} />

                                <Box>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <Hearing color="secondary" />
                                        <Typography fontWeight={700} fontSize={16}>
                                            Từ/cụm dễ nghe thiếu
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        {listeningNotes.length ? (
                                            listeningNotes.map((item: string, idx: number) => (
                                                <Box
                                                    key={`${item}-${idx}`}
                                                    sx={{
                                                        bgcolor: "rgba(147,51,234,0.08)",
                                                        color: "#6d28d9",
                                                        px: 1.5,
                                                        py: 0.5,
                                                        borderRadius: "10px",
                                                        fontSize: 14,
                                                        lineHeight: 1.5,
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {item}
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography variant="body2" sx={{ opacity: 0.6 }}>
                                                Không có nhóm từ cần chú ý đặc biệt.
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Grid container spacing={3} mb={5}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <BarIcon color="primary" />
                                        <Typography fontWeight={700}>
                                            Biểu đồ độ chính xác theo câu
                                        </Typography>
                                    </Box>
                                    <LineChart
                                        height={220}
                                        xAxis={[{ dataKey: "x", label: "Câu số" }]}
                                        yAxis={[{ min: 0, max: 100 }]}
                                        series={[
                                            {
                                                dataKey: "y",
                                                label: "Độ chính xác (%)",
                                                color: "#2563eb",
                                            },
                                        ]}
                                        dataset={accuracyData}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <ErrorOutline color="error" />
                                        <Typography fontWeight={700}>
                                            Từ / cụm sai thường gặp
                                        </Typography>
                                    </Box>
                                    <BarChart
                                        height={220}
                                        xAxis={[{ dataKey: "x", label: "Từ sai" }]}
                                        series={[
                                            {
                                                dataKey: "y",
                                                label: "Tần suất",
                                                color: "#ec4899",
                                            },
                                        ]}
                                        dataset={mistakesData}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <CheckCircleOutline color="success" />
                                        <Typography variant="h6" fontWeight={700}>
                                            Điểm mạnh
                                        </Typography>
                                    </Box>
                                    {renderTextList(strengths, "Chưa có điểm mạnh nổi bật.")}
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <ErrorOutline color="error" />
                                        <Typography variant="h6" fontWeight={700}>
                                            Điểm yếu / lỗi phổ biến
                                        </Typography>
                                    </Box>
                                    {renderTextList(weaknesses, "Chưa có điểm yếu nổi bật.")}
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <TrendingUp color="primary" />
                                        <Typography variant="h6" fontWeight={700}>
                                            Gợi ý cải thiện
                                        </Typography>
                                    </Box>
                                    {renderTextList(tips, "Chưa có gợi ý cải thiện.")}
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <School sx={{ color: "#9333ea" }} />
                                        <Typography variant="h6" fontWeight={700}>
                                            Bài luyện đề xuất
                                        </Typography>
                                    </Box>

                                    {recommendations.length ? (
                                        <Box display="flex" flexDirection="column" gap={1.5}>
                                            {recommendations.map((item) => (
                                                <Card
                                                    key={item.dictationId}
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: 2,
                                                        borderColor: "rgba(147,51,234,0.22)",
                                                        backgroundColor: "rgba(147,51,234,0.04)",
                                                    }}
                                                >
                                                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                                        <Box
                                                            display="flex"
                                                            justifyContent="space-between"
                                                            gap={2}
                                                            alignItems="flex-start"
                                                        >
                                                            <Box minWidth={0}>
                                                                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                                                    <Typography fontWeight={800} color="text.primary">
                                                                        {item.title}
                                                                    </Typography>
                                                                    {formatRecommendationGoal(item.recommendationGoal) ? (
                                                                        <Chip
                                                                            size="small"
                                                                            label={formatRecommendationGoal(item.recommendationGoal)}
                                                                            sx={{
                                                                                height: 22,
                                                                                bgcolor: "rgba(37,99,235,0.08)",
                                                                                color: "#1d4ed8",
                                                                                fontWeight: 700,
                                                                            }}
                                                                        />
                                                                    ) : null}
                                                                </Box>
                                                                <Typography variant="body2" color="text.secondary" mt={0.5}>
                                                                    {[item.level, formatPartType(item.part_type, item.partLabel), item.weight != null ? `Weight ${item.weight}` : null, item.suggestedDifficulty ? `Luyện ở ${item.suggestedDifficulty}` : null]
                                                                        .filter(Boolean)
                                                                        .join(" · ")}
                                                                </Typography>
                                                            </Box>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                onClick={() => handleOpenRecommendation(item)}
                                                                sx={{
                                                                    flexShrink: 0,
                                                                    textTransform: "none",
                                                                    fontWeight: 700,
                                                                    borderRadius: 1.5,
                                                                    background: "linear-gradient(90deg,#2563eb,#7c3aed)",
                                                                }}
                                                            >
                                                                Học tiếp
                                                            </Button>
                                                        </Box>

                                                        {item.tags?.length ? (
                                                            <Stack direction="row" gap={1} flexWrap="wrap" mt={1.25}>
                                                                {item.tags.slice(0, 3).map((tag) => (
                                                                    <Chip
                                                                        key={tag}
                                                                        label={tag}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: "#fff",
                                                                            color: "#6d28d9",
                                                                            fontWeight: 600,
                                                                        }}
                                                                    />
                                                                ))}
                                                            </Stack>
                                                        ) : null}

                                                        <Box component="ul" sx={{ pl: 2.25, mt: 1.25, mb: 0 }}>
                                                            {item.reasons.slice(0, 3).map((reason) => (
                                                                <li key={reason}>
                                                                    <Typography
                                                                        variant="body2"
                                                                        color="text.secondary"
                                                                        sx={{ lineHeight: 1.55 }}
                                                                    >
                                                                        {reason}
                                                                    </Typography>
                                                                </li>
                                                            ))}
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </Box>
                                    ) : legacyRecommendedFocus.length ? (
                                        renderTextList(legacyRecommendedFocus, "Chưa có gợi ý luyện thêm.")
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                            Hiện chưa tìm thấy bài luyện phù hợp. Bạn có thể luyện lại bài hiện tại hoặc chọn bài cùng chủ đề trong danh sách Dictation.
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Box textAlign="center" mt={6}>
                        <Button
                            onClick={onConfirm}
                            variant="contained"
                            startIcon={<AutoAwesome />}
                            sx={{
                                px: 6,
                                py: 1.8,
                                borderRadius: "999px",
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: 16,
                                background: "linear-gradient(90deg,#2563eb,#7c3aed)",
                                boxShadow: "0 6px 16px rgba(37,99,235,0.25)",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                    boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
                                },
                            }}
                        >
                            Xác nhận phân tích xong
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    )
}
