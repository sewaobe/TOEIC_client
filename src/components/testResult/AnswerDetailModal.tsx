import {
  Box,
  Modal,
  Fade,
  Backdrop,
  Typography,
  Divider,
  IconButton,
  CircularProgress,
  Chip,
  Collapse,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useEffect, useState } from "react";
import type { RawAnswer } from "../../utils/mapAnswersToParts";
import { ExamGroup, ExamQuestion } from "../../types/Exam";
import { questionService } from "../../services/question.service";

interface AnswerDetailModalProps {
  open: boolean;
  onClose: () => void;
  answer: RawAnswer;
  testId: string;
}

const AnswerDetailModal = ({
  open,
  onClose,
  answer,
  testId,
}: AnswerDetailModalProps) => {
  const [group, setGroup] = useState<ExamGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (!open || !answer?.question_id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await questionService.getQuestionByIdFromGroup(
          answer.question_id,
          testId
        );
        setGroup(res);
      } catch (error) {
        console.error("❌ Lỗi khi tải chi tiết câu hỏi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, answer?.question_id]);

  const currentQuestion: ExamQuestion | undefined = group?.questions.find(
    (q) => q._id === answer.question_id
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 400,
          sx: { backgroundColor: "rgba(0,0,0,0.25)", backdropFilter: "blur(3px)" },
        },
      }}
    >
      <Fade in={open}>
        <Box
          className="bg-white rounded-2xl shadow-xl flex flex-col text-gray-900"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", md: "70%", lg: "55%" },
            maxHeight: "90vh",
          }}
        >
          {/* HEADER */}
          <Box className="border-b border-gray-200 px-6 py-4">
            <Box className="flex items-center justify-between">
              <Typography className="font-poppins text-lg font-semibold">
                Đáp án chi tiết #{answer.question_no}
              </Typography>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Tags */}
            <Box className="flex flex-wrap items-center gap-2 mt-2">
              <Chip
                label={`Part ${group?.part ?? "?"}`}
                color="primary"
                size="small"
                variant="outlined"
                className="!font-poppins !text-xs"
              />
              {answer.tags?.map(
                (tag, i) =>
                  tag && (
                    <Chip
                      key={i}
                      label={tag.replace(/\[|\]/g, "")}
                      size="small"
                      variant="outlined"
                      className="!font-poppins !text-xs"
                    />
                  )
              )}
            </Box>
          </Box>

          {/* CONTENT (scroll-y) */}
          <Box className="overflow-y-auto px-6 py-5 space-y-4" sx={{ maxHeight: { xs: "70vh", md: "75vh" } }}>
            {loading ? (
              <Box className="flex items-center justify-center min-h-[300px]">
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Audio */}
                {group?.audioUrl && (
                  <Box className="mb-3">
                    <audio src={group.audioUrl} controls className="w-full rounded-md mt-2" />
                  </Box>
                )}

                {/* Images */}
                {group?.imagesUrl?.length ? (
                  <Box className="mb-3">
                    {group.imagesUrl.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`image-${i}`}
                        className="w-full rounded-lg mb-2 object-contain"
                      />
                    ))}
                  </Box>
                ) : null}

                {/* QUESTION */}
                {currentQuestion && (
                  <>
                    <Typography className="font-poppins text-[16px] font-medium leading-relaxed mb-2">
                      {answer.question_no}. {currentQuestion.textQuestion || ""}
                    </Typography>

                    {Object.entries(currentQuestion.choices).map(([key, value]) => {
                      const isCorrect = key === currentQuestion.correctAnswer;
                      const isSelected = key === answer.selectedOption;

                      return (
                        <Box key={key} className="flex items-center gap-2 mb-1.5">
                          <Typography
                            className={`font-inter text-[15px] leading-relaxed ${
                              isCorrect
                                ? "text-green-600 font-semibold"
                                : isSelected && !isCorrect
                                ? "text-red-500 font-medium"
                                : "text-gray-800"
                            }`}
                          >
                            {value}
                          </Typography>
                          {isCorrect && <CheckCircleOutlineIcon fontSize="small" color="success" />}
                          {isSelected && !isCorrect && <CancelOutlinedIcon fontSize="small" color="error" />}
                        </Box>
                      );
                    })}

                    {/* Transcript */}
                    {group?.transcriptEnglish && (
                      <Box className="mt-4">
                        <Typography className="font-poppins font-semibold text-sm mb-1">
                          Transcript
                        </Typography>
                        <Typography className="font-noto text-[15px] leading-[1.7] text-gray-700 whitespace-pre-line">
                          {group.transcriptEnglish}
                        </Typography>
                        {group.transcriptTranslation && (
                          <Typography className="font-noto text-[15px] leading-[1.7] text-gray-500 whitespace-pre-line mt-2">
                            {group.transcriptTranslation}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* FOOTER */}
                    <Divider className="my-3 border-gray-200" />
                    <Typography className="font-poppins text-green-600 font-semibold">
                      Đáp án đúng: {currentQuestion.correctAnswer}
                    </Typography>

                    {currentQuestion.explanation && (
                      <Box className="mt-2">
                        <Button
                          onClick={() => setShowExplanation((v) => !v)}
                          endIcon={showExplanation ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          className="!font-poppins !font-semibold !text-gray-900 !px-0 !capitalize"
                        >
                          Giải thích chi tiết đáp án
                        </Button>

                        <Collapse in={showExplanation}>
                          <Typography className="font-noto text-[15px] text-gray-700 leading-[1.8] whitespace-pre-line mt-1">
                            {currentQuestion.explanation}
                          </Typography>
                        </Collapse>
                      </Box>
                    )}
                  </>
                )}
              </>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default AnswerDetailModal;
