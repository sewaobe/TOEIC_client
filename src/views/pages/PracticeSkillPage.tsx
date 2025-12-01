import { Box, Typography } from "@mui/material";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import QuizIcon from "@mui/icons-material/Quiz";
import BoltIcon from "@mui/icons-material/Bolt";
import MicIcon from "@mui/icons-material/Mic";
import PracticeLayout from "../layouts/PracticeLayout";
import PracticeCard from "../../components/practices/CardPractice";
import { useNavigate } from "react-router-dom";

export default function PracticeSkillPage() {
  const practiceModes = [
    {
      key: "dictation",
      title: "Dictation",
      subtitle: "Nghe và chép lại",
      icon: <HeadphonesIcon sx={{ fontSize: 40, color: "#2563eb" }} />,
      gradient: "linear-gradient(to right, #2563eb, #06b6d4)",
      description:
        "Luyện kỹ năng nghe hiểu và chính tả tiếng Anh qua từng câu ngắn.",
    },
    {
      key: "shadowing",
      title: "Shadowing",
      subtitle: "Nói theo người bản xứ",
      icon: <RecordVoiceOverIcon sx={{ fontSize: 40, color: "#10b981" }} />,
      gradient: "linear-gradient(to right, #10b981, #34d399)",
      description:
        "Cải thiện phát âm, ngữ điệu và phản xạ tiếng Anh bằng cách lặp lại theo audio.",
    },
    {
      key: "quiz",
      title: "Quiz Test",
      subtitle: "Kiểm tra nhanh các câu",
      icon: <QuizIcon sx={{ fontSize: 40, color: "#f59e0b" }} />,
      gradient: "linear-gradient(to right, #f59e0b, #fbbf24)",
      description:
        "Đánh giá nhanh trình độ qua bài kiểm tra ngắn mô phỏng TOEIC thật.",
    },
    {
      key: "challenge",
      title: "Challenge",
      subtitle: "Thử thách tốc độ cao",
      icon: <BoltIcon sx={{ fontSize: 40, color: "#ef4444" }} />,
      gradient: "linear-gradient(to right, #ef4444, #f87171)",
      description:
        "Chế độ dành cho người muốn thử giới hạn tốc độ và phản xạ nghe nói.",
    },
    {
      key: "definition_based",
      title: "Definition Based",
      subtitle: "Học từ vựng qua định nghĩa",
      icon: <QuizIcon sx={{ fontSize: 40, color: "#8b5cf6" }} />,
      gradient: "linear-gradient(to right, #8b5cf6, #a78bfa)",
      description:
        "Luyện kỹ năng từ vựng bằng cách đoán từ dựa trên định nghĩa tiếng Anh.",
    },
    {
      key: "speaking_conversation",
      title: "Short Conversation",
      subtitle: "Luyện nói tương tác theo tình huống",
      icon: <MicIcon sx={{ fontSize: 40, color: "#f97316" }} />, // Orange 500
      gradient: "linear-gradient(to right, #fb923c, #f97316)", // Orange 400 → Orange 500
      description:
        "Luyện phản xạ giao tiếp và phát âm qua hội thoại mô phỏng thực tế. Bạn sẽ trò chuyện với AI theo các tình huống đời sống và công việc.",
    }
  ];

  const navigate = useNavigate();

  return (
    <PracticeLayout>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={4}
        sx={{ overflowY: "auto" }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          mb={4}
          sx={{
            background: "linear-gradient(90deg, #06B6D4, #8B5CF6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Chọn chế độ luyện tập các kỹ năng TOEIC
        </Typography>

        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(260px, 1fr))"
          gap={3}
          width="100%"
          maxWidth="1000px"
        >
          {practiceModes.map((modeItem) => (
            <PracticeCard
              key={modeItem.key}
              title={modeItem.title}
              subtitle={modeItem.subtitle}
              description={modeItem.description}
              gradient={modeItem.gradient}
              icon={modeItem.icon}
              onClick={() => navigate(`/practice-skill/${modeItem.key}`)}
            />
          ))}
        </Box>
      </Box>
    </PracticeLayout>
  );
}
