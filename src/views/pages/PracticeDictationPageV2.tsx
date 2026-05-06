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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLesson = async () => {
      if (!urlId) return;

      try {
        setLoading(true);
        const lesson = await dictationService.getDictationById(urlId);
        setSelectedLesson(lesson);
      } catch (error) {
        console.error("Failed to select dictation v2:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [urlId]);

  const rawDifficulty = searchParams.get("difficulty");
  const initialDifficulty =
    rawDifficulty === "easy" ||
    rawDifficulty === "medium" ||
    rawDifficulty === "hard"
      ? rawDifficulty
      : "hard";

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
