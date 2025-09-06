import React, { useReducer, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import Header from "../../components/examDetail/Header";
import PracticeTab from "../../components/examDetail/PracticeTab";
import Comments from "../../components/examDetail/Comments";
import FullTestTab from "../../components/examDetail/FullTestTab";
import Tabs from "../../components/examDetail/Tabs";
import UserExamCard from "../../components/exams/UserExamCard";
import testService from "../../services/test.service";
import { examParts } from "../../constants/examParts"; // ✅ import mảng parts đã tách riêng
// import { Part } from "../../types/examDetail";

// --------- Kiểu state tổng ---------
interface State {
  selectedParts: string[];
  timeLimit: string;
  activeTab: "practice" | "full";
  loading: boolean;
  test: any;
  page: number;
}

type Action =
  | { type: "TOGGLE_PART"; payload: string }
  | { type: "SET_TIME_LIMIT"; payload: string }
  | { type: "SET_ACTIVE_TAB"; payload: "practice" | "full" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_TEST"; payload: any }
  | { type: "SET_PAGE"; payload: number };

// --------- Reducer ---------
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "TOGGLE_PART":
      return {
        ...state,
        selectedParts: state.selectedParts.includes(action.payload)
          ? state.selectedParts.filter((p) => p !== action.payload)
          : [...state.selectedParts, action.payload],
      };
    case "SET_TIME_LIMIT":
      return { ...state, timeLimit: action.payload };
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_TEST":
      return { ...state, test: action.payload };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    default:
      return state;
  }
};

const initialState: State = {
  selectedParts: [],
  timeLimit: "",
  activeTab: "practice",
  loading: true,
  test: null,
  page: 1,
};

const ExamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const commentRef = useRef<HTMLDivElement | null>(null);

  const [state, dispatch] = useReducer(reducer, initialState);
  const { selectedParts, timeLimit, activeTab, loading, test, page } = state;
  const limit = 5;

  // --------- Fetch test detail ---------
  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const res = await testService.getTestDetail(id, page, limit);
        dispatch({ type: "SET_TEST", payload: res });
      } catch (err) {
        console.error("Lỗi load test detail", err);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };
    fetchDetail();
  }, [id, page]);

  // --------- Handlers ---------
  const handlePractice = () => {
    if (!selectedParts.length) {
      alert("Vui lòng chọn ít nhất 1 phần để luyện tập");
      return;
    }

    const partNumbers = selectedParts.map((p) => {
      const match = p.match(/\d+/);
      return match ? match[0] : p;
    });

    alert(
      "Bạn đã chọn part: " +
        partNumbers.join(",") +
        " | Giới hạn: " +
        (timeLimit || "No limit")
    );

    const params = new URLSearchParams();
    if (test?._id) params.append("testId", test._id);

    if (partNumbers.length < 7) {
      params.append("parts", partNumbers.join(","));
    }
    if (timeLimit) params.append("timeLimit", timeLimit);

    navigate(`/overview-test?${params.toString()}`);
  };

  const handleFullTest = () => { 
    navigate(`/overview-test?testId=${id}`);
  };

  const handleScrollToComments = () => {
    if (commentRef.current) {
      commentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // --------- Render ---------
  if (loading) return <CircularProgress />;
  if (!test) return <Typography>Không tìm thấy đề thi</Typography>;

  return (
    <MainLayout>
      <Box className="w-full flex flex-col p-8 gap-4">
        <Box className="w-full flex justify-between">
          <div className="w-full bg-gray-50 min-h-screen px-4 font-inter">
            {/* Card Nội dung chính */}
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6">
              <Header />

              <h1 className="text-2xl font-bold mb-2 font-montserrat">
                {test.title}
              </h1>
              <div className="text-gray-600 mb-4">
                <p>
                  ⏱ Thời gian làm: 120 phút | 7 phần | 200 câu hỏi |{" "}
                  {test.totalComments} bình luận
                </p>
                <p>👥 {test.totalUsers} người đã luyện đề này</p>
                <p>
                  ⭐ Điểm cao nhất bạn đạt được:{" "}
                  {test.highestScore !== null ? test.highestScore : "Chưa có"}
                </p>
              </div>

              <Tabs
                activeTab={activeTab}
                setActiveTab={(tab) =>
                  dispatch({ type: "SET_ACTIVE_TAB", payload: tab })
                }
                onDiscussionClick={handleScrollToComments}
              />

              {activeTab === "practice" && (
                <PracticeTab
                  parts={examParts} // ✅ dùng dữ liệu import
                  selectedParts={selectedParts}
                  togglePart={(label) =>
                    dispatch({ type: "TOGGLE_PART", payload: label })
                  }
                  timeLimit={timeLimit}
                  setTimeLimit={(val) =>
                    dispatch({ type: "SET_TIME_LIMIT", payload: val })
                  }
                  onPractice={handlePractice}
                />
              )}

              {activeTab === "full" && (
                <FullTestTab onClickFullTest={handleFullTest} />
              )}
            </div>

            {/* Card Comment */}
            <div
              ref={commentRef}
              className="max-w-4xl mx-auto bg-white shadow-md rounded-xl  mt-6"
            >
              <Comments testId={test._id} />
            </div>
          </div>

          <div className="basis-1/3">
            <UserExamCard
              userId="22110285"
              examDate="30/08/2025"
              daysLeft={2}
              targetScore={700}
              onEditDate={() => console.log("Edit date")}
              onViewStats={() => console.log("View stats")}
            />
          </div>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default ExamDetailPage;
