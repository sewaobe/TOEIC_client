import { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Card,
    CardHeader,
    CardContent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    CircularProgress,
    Skeleton,
} from "@mui/material";
import {
    FilterList,
    TrendingUp,
    LibraryBooks,
    AccessTime,
    LocalFireDepartment,
} from "@mui/icons-material";
import MainLayout from "../layouts/MainLayout";
import SharpGradientCard from "../../components/cards/SharpGradientCard";
import ScoreTrendChart from "../../components/result-statictis/ScoreTrendChart";
import AccuracyComparisonChart from "../../components/result-statictis/AccuracyComparisonChart";
import PracticeSkillPanel from "../../components/result-statictis/PracticeSkillPanel";
import TestHistoryTable from "../../components/result-statictis/TestHistoryTable";
import ScoreHeaderCard from "../../components/result-statictis/ScoreHeaderCard";

// ---------------- MOCK DATA ----------------
const overview = { overall: 835, listening: 430, reading: 405, delta: 80, progress: 83.5 };

const stats = [
    {
        label: "Listening",
        value: "430 / 495",
        icon: <TrendingUp sx={{ color: "#FDE68A" }} />,
        colors: ["#7C3AED", "#A855F7", "#EC4899"],
        trend: "up",
        trendValue: "+5%",
    },
    {
        label: "Reading",
        value: "405 / 495",
        icon: <LibraryBooks sx={{ color: "#BFDBFE" }} />,
        colors: ["#3B82F6", "#6366F1", "#8B5CF6"],
        trend: "down",
        trendValue: "-2%",
    },
    {
        label: "Giờ học",
        value: "120+",
        icon: <AccessTime sx={{ color: "#FEF3C7" }} />,
        colors: ["#F59E0B", "#F97316", "#F43F5E"],
        trend: "up",
        trendValue: "+12%",
    },
    {
        label: "Chuỗi học",
        value: "15 ngày",
        icon: <LocalFireDepartment sx={{ color: "#FECACA" }} />,
        colors: ["#EF4444", "#DC2626", "#FB7185"],
        trend: "up",
        trendValue: "+1 ngày",
    },
];

const scoreTrend = [
    { month: "T1", listening: 350, reading: 330 },
    { month: "T2", listening: 370, reading: 345 },
    { month: "T3", listening: 390, reading: 365 },
    { month: "T4", listening: 410, reading: 385 },
    { month: "T5", listening: 430, reading: 405 },
];

const listeningParts = [
    { part: "Part 1", accuracy: 0.95 },
    { part: "Part 2", accuracy: 0.78 },
    { part: "Part 3", accuracy: 0.62 },
    { part: "Part 4", accuracy: 0.69 },
];

const readingParts = [
    { part: "Part 5", accuracy: 0.74 },
    { part: "Part 6", accuracy: 0.66 },
    { part: "Part 7", accuracy: 0.58 },
];

const testHistory = [
    { date: "2024-05-15", total: 835, listening: 430, reading: 405, delta: "+40" },
    { date: "2024-04-10", total: 795, listening: 410, reading: 385, delta: "+40" },
    { date: "2024-03-05", total: 755, listening: 390, reading: 365, delta: "+30" },
];

const recommendations = [
    { title: "Cải thiện Part 3", desc: "Độ chính xác 62% - hội thoại dài", action: "Luyện ngay" },
    { title: "Ôn Part 7 Reading", desc: "Độ chính xác 58% - đọc nhanh", action: "Bắt đầu" },
    { title: "Từ vựng Workplace", desc: "Độ chính xác 65% - ôn 60 từ", action: "Ôn flashcards" },
];

