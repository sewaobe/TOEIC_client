import { FC, useState } from "react";
import { motion } from "framer-motion";

const RightSidebar: FC = () => {
  const parts = [
    { part: "Part 1", questions: Array.from({ length: 6 }, (_, i) => i + 1) },
    { part: "Part 2", questions: Array.from({ length: 25 }, (_, i) => i + 7) },
    { part: "Part 3", questions: Array.from({ length: 39 }, (_, i) => i + 32) },
  ];

  // Lưu trạng thái câu hỏi đã làm
  const [answered, setAnswered] = useState<number[]>([]);

  const toggleAnswer = (q: number) => {
    setAnswered((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]
    );
  };

  return (
    <aside
      className="
        max-w-[25%] w-full flex-shrink-0
        h-screen bg-white border-l p-4 
        overflow-y-auto shadow-inner flex-1
        max-h-[calc(100vh-100px)]
      "
    >
      {parts.map((p) => (
        <div key={p.part} className="mb-4">
          <h3 className="font-bold text-primary mb-2">{p.part}</h3>
          <div className="flex flex-wrap gap-2">
            {p.questions.map((q) => (
              <motion.button
                key={q}
                whileHover={{ scale: 1.1 }}
                onClick={() => toggleAnswer(q)}
                className={`w-8 h-8 rounded-md text-sm font-semibold border
                  ${
                    answered.includes(q)
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
              >
                {q}
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
};

export default RightSidebar;
