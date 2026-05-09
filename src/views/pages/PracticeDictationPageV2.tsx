import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import PracticeLayout from "../layouts/PracticeLayout";
import { Dictation } from "../../types/Dictation";
import { dictationService } from "../../services/dictation.service";
import DictationContentV2 from "../../components/practices/DictationContentV2";

const PracticeDictationPageV2 = () => {
  const { id: urlId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedLesson, setSelectedLesson] = useState<Dictation | null>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const rawDifficulty = searchParams.get("difficulty");
  const initialDifficulty =
    rawDifficulty === "easy" ||
    rawDifficulty === "medium" ||
    rawDifficulty === "hard"
      ? rawDifficulty
      : "hard";

  useEffect(() => {
    let isMounted = true;

    const loadLesson = async () => {
      if (!urlId) return;

      try {
        setLoading(true);
        setNextLessonId(null);
        const lesson = await dictationService.getDictationById(urlId);
        if (!isMounted) return;

        setSelectedLesson(lesson);

        const nextCandidates = await dictationService.getAllDictationPage({
          part_type: lesson.part_type,
          level: lesson.level,
          limit: 100,
        });

        if (!isMounted) return;

        const currentPosition = nextCandidates.items.findIndex(
          (item) => item._id === lesson._id
        );
        const nextLesson =
          currentPosition >= 0
            ? nextCandidates.items[currentPosition + 1]
            : undefined;
        setNextLessonId(nextLesson?._id ?? null);
      } catch (error) {
        console.error("Failed to select dictation v2:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLesson();

    return () => {
      isMounted = false;
    };
  }, [urlId]);

  const handleNextLesson = () => {
    if (!nextLessonId) {
      navigate("/practice-skill/dictation-v2");
      return;
    }

    navigate(
      `/practice-skill/dictation-v2/${nextLessonId}?difficulty=${initialDifficulty}`
    );
  };

  return (
    <PracticeLayout>
      <Box className="min-h-screen p-4 md:p-8 text-slate-800">
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
          >
            <CircularProgress />
          </Box>
        ) : selectedLesson ? (
          <DictationContentV2
            dictation={selectedLesson}
            initialDifficulty={initialDifficulty}
            onBackToList={() => navigate("/practice-skill/dictation-v2")}
            hasNextLesson={Boolean(nextLessonId)}
            onNextLesson={handleNextLesson}
          />
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
          >
            <Typography color="text.secondary">
              Không tìm thấy bài luyện tập
            </Typography>
          </Box>
        )}
      </Box>
    </PracticeLayout>
  );
};

export default PracticeDictationPageV2;
