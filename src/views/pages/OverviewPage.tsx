import { FC, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  OverviewCard,
  SkillInfo,
} from "../../components/testDemo/OverviewCard";

// Thông tin chi tiết từng part
const partDetails: Record<
  number,
  {
    name: string;
    questions: number;
    timeMinutes: number;
    type: "listening" | "reading";
  }
> = {
  1: {
    name: "Part 1: Photographs",
    questions: 6,
    timeMinutes: 3,
    type: "listening",
  },
  2: {
    name: "Part 2: Question-Response",
    questions: 25,
    timeMinutes: 10,
    type: "listening",
  },
  3: {
    name: "Part 3: Conversations",
    questions: 39,
    timeMinutes: 17,
    type: "listening",
  },
  4: {
    name: "Part 4: Talks",
    questions: 30,
    timeMinutes: 15,
    type: "listening",
  },
  5: {
    name: "Part 5: Incomplete Sentences",
    questions: 30,
    timeMinutes: 15,
    type: "reading",
  },
  6: {
    name: "Part 6: Text Completion",
    questions: 16,
    timeMinutes: 10,
    type: "reading",
  },
  7: {
    name: "Part 7: Reading Comprehension",
    questions: 54,
    timeMinutes: 50,
    type: "reading",
  },
};

const OverviewPage: FC = () => {
  const [searchParams] = useSearchParams();
  const partsQuery = searchParams.get("parts");
  const timeLimit = searchParams.get("timeLimit");

  const { skills, totalScore, totalTime, description, isFullTest } =
    useMemo(() => {
      // Nếu không có parts hoặc parts là full (1,2,3,4,5,6,7) => Full test
      const parts = partsQuery
        ? partsQuery.split(",").map(Number)
        : [1, 2, 3, 4, 5, 6, 7];
      const isFull = parts.length === 7;

      if (isFull) {
        // Full test mode
        const skills: SkillInfo[] = [
          { name: "Listening", questions: 100, timeMinutes: 45 },
          { name: "Reading", questions: 100, timeMinutes: 75 },
        ];
        return {
          skills,
          totalScore: 200,
          totalTime: timeLimit ? parseInt(timeLimit) : 120,
          description:
            "Bài thi TOEIC gồm 2 kỹ năng: Listening và Reading. Hãy làm bài cẩn thận, đọc kỹ câu hỏi, quản lý thời gian hợp lý và sử dụng các mẹo nhanh để đạt điểm cao.",
          isFullTest: true,
        };
      } else {
        // Practice mode - chỉ các parts được chọn
        const selectedParts = parts.map((p) => partDetails[p]).filter(Boolean);
        const skills: SkillInfo[] = selectedParts.map((part) => ({
          name: part.name,
          questions: part.questions,
          timeMinutes: part.timeMinutes,
        }));

        const totalQuestions = selectedParts.reduce(
          (sum, p) => sum + p.questions,
          0
        );
        const calculatedTime = selectedParts.reduce(
          (sum, p) => sum + p.timeMinutes,
          0
        );
        const finalTime = timeLimit ? parseInt(timeLimit) : calculatedTime;

        const partsList = parts.map((p) => `Part ${p}`).join(", ");

        return {
          skills,
          totalScore: totalQuestions,
          totalTime: finalTime,
          description: `Bạn đang luyện tập ${partsList} với ${totalQuestions} câu hỏi. Hãy tập trung làm bài và quản lý thời gian hiệu quả!`,
          isFullTest: false,
        };
      }
    }, [partsQuery, timeLimit]);

  return (
    <>
      <OverviewCard
        totalScore={totalScore}
        totalTimeMinutes={totalTime}
        skills={skills}
        description={description}
        isFullTest={isFullTest}
      />
    </>
  );
};
export default OverviewPage;
