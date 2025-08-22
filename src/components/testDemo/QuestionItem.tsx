import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../stores/store';
import { setAnswer, toggleFlag } from '../../stores/answerSlice';

interface QuestionItemProps {
  id: number;
  text: string;
  options: string[];
}

const QuestionItem: React.FC<QuestionItemProps> = ({ id, text, options }) => {
  const dispatch = useDispatch<AppDispatch>();

  const answer = useSelector(
    (state: RootState) => state.answer.answers[id - 1],
  );

  const handleSelect = (opt: string) => {
    dispatch(setAnswer({ questionId: id, answer: opt }));
  };

  const handleToggleFlag = () => {
    dispatch(toggleFlag({ questionId: id }));
  };
  return (
    <div className='w-full md:w-1/2'>
      <h3 className='font-bold mb-4'>Câu {id}</h3>
      <p className='mb-4'>{text}</p>

      <ul className='space-y-2'>
        {options.map((opt, index) => (
          <li key={index}>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                name={`q${id}`}
                className='form-radio'
                checked={answer.answer === opt}
                onChange={() => handleSelect(opt)}
              />
              {opt}
            </label>
          </li>
        ))}
      </ul>

      <button
        onClick={handleToggleFlag}
        className={`mt-3 px-3 py-1 rounded ${
          answer.isFlagged ? 'bg-yellow-500 text-white' : 'bg-gray-200'
        }`}
      >
        {answer.isFlagged ? 'Bỏ gắn cờ' : 'Gắn cờ'}
      </button>
    </div>
  );
};

export default QuestionItem;
