import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Divider,
    Card,
    CardContent,
    Grid,
} from "@mui/material"
import { motion } from "framer-motion"
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

interface DictationAIAnalysisProps {
    loading?: boolean
    analysis?: any
    onConfirm: () => void
}

export default function DictationAIAnalysis({
    loading,
    analysis,
    onConfirm,
}: DictationAIAnalysisProps) {
    const accuracyData =
        analysis?.chart_insights?.accuracy_over_time?.map(
            (item: any, idx: number) => ({
                x: idx + 1,
                y: parseFloat(item.replace("%", "")) || 0,
            })
        ) || []

    const mistakesData =
        analysis?.chart_insights?.common_mistakes?.map(
            (item: string, idx: number) => ({
                x: item,
                y: Math.floor(Math.random() * 5) + 1, // demo
            })
        ) || []

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
                    {/* ===== Header (Gradient Hero) ===== */}
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
                            Báo cáo chi tiết từ AI về độ chính xác, lỗi chính tả và khả năng
                            nghe hiểu của bạn.
                        </Typography>
                    </Box>

                    {/* ===== Tổng quan kết quả ===== */}
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
                                {analysis?.summary}
                            </Typography>

                            <Box display="flex" flexDirection="column" gap={3}>
                                {/* --- Độ chính xác --- */}
                                <Box>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                        mb={1}
                                    >
                                        <QueryStats color="primary" />
                                        <Typography fontWeight={700} fontSize={16}>
                                            Độ chính xác qua từng câu
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 1,
                                        }}
                                    >
                                        {analysis?.chart_insights?.accuracy_over_time?.length ? (
                                            analysis.chart_insights.accuracy_over_time.map(
                                                (a: string, i: number) => (
                                                    <Box
                                                        key={i}
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
                                                        {`Câu ${i + 1}: ${a}`}
                                                    </Box>
                                                )
                                            )
                                        ) : (
                                            <Typography variant="body2" sx={{ opacity: 0.6 }}>
                                                Chưa có dữ liệu độ chính xác.
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                <Divider sx={{ borderColor: "#e2e8f0" }} />

                                {/* --- Từ sai phổ biến --- */}
                                <Box>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <ErrorOutline color="error" />
                                        <Typography fontWeight={700} fontSize={16}>
                                            Từ sai phổ biến
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 1,
                                        }}
                                    >
                                        {analysis?.chart_insights?.common_mistakes?.length ? (
                                            analysis.chart_insights.common_mistakes.map(
                                                (m: string, i: number) => (
                                                    <Box
                                                        key={i}
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
                                                        {m}
                                                    </Box>
                                                )
                                            )
                                        ) : (
                                            <Typography variant="body2" sx={{ opacity: 0.6 }}>
                                                Không có lỗi đáng kể 🎉
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                <Divider sx={{ borderColor: "#e2e8f0" }} />

                                {/* --- Âm cần chú ý --- */}
                                <Box>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <Hearing color="secondary" />
                                        <Typography fontWeight={700} fontSize={16}>
                                            Âm cần chú ý
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 1,
                                        }}
                                    >
                                        {analysis?.chart_insights?.pronunciation_patterns?.length ? (
                                            analysis.chart_insights.pronunciation_patterns.map(
                                                (p: string, i: number) => (
                                                    <Box
                                                        key={i}
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
                                                        {p}
                                                    </Box>
                                                )
                                            )
                                        ) : (
                                            <Typography variant="body2" sx={{ opacity: 0.6 }}>
                                                Không có âm cần chú ý đặc biệt.
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* ===== Biểu đồ trực quan ===== */}
                    <Grid container spacing={3} mb={5}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                        mb={1}
                                    >
                                        <BarIcon color="primary" />
                                        <Typography fontWeight={700}>
                                            Biểu đồ độ chính xác theo thời gian
                                        </Typography>
                                    </Box>
                                    <LineChart
                                        height={220}
                                        xAxis={[{ dataKey: "x", label: "Câu số" }]}
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
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                        mb={1}
                                    >
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

                    {/* ===== 4 khu vực đánh giá chi tiết ===== */}
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
                                    <ul>
                                        {analysis?.strengths?.map((s: string, i: number) => (
                                            <li key={i}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ lineHeight: 1.6 }}
                                                >
                                                    {s}
                                                </Typography>
                                            </li>
                                        ))}
                                    </ul>
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
                                    <ul>
                                        {analysis?.weaknesses?.map((w: string, i: number) => (
                                            <li key={i}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ lineHeight: 1.6 }}
                                                >
                                                    {w}
                                                </Typography>
                                            </li>
                                        ))}
                                    </ul>
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
                                    <ul>
                                        {analysis?.improvement_tips?.map((t: string, i: number) => (
                                            <li key={i}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ lineHeight: 1.6 }}
                                                >
                                                    {t}
                                                </Typography>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <School sx={{ color: "#9333ea" }} />
                                        <Typography variant="h6" fontWeight={700}>
                                            Nên luyện thêm
                                        </Typography>
                                    </Box>
                                    <ul>
                                        {analysis?.recommended_focus?.map(
                                            (f: string, i: number) => (
                                                <li key={i}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ lineHeight: 1.6 }}
                                                    >
                                                        {f}
                                                    </Typography>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* ===== Nút xác nhận ===== */}
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
