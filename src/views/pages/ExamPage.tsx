import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import Paper from '@mui/material/Paper';
import { styled, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import UserExamCard from '../../components/exams/UserExamCard';
import TestCard from '../../components/Home/TestCard';
import PaginationContainer from '../../components/PaginationContainer';
import { useNavigate } from 'react-router-dom';

const filtered = [
  {
    id: '1',
    title: 'TOEIC Full Test 2024',
    details: 'Đề thi TOEIC chuẩn quốc tế',
    score: 680,
  },
  {
    id: '2',
    title: 'TOEIC Mini Test 2023',
    details: 'Đề thi thử rút gọn',
    score: 720,
  },
  {
    id: '3',
    title: 'TOEIC Economy 2022',
    details: 'Đề thi Economy dễ luyện tập',
  },
  {
    id: '4',
    title: 'TOEIC Full Test 2023',
    details: 'Đề thi TOEIC chuẩn quốc tế',
    score: 700,
  },
  {
    id: '5',
    title: 'TOEIC Mini Test 2022',
    details: 'Đề thi thử rút gọn',
    score: 650,
  },
  {
    id: '6',
    title: 'TOEIC Economy 2021',
    details: 'Đề thi Economy luyện cơ bản',
    score: 600,
  },
  {
    id: '7',
    title: 'TOEIC Practice Test 2020',
    details: 'Đề luyện tập sát cấu trúc',
    score: 640,
  },
  {
    id: '8',
    title: 'TOEIC Official Test 2019',
    details: 'Đề thi thật từ ETS',
    score: 750,
  },
  {
    id: '9',
    title: 'TOEIC Full Test 2018',
    details: 'Đề thi TOEIC chuẩn quốc tế',
    score: 690,
  },
  {
    id: '10',
    title: 'TOEIC Mini Test 2017',
    details: 'Đề thi thử rút gọn',
    score: 710,
  },
  {
    id: '11',
    title: 'TOEIC Economy 2016',
    details: 'Đề thi Economy dễ luyện tập',
    score: 580,
  },
  {
    id: '12',
    title: 'TOEIC Practice Test 2015',
    details: 'Đề luyện tập tổng hợp',
    score: 630,
  },
];

const ExamPage = () => {
  const theme = useTheme();
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: (theme.vars ?? theme).palette.text.primary,
    ...theme.applyStyles('dark', {
      backgroundColor: '#1A2027',
    }),
    cursor: 'pointer',
    transition: 'all 0.3s ease',

    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      transform: 'scale(1.02)',
      boxShadow: theme.shadows[4],
    },
  }));

  const [searchValue, setSearchValue] = useState<string>('');
  return (
    <MainLayout>
      <Box className='w-full flex flex-col p-8 gap-4'>
        <Box className='w-full flex items-center justify-between'>
          <Box className='w-full flex flex-col gap-4'>
            {/* Tiêu đề */}
            <Typography
              variant='h2'
              // Sử dụng sx để kiểm soát font-size trực tiếp
              sx={{
                color: theme.palette.primary.main,
                fontSize: { xs: '3rem', md: '48px' }, // 3rem (~48px) trên mobile, 48px trên desktop
              }}
              className='font-bold mb-2'
            >
              Thư viện đề thi
            </Typography>

            {/* Search các năm */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, md: 4 }}
            >
              <Item>New economy</Item>
              <Item>2024</Item>
              <Item>2023</Item>
              <Item>2022</Item>
              <Item>2021</Item>
            </Stack>

            {/* Search theo giá trị input */}
            <TextField
              placeholder='Tìm kiếm...'
              variant='outlined'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              size='small'
              className='w-2/3'
              sx={{ backgroundColor: theme.palette.background.paper }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            {/* Button tìm kiếm */}
            <Button
              variant='contained'
              color='primary'
              className='rounded-full flex items-center gap-2 w-28'
            >
              Tìm kiếm
            </Button>
          </Box>
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
        {/* Kết quả tìm kiếm */}
        <Box className='mt-8 w-full'>
          <Typography
            variant='h5'
            className='!mb-4 font-extrabold underline'
            sx={{ color: theme.palette.text.primary }}
          >
            Kết quả tìm kiếm
          </Typography>

          {filtered.length === 0 ? (
            <Typography variant='body1' color='text.secondary'>
              Không tìm thấy kết quả phù hợp.
            </Typography>
          ) : (
            <PaginationContainer
              items={filtered}
              itemsPerPage={6}
              renderItem={(t) => (
                <TestCard
                  key={t.id}
                  id={t.id}
                  title={t.title}
                  details={t.details}
                  score={t.score}
                />
              )}
            />
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default ExamPage;
