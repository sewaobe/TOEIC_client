import { FC } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../stores/store';
import QuestionChipRightBar from './QuestionChipRightBar';
import { setCurrentGroupByQuestionId } from '../../stores/examSlice';

interface RightSidebarProps {
  isShow: boolean;
}

const RightSidebar: FC<RightSidebarProps> = ({ isShow }) => {
  const parts = [
    { part: 'Part 1', questions: [1, 2] },
    { part: 'Part 2', questions: [7, 8] },
    { part: 'Part 3', questions: [32, 33, 34] },
    { part: 'Part 4', questions: [71, 72, 73] },
    { part: 'Part 5', questions: [101, 102] },
    { part: 'Part 6', questions: [151, 152, 153, 154, 155, 156, 157, 158] },
  ];

  const dispatch = useDispatch<AppDispatch>();
  const answers = useSelector((s: RootState) => s.answer.answers);

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: isShow ? 0 : '100%' }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.4 }}
      className='absolute right-0 w-full md:max-w-[25%] h-[calc(100vh-112px)] bg-white border-l py-4 pl-4 overflow-y-auto shadow-inner'
    >
      {parts.map((p) => (
        <div key={p.part} className='mb-4'>
          <h3 className='font-bold text-primary mb-2'>{p.part}</h3>
          <div className='flex flex-wrap gap-2'>
            {p.questions.map((q) => {
              const a = answers[q - 1]; // mảng 200 phần tử
              return (
                <QuestionChipRightBar
                  key={q}
                  id={q}
                  answered={!!a && a.answer !== ''}
                  isFlagged={!!a && a.isFlagged}
                  onClick={() => dispatch(setCurrentGroupByQuestionId(q))}
                />
              );
            })}
          </div>
        </div>
      ))}
    </motion.aside>
  );
};

export default RightSidebar;
