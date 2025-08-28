import React, { useState, useRef } from 'react';
import { Part } from '../../types/examDetail';
import Header from '../../components/examDetail/Header';
import PracticeTab from '../../components/examDetail/PracticeTab';
import Comments from '../../components/examDetail/Comments';
import FullTestTab from '../../components/examDetail/FullTestTab';
import Tabs from '../../components/examDetail/Tabs';
import MainLayout from '../layouts/MainLayout';
import { Box, Button, Typography } from '@mui/material';
import UserExamCard from '../../components/exams/UserExamCard';

const ExamDetailPage: React.FC = () => {
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'practice' | 'full'>('practice');

  const commentRef = useRef<HTMLDivElement | null>(null);

  const togglePart = (label: string) => {
    setSelectedParts((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  const handlePractice = () => {
    alert(
      'Bạn đã chọn: ' +
        selectedParts.join(', ') +
        ' | Giới hạn: ' +
        (timeLimit || 'No limit'),
    );
  };

  const parts: Part[] = [
    {
      label: 'Part 1 (6 câu hỏi)',
      tags: [
        { name: 'Photo A', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: 'Photo B', color: 'bg-[#EEEEEE] text-gray-800' },
      ],
    },
    {
      label: 'Part 2 (25 câu hỏi)',
      tags: [
        { name: 'Short Q', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: 'Dialogue', color: 'bg-[#EEEEEE] text-gray-800' },
      ],
    },
    {
      label: 'Part 3 (39 câu hỏi)',
      tags: [
        { name: 'Conversation', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: 'Discussion', color: 'bg-[#EEEEEE] text-gray-800' },
      ],
    },
    {
      label: 'Part 4 (30 câu hỏi)',
      tags: [
        { name: 'Talks', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: 'Lecture', color: 'bg-[#EEEEEE] text-gray-800' },
      ],
    },
    {
      label: 'Part 5 (30 câu hỏi)',
      tags: [
        { name: 'Talks', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: 'Lecture', color: 'bg-[#EEEEEE] text-gray-800' },
      ],
    },
    {
      label: 'Part 6 (16 câu hỏi)',
      tags: [
        { name: 'Talks', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: 'Lecture', color: 'bg-[#EEEEEE] text-gray-800' },
      ],
    },
    {
      label: 'Part 7 (54 câu hỏi)',
      tags: [
        { name: 'Talks', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: 'Lecture', color: 'bg-[#EEEEEE] text-gray-800' },
      ],
    },
  ];

  const handleScrollToComments = () => {
    if (commentRef.current) {
      commentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <MainLayout>
      <Box className='w-full flex flex-col p-8 gap-4'>
        <Box className='w-full flex justify-between'>
          <div className='w-full bg-gray-50 min-h-screen px-4 font-inter'>
            {/* Card Nội dung chính */}
            <div className='max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6'>
              <Header />

              <h1 className='text-2xl font-bold mb-2 font-montserrat'>
                New Economy TOEIC Test 1
              </h1>
              <div className='text-gray-600 mb-4'>
                <p>
                  ⏱ Thời gian làm: 120 phút | 7 phần | 200 câu hỏi | 3268 bình
                  luận
                </p>
                <p>👥 24.072 người đã luyện đề này</p>
              </div>

              <Tabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onDiscussionClick={handleScrollToComments}
              />

              {activeTab === 'practice' && (
                <PracticeTab
                  parts={parts}
                  selectedParts={selectedParts}
                  togglePart={togglePart}
                  timeLimit={timeLimit}
                  setTimeLimit={setTimeLimit}
                  onPractice={handlePractice}
                />
              )}

              {activeTab === 'full' && <FullTestTab />}
            </div>

            {/* Card Comment */}
            <div
              ref={commentRef}
              className='max-w-4xl mx-auto bg-white shadow-md rounded-xl  mt-6'
            >
              <Comments />
            </div>
          </div>
          <div className='basis-1/3'>
            <UserExamCard
              userId='22110285'
              examDate='30/08/2025'
              daysLeft={2}
              targetScore={700}
              onEditDate={() => console.log('Edit date')}
              onViewStats={() => console.log('View stats')}
            />
          </div>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default ExamDetailPage;
