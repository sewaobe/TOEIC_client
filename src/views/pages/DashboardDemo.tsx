// src/pages/DashboardDemo.tsx
import * as React from "react";
import {
  Box,
  Button,
  Modal,
  Typography,
  CircularProgress,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import DashboardLearningPath from "./DashboardLearningPath";
import learningPathService from "../../services/learningPath.service";
// NOTE: Ẩn tính năng chọn phương pháp tạm thời để đơn giản hoá flow tạo lộ trình.
// Khi cần bật lại, bỏ comment import bên dưới và khối Modal 2 ở cuối file.
// import {
//   LEARNING_METHOD_GROUPS,
//   type Method,
//   type MethodDetails,
// } from "../../constants/learningMethods";
import axiosClient from "../../services/axiosClient";

/* LocalStorage keys (để gom plan khi xác nhận) */
// const LS_KEY = "toeic_plan_draft";
// const LS_PLACEMENT_KEY = "toeic_placement_result";

/* ============== Card phương pháp + View chi tiết (TẠM ẨN) ==============
   Toàn bộ block MethodCard và MethodDetailsView được comment để tạm thời ẩn
   tính năng chọn phương pháp học. Khi muốn bật lại:
   - Mở comment import learningMethods phía trên
   - Mở comment block Modal 2 ở dưới cùng file
   - Giữ nguyên 2 component này (copy lại từ git history hoặc bỏ comment)
*/

/* ============== Main ============== */
export default function DashboardDemo() {
  const [loading, setLoading] = React.useState(true);
  const [hasPlan, setHasPlan] = React.useState(false);
  const [plan, setPlan] = React.useState<any | null>(null);

  // Modal 1: báo chưa có lộ trình
  const [open, setOpen] = React.useState(false);
  // NOTE: Các state dưới đây thuộc tính năng chọn phương pháp – tạm thời ẩn.
  // Khi cần bật lại, bỏ comment các state và UI block Modal 2 tương ứng.
  // const [chooseMethod, setChooseMethod] = React.useState(false);
  // const [infoMethod, setInfoMethod] = React.useState<Method | null>(null);
  // const [blockedToast, setBlockedToast] = React.useState(false);
  // const [confirmExit, setConfirmExit] = React.useState(false);
  // const [selected, setSelected] = React.useState<Set<string>>(new Set());
  // const toggleMethod = (key: string) =>
  //   setSelected((prev) => {
  //     const next = new Set(prev);
  //     next.has(key) ? next.delete(key) : next.add(key);
  //     return next;
  //   });

  React.useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await learningPathService.getUserLearningPath();
        console.log("res", res);
        if (res) {
          setPlan(res);
          setHasPlan(true);
        } else {
          setOpen(true);
        }
      } catch {
        setOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  const handleConfirm = async () => {
    // TẠM THỜI: Bỏ qua bước chọn phương pháp và gọi trực tiếp Gemini để lấy khung lộ trình
    // DỮ LIỆU ĐẦU VÀO: lấy "thực tế" từ localStorage (wizard) nếu có, và tính toán an toàn
    try {
      // 1) Lấy dữ liệu từ localStorage (đã lưu ở các step wizard)
      const planStart = JSON.parse(
        localStorage.getItem("plan_start") || "null"
      );
      const planEnd = JSON.parse(localStorage.getItem("plan_end") || "null");
      const targetScore = JSON.parse(
        localStorage.getItem("score_target_plan") || "null"
      );
      const weeklyTotals: number[] = JSON.parse(
        localStorage.getItem("weekly_totals") || "[]"
      ); // minutes per week
      const weeklyDays = JSON.parse(
        localStorage.getItem("weekly_days") || "{}"
      ); // per-day minutes map

      // 2) Tính weekly_study_hours & study_days_per_week từ bản phân bổ tuần/ngày
      const avgWeeklyMinutes = weeklyTotals.length
        ? Math.round(
            weeklyTotals.reduce((a, b) => a + b, 0) / weeklyTotals.length
          )
        : 21 * 60; // fallback 21h/tuần
      const weekly_study_hours = Math.max(1, Math.round(avgWeeklyMinutes / 60));

      const firstWeekPlan = weeklyDays?.["0"] || {};
      const study_days_per_week =
        Object.values(firstWeekPlan).filter(
          (m: any) => (typeof m === "number" ? m : 0) > 0
        ).length || 6;

      // 3) Lấy điểm hiện tại và accuracy nếu có (ưu tiên local last_test_result/demo_test_result)
      // Các key mới: 'last_test_result' (lưu bởi TestHeader) chứa { score, parts: [{ part_name, accuracy }], ... }
      let current_score = 400;
      let current_accuracy = {
        part1: 72,
        part2: 65,
        part3: 58,
        part4: 55,
        part5: 68,
        part6: 60,
        part7: 56,
      } as Record<string, number>;

      try {
        const lastRaw = localStorage.getItem("last_test_result");
        const demoRaw = localStorage.getItem("demo_test_result");
        const placementRaw =
          lastRaw || demoRaw || localStorage.getItem("toeic_placement_result");

        if (placementRaw) {
          const placement = JSON.parse(placementRaw);
          if (typeof placement?.score === "number")
            current_score = placement.score;

          if (Array.isArray(placement?.parts)) {
            const acc: Record<string, number> = {};
            placement.parts.forEach((p: any) => {
              // support both { part_name: 'Part 1' } and { name: 'Part 1' }
              const name = p?.part_name ?? p?.name ?? "";
              const match = String(name).match(/(\d+)/);
              const key = match ? `part${match[1]}` : undefined;
              if (key && typeof p?.accuracy === "number") {
                // If accuracy is in [0,1] (fraction), convert to percent; else assume percent already
                const rawAcc = p.accuracy;
                const percent = rawAcc <= 1 ? rawAcc * 100 : rawAcc;
                acc[key] = Math.round(percent);
              }
            });
            // Nếu có ít nhất 3 parts thì merge vào current_accuracy
            if (Object.keys(acc).length >= 3)
              current_accuracy = { ...current_accuracy, ...acc } as any;
          }
        }
      } catch (e) {
        console.warn(
          "Không parse được placement từ localStorage, dùng mặc định demo.",
          e
        );
      }

      // 4) Xây payload gọi Gemini theo spec bạn cung cấp
      const body = {
        current_score,
        current_accuracy,
        target_score: typeof targetScore === "number" ? targetScore : 600,
        start_date: typeof planStart === "string" ? planStart : "2025-01-01",
        deadline: typeof planEnd === "string" ? planEnd : "2025-04-30",
        weekly_study_hours,
        study_days_per_week,
        learning_methods: {
          video: "Ngữ pháp, lý thuyết, chiến lược",
          flashcard: "Từ vựng, collocation",
          dictation: "Nghe - chép chính tả",
          shadowing: "Bắt chước phát âm, ngữ điệu người bản xứ",
          quiz: "Trắc nghiệm ngắn ôn từ và cấu trúc",
          mini_test: "Làm đề TOEIC ngắn, đánh giá phản xạ",
        },
      };

      console.log("GEMINI_INPUT_BODY", body);
      const res = await axiosClient.post("/gemini/generate-toeic-plan", body);
      console.log("GEMINI_PLAN_RESULT", res);

      // Tuỳ ý: sau này có thể lưu plan vào server hoặc state để hiển thị ngay
      // setPlan(res?.data ?? res);
      // setHasPlan(true);
      // setOpen(false);
    } catch (err) {
      console.error("Gọi Gemini tạo lộ trình thất bại:", err);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (hasPlan && plan) return <DashboardLearningPath plan={plan} />;

  return (
    <MainLayout>
      {/* Modal 1: chưa có lộ trình */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Bạn chưa có lộ trình học
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Hãy tạo lộ trình trước khi bắt đầu học.
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              // TẠM THỜI: Gọi trực tiếp handleConfirm để tạo lộ trình qua Gemini.
              // Khi bật lại chọn phương pháp, đổi thành setChooseMethod(true)
              handleConfirm();
            }}
          >
            Tạo lộ trình ngay
          </Button>
        </Box>
      </Modal>

      {/* Modal 2: chọn phương pháp – TẠM THỜI ẨN
          Để bật lại, bỏ comment toàn bộ block dưới cùng và khối import + state bên trên. */}
      {/**
      <Modal
        open={chooseMethod}
        onClose={(_, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            setBlockedToast(true);
            return;
          }
          setChooseMethod(false);
        }}
      >
        <Box ...> ... (UI chọn phương pháp học) ... </Box>
      </Modal>
      */}

      {/* Snackbar cảnh báo – thuộc flow chọn phương pháp (TẠM ẨN) */}
      {/**
      <Snackbar ...> ... </Snackbar>
      */}

      {/* Dialog xác nhận – thuộc flow chọn phương pháp (TẠM ẨN) */}
      {/**
      <Dialog ...> ... </Dialog>
      */}

      {/* Modal ℹ️ chi tiết – thuộc flow chọn phương pháp (TẠM ẨN) */}
      {/**
      <Modal ...> ... </Modal>
      */}
    </MainLayout>
  );
}
