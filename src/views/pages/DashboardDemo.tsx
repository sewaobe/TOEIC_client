// src/pages/DashboardDemo.tsx
import * as React from "react";
import {
  Box,
  Button,
  Modal,
  Typography,
  CircularProgress,
  Stack,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MainLayout from "../layouts/MainLayout";
import DashboardLearningPath from "./DashboardLearningPath";
import learningPathService from "../../services/learningPath.service";
import {
  LEARNING_METHOD_GROUPS,
  type Method,
  type MethodDetails,
} from "../../constants/learningMethods";

/* LocalStorage keys (để gom plan khi xác nhận) */
const LS_KEY = "toeic_plan_draft";
const LS_PLACEMENT_KEY = "toeic_placement_result";

/* ============== Card phương pháp ============== */
function MethodCard({
  method,
  selected,
  onToggle,
  onInfo,
}: {
  method: Method;
  selected: boolean;
  onToggle: () => void;
  onInfo: () => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: selected ? "primary.main" : "rgba(0,0,0,0.12)",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        height: "100%",
        cursor: "pointer",
        transition: "all .15s ease",
        "&:hover": {
          boxShadow: "0 6px 18px rgba(0,0,0,.08)",
          transform: "translateY(-1px)",
        },
      }}
      onClick={onToggle}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle1" fontWeight={800}>
          {method.title}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // tránh toggle khi mở info
            onInfo();
          }}
        >
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Typography variant="body2" color="text.secondary">
        {method.shortDesc}
      </Typography>
    </Paper>
  );
}

/* ============== View chi tiết trong modal ℹ️ ============== */
function MethodDetailsView({ details }: { details: MethodDetails }) {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Giải thích
      </Typography>
      <Typography variant="body2" gutterBottom>
        {details.explain}
      </Typography>

      <Typography
        variant="subtitle2"
        fontWeight={700}
        gutterBottom
        sx={{ mt: 2 }}
      >
        Áp dụng TOEIC
      </Typography>
      <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
        {details.apply.map((item, i) => (
          <li key={i}>
            <Typography variant="body2">{item}</Typography>
          </li>
        ))}
      </ul>
    </Box>
  );
}

