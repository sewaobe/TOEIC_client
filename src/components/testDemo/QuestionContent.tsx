import React, { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../stores/store";
import QuestionItem from "./QuestionItem";
import { setCurrentGroupIndex } from "../../stores/examSlice";

const QuestionContent: React.FC = () => {
  const dispatch = useDispatch();
  const { groups, currentGroupIndex } = useSelector((s: RootState) => s.exam);
  const group = groups[currentGroupIndex];
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // khi group thay đổi, play audio nếu có
    if (group?.audioUrl && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch((err) => console.log(err));
    }
  }, [group]);

  if (!group) return <div>Không tìm thấy group</div>;
  const hasLeftPane = !!(group.imagesUrl!.length > 0);

  const goPrev = () => {
    if (currentGroupIndex > 0) dispatch(setCurrentGroupIndex(currentGroupIndex - 1));
  };

  const goNext = () => {
    if (currentGroupIndex < groups.length - 1)
      dispatch(setCurrentGroupIndex(currentGroupIndex + 1));
  };

  const handleAudioEnded = () => {
    // tự động chuyển sang group tiếp theo
    goNext();
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Navigation buttons */}
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

      {/* Layout question + passage/image */}
      <div className="flex flex-col md:flex-row flex-1 bg-white border rounded-md overflow-hidden shadow-sm">
        {/* Cột trái: passage / ảnh */}
        {hasLeftPane && (
          <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r p-6 overflow-auto">
            {group.imagesUrl!.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Passage ${idx + 1}`}
                className="w-full rounded"
              />
            ))}
          </div>
        )}

        {/* Cột phải: toàn bộ câu của group */}
        <div
          className={`w-full ${hasLeftPane ? "md:w-1/2" : "md:w-full"} p-6 overflow-y-auto flex flex-col gap-6`}
        >
          {group.questions.map((q) => {
            const question = q || {
              _id: "0",
              textQuestion: "Question text...",
              choices: { A: "A. ...", B: "B. ...", C: "C. ...", D: "D. ..." },
              correctAnswer: "A",
            };
            const options: string[] = Object.values(question.choices) as string[];
            const questionId = q.name.replace(/^Question\s*/, "");
            return (
              <QuestionItem
                key={question._id}
                id={question._id} 
                name={Number(questionId)}
                text={question.textQuestion || ""}
                options={options}
              />
            );
          })}
        </div>
      </div>

      {/* Audio ẩn */}
      {group.audioUrl && (
        <audio ref={audioRef} src={group.audioUrl} onEnded={handleAudioEnded} />
      )}
    </div>
  );
};

export default QuestionContent;
