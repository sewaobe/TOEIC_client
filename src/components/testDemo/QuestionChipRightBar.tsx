import React from 'react';
import { motion } from 'framer-motion';

interface QuestionChipRightBarProps {
  id: number;
  answered: boolean;
  isFlagged: boolean;
  onClick: () => void;
}

const QuestionChipRightBar: React.FC<QuestionChipRightBarProps> = ({
  id,
  answered,
  isFlagged,
  onClick,
}) => {
  let bgClass = 'bg-gray-100 text-gray-700'; // default
  if (answered) {
    bgClass = 'bg-green-500 text-white'; // answered
  }
  if (isFlagged) {
    bgClass = 'bg-yellow-500 text-white'; // warning ưu tiên cao hơn
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      onClick={onClick}
      className={`w-8 h-8 rounded-md text-sm font-semibold border ${bgClass}`}
    >
      {id}
    </motion.button>
  );
};

export default QuestionChipRightBar;
