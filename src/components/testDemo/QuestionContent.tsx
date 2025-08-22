import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../stores/store';
import QuestionItem from './QuestionItem';
import { questionsById } from '../../models/QuestionType';
import { setCurrentGroupIndex } from '../../stores/examSlice';

const QuestionContent: React.FC = () => {
  const dispatch = useDispatch();
  const { groups, currentGroupIndex } = useSelector((s: RootState) => s.exam);
  const group = groups[currentGroupIndex];

  if (!group) return <div>Không tìm thấy group</div>;

  const hasLeftPane = !!(group.passageHtml || group.imageUrl);

  const goPrev = () => {
    if (currentGroupIndex > 0) {
      dispatch(setCurrentGroupIndex(currentGroupIndex - 1));
    }
  };

  const goNext = () => {
    if (currentGroupIndex < groups.length - 1) {
      dispatch(setCurrentGroupIndex(currentGroupIndex + 1));
    }
  };

  return (
    <div className='flex flex-col flex-1'>
      {/* Navigation buttons: nằm ngoài toàn bộ layout */}
      <div className='flex justify-center gap-4 mb-4'>
        <button
          onClick={goPrev}
          disabled={currentGroupIndex === 0}
          className='px-4 py-2 rounded bg-gray-200 disabled:opacity-50'
        >
          ⬅ Câu trước
        </button>
        <button
          onClick={goNext}
          disabled={currentGroupIndex === groups.length - 1}
          className='px-4 py-2 rounded bg-blue-500 text-white disabled:opacity-50'
        >
          Câu tiếp ➡
        </button>
      </div>

      {/* Layout question + passage/image */}
      <div className='flex flex-col md:flex-row flex-1 bg-white border rounded-md overflow-hidden shadow-sm'>
        {/* Cột trái: passage / ảnh */}
        {hasLeftPane && (
          <div className='w-full md:w-1/2 border-b md:border-b-0 md:border-r p-6 overflow-auto'>
            {group.passageHtml && (
              <div
                className='prose max-w-none'
                dangerouslySetInnerHTML={{ __html: group.passageHtml }}
              />
            )}
            {group.imageUrl && (
              <img
                src={group.imageUrl}
                alt='Passage'
                className='mt-4 w-full rounded'
              />
            )}
          </div>
        )}

        {/* Cột phải: toàn bộ câu của group */}
        <div
          className={`w-full ${
            hasLeftPane ? 'md:w-1/2' : 'md:w-full'
          } p-6 overflow-y-auto flex flex-col gap-6`}
        >
          {group.questionIds.map((qid) => {
            const q = questionsById[qid] || {
              id: qid,
              text: 'Question text...',
              options: ['A. ...', 'B. ...', 'C. ...', 'D. ...'],
            };
            return (
              <QuestionItem
                key={q.id}
                id={q.id}
                text={q.text}
                options={q.options}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionContent;
