import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  LinearProgress,
  Rating,
  TextField,
  Divider,
} from "@mui/material";
import {
  EmojiEvents as EmojiEventsIcon,
  Celebration as CelebrationIcon,
  Share as ShareIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { LineChart, Line, XAxis, YAxis, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

// ================= MOCK DATA =================
interface IWeek {
  _id: string;
  no: number;
  accuracy_overall: number;
  estimated_score: number;
}
interface IUserLearningPath {
  user_fullname: string;
  target_score: number;
  started_at: string;
  target_completion_date: string;
  initial_score: number;
  final_estimated_score: number;
}

function fetchLearningSummary(): Promise<{ lp: IUserLearningPath; weeks: IWeek[] }> {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        lp: {
          user_fullname: "Nguyễn Minh Học",
          target_score: 600,
          started_at: "2025-09-01",
          target_completion_date: "2025-09-30",
          initial_score: 410,
          final_estimated_score: 615,
        },
        weeks: [
          { _id: "w1", no: 1, accuracy_overall: 72, estimated_score: 440 },
          { _id: "w2", no: 2, accuracy_overall: 78, estimated_score: 505 },
          { _id: "w3", no: 3, accuracy_overall: 83, estimated_score: 570 },
          { _id: "w4", no: 4, accuracy_overall: 87, estimated_score: 615 },
        ],
      });
    }, 600)
  );
}

