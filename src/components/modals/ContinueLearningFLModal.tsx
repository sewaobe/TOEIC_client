import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { motion, AnimatePresence } from "framer-motion";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ContinueLearningModalProps {
  open: boolean;
  topicTitle?: string;
  onClose: () => void;
  onContinue: () => void;
}

const ContinueLearningFLModal: React.FC<ContinueLearningModalProps> = ({
  open,
  topicTitle = "bài học này",
  onClose,
  onContinue,
}) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={(_event, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        onClose();
      }}
      disableEscapeKeyDown
      aria-describedby="continue-learning-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          width: "100%",
          maxWidth: 420,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pb: 1,
        }}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ scale: 0.8, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 18,
                mass: 0.6,
              }}
            >
              <SchoolOutlinedIcon color="primary" sx={{ fontSize: 36 }} />
            </motion.div>
          )}
        </AnimatePresence>

        <Typography variant="h6" component="span" fontWeight={700}>
          Tiếp tục phiên học?
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography id="continue-learning-dialog-description" sx={{ fontSize: "0.95rem" }}>
          Bạn đang có phiên luyện tập trong hôm nay cho <strong>{topicTitle}</strong>.{" "}
          Bạn muốn tiếp tục không?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2, mt: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
        >
          Bỏ phiên cũ
        </Button>

        <Button
          onClick={onContinue}
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
        >
          Học tiếp
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContinueLearningFLModal;
