// QuestionContent.tsx
import React from "react";
import QuestionItem from "./QuestionItem";

interface QuestionContentProps {
  groupQuestions: {
    imagesUrl?: string[];
    questions: any[];
  };
}

const QuestionContent: React.FC<QuestionContentProps> = ({ groupQuestions }) => {
  const hasLeftPane = !!(groupQuestions.imagesUrl && groupQuestions.imagesUrl.length > 0);

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-white border rounded-md overflow-hidden shadow-sm">
      {/* Cột trái: passage / ảnh */}
      {hasLeftPane && (
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r p-6 overflow-auto">
          {groupQuestions.imagesUrl!.map((url, idx) => (
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
        {groupQuestions.questions.map((q) => {
          const question = q || {
            _id: "0",
            textQuestion: "Question text...",
            choices: { A: "A. ...", B: "B. ...", C: "C. ...", D: "D. ..." },
            correctAnswer: "A",
          };
          const options: string[] = Object.values(question.choices) as string[];
          const questionId = q.name?.replace(/^Question\s*/, "") || "0";
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
  );
};

export default QuestionContent;
