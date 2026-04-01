import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import React, { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../stores/store";
import PartIntro from "./PartIntro";
import QuestionContent from "./QuestionContent";
import { setShowIntro, setCurrentGroupIndex } from "../../stores/examSlice";
import { partIntros } from "../../models/QuestionType";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ExamContainerProps {
  isSubmitted: boolean;
}

const ExamContainer: React.FC<ExamContainerProps> = ({ isSubmitted }) => {
  const dispatch = useDispatch();
  const { groups, currentGroupIndex, showIntro, isLoading } = useSelector(
    (s: RootState) => s.exam
  )

  const audioRef = useRef<HTMLAudioElement>(null);

  const groupQuestions = groups[currentGroupIndex];
  const intro = groupQuestions
    ? partIntros.find((p) => p.part === groupQuestions.part)
    : null;

  // --- Audio play mỗi khi group thay đổi ---
  useEffect(() => {
    if (showIntro === false && groupQuestions?.audioUrl && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch((err) => console.log(err));
    }
  }, [groupQuestions, showIntro]);

  const handleStart = () => {
    dispatch(setShowIntro(false));
  };

  const goPrev = () => {
    if (currentGroupIndex > 0)
      dispatch(setCurrentGroupIndex(currentGroupIndex - 1));
  };

  const goNext = () => {
    if (currentGroupIndex < groups.length - 1)
      dispatch(setCurrentGroupIndex(currentGroupIndex + 1));
  };

  const handleAudioEnded = () => {
    goNext();
  };

  useEffect(() => {
    if (isSubmitted && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isSubmitted])

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center flex-1 min-h-[400px]">
        {/* Bạn có thể dùng Spinner của MUI hoặc SVG quay tròn */}
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Đang chuẩn bị đề thi...</p>
      </div>
    );
  }

  if (!isLoading && groups.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-10 text-center min-h-[400px]">
        <InboxOutlinedIcon 
          sx={{ 
            fontSize: 80, 
            mb: 2 
          }} 
        />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Không tìm thấy dữ liệu bài thi
        </h2>
        <p className="text-gray-500 mb-6 max-w-md">
          Có vẻ như đề thi này hiện không khả dụng hoặc đã xảy ra lỗi trong quá trình tải dữ liệu.
        </p>

        <div className="flex gap-4">
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{
              borderRadius: "20px",
              textTransform: "none",
              px: 4,
              fontWeight: 600
            }}
          >
            Quay về trang chủ
          </Button>

          <Button
            variant="outlined"
            onClick={() => window.location.reload()} // Thử tải lại trang
            sx={{
              borderRadius: "20px",
              textTransform: "none",
              px: 4,
            }}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showIntro && intro ? (
        <PartIntro
          partNumber={intro.part}
          termDesc={intro.termDesc}
          audioSrc={intro.audioUrl}
          totalScore={0}
          onStart={handleStart}
        />
      ) : (
        <div className="flex flex-col flex-1">
          {/* Navigation buttons */}
          {groupQuestions.part > 4 && (
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={goPrev}
                disabled={currentGroupIndex === 0}
                className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
              >
                ⬅ Câu trước
              </button>
              <button
                onClick={goNext}
                disabled={currentGroupIndex === groups.length - 1}
                className="px-4 py-2 rounded bg-blue-500 text-white disabled:opacity-50"
              >
                Câu tiếp ➡
              </button>
            </div>
          )}

          {/* QuestionContent chỉ nhận data */}
          <QuestionContent groupQuestions={groupQuestions} />

          {/* Audio ẩn */}
          {groupQuestions.audioUrl && (
            <audio
              ref={audioRef}
              src={groupQuestions.audioUrl}
              onEnded={handleAudioEnded}
            />
          )}
        </div>
      )}
    </>
  );
};

export default ExamContainer;
