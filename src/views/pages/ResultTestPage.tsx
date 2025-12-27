import {
  Box,
  Button,
  Stack,
  Typography,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { SecondLayout } from "../layouts/SecondLayout";
import { OverallAnalysis } from "../../components/testResult/OverallAnalysis";
import { getPartFromTags, RawAnswer } from "../../utils/mapAnswersToParts";
import DetailAnalysis from "../../components/testResult/DetailAnalysis";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import userTestService from "../../services/user_test.service";
import { AnswerListSection } from "../../components/testResult/AnswerListSection";
import Comments from "../../components/testDetail/Comments";
import AnswerDetailModal from "../../components/testResult/AnswerDetailModal";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../stores/store";
import {
  disableHighlightPopup,
  enableHighlightPopup,
} from "../../stores/highlightPopupSlice";

const ResultTestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { historyId } = useParams<{ historyId: string }>();
  const testId = location.pathname.split("/")[2];

  const [selectedAnswer, setSelectedAnswer] = useState<RawAnswer | null>(null);
  const [testTitle, setTestTitle] = useState<string>("");

  const [loading, setLoading] = useState(true); // 🧩 loading state
  const [testDetail, setTestDetail] = useState<{
    score: number;
    answers: RawAnswer[];
    completedPart: string;
    duration: number;
    submit_at: Date;
  }>();

  const tab_parts: string[] = testDetail
    ? [
        ...new Set(
          testDetail.answers
            .flatMap((ans) => ans.tags)
            .map((tag) => tag!.match(/\[Part (\d+)\]/)?.[1])
            .filter(Boolean) as string[]
        ),
      ]
    : [];

  const total_correct_question = testDetail
    ? testDetail.answers.filter((q) => q.isCorrect === true).length
    : 0;
  const total_incorrect_question = testDetail
    ? testDetail.answers.filter(
        (q) => q.isCorrect === false && q.selectedOption !== ""
      ).length
    : 0;

  const total_correct_listening = testDetail
    ? testDetail.answers.filter((q) => {
        const part = getPartFromTags(q.tags);
        return part !== undefined && q.isCorrect && part >= 1 && part <= 4;
      }).length
    : 0;

  const total_correct_reading = testDetail
    ? testDetail.answers.filter((q) => {
        const part = getPartFromTags(q.tags);
        return part !== undefined && q.isCorrect && part >= 5 && part <= 7;
      }).length
    : 0;
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (historyId) {
          setLoading(true);
          const data = await userTestService.getTestHistoryDetail(historyId);
          setTestDetail(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    const storedTitle = localStorage.getItem("title_test") || "TOEIC Test";
    setTestTitle(storedTitle);

    dispatch(enableHighlightPopup());

    return () => {
      dispatch(disableHighlightPopup());
    };
  }, []);

  return (
    <MainLayout>
      <SecondLayout>
        <Box
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 2,
            boxShadow: 1,
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Kết quả thi: {testTitle}</Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() =>
                navigate(
                  location.pathname.substring(
                    0,
                    location.pathname.lastIndexOf("/result")
                  )
                )
              }
            >
              Quay về trang đề thi
            </Button>
          </Stack>

          {/* 🧩 Loading Skeleton */}
          {loading ? (
            <Box>
              {/* 🌀 Loading Indicator */}
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                sx={{
                  mt: 2,
                  mb: 2,
                  animation: "fadeIn 0.4s ease-in-out",
                  "@keyframes fadeIn": {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                  },
                }}
              >
                <CircularProgress
                  size={36}
                  thickness={4}
                  sx={{ color: "primary.main", mb: 1 }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                >
                  Đang tải kết quả thi, vui lòng chờ trong giây lát...
                </Typography>
              </Box>

              <Skeleton
                variant="rounded"
                width="100%"
                height={120}
                sx={{ borderRadius: 2, mb: 2 }}
              />
              <Skeleton
                variant="rounded"
                width="100%"
                height={280}
                sx={{ borderRadius: 2, mb: 2 }}
              />
              <Skeleton
                variant="rounded"
                width="100%"
                height={200}
                sx={{ borderRadius: 2, mb: 2 }}
              />
            </Box>
          ) : (
            <>
              {/* Section Analysis */}
              {testDetail && (
                <OverallAnalysis
                  completion_time={testDetail.duration}
                  correct_question={total_correct_question}
                  incorrect_question={total_incorrect_question}
                  skip_question={
                    testDetail.answers.length -
                    total_correct_question -
                    total_incorrect_question
                  }
                  total_score={testDetail.score}
                  correct_listening={total_correct_listening}
                  correct_reading={total_correct_reading}
                />
              )}

              {/* Section Detail Analysis */}
              <div className="mt-4">
                {testDetail && (
                  <DetailAnalysis
                    answers={testDetail?.answers}
                    tab_parts={tab_parts}
                    setSelected={setSelectedAnswer}
                  />
                )}

                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Đáp án
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        navigate(`${location.pathname}/answers`, {
                          state: {
                            from:
                              window.location.pathname + window.location.search,
                          },
                        })
                      }
                    >
                      Xem chi tiết đáp án
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={() => navigate(`${location.pathname}/retry`)}
                    >
                      Làm lại các câu sai
                    </Button>
                  </Box>
                </Box>
              </div>

              {/* Answer List Section */}
              {testDetail && (
                <AnswerListSection
                  answers={testDetail.answers}
                  setSelected={setSelectedAnswer}
                />
              )}
            </>
          )}
        </Box>

        {/* Comment Section */}
        {!loading && (
          <Box
            sx={{
              mt: 4,
              bgcolor: "background.paper",
              borderRadius: 2,
              p: 2,
              boxShadow: 1,
            }}
          >
            {testId && <Comments testId={testId} />}
          </Box>
        )}
      </SecondLayout>

      {/* Answer Detail Modal */}
      {selectedAnswer && (
        <AnswerDetailModal
          open={Boolean(selectedAnswer)}
          answer={selectedAnswer}
          onClose={() => setSelectedAnswer(null)}
          testId={testId!}
        />
      )}
    </MainLayout>
  );
};

export default ResultTestPage;