// ---------------- COMPONENT ----------------
export default function ResultStatisticPage() {
    const [filterTime, setFilterTime] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    // ---------------- LOGIC FILTER ----------------

    const filteredScoreTrend = (() => {
        let filtered = [...scoreTrend];

        if (filterTime === "month") filtered = scoreTrend.slice(-1);
        else if (filterTime === "3months") filtered = scoreTrend.slice(-3);
        else if (filterTime === "6months") filtered = scoreTrend.slice(-5);

        if (filterType === "listening") {
            return filtered.map(({ month, listening }) => ({ month, listening }));
        } else if (filterType === "reading") {
            return filtered.map(({ month, reading }) => ({ month, reading }));
        }

        return filtered;
    })();

    const filteredListeningParts =
        filterType === "reading" ? [] : listeningParts;
    const filteredReadingParts =
        filterType === "listening" ? [] : readingParts;

    const filteredTestHistory = (() => {
        let filtered = [...testHistory];

        if (filterTime === "month") filtered = testHistory.slice(0, 1);
        else if (filterTime === "3months") filtered = testHistory.slice(0, 3);
        else if (filterTime === "6months") filtered = testHistory.slice(0, 5);

        if (filterType === "listening")
            filtered = filtered.map((t) => ({
                date: t.date,
                total: t.listening,
                listening: t.listening,
                reading: 0,
                delta: t.delta,
            }));
        else if (filterType === "reading")
            filtered = filtered.map((t) => ({
                date: t.date,
                total: t.reading,
                listening: 0,
                reading: t.reading,
                delta: t.delta,
            }));

        return filtered;
    })();

    const filteredStats =
        filterType === "listening"
            ? stats.filter((s) => s.label === "Listening" || s.label === "Giờ học")
            : filterType === "reading"
                ? stats.filter((s) => s.label === "Reading" || s.label === "Giờ học")
                : stats;

    // ---------------- RENDER ----------------
    return (
        <MainLayout>
            <Box sx={{ p: 4 }}>
                {/* Header */}
                {isLoading ? (
                    <Skeleton variant="rounded" height={180} sx={{ borderRadius: 4, mb: 4 }} />
                ) : (
                    <ScoreHeaderCard overview={overview} />
                )}

                {/* Filter */}
                {isLoading ? (
                    <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3, mb: 4 }} />
                ) : (
                    <Card sx={{ borderRadius: 3, p: 2, mb: 4 }}>
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            flexWrap="wrap"
                            gap={2}
                        >
                            <Box display="flex" alignItems="center" gap={1}>
                                <FilterList />
                                <Typography variant="h6" fontWeight={700}>
                                    Bộ lọc kết quả
                                </Typography>
                            </Box>

                            <Box display="flex" gap={2}>
                                <FormControl size="small">
                                    <InputLabel>Thời gian</InputLabel>
                                    <Select
                                        value={filterTime}
                                        onChange={(e) => setFilterTime(e.target.value)}
                                        label="Thời gian"
                                    >
                                        <MenuItem value="all">Tất cả</MenuItem>
                                        <MenuItem value="month">Tháng này</MenuItem>
                                        <MenuItem value="3months">3 tháng</MenuItem>
                                        <MenuItem value="6months">6 tháng</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small">
                                    <InputLabel>Loại bài</InputLabel>
                                    <Select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        label="Loại bài"
                                    >
                                        <MenuItem value="all">Tất cả</MenuItem>
                                        <MenuItem value="full">Đề đầy đủ</MenuItem>
                                        <MenuItem value="listening">Listening</MenuItem>
                                        <MenuItem value="reading">Reading</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>
                    </Card>
                )}

                {/* Stat Cards */}
                <Box sx={{ display: "flex", gap: 2, pb: 1.5, mb: 2 }}>
                    {isLoading
                        ? [...Array(4)].map((_, i) => (
                            <Skeleton
                                key={i}
                                variant="rounded"
                                width={280}
                                height={120}
                                sx={{ borderRadius: 3 }}
                            />
                        ))
                        : filteredStats.map((s, i) => (
                            <Box
                                key={i}
                                sx={{
                                    flex: "0 0 auto",
                                    minWidth: 280,
                                }}
                            >
                                <SharpGradientCard
                                    icon={s.icon}
                                    title={s.label}
                                    description={s.value}
                                    colors={s.colors as any}
                                    height={120}
                                    trend={s.trend as any}
                                    trendValue={s.trendValue}
                                />
                            </Box>
                        ))}
                </Box>

                {/* Charts */}
                <Grid container spacing={2} alignItems="stretch">
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex" }}>
                        {isLoading ? (
                            <Skeleton
                                variant="rounded"
                                height={300}
                                sx={{ borderRadius: 3, width: "100%" }}
                            />
                        ) : (
                            <Card sx={{ borderRadius: 3, p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                                <CardHeader
                                    titleTypographyProps={{
                                        fontSize: "1.05rem",
                                        fontWeight: 700,
                                        color: "text.primary",
                                    }}
                                    subheaderTypographyProps={{
                                        fontSize: "0.875rem",
                                        color: "text.secondary",
                                        sx: { mt: 0.25 },
                                    }}
                                    title="Xu hướng điểm"
                                    subheader="Listening vs Reading (5 tháng)"
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <ScoreTrendChart data={filteredScoreTrend as any} />
                                </CardContent>
                            </Card>
                        )}
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex" }}>
                        {isLoading ? (
                            <Skeleton
                                variant="rounded"
                                height={300}
                                sx={{ borderRadius: 3, width: "100%" }}
                            />
                        ) : (
                            <Card sx={{ borderRadius: 3, p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                                <CardHeader
                                    titleTypographyProps={{
                                        fontSize: "1.05rem",
                                        fontWeight: 700,
                                        color: "text.primary",
                                    }}
                                    subheaderTypographyProps={{
                                        fontSize: "0.875rem",
                                        color: "text.secondary",
                                        sx: { mt: 0.25 },
                                    }}
                                    title={
                                        filterType === "reading"
                                            ? "Reading Accuracy"
                                            : filterType === "listening"
                                                ? "Listening Accuracy"
                                                : "Độ chính xác từng Part"
                                    }
                                    subheader="So sánh Listening & Reading"
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <AccuracyComparisonChart
                                        listeningData={filteredListeningParts}
                                        readingData={filteredReadingParts}
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </Grid>
                </Grid>

                {/* Table */}
                <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                    {isLoading ? (
                        <Skeleton
                            variant="rounded"
                            height={320}
                            sx={{ borderRadius: 3, width: "100%" }}
                        />
                    ) : (
                        <Card sx={{ flex: 1, width: "100%", borderRadius: 3 }}>
                            <CardHeader
                                titleTypographyProps={{
                                    fontSize: "1.05rem",
                                    fontWeight: 700,
                                    color: "text.primary",
                                }}
                                subheaderTypographyProps={{
                                    fontSize: "0.875rem",
                                    color: "text.secondary",
                                    sx: { mt: 0.25 },
                                }}
                                title="Lịch sử bài thi"
                                subheader="Các lần thi gần đây"
                            />
                            <CardContent>
                                <TestHistoryTable data={filteredTestHistory} />
                            </CardContent>
                        </Card>
                    )}
                </Box>

                {/* Practice Skill Section */}
                <Box sx={{ mt: 4 }}>
                    {isLoading ? (
                        <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3 }} />
                    ) : (
                        <Card sx={{ borderRadius: 3 }}>
                            <CardHeader
                                titleTypographyProps={{
                                    fontSize: "1.05rem",
                                    fontWeight: 700,
                                    color: "text.primary",
                                }}
                                subheaderTypographyProps={{
                                    fontSize: "0.875rem",
                                    color: "text.secondary",
                                    sx: { mt: 0.25 },
                                }}
                                title="Ôn luyện kỹ năng"
                                subheader="Theo dõi tiến độ từng kỹ năng và tiếp tục luyện tập"
                            />
                            <CardContent>
                                <PracticeSkillPanel />
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </Box>
        </MainLayout>
    );
}
