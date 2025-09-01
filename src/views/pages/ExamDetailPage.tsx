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
        { name: '#[Part 1] Tranh tả người', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 1] Tranh tả vật', color: 'bg-[#EEEEEE] text-gray-800' },
      ],
    },
    {
      label: 'Part 2 (25 câu hỏi)',
      tags: [
        { name: '#[Part 2] Câu hỏi WHAT', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 2] Câu hỏi WHO', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 2] Câu hỏi WHERE', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 2] Câu hỏi WHEN', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 2] Câu hỏi HOW', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 2] Câu hỏi WHY', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 2] Câu hỏi YES/NO', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 2] Câu hỏi đuôi', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 2] Câu hỏi lựa chọn', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 2] Câu yêu cầu, đề nghị', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 2] Câu trần thuật', color: 'bg-[#EEEEEE] text-gray-800' },
      ],
    },
    {
      label: 'Part 3 (39 câu hỏi)',
      tags: [
        { name: '#[Part 3] Câu hỏi về chủ đề, mục đích', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 3] Câu hỏi về danh tính người nói', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 3] Câu hỏi về chi tiết cuộc hội thoại', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 3] Câu hỏi về hành động tương lai', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 3] Câu hỏi kết hợp bảng biểu', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 3] Câu hỏi về hàm ý câu nói', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 3] Chủ đề: Company - General Office Work', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 3] Chủ đề: Company - Personnel', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 3] Chủ đề: Company - Event, Project', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 3] Chủ đề: Company - Facility', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 3] Chủ đề: Shopping, Service', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 3] Chủ đề: Order, delivery', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 3] Chủ đề: Transportation', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 3] Câu hỏi về yêu cầu, gợi ý', color: 'bg-[#EEEEEE] text-gray-800' },
      ],
    },
    {
      label: 'Part 4 (30 câu hỏi)',
      tags: [
        { name: '#[Part 4] Câu hỏi về chủ đề, mục đích', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 4] Câu hỏi về danh tính, địa điểm', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 4] Câu hỏi về chi tiết', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 4] Câu hỏi về hành động tương lai', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 4] Câu hỏi kết hợp bảng biểu', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 4] Câu hỏi về hàm ý câu nói', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 4] Dạng bài: Telephone message - Tin nhắn thoại', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 4] Dạng bài: Announcement - Thông báo', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 4] Dạng bài: News report, Broadcast - Bản tin', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 4] Dạng bài: Talk - Bài phát biểu, diễn văn', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 4] Dạng bài: Excerpt from a meeting - Trích dẫn từ buổi họp', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 4] Câu hỏi yêu cầu, gợi ý', color: 'bg-[#EEEEEE] text-gray-800' },
      ],
    },
    {
      label: 'Part 5 (30 câu hỏi)',
      tags: [
        { name: '#[Part 5] Câu hỏi từ loại', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 5] Câu hỏi ngữ pháp', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 5] Câu hỏi từ vựng', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Danh từ', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Đại từ', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Tính từ', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Thì', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Trạng từ', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Động từ nguyên mẫu có to', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Giới từ', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Liên từ', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Mệnh đề quan hệ', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Cấu trúc so sánh', color: 'bg-[#EEEEEE] text-gray-800' },
      ],
    },
    {
      label: 'Part 6 (16 câu hỏi)',
      tags: [
        { name: '[Grammar] Danh từ', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Tính từ', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Thì', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Thể', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Phân từ và Cấu trúc phân từ', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Giới từ', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '[Grammar] Liên từ', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 6] Câu hỏi từ loại', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 6] Câu hỏi ngữ pháp', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 6] Câu hỏi từ vựng', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 6] Câu hỏi điền câu vào đoạn văn', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 6] Hình thức: Thư điện tử/ thư tay (Email/ Letter)', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 6] Hình thức: Thông báo/ văn bản hướng dẫn (Notice/ Announcement Information)', color: 'bg-[#EEEEEE] text-gray-800' },
      ],
    },
    {
      label: 'Part 7 (54 câu hỏi)',
      tags: [
        { name: '#[Part 7] Câu hỏi tìm thông tin', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 7] Câu hỏi tìm chi tiết sai', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 7] Câu hỏi về chủ đề, mục đích', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 7] Câu hỏi suy luận', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 7] Câu hỏi điền câu', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 7] Cấu trúc: một đoạn', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 7] Cấu trúc: nhiều đoạn', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 7] Dạng bài: Email/ Letter: Thư điện tử/ Thư tay', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 7] Dạng bài: Form - Đơn từ, biểu mẫu', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 7] Dạng bài: Article/ Review: Bài báo/ Bài đánh giá', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 7] Dạng bài: Advertisement - Quảng cáo', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 7] Dạng bài: Announcement: Thông báo', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 7] Dạng bài: Text message chain - Chuỗi tin nhắn', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 7] Câu hỏi tìm từ đồng nghĩa', color: 'bg-[#EEEEEE] text-gray-800' },
        { name: '#[Part 7] Câu hỏi về hàm ý câu nói', color: 'bg-[#EEEEEE] text-gray-800' },
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