// ================= MAIN COMPONENT =================
const LearningCompletion_v4_0: React.FC = () => {
  const [lp, setLp] = useState<IUserLearningPath | null>(null);
  const [weeks, setWeeks] = useState<IWeek[]>([]);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<number | null>(5);
  const [mentorQuote, setMentorQuote] = useState("");

  useEffect(() => {
    fetchLearningSummary().then((res) => {
      setLp(res.lp);
      setWeeks(res.weeks);
      setMentorQuote(buildQuote(res.lp));
      fireConfetti();
    });
  }, []);

  const buildQuote = (lp: IUserLearningPath) =>
    `Trong 4 tuần qua, bạn đã đi từ ${lp.initial_score} lên ${lp.final_estimated_score} điểm. 
Điều đó không đến từ may mắn, mà từ sự kiên trì mỗi ngày. 
Bạn đã chứng minh rằng chỉ cần đều đặn, mục tiêu nào cũng có thể đạt được.`;

  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#2563eb", "#60a5fa", "#facc15"],
    });
  };

  if (!lp)
    return (
      <Box className="flex h-screen items-center justify-center bg-slate-50 text-slate-600">
        Đang tải dữ liệu học tập...
      </Box>
    );

  const avgAcc =
    weeks.reduce((sum, w) => sum + w.accuracy_overall, 0) / weeks.length;

  return (
    <Box className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-800 pb-16">
      {/* ================= HEADER ================= */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white px-6 md:px-16 py-12 rounded-b-3xl shadow-lg"
      >
        <Box className="flex flex-col items-center text-center">
          <EmojiEventsIcon sx={{ fontSize: 60, color: "#fde68a" }} />
          <Typography variant="h4" className="font-bold mt-2">
            <CelebrationIcon sx={{ mr: 1 }} />
            Chúc mừng, {lp.user_fullname}!
          </Typography>
          <Typography className="text-slate-100 mt-2 max-w-2xl">
            Bạn đã hoàn thành lộ trình TOEIC {lp.target_score}+ với kết quả ấn tượng.
          </Typography>
          <Typography className="text-xs text-slate-200 mt-1">
            {new Date(lp.started_at).toLocaleDateString("vi-VN")} –{" "}
            {new Date(lp.target_completion_date).toLocaleDateString("vi-VN")}
          </Typography>
        </Box>
      </motion.div>

      {/* ================= PROGRESS ================= */}
      <Box className="mt-12 px-6 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border border-slate-100">
          <CardContent>
            <Typography className="text-slate-500 text-sm">
              Độ chính xác trung bình
            </Typography>
            <Typography variant="h4" className="font-bold mt-2 mb-2">
              {Math.round(avgAcc)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={avgAcc}
              className="h-2 rounded-full"
            />
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-slate-100">
          <CardContent>
            <Typography className="text-slate-500 text-sm">
              Điểm TOEIC tăng trưởng
            </Typography>
            <Typography variant="h4" className="font-bold mt-2">
              +{lp.final_estimated_score - lp.initial_score} điểm
            </Typography>
            <Typography className="text-xs text-slate-400 mt-1">
              {lp.initial_score} → {lp.final_estimated_score}
            </Typography>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-slate-100">
          <CardContent>
            <Typography className="text-slate-500 text-sm">
              Tổng thời gian học
            </Typography>
            <Typography variant="h4" className="font-bold mt-2">
              4 tuần
            </Typography>
            <Typography className="text-xs text-slate-400 mt-1">
              Trung bình 6 ngày/tuần, 90 phút/ngày
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* ================= CHART ================= */}
      <Box className="mt-10 px-6 md:px-16">
        <Card className="shadow-md border-none bg-gradient-to-br from-white to-slate-50">
          <CardContent>
            <Typography variant="h6" className="mb-4 font-semibold">
              Biểu đồ tiến bộ theo tuần
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeks}>
                <XAxis dataKey="no" label={{ value: "Tuần học", position: "insideBottomRight", dy: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="accuracy_overall"
                  stroke="#0284c7"
                  strokeWidth={3}
                  name="Độ chính xác (%)"
                  dot={{ r: 5, fill: "#0284c7" }}
                />
                <Line
                  type="monotone"
                  dataKey="estimated_score"
                  stroke="#facc15"
                  strokeWidth={3}
                  name="Điểm TOEIC ước tính"
                  dot={{ r: 5, fill: "#facc15" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* ================= MENTOR QUOTE ================= */}
      <Box className="mt-12 px-6 md:px-16">
        <Card className="shadow-md border-l-4 border-sky-500 bg-white">
          <CardContent>
            <Typography variant="h6" className="font-semibold text-sky-600 mb-2">
              💬 Thư từ TOEIC Master
            </Typography>
            <Typography className="whitespace-pre-line text-slate-700 leading-relaxed">
              {mentorQuote}
            </Typography>
            <Typography className="text-right italic text-slate-500 mt-2">
              — Đội ngũ TOEIC Master
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* ================= CERTIFICATE ================= */}
      <Box className="mt-12 px-6 md:px-16 flex justify-center">
        <Card className="shadow-md border border-sky-100 bg-gradient-to-b from-white to-sky-50 rounded-2xl text-center max-w-xl">
          <CardContent>
            <Avatar
              src="https://i.pravatar.cc/120"
              alt={lp.user_fullname}
              sx={{ width: 70, height: 70, margin: "0 auto 12px" }}
            />
            <Typography variant="h6" className="font-semibold text-sky-700">
              CHỨNG NHẬN HOÀN THÀNH
            </Typography>
            <Typography className="text-slate-700 mt-2">
              {lp.user_fullname} đã hoàn thành lộ trình TOEIC {lp.target_score}+ ngày{" "}
              {new Date(lp.target_completion_date).toLocaleDateString("vi-VN")}
            </Typography>
            <Box className="flex justify-center gap-3 mt-4 flex-wrap">
              <Button
                startIcon={<ShareIcon />}
                variant="contained"
                className="!rounded-xl"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Mình vừa hoàn thành TOEIC ${lp.target_score}+ trên TOEIC Master 🎉`
                  );
                  alert("Đã sao chép thông điệp chia sẻ 🎉");
                }}
              >
                Chia sẻ thành tích
              </Button>
              <Button
                endIcon={<ArrowForwardIcon />}
                variant="outlined"
                className="!rounded-xl"
                onClick={() => alert("Bắt đầu lộ trình TOEIC 700+ 🚀")}
              >
                Bắt đầu TOEIC 700+
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* ================= FEEDBACK ================= */}
      <Box className="mt-12 px-6 md:px-16 flex justify-center">
        <Card className="shadow-md border-none bg-white max-w-xl w-full">
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-2 text-sky-700">
              💭 Cảm nhận của bạn
            </Typography>
            <Rating
              value={rating}
              onChange={(_, v) => setRating(v)}
              className="mb-3"
            />
            <TextField
              multiline
              fullWidth
              minRows={3}
              placeholder="Chia sẻ cảm nhận sau khi hoàn thành khóa học..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <Button
              fullWidth
              variant="contained"
              className="!mt-3 !rounded-xl"
              onClick={() => alert("Cảm ơn bạn đã gửi phản hồi ❤️")}
            >
              Gửi phản hồi
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* ================= FOOTER ================= */}
      <Divider className="!mt-12" />
      <Typography className="text-xs text-center text-slate-400 mt-3">
        © {new Date().getFullYear()} TOEIC Master — Learning Completion v4.0
      </Typography>
    </Box>
  );
};

export default LearningCompletion_v4_0;
