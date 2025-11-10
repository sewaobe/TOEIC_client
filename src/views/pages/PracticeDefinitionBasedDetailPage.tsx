import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Stack,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import { motion } from "framer-motion";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { EmptyState } from "../../components/common/EmptyState";
import { usePracticeDefinitionBasedDetailVM } from "../../viewmodels/PracticeDefinitionBasedDetail/usePracticeDefinitionBasedDetailVM";
import PracticeLayout from "../layouts/PracticeLayout";
import { HeaderBanner } from "../../components/practices/HeaderBanner";

const PracticeDefinitionBasedDetailPage = () => {
    const { vm } = usePracticeDefinitionBasedDetailVM();

    if (vm.loading) return <EmptyState mode="loading" />;

    const vocab = vm.getCurrentVocabulary();
    if (!vocab)
        return (
            <EmptyState
                mode="empty"
                title="Không có từ vựng nào."
                description="Vui lòng thử lại sau."
            />
        );

    return (
        <PracticeLayout>
            <Box
                sx={{
                    px: { xs: 2, md: 4 },
                    py: 4,
                    background: "linear-gradient(180deg, #f8fbff 0%, #f0f4ff 100%)",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    fontFamily: "'Inter', sans-serif",
                }}
            >
                {/* ===== Header Banner (Pro) ===== */}
                <HeaderBanner
                    title="Luyện tập định nghĩa từ vựng"
                    subtitle="Hãy đọc từ và thử định nghĩa lại theo cách hiểu của bạn."
                    progress={vm.getProgress()}
                    progressLabel={`Từ ${vm.current_index + 1}/${vm.vocabularies.length}`}
                    onGuideClick={() => console.log("🎯 Bắt đầu tour hướng dẫn!")}
                />

                {/* ===== Main Content (7/3 layout) ===== */}
                <Box
                    display="flex"
                    gap={3}
                    justifyContent="center"
                    alignItems="flex-start"
                    width="100%"
                    flexWrap={{ xs: "wrap", md: "nowrap" }}
                >
                    {/* LEFT: Practice Section */}
                    <Box flex={7} maxWidth={800} width="100%">
                        <motion.div
                            key={vocab._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <Paper
                                sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    border: "1px solid rgba(37,99,235,0.1)",
                                    boxShadow: "0 10px 20px rgba(37,99,235,0.05)",
                                    backgroundColor: "#ffffff",
                                    transition: "0.3s",
                                    "&:hover": {
                                        boxShadow:
                                            "0 12px 24px rgba(37,99,235,0.1)",
                                    },
                                }}
                            >
                                <Stack spacing={3}>
                                    {/* Word + Kiểm tra */}
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                            sx={{
                                                color: "#2563eb",
                                                letterSpacing: "0.5px",
                                            }}
                                        >
                                            {vocab.word.toUpperCase()}
                                        </Typography>

                                        <motion.div whileTap={{ scale: 0.95 }}>
                                            <Button
                                                variant="contained"
                                                startIcon={<AutoAwesomeIcon />}
                                                disabled={!vm.current_answer?.trim()}
                                                onClick={vm.submitAnswer}
                                                sx={{
                                                    borderRadius: 3,
                                                    px: 3,
                                                    py: 1,
                                                    fontWeight: 600,
                                                    textTransform: "none",

                                                }}
                                            >
                                                Kiểm tra
                                            </Button>
                                        </motion.div>
                                    </Box>

                                    {/* Gợi ý định nghĩa */}
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ lineHeight: 1.6 }}
                                    >
                                        <strong>Gợi ý định nghĩa:</strong>{" "}
                                        <span style={{ color: "#111827" }}>
                                            {vocab.definition}
                                        </span>
                                    </Typography>

                                    {/* Input định nghĩa */}
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        placeholder="Nhập định nghĩa theo cách hiểu của bạn..."
                                        variant="outlined"
                                        value={vm.current_answer}
                                        onChange={(e) =>
                                            vm.onChangeCurrentAnswer(
                                                e.target.value
                                            )
                                        }
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 3,
                                                "& fieldset": {
                                                    borderColor: "#e5e7eb",
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: "#2563eb",
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#2563eb",
                                                    boxShadow:
                                                        "0 0 0 2px rgba(37,99,235,0.1)",
                                                },
                                            },
                                        }}
                                    />

                                    {/* Navigation Buttons */}
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        pt={1}
                                    >
                                        {vm.current_index > 0 ? (
                                            <Button
                                                variant="outlined"
                                                startIcon={<ArrowBackIcon />}
                                                onClick={() =>
                                                    vm.goToPreviousVocabulary()
                                                }
                                                sx={{
                                                    borderRadius: 3,
                                                    textTransform: "none",
                                                    fontWeight: 600,
                                                    px: 3,
                                                    color: "#374151",
                                                    borderColor: "#d1d5db",
                                                    "&:hover": {
                                                        borderColor: "#2563eb",
                                                        color: "#2563eb",
                                                    },
                                                }}
                                            >
                                                Câu trước
                                            </Button>
                                        ) : (
                                            <Box />
                                        )}

                                        <Button
                                            variant="contained"
                                            color="primary"
                                            endIcon={<ArrowForwardIcon />}
                                            disabled={
                                                vm.current_accuracy_score == null ||
                                                vm.current_accuracy_score < 0.5
                                            }
                                            onClick={() => vm.goToNextVocabulary()}
                                            sx={{
                                                borderRadius: 3,
                                                px: 3,
                                                fontWeight: 600,
                                                textTransform: "none",
                                                boxShadow: "0 4px 10px rgba(37,99,235,0.25)",
                                                "&.Mui-disabled": {
                                                    backgroundColor: "#e5e7eb",
                                                    color: "#9ca3af",
                                                    boxShadow: "none",
                                                },
                                            }}
                                        >
                                            {vm.current_index + 1 < vm.vocabularies.length
                                                ? "Tiếp theo"
                                                : "Hoàn thành"}
                                        </Button>
                                    </Box>
                                </Stack>
                            </Paper>
                        </motion.div>
                    </Box>

                    {/* RIGHT: Attempt Section */}
                    <Box flex={3} width="100%">
                        <Paper
                            sx={{
                                p: 0,
                                borderRadius: 4,
                                border: "1px solid rgba(37,99,235,0.1)",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                                maxHeight: "75vh",
                            }}
                        >
                            {/* Header cố định */}
                            <Box
                                sx={{
                                    position: "sticky",
                                    top: 0,
                                    background: "#fff",
                                    zIndex: 2,
                                    borderBottom: "1px solid #f1f5f9",
                                    p: 2.5,
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    fontWeight={600}
                                    sx={{ color: "#1e293b" }}
                                >
                                    Tiến trình luyện tập
                                </Typography>
                            </Box>

                            {/* Danh sách cuộn */}
                            <Box
                                sx={{
                                    flex: 1,
                                    overflowY: "auto",
                                    p: 2.5,
                                    scrollbarWidth: "thin",
                                    scrollBehavior: "smooth",
                                }}
                            >
                                {vm.user_attempts.length === 0 ? (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        textAlign="center"
                                        sx={{ py: 3 }}
                                    >
                                        Bạn chưa có lượt luyện tập nào.
                                    </Typography>
                                ) : (
                                    <List dense sx={{ m: 0 }}>
                                        {vm.user_attempts.map((a, idx) => (
                                            <ListItem
                                                key={idx}
                                                sx={{
                                                    borderBottom:
                                                        "1px solid #f0f0f0",
                                                    py: 0.8,
                                                    px: 0,
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Typography
                                                            fontWeight={600}
                                                            color={
                                                                a.is_correct
                                                                    ? "success.main"
                                                                    : "error.main"
                                                            }
                                                        >
                                                            {a.vocabulary_id}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            Độ chính xác:{" "}
                                                            {a.accuracy_score *
                                                                100}
                                                            %
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </PracticeLayout>
    );
};

export default PracticeDefinitionBasedDetailPage;