/* ============== Main ============== */
export default function DashboardDemo() {
  const [loading, setLoading] = React.useState(true);
  const [hasPlan, setHasPlan] = React.useState(false);

  // Modal 1: báo chưa có lộ trình
  const [open, setOpen] = React.useState(false);
  // Modal 2: chọn phương pháp
  const [chooseMethod, setChooseMethod] = React.useState(false);
  // Modal ℹ️ chi tiết
  const [infoMethod, setInfoMethod] = React.useState<Method | null>(null);

  // Cảnh báo khi người dùng bấm ra ngoài/Esc
  const [blockedToast, setBlockedToast] = React.useState(false);
  // Dialog xác nhận khi bấm "Hủy"
  const [confirmExit, setConfirmExit] = React.useState(false);

  // Phương pháp đã chọn
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const toggleMethod = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  React.useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await learningPathService.getUserLearningPath();
        if (res?.success && res?.data) {
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
    // 1) Gom phương pháp đã chọn
    const methods = Array.from(selected);

    // 2) Lấy draft plan + placement từ localStorage
    let draft: any = {};
    let placement: any = null;

    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) draft = JSON.parse(raw);
    } catch (err) {
      console.warn("Parse draft plan failed:", err);
    }

    try {
      const rawP = localStorage.getItem(LS_PLACEMENT_KEY);
      if (rawP) placement = JSON.parse(rawP);
    } catch (err) {
      console.warn("Parse placement result failed:", err);
    }

    // 3) Chuẩn payload gửi về BE
    const payload = {
      methods, // mảng key phương pháp
      targetScore: draft?.targetScore ?? null,
      endDate: draft?.endDate ?? null,
      weeklyTotals: draft?.weeklyTotals ?? [],
      weeklyPlan: draft?.weeklyPlan ?? null, // { Mon, Tue, ... }
      placement: placement ?? null, // optional
    };

    // Debug log
    console.log("CREATE_LEARNING_PATH_PAYLOAD:", payload);

    // 4) TODO: gọi API tạo lộ trình (giữ comment để test trước)
    try {
      const res = await learningPathService.createUserLearningPath(payload);
      if (res.success) {
        setHasPlan(true);
        setChooseMethod(false);
      }
    } catch (err) {
      console.error("Create learning path failed:", err);
    }

    // 5) Tạm set state để flow UI tiếp tục (sau này bỏ khi gọi API thật)
    // setChooseMethod(false);
    // setHasPlan(true);
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

  if (hasPlan) return <DashboardLearningPath />;

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
              setOpen(false);
              setChooseMethod(true);
            }}
          >
            Tạo lộ trình ngay
          </Button>
        </Box>
      </Modal>

      {/* Modal 2: chọn phương pháp */}
      <Modal
        open={chooseMethod}
        onClose={(_, reason) => {
          // Chặn đóng bằng backdrop/Esc, hiển thị cảnh báo
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            setBlockedToast(true);
            return;
          }
          setChooseMethod(false);
        }}
      >
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
            minWidth: 760,
            maxWidth: "85vw",
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Cá nhân hoá lộ trình học
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Chọn các phương pháp phù hợp. Bấm ℹ️ để xem chi tiết.
          </Typography>

          <Stack spacing={3.5}>
            {LEARNING_METHOD_GROUPS.map((group) => (
              <Box key={group.name}>
                <Typography variant="subtitle1" fontWeight={900}>
                  {group.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Bao gồm: {group.includes}
                </Typography>

                {/* 2 cột bằng CSS Grid (tránh MUI Grid để không dính typings) */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  {group.methods.map((method) => (
                    <MethodCard
                      key={method.key}
                      method={method}
                      selected={selected.has(method.key)}
                      onToggle={() => toggleMethod(method.key)}
                      onInfo={() => setInfoMethod(method)}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Stack>

          <Box mt={3} textAlign="right">
            <Button onClick={() => setConfirmExit(true)}>Hủy</Button>
            <Button
              variant="contained"
              sx={{ ml: 1 }}
              onClick={handleConfirm}
              disabled={selected.size === 0}
            >
              Xác nhận ({selected.size})
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar cảnh báo khi bấm ra ngoài / nhấn Esc */}
      <Snackbar
        open={blockedToast}
        autoHideDuration={2600}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setBlockedToast(false);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setBlockedToast(false)}
          severity="info"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Bạn chưa xác nhận lựa chọn. Vui lòng dùng nút “Xác nhận” hoặc “Hủy”.
        </Alert>
      </Snackbar>

      {/* Dialog xác nhận khi bấm Hủy */}
      <Dialog open={confirmExit} onClose={() => setConfirmExit(false)}>
        <DialogTitle>Xác nhận đóng</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Bạn chưa xác nhận lựa chọn phương pháp. Bạn có chắc muốn đóng không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmExit(false)}>Tiếp tục chọn</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setConfirmExit(false);
              setChooseMethod(false);
              // Nếu muốn xoá lựa chọn khi đóng, bật dòng dưới:
              // setSelected(new Set());
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal ℹ️ chi tiết */}
      <Modal open={!!infoMethod} onClose={() => setInfoMethod(null)}>
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
            minWidth: 520,
            maxWidth: "70vw",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {infoMethod && (
            <>
              <Typography variant="h6" gutterBottom>
                {infoMethod.title}
              </Typography>
              <MethodDetailsView details={infoMethod.details} />
              <Box mt={3} textAlign="right">
                <Button onClick={() => setInfoMethod(null)} variant="contained">
                  Đóng
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </MainLayout>
  );
}
