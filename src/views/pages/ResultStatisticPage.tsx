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
import TestHistoryTable, { TestHistory } from "../../components/result-statictis/TestHistoryTable";
import ScoreHeaderCard from "../../components/result-statictis/ScoreHeaderCard";
import { OverviewStatistic, progressService } from "../../services/progress.service";

/* ---------------- COMPONENT ---------------- */
export default function ResultStatisticPage() {
    const [overview, setOverview] = useState<OverviewStatistic[]>([]);
    const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
    const [scoreTrend, setScoreTrend] = useState<{ month: string; listening: number; reading: number }[]>([]);
    const [partAccuracy, setPartAccuracy] = useState<{
        listeningData: { part: string; accuracy: number }[];
        readingData: { part: string; accuracy: number }[];
    }>({ listeningData: [], readingData: [] });
    
    const now = new Date();
    const [filterYear, setFilterYear] = useState<number>(now.getFullYear());
    const [filterMonth, setFilterMonth] = useState<number | "all">(now.getMonth() + 1);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDataOverview = async () => {
        setIsLoading(true);
        try {
            const res = await progressService.getOverviewStatistic();
            setOverview(res);
            
            // 🎯 Transform data cho ScoreTrendChart
            // Lọc từ tháng 1 đến tháng hiện tại (filterMonth)
            const currentMonth = filterMonth === "all" ? 12 : Number(filterMonth);
            const trendData = [];
            
            for (let m = 1; m <= currentMonth; m++) {
                const monthData = res.find(r => r.year === filterYear && r.month === m);
                trendData.push({
                    month: `T${m}`,
                    listening: monthData?.avgListening || 0,
                    reading: monthData?.avgReading || 0
                });
            }
            
            setScoreTrend(trendData);
            console.log("Fetched result statistics:", res);
            console.log("Score trend data:", trendData);
        } catch (err) {
            console.error("Error fetching result statistics:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDataTestHistory = async () => {
        setIsLoading(true);
        try {
            const res = await progressService.getUserTestStatistics(filterYear, filterMonth);
            if (!res?.data) return;

            // 🧮 Convert dữ liệu từ backend sang định dạng FE mong muốn
            const converted: TestHistory[] = res.data.map((t: any, i: number, arr: any[]) => {
                // Tính delta dựa trên bài test trước đó
                const prev = arr[i - 1]?.total ?? t.total;
                const diff = t.total - prev;
                const delta = diff === 0 ? "+0" : diff > 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`;

                // Vì listening/reading backend trả ~4000 thay vì 400
                const normalize = (val: number) =>
                    val && val > 1000 ? Number((val / 10).toFixed(1)) : Number(val?.toFixed?.(1) || 0);

                return {
                    date: t.date,
                    total: Number(t.total.toFixed(1)),
                    listening: normalize(t.listening),
                    reading: normalize(t.reading),
                    delta,
                };
            });

            setTestHistory(converted);
            console.log("✅ Converted test history:", converted);
        } catch (err) {
            console.error("Error fetching test history:", err);
        } finally {
            setIsLoading(false);
        }
    };


    const fetchPartAccuracy = async () => {
        setIsLoading(true);
        try {
            const res = await progressService.getPartAccuracyStats(filterYear, filterMonth);
            setPartAccuracy(res);
            console.log("Part accuracy stats:", res);
        } catch (err) {
            console.error("Error fetching part accuracy:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDataTestHistory();
        fetchPartAccuracy();
    }, [filterYear, filterMonth]);

    useEffect(() => {
        fetchDataOverview();
    }, [filterYear, filterMonth]);

    // 🎯 Tính toán stats cards từ overview
    const getStatsCards = () => {
        // Lọc dữ liệu theo filterMonth
        let filteredData = overview;
        
        if (filterMonth !== "all") {
            filteredData = overview.filter(o => o.month === filterMonth && o.year === filterYear);
        } else {
            filteredData = overview.filter(o => o.year === filterYear);
        }

        // Tính điểm trung bình Listening và Reading
        const avgListening = filteredData.length > 0
            ? Math.round(filteredData.reduce((sum, o) => sum + o.avgListening, 0) / filteredData.length)
            : 0;
        
        const avgReading = filteredData.length > 0
            ? Math.round(filteredData.reduce((sum, o) => sum + o.avgReading, 0) / filteredData.length)
            : 0;

        // Tính trend (so với kỳ trước)
        const getPrevPeriod = () => {
            if (filterMonth === "all") {
                return overview.filter(o => o.year === filterYear - 1);
            } else {
                const prevMonth = filterMonth === 1 ? 12 : (filterMonth as number) - 1;
                const prevYear = filterMonth === 1 ? filterYear - 1 : filterYear;
                return overview.filter(o => o.month === prevMonth && o.year === prevYear);
            }
        };

        const prevData = getPrevPeriod();
        const prevAvgListening = prevData.length > 0
            ? Math.round(prevData.reduce((sum, o) => sum + o.avgListening, 0) / prevData.length)
            : avgListening;
        
        const prevAvgReading = prevData.length > 0
            ? Math.round(prevData.reduce((sum, o) => sum + o.avgReading, 0) / prevData.length)
            : avgReading;

        const listeningDiff = avgListening - prevAvgListening;
        const readingDiff = avgReading - prevAvgReading;

        return [
            {
                label: "Listening",
                value: `${avgListening} / 495`,
                icon: <TrendingUp sx={{ color: "#FDE68A" }} />,
                colors: ["#7C3AED", "#A855F7", "#EC4899"] as [string, string, string],
                trend: listeningDiff >= 0 ? "up" as const : "down" as const,
                trendValue: listeningDiff >= 0 ? `+${listeningDiff}` : `${listeningDiff}`,
            },
            {
                label: "Reading",
                value: `${avgReading} / 495`,
                icon: <LibraryBooks sx={{ color: "#BFDBFE" }} />,
                colors: ["#3B82F6", "#6366F1", "#8B5CF6"] as [string, string, string],
                trend: readingDiff >= 0 ? "up" as const : "down" as const,
                trendValue: readingDiff >= 0 ? `+${readingDiff}` : `${readingDiff}`,
            },
            {
                label: "Giờ học",
                value: "120+",
                icon: <AccessTime sx={{ color: "#FEF3C7" }} />,
                colors: ["#F59E0B", "#F97316", "#F43F5E"] as [string, string, string],
                trend: "up" as const,
                trendValue: "+12%",
            },
            {
                label: "Chuỗi học",
                value: "15 ngày",
                icon: <LocalFireDepartment sx={{ color: "#FECACA" }} />,
                colors: ["#EF4444", "#DC2626", "#FB7185"] as [string, string, string],
                trend: "up" as const,
                trendValue: "+1 ngày",
            },
        ];
    };

    const stats = getStatsCards();

    // ---------------- RENDER ----------------
    return (
        <MainLayout>
            <Box sx={{ p: 4 }}>
                {/* ===== BỘ LỌC CHÍNH ===== */}
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
                                Bộ lọc thống kê
                            </Typography>
                        </Box>

                        <Box display="flex" gap={2}>
                            <FormControl size="small">
                                <InputLabel>Năm</InputLabel>
                                <Select
                                    value={filterYear}
                                    onChange={(e) => {
                                        setIsLoading(true);
                                        setFilterYear(Number(e.target.value));
                                        setTimeout(() => setIsLoading(false), 300);
                                    }}
                                    label="Năm"
                                >
                                    {[2023, 2024, 2025].map((y) => (
                                        <MenuItem key={y} value={y}>
                                            {y}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small">
                                <InputLabel>Tháng</InputLabel>
                                <Select
                                    value={filterMonth}
                                    onChange={(e) => {
                                        setIsLoading(true);
                                        setFilterMonth(e.target.value as any);
                                        setTimeout(() => setIsLoading(false), 300);
                                    }}
                                    label="Tháng"
                                >
                                    <MenuItem value="all">Cả năm</MenuItem>
                                    {[...Array(12)].map((_, i) => (
                                        <MenuItem key={i + 1} value={i + 1}>
                                            Tháng {i + 1}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </Card>

                {/* ===== HEADER: TỔNG QUAN ===== */}
                {isLoading ? (
                    <Skeleton variant="rounded" height={180} sx={{ borderRadius: 4, mb: 4 }} />
                ) : (
                    <ScoreHeaderCard overview={overview} filterYear={filterYear} filterMonth={filterMonth} />
                )}

                {/* ===== THẺ THỐNG KÊ NHỎ ===== */}
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
                        : stats.map((s, i) => (
                            <Box key={i} sx={{ flex: "0 0 auto", minWidth: 280 }}>
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

                {/* ===== LỊCH SỬ BÀI THI ===== */}
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
                                subheader={
                                    filterMonth === "all"
                                        ? `Các bài thi trong năm ${filterYear}`
                                        : `Các bài thi trong tháng ${filterMonth}/${filterYear}`
                                }
                            />
                            <CardContent>
                                <TestHistoryTable data={testHistory} />
                            </CardContent>
                        </Card>
                    )}
                </Box>

                {/* ===== ÔN LUYỆN KỸ NĂNG ===== */}
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
                                subheader={`Theo dõi tiến độ ${filterMonth === "all" ? "cả năm" : `tháng ${filterMonth}`} `}
                            />
                            <CardContent>
                                <PracticeSkillPanel filterYear={filterYear} filterMonth={filterMonth} />
                            </CardContent>
                        </Card>
                    )}
                </Box>

                {/* ===== BIỂU ĐỒ ===== */}
                <Grid container spacing={2} alignItems="stretch" sx={{ mt: 4 }}>
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex" }}>
                        {isLoading ? (
                            <Skeleton
                                variant="rounded"
                                height={300}
                                sx={{ borderRadius: 3, width: "100%" }}
                            />
                        ) : (
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    p: 2,
                                    flexGrow: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
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
                                    subheader={`Năm ${filterYear}`}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <ScoreTrendChart data={scoreTrend} />
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
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    p: 2,
                                    flexGrow: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
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
                                    title="Độ chính xác từng Part"
                                    subheader={
                                        filterMonth === "all"
                                            ? `Năm ${filterYear}`
                                            : `Tháng ${filterMonth}/${filterYear}`
                                    }
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <AccuracyComparisonChart
                                        listeningData={partAccuracy.listeningData}
                                        readingData={partAccuracy.readingData}
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </Grid>
                </Grid>
            </Box>
        </MainLayout>
    );
}
