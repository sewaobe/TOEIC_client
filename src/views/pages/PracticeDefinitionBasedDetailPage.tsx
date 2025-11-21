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
  IconButton,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { EmptyState } from "../../components/common/EmptyState";
import { usePracticeDefinitionBasedDetailVM } from "../../viewmodels/PracticeDefinitionBasedDetail/usePracticeDefinitionBasedDetailVM";
import PracticeLayout from "../layouts/PracticeLayout";
import { HeaderBanner } from "../../components/practices/HeaderBanner";
import { VolumeUp } from "@mui/icons-material";
import { useSpeech } from "../../hooks/useSpeech";
import F5Modal from "../../components/modals/F5Modal";
import ResumeSessionModal from "../../components/modals/ResumeSessionModal";
import { DefinitionBasedTourGuide } from "../../components/tour-guide/DefinitionBasedTourGuide";

const PracticeDefinitionBasedDetailPage = () => {
  const {
    vm,
    vocab,
    hasAttemptedCurrent,
    isCorrect,
    accuracyScore,
    handleCompleted,
    showGuider,
    setShowGuider,
  } = usePracticeDefinitionBasedDetailVM();
  const { speak } = useSpeech();

  if (vm.isLoading("fetchVocabularies") || vm.showResumeModal) {
    return (
      <>
        {vm.isLoading("fetchVocabularies") && <EmptyState mode="loading" />}

        {vm.showResumeModal && vm.currentSession && (
          <ResumeSessionModal
            open={vm.showResumeModal}
            progress={
              (vm.currentSession.completed_items /
                vm.currentSession.total_items) *
              100
            }
            completedItems={vm.currentSession.completed_items}
            totalItems={vm.currentSession.total_items}
            onResume={() => vm.resumeSession()}
            onCancel={() => vm.cancelAndStartNew()}
          />
        )}
      </>
    );
  }

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
      {/* F5 Modal - Cảnh báo khi nhấn F5 hoặc Ctrl+R */}
      <F5Modal
        title="Cảnh báo rời trang luyện tập"
        content="Bạn có chắc chắn muốn tải lại trang không? Tiến độ của bạn đã được lưu và bạn có thể tiếp tục sau."
        onConfirm={() => {
          window.location.reload();
        }}
      />

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
        {/* ===== Header Banner ===== */}
        <HeaderBanner
          title="Luyện tập định nghĩa từ vựng"
          subtitle="Hãy đọc từ và thử định nghĩa lại theo cách hiểu của bạn, đừng nhìn gợi ý trước nhé."
          progress={vm.getProgress()}
          progressLabel={`Từ ${vm.current_index + 1}/${vm.vocabularies.length}`}
          onGuideClick={() => setShowGuider(true)}
          data_tour="header-banner"
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
                    boxShadow: "0 12px 24px rgba(37,99,235,0.1)",
                  },
                }}
              >
                <Stack spacing={3}>
                  {/* WORD + PHONETIC + CHECK BUTTON */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    data-tour="word-section"
                  >
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
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
                        <IconButton
                          onClick={() => speak(vocab.word)}
                          sx={{
                            color: "#2563eb",
                            "&:hover": { background: "rgba(37,99,235,0.1)" },
                          }}
                        >
                          <VolumeUp />
                        </IconButton>
                      </Stack>

                      {vocab.phonetic && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5, fontStyle: "italic" }}
                        >
                          /{vocab.phonetic}/
                        </Typography>
                      )}

                      {vocab.type && (
                        <Typography
                          variant="caption"
                          sx={{ mt: 0.25, color: "#6b7280" }}
                        >
                          Loại từ: {vocab.type}
                        </Typography>
                      )}
                    </Box>

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
                        data-tour="check-button"
                      >
                        {vm.isLoading("submitAnswer") ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          "Kiểm tra"
                        )}
                      </Button>
                    </motion.div>
                  </Box>

                  {/* IMAGE (nếu có) */}
                  {vocab.image && (
                    <Box
                      component="img"
                      src={vocab.image}
                      alt={vocab.word}
                      sx={{
                        mt: 1,
                        maxHeight: 140,
                        width: "100%",
                        objectFit: "contain",
                        borderRadius: 2,
                        backgroundColor: "#f9fafb",
                      }}
                    />
                  )}

                  {/* Input định nghĩa (user tự định nghĩa) */}
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    placeholder="Nhập định nghĩa theo cách hiểu của bạn..."
                    variant="outlined"
                    value={vm.current_answer}
                    onChange={(e) => vm.onChangeCurrentAnswer(e.target.value)}
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
                          boxShadow: "0 0 0 2px rgba(37,99,235,0.1)",
                        },
                      },
                    }}
                    data-tour="definition-input"
                  />

                  {/* FEEDBACK: ✅ / ❌ + Định nghĩa chuẩn + Ví dụ + Ghi chú */}
                  {hasAttemptedCurrent && (
                    <Box
                      sx={{
                        mt: 1,
                        p: 2.5,
                        borderRadius: 3,
                        background: isCorrect
                          ? "rgba(34,197,94,0.08)"
                          : "rgba(239,68,68,0.08)",
                        border: `1px solid ${
                          isCorrect
                            ? "rgba(34,197,94,0.4)"
                            : "rgba(239,68,68,0.4)"
                        }`,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{
                          color: isCorrect ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {vm.current_feedback || "Không có phản hồi."}
                      </Typography>

                      <Typography sx={{ mt: 1.5 }}>
                        <strong>Định nghĩa chuẩn:</strong>{" "}
                        {vocab.definitions?.[0] ||
                          "Chưa có dữ liệu định nghĩa."}
                      </Typography>

                      {vocab.examples && vocab.examples.length > 0 ? (
                        <Box sx={{ mt: 1.5 }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ mb: 0.5 }}
                          >
                            Ví dụ:
                          </Typography>
                          {vocab.examples.map((ex, i) => (
                            <Typography
                              key={i}
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0.5 }}
                            >
                              • {ex}
                            </Typography>
                          ))}
                        </Box>
                      ) : null}

                      {vocab.notes && (
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 1.5,
                            fontStyle: "italic",
                            color: "#374151",
                          }}
                        >
                          💡 Ghi chú: {vocab.notes}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Navigation Buttons + lời động viên */}
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
                        onClick={() => vm.goToPreviousVocabulary()}
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
                        data-tour="prev-button"
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
                      disabled={!hasAttemptedCurrent || accuracyScore < 0.5}
                      onClick={() => {
                        if (vm.current_index + 1 < vm.vocabularies.length) {
                          vm.goToNextVocabulary();
                        } else {
                          handleCompleted();
                        }
                      }}
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
                      data-tour="next-button"
                    >
                      {vm.current_index + 1 < vm.vocabularies.length
                        ? "Tiếp theo"
                        : "Hoàn thành"}
                    </Button>
                  </Box>

                  {hasAttemptedCurrent && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      sx={{ mt: 1 }}
                    >
                      {isCorrect
                        ? `Tuyệt! Bạn đã hoàn thành ${vm.current_index + 1}/${
                            vm.vocabularies.length
                          } từ.`
                        : "Không sao, hãy đọc lại định nghĩa và ghi nhớ ý chính nhé."}
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </motion.div>
          </Box>

          {/* RIGHT: Attempt Section */}
          <Box flex={3} width="100%" data-tour="attempt-list">
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
                          borderBottom: "1px solid #f0f0f0",
                          py: 0.8,
                          px: 0,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              fontWeight={600}
                              color={
                                a.is_correct ? "success.main" : "error.main"
                              }
                            >
                              {vm.vocabularies.find(
                                (v) => v._id === a.vocabulary_id
                              )?.word || "---"}
                              : {a.answer}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              Độ chính xác: {a.accuracy_score * 100}%
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

      {/* Tour Guide */}
      <DefinitionBasedTourGuide isRun={showGuider} />
    </PracticeLayout>
  );
};

export default PracticeDefinitionBasedDetailPage;
