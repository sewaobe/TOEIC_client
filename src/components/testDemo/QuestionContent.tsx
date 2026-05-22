import React from "react";
import { ExamGroup } from "../../types/Exam";
import QuestionItem from "./QuestionItem";

interface QuestionContentProps {
  groupQuestions: ExamGroup;
}

const QuestionContent: React.FC<QuestionContentProps> = ({ groupQuestions }) => {
  const hasImages = !!(
    groupQuestions.imagesUrl && groupQuestions.imagesUrl.length > 0
  );
  const hasReadingPassage =
    groupQuestions.part >= 6 && !!groupQuestions.transcriptEnglish?.trim();
  const hasLeftPane = hasImages || hasReadingPassage;
  const hidesPrintedListeningContent = groupQuestions.part <= 2;

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-white border rounded-md overflow-hidden shadow-sm">
      {hasLeftPane && (
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r p-6 overflow-auto">
          {groupQuestions.imagesUrl?.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Passage ${idx + 1}`}
              className="w-full rounded mb-4 last:mb-0"
            />
          ))}
          {hasReadingPassage && (
            <div
              className="prose max-w-none text-gray-800"
              dangerouslySetInnerHTML={{
                __html: groupQuestions.transcriptEnglish || "",
              }}
            />
          )}
        </div>
      )}

      <div
        className={`w-full ${
          hasLeftPane ? "md:w-1/2" : "md:w-full"
        } p-6 overflow-y-auto flex flex-col gap-6`}
      >
        {groupQuestions.questions.map((question) => {
          const options = Object.entries(question.choices || {}).map(
            ([key, text]) => ({ key, text: String(text) })
          );

          return (
            <QuestionItem
              key={question._id}
              id={question._id}
              name={question.questionNumber}
              text={question.textQuestion || ""}
              options={options}
              showText={!hidesPrintedListeningContent}
              choiceLabelMode={
                hidesPrintedListeningContent ? "key-only" : "full"
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default QuestionContent;
