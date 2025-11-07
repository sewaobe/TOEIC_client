import {
    Box,
    Typography,
    Stack,
    Button,
    Tabs,
    Tab,
    TextField,
    Divider,
    Paper,
    Snackbar,
    Alert,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Chip,
} from "@mui/material";
import { useState } from "react";
import DiamondIcon from "@mui/icons-material/Diamond";
import HistoryIcon from "@mui/icons-material/History";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { motion } from "framer-motion";
import MainLayout from "../layouts/MainLayout";

export default function CreditPage() {
    const [tab, setTab] = useState(0);
    const [balance, setBalance] = useState(120);
    const [customValue, setCustomValue] = useState("");
    const [snack, setSnack] = useState(false);

    const quickOptions = [20000, 50000, 100000];
    const ratio = 100;

    const [transactions, setTransactions] = useState([
        {
            id: 1,
            method: "Momo",
            type: "topup",
            amount: 50,
            createdAt: new Date("2025-11-01T10:30"),
            status: "Thành công",
        },
        {
            id: 2,
            method: "VNPay",
            type: "topup",
            amount: 100,
            createdAt: new Date("2025-11-02T14:12"),
            status: "Thành công",
        },
        {
            id: 3,
            method: "AI Usage",
            type: "spend",
            amount: -5,
            createdAt: new Date("2025-11-03T19:25"),
            status: "Đã trừ Credit",
        },
    ]);

    const handleTopup = (amount: number) => {
        const credits = Math.floor(amount / ratio);
        setBalance((prev) => prev + credits);
        setTransactions((prev) => [
            {
                id: Date.now(),
                method: "Momo",
                type: "topup",
                amount: credits,
                createdAt: new Date(),
                status: "Thành công",
            },
            ...prev,
        ]);
        setSnack(true);
        setCustomValue("");
    };

    return (
        <MainLayout>
            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: "auto" }}>
                {/* HEADER */}
                <Stack alignItems="center" spacing={1} mb={4}>
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <DiamondIcon sx={{ fontSize: 52, color: "#7F00FF" }} />
                    </motion.div>

                    <Typography
                        variant="h4"
                        fontWeight={800}
                        textAlign="center"
                        sx={{
                            background: "linear-gradient(90deg,#7F00FF,#00D4FF)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Ví Credit TOEIC Smart
                    </Typography>

                    <Typography
                        textAlign="center"
                        color="text.secondary"
                        maxWidth={640}
                        sx={{ lineHeight: 1.7 }}
                    >
                        Dùng Credit để truy cập các tính năng AI thông minh:{" "}
                        <b>giải thích đáp án, gợi ý lộ trình học,</b> và{" "}
                        <b>phân tích kỹ năng cá nhân.</b>
                    </Typography>
                </Stack>

                {/* TAB */}
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    centered
                    sx={{
                        mb: 3,
                        "& .MuiTab-root": { fontWeight: 600, textTransform: "none" },
                    }}
                >
                    <Tab icon={<AccountBalanceWalletIcon />} iconPosition="start" label="Nạp Credit" />
                    <Tab icon={<HistoryIcon />} iconPosition="start" label="Lịch sử giao dịch" />
                </Tabs>

                {/* TAB 1: Nạp Credit */}
                {tab === 0 && (
                    <Stack spacing={3}>
                        <Paper
                            elevation={2}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                textAlign: "center",
                                background: "linear-gradient(135deg, #EEF2FF, #E0F7FA)",
                            }}
                        >
                            <Typography fontWeight={700} fontSize={18}>
                                Số dư hiện tại
                            </Typography>
                            <Typography fontWeight={800} fontSize={36} color="primary.main">
                                {balance} Credit
                            </Typography>
                            <Typography color="text.secondary" fontSize={13}>
                                (100₫ = 1 Credit)
                            </Typography>
                        </Paper>

                        <Stack direction="row" spacing={2} flexWrap="wrap">
                            {quickOptions.map((v) => (
                                <Button
                                    key={v}
                                    onClick={() => handleTopup(v)}
                                    variant="outlined"
                                    sx={{
                                        flex: 1,
                                        borderRadius: 2,
                                        borderColor: "#7F00FF",
                                        color: "#7F00FF",
                                        fontWeight: 700,
                                        "&:hover": {
                                            background: "linear-gradient(90deg,#7F00FF,#00D4FF)",
                                            color: "white",
                                        },
                                    }}
                                >
                                    {v.toLocaleString("vi-VN")}₫
                                </Button>
                            ))}
                        </Stack>

                        <Stack direction="row" spacing={2} alignItems="center">
                            <TextField
                                label="Nhập số tiền (VNĐ)"
                                type="number"
                                fullWidth
                                value={customValue}
                                onChange={(e) => setCustomValue(e.target.value)}
                            />
                            <Button
                                variant="contained"
                                onClick={() => handleTopup(Number(customValue))}
                                disabled={!customValue || Number(customValue) <= 0}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 700,
                                }}
                            >
                                Nạp ngay
                            </Button>
                        </Stack>

                        <Divider sx={{ my: 3 }} />

                        <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: "#F8FAFC" }}>
                            <Stack direction="row" spacing={2}>
                                <InfoOutlinedIcon color="primary" />
                                <Box>
                                    <Typography fontWeight={700}>Vì sao cần mua Credit?</Typography>
                                    <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                        Credit là “năng lượng AI” giúp bạn:
                                        <br />• Gợi ý lộ trình học cá nhân hóa
                                        <br />• Giải thích chi tiết đáp án và ngữ pháp
                                        <br />• Phân tích điểm mạnh – yếu kỹ năng
                                        <br />
                                        Hệ thống chỉ trừ Credit khi bạn dùng tính năng AI, đảm bảo công bằng & hiệu quả.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Stack>
                )}

                {/* TAB 2: Lịch sử giao dịch */}
                {tab === 1 && (
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        {transactions.length === 0 ? (
                            <Typography color="text.secondary" textAlign="center" mt={4}>
                                Chưa có giao dịch nào.
                            </Typography>
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Mã GD</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Phương thức</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Loại</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Số Credit</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell>{tx.id}</TableCell>
                                            <TableCell>{tx.method}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={tx.type === "topup" ? "Nạp" : "Tiêu"}
                                                    color={tx.type === "topup" ? "success" : "error"}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    fontWeight={700}
                                                    color={tx.amount > 0 ? "success.main" : "error.main"}
                                                >
                                                    {tx.amount > 0 ? "+" : ""}
                                                    {tx.amount} Cr
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={tx.status}
                                                    color={tx.status === "Thành công" ? "success" : "default"}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>{tx.createdAt.toLocaleString("vi-VN")}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Paper>
                )}

                <Snackbar
                    open={snack}
                    autoHideDuration={2500}
                    onClose={() => setSnack(false)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert
                        onClose={() => setSnack(false)}
                        severity="success"
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                    >
                        🎉 Nạp Credit thành công!
                    </Alert>
                </Snackbar>
            </Box>
        </MainLayout>
    );
}
