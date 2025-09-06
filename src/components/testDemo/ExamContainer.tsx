import React, { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../stores/store";
import PartIntro from "./PartIntro";
import QuestionContent from "./QuestionContent";
import { setShowIntro, setCurrentGroupIndex } from "../../stores/examSlice";
import { partIntros } from "../../models/QuestionType";

const ExamContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { groups, currentGroupIndex, showIntro } = useSelector(
    (s: RootState) => s.exam
  );

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

  if (!groupQuestions) {
    return <div>Không tìm thấy group</div>;
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
