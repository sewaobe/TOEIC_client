import type { MouseEvent } from "react";
import {
  PlayArrow as PlayIcon,
  Replay as ReplayIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Speed as SpeedIcon,
  RestartAlt as RestartIcon,
} from "@mui/icons-material";
import HelpIcon from "@mui/icons-material/Help";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Slider,
  Typography,
} from "@mui/material";
import SentenceRenderer from "../SetenceRenderer";
import type { DictationWord } from "../DictationContentV2";

type Difficulty = "easy" | "medium" | "hard";

type SentenceItem = {
  id: number;
  text: string;
  words: DictationWord[];
};

interface DictationMainProps {
  difficulty: Difficulty;
  sentence?: SentenceItem;
  currentIndex: number;
  totalItems: number;
  currentAnswers: Record<number, string>;
  showAnswer: boolean;
  isPlaying: boolean;
  progress: number;
  playbackRate: number;
  autoNext: boolean;
  allFilled: boolean;
  isPassed: boolean;
  onPlay: () => void;
  onSeek: (value: number) => void;
  onOpenSpeedMenu: (event: MouseEvent<HTMLButtonElement>) => void;
  onCloseSpeedMenu: () => void;
  onSelectPlaybackRate: (rate: number) => void;
  anchorSpeed: null | HTMLElement;
  onWordChange: (index: number, value: string) => void;
  onAutoNextChange: (checked: boolean) => void;
  onCheck: () => void;
  onRetry: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRestartGuide: () => void;
  canComplete: boolean;
}

export default function DictationMain({
  difficulty,
  sentence,
  currentIndex,
  totalItems,
  currentAnswers,
  showAnswer,
  isPlaying,
  progress,
  playbackRate,
  autoNext,
  allFilled,
  isPassed,
  onPlay,
  onSeek,
  onOpenSpeedMenu,
  onCloseSpeedMenu,
  onSelectPlaybackRate,
  anchorSpeed,
  onWordChange,
  canComplete,
  onAutoNextChange,
  onCheck,
  onRetry,
  onPrev,
  onNext,
  onRestartGuide,
}: DictationMainProps) {
  return (
    <>
      <Box
        sx={{
          background: "linear-gradient(90deg,#2563eb,#06b6d4)",
          borderRadius: "999px",
          p: 1,
          px: 2,
          display: "flex",
          alignItems: "center",
          mb: 3,
          gap: 1.5,
        }}
        className="dictation-audio"
      >
        <IconButton onClick={onPlay} sx={{ color: "#fff" }}>
          {isPlaying ? <ReplayIcon /> : <PlayIcon />}
        </IconButton>

        <Slider
          min={0}
          max={100}
          value={progress}
          onChange={(_, newValue) => {
            if (typeof newValue !== "number") return;
            onSeek(newValue);
          }}
          sx={{
            flex: 1,
            color: "#fff",
            "& .MuiSlider-thumb": { backgroundColor: "#fff" },
          }}
        />

        <Button
          onClick={onOpenSpeedMenu}
          startIcon={<SpeedIcon />}
          sx={{ color: "#fff", textTransform: "none" }}
        >
          {playbackRate.toFixed(2)}x
        </Button>

        <Menu
          anchorEl={anchorSpeed}
          open={Boolean(anchorSpeed)}
          onClose={onCloseSpeedMenu}
        >
          {[0.75, 1, 1.25, 1.5].map((rate) => (
            <MenuItem
              key={rate}
              selected={playbackRate === rate}
              onClick={() => {
                onSelectPlaybackRate(rate);
                onCloseSpeedMenu();
              }}
            >
              {rate}x
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        className="dictation-difficulty"
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary">
            Chế độ:
          </Typography>
          <Alert
            severity="info"
            sx={{
              py: 0,
              px: 1.25,
              fontWeight: 700,
              borderRadius: "999px",
              backgroundColor: "#eff6ff",
              color: "#2563eb",
              "& .MuiAlert-icon": { py: 0 },
            }}
          >
            {difficulty === "easy" ? "Dễ" : difficulty === "medium" ? "Trung bình" : "Khó"}
          </Alert>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Checkbox
            size="small"
            checked={autoNext}
            onChange={(e) => onAutoNextChange(e.target.checked)}
          />
          <Typography variant="body2">Tự động chuyển câu</Typography>
          <IconButton
            onClick={() => {
              onRestartGuide();
            }}
            size="small"
            sx={{
              color: "#2563eb",
              backgroundColor: "rgba(37,99,235,0.1)",
              "&:hover": {
                backgroundColor: "rgba(37,99,235,0.2)",
              },
            }}
          >
            <HelpIcon />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          backgroundColor: "#fff",
        }}
      >
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography mb={2} fontWeight="bold" color="primary">
              Câu {currentIndex + 1}/{totalItems}
            </Typography>
            <Box
              textAlign="center"
              fontSize={18}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 1,
              }}
              className="dictation-sentence"
            >
              <Box sx={{ width: "100%" }}>
                {sentence ? (
                  <SentenceRenderer
                    mode={difficulty}
                    sentence={sentence}
                    userAnswers={currentAnswers}
                    onChange={onWordChange}
                    showAnswer={showAnswer}
                  />
                ) : null}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box display="flex" justifyContent="center" gap={1} mb={2}>
        <Button
          variant="outlined"
          startIcon={<ChevronLeftIcon />}
          onClick={onPrev}
          disabled={currentIndex === 0}
        >
          Trước
        </Button>

        {!showAnswer ? (
          <Button
            variant="contained"
            onClick={onCheck}
            disabled={!allFilled}
            className="dictation-check"
          >
            Kiểm tra
          </Button>
        ) : isPassed ? (
          <Button
            variant="contained"
            color="success"
            endIcon={<ChevronRightIcon />}
            onClick={onNext}
            disabled={!canComplete && currentIndex >= totalItems - 1}
          >
            {currentIndex >= totalItems - 1 && canComplete
              ? "Hoàn thành"
              : "Tiếp theo"}
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="warning"
            startIcon={<RestartIcon />}
            onClick={onRetry}
          >
            Làm lại câu này
          </Button>
        )}
      </Box>
    </>
  );
}
