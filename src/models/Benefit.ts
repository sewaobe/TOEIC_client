import feature1 from '../assets/feature1.webp';
import feature2 from '../assets/feature2.webp';
import feature3 from '../assets/feature3.webp';
import feature4 from '../assets/feature4.webp';
import feature5 from '../assets/feature5.webp';
export interface Benefit {
  id: number;
  image: string; // kiểu component
  title: string;
  description: string;
}

export const benefits: Benefit[] = [
  {
    id: 1,
    image: feature1,
    title: 'Nội dung luyện tập chất lượng',
    description:
      'Học sâu, nhớ lâu: Luyện tập với kho bài tập và từ vựng phong phú, được giải thích cặn kẽ. Nắm vững kiến thức nền tảng thay vì học vẹt.',
  },
  {
    id: 2,
    image: feature2,
    title: 'Mô phỏng đề thi thật',
    description:
      'Tự tin bước vào phòng thi: Trải nghiệm áp lực thời gian và cấu trúc đề thi y hệt thực tế. Xây dựng chiến thuật làm bài vững chắc, xóa tan mọi sự bỡ ngỡ.',
  },
  {
    id: 3,
    image: feature3,
    title: 'Cá nhân hóa người dùng',
    description:
      'Lộ trình dành riêng cho bạn: Không lãng phí thời gian vào những kiến thức đã vững. Hệ thống tập trung chính xác vào điểm yếu của bạn để bứt phá điểm số nhanh nhất.',
  },
  {
    id: 4,
    image: feature4,
    title: 'Hệ thống ứng dụng thông minh',
    description:
      'Không bao giờ học một mình: Luôn có đội ngũ chuyên gia và cộng đồng sẵn sàng giải đáp mọi thắc mắc. Giữ vững động lực và không bao giờ bị bế tắc.',
  },
  {
    id: 5,
    image: feature5,
    title: 'Hỗ trợ nhanh chóng',
    description:
      'Người dùng có thể liên hệ trực tiếp với đội ngũ hỗ trợ qua nút tin nhắn ở góc phải màn hình.',
  },
];
