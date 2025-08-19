import { SvgIconComponent } from '@mui/icons-material';
import MicIcon from '@mui/icons-material/Mic';
import QuizIcon from '@mui/icons-material/Quiz';
import BookIcon from '@mui/icons-material/Book';
import HeadsetIcon from '@mui/icons-material/Headset';

export interface Feature {
  id: number;
  icon: SvgIconComponent;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    id: 1,
    icon: MicIcon,
    title: 'Luyện nghe',
    description: 'Nghe hiểu các đoạn hội thoại, bài nói TOEIC thực tế.',
  },
  {
    id: 2,
    icon: QuizIcon,
    title: 'Bài tập thực hành',
    description: 'Hệ thống bài tập đa dạng giúp ghi nhớ từ vựng.',
  },
  {
    id: 3,
    icon: BookIcon,
    title: 'Tài liệu chất lượng',
    description: 'Sách và đề thi chính thống cập nhật mới nhất.',
  },
  {
    id: 4,
    icon: HeadsetIcon,
    title: 'Hỗ trợ trực tuyến',
    description: 'Tư vấn, giải đáp thắc mắc nhanh chóng qua chat.',
  },
];
