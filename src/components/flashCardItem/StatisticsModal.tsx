import { FC, useMemo } from "react";
import {
    Box,
    Modal,
    Card,
    CardContent,
    Typography,
    IconButton,
    Divider,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Grid,
    CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { BarChart } from "@mui/x-charts/BarChart";

// Log type từ LessonFlashcard
export interface Log {
    vocab_id: string;
    vocab_word: string;
    eval_type: "easy" | "medium" | "hard" | "skip";
    response_time: number;
    attempted_at: string;
}

interface StatisticsModalProps {
    open: boolean;
    onClose: () => void;
    logs: Log[];
}

const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 900,
    maxHeight: "90vh",
    overflowY: "auto",
    bgcolor: "background.paper",
    borderRadius: 3,
    boxShadow: 24,
    p: 3,
};

export const StatisticsModal: FC<StatisticsModalProps> = ({
    open,
    onClose,
    logs,
}) => {
    // gom nhóm theo vocab
    const grouped = useMemo(() => {
        const map: Record<string, { word: string; logs: Log[] }> = {};
        logs.forEach((l) => {
            if (!map[l.vocab_id]) {
                map[l.vocab_id] = { word: l.vocab_word, logs: [] };
            }
            map[l.vocab_id].logs.push(l);
        });
        return map;
    }, [logs]);

    const summary = useMemo(() => {
        let easy = 0,
            medium = 0,
            hard = 0,
            skip = 0,
            total = logs.length,
            durations: number[] = [];
        logs.forEach((l) => {
            if (l.eval_type === "easy") easy++;
            if (l.eval_type === "medium") medium++;
            if (l.eval_type === "hard") hard++;
            if (l.eval_type === "skip") skip++;
            durations.push(l.response_time);
        });
        const avgTime = durations.length
            ? Math.round(
                durations.reduce((a, b) => a + b, 0) / durations.length / 1000
            )
            : 0;
        const accuracy =
            total > 0
                ? Math.round(
                    ((skip * 1 + easy * 0.9 + medium * 0.6 + hard * 0.3) / total) * 100
                )
                : 0;

        return { easy, medium, hard, skip, total, avgTime, accuracy };
    }, [logs]);

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={800}>
                        📊 Thống kê kết quả học
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ my: 2 }} />

                {/* Tổng quan */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                            Tổng quan
                        </Typography>

                        <BarChart
                            height={240}
                            layout="horizontal"
                            series={[
                                {
                                    data: [
                                        summary.easy,
                                        summary.medium,
                                        summary.hard,
                                        summary.skip,
                                    ],
                                    label: "Số lần",
                                    color: "#1976d2",
                                },
                            ]}
                            xAxis={[{ label: "Số lượt" }]}
                            yAxis={[
                                {
                                    data: ["Easy", "Medium", "Hard", "Skip"],
                                    scaleType: "band",
                                },
                            ]}
                            margin={{ left: 80 }}
                        />

                        {/* Metrics nổi bật */}
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid size={{ xs: 6 }}>
                                <Card
                                    variant="outlined"
                                    sx={{ textAlign: "center", py: 3, height: "100%" }}
                                >
                                    <Typography variant="overline" color="text.secondary">
                                        ⏱️ Thời gian trung bình
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        fontWeight={800}
                                        color="primary"
                                        sx={{ mt: 1 }}
                                    >
                                        {summary.avgTime}s
                                    </Typography>
                                </Card>
                            </Grid>

                            <Grid size={{ xs: 6 }}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        textAlign: "center",
                                        py: 3,
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Typography variant="overline" color="text.secondary">
                                        🎯 Accuracy
                                    </Typography>
                                    <Box
                                        position="relative"
                                        display="inline-flex"
                                        justifyContent="center"
                                        alignItems="center"
                                        sx={{ mt: 2 }}
                                    >
                                        <CircularProgress
                                            variant="determinate"
                                            value={summary.accuracy}
                                            size={80}
                                            thickness={5}
                                            color={
                                                summary.accuracy >= 80
                                                    ? "success"
                                                    : summary.accuracy >= 50
                                                        ? "warning"
                                                        : "error"
                                            }
                                        />
                                        <Box
                                            sx={{
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                right: 0,
                                                position: "absolute",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography variant="h6" fontWeight={700}>
                                                {summary.accuracy}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Chi tiết từng từ */}
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                            Chi tiết từng từ
                        </Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Từ</TableCell>
                                    <TableCell align="center">Easy</TableCell>
                                    <TableCell align="center">Medium</TableCell>
                                    <TableCell align="center">Hard</TableCell>
                                    <TableCell align="center">Skip</TableCell>
                                    <TableCell align="center">Lượt</TableCell>
                                    <TableCell align="center">⏱️ TB (s)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(grouped).map(([id, { word, logs: arr }]) => {
                                    const easy = arr.filter((l) => l.eval_type === "easy").length;
                                    const medium = arr.filter((l) => l.eval_type === "medium")
                                        .length;
                                    const hard = arr.filter((l) => l.eval_type === "hard").length;
                                    const skip = arr.filter((l) => l.eval_type === "skip").length;
                                    const avgTime = arr.length
                                        ? Math.round(
                                            arr.reduce((a, b) => a + b.response_time, 0) /
                                            arr.length /
                                            1000
                                        )
                                        : 0;
                                    return (
                                        <TableRow key={id}>
                                            <TableCell>{word}</TableCell>
                                            <TableCell align="center">{easy}</TableCell>
                                            <TableCell align="center">{medium}</TableCell>
                                            <TableCell align="center">{hard}</TableCell>
                                            <TableCell align="center">{skip}</TableCell>
                                            <TableCell align="center">{arr.length}</TableCell>
                                            <TableCell align="center">{avgTime}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </Box>
        </Modal>
    );
};
