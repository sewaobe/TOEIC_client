import type { MouseEvent } from "react";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Headphones as HeadphonesIcon,
  InfoOutlined as InfoOutlinedIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  LockOutlined as LockOutlinedIcon,
  PlayArrow as PlayIcon,
  Replay as ReplayIcon,
  Replay5 as Replay5Icon,
  RestartAlt as RestartIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Slider,
  Switch,
  Tooltip,
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
  segmentStart: number;
  segmentEnd: number;
  onPlay: () => void;
  onSeek: (value: number) => void;
  onRewind: (seconds: number) => void;
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

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
};

const formatAudioTime = (value: number) => {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const minutes = Math.floor(safeValue / 60);
  const seconds = safeValue % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const actionButtonSx = {
  minWidth: { xs: 0, sm: 148, lg: 170, xl: 180 },
  height: { xs: 40, sm: 44, lg: 48, xl: 50 },
  borderRadius: { xs: 1.5, lg: 2 },
  textTransform: "none",
  fontWeight: 800,
  fontSize: { xs: 12, sm: 13, lg: 14, xl: 15 },
  px: { xs: 1, sm: 1.5, lg: 2 },
};

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
  segmentStart,
  segmentEnd,
  onPlay,
  onSeek,
  onRewind,
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
  const segmentDuration = Math.max(segmentEnd - segmentStart, 0);
  const currentTime = segmentStart + (segmentDuration * progress) / 100;
  const nextDisabled = !isPassed || (!canComplete && currentIndex >= totalItems - 1);

  const primaryAction = !showAnswer ? (
    <Button
      variant="contained"
      onClick={onCheck}
      disabled={!allFilled}
      className="dictation-check"
      sx={{
        ...actionButtonSx,
        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
        boxShadow: "0 12px 24px rgba(37, 99, 235, 0.24)",
        "&:hover": {
          background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
        },
        "&.Mui-disabled": {
          color: "#9aa3af",
          background: "#eef1f5",
          boxShadow: "none",
        },
      }}
    >
      Kiểm tra
    </Button>
  ) : isPassed ? (
    <Button
      variant="contained"
      disabled
      sx={{
        ...actionButtonSx,
        "&.Mui-disabled": {
          color: "#64748b",
          background: "#eef1f5",
        },
      }}
    >
      Đã kiểm tra
    </Button>
  ) : (
    <Button
      variant="outlined"
      color="warning"
      startIcon={<RestartIcon />}
      onClick={onRetry}
      sx={{
        ...actionButtonSx,
        backgroundColor: "#fff",
      }}
    >
      Làm lại
    </Button>
  );

  return (
    <>
      <Box
        className="dictation-audio"
        sx={{
          mb: { xs: 1, sm: 1.25, lg: 1.5 },
          p: { xs: 1, sm: 1.25, md: 1.5, lg: 1.75, xl: 2 },
          borderRadius: { xs: 2, lg: 3 },
          border: "1px solid #dbe3ef",
          backgroundColor: "#fff",
          boxShadow: "0 14px 34px rgba(15, 23, 42, 0.055)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "auto 1fr",
              sm: "auto 1fr auto",
              lg: "64px 1fr auto",
              xl: "70px 1fr auto",
            },
            alignItems: "center",
            gap: { xs: 1.25, sm: 1.5, lg: 2 },
          }}
        >
          <IconButton
            onClick={onPlay}
            aria-label={isPlaying ? "Phát lại audio" : "Phát audio"}
            sx={{
              width: { xs: 38, sm: 44, lg: 50, xl: 54 },
              height: { xs: 38, sm: 44, lg: 50, xl: 54 },
              justifySelf: "center",
              color: "#fff",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              boxShadow: "0 12px 24px rgba(37, 99, 235, 0.24)",
              "&:hover": {
                background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
              },
            }}
          >
            {isPlaying ? (
              <ReplayIcon sx={{ fontSize: { xs: 19, sm: 21, lg: 23 } }} />
            ) : (
              <PlayIcon sx={{ fontSize: { xs: 24, sm: 26, lg: 30 } }} />
            )}
          </IconButton>

          <Box sx={{ minWidth: 0 }}>
            <Slider
              min={0}
              max={100}
              value={progress}
              onChange={(_, newValue) => {
                if (typeof newValue !== "number") return;
                onSeek(newValue);
              }}
              sx={{
                color: "#2563eb",
                height: { xs: 4, lg: 6 },
                p: 0,
                "& .MuiSlider-rail": {
                  opacity: 1,
                  color: "#e5eaf1",
                },
                "& .MuiSlider-track": {
                  border: "none",
                  background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
                },
                "& .MuiSlider-thumb": {
                  width: { xs: 14, lg: 18 },
                  height: { xs: 14, lg: 18 },
                  backgroundColor: "#2563eb",
                  border: "3px solid #fff",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.28)",
                },
              }}
            />
            <Box display="flex" justifyContent="space-between" mt={{ xs: 0.5, lg: 0.75 }}>
              <Typography sx={{ color: "#334155", fontSize: { xs: 11, sm: 11.5, lg: 12.5 }, fontWeight: 500 }}>
                {formatAudioTime(currentTime)}
              </Typography>
              <Typography sx={{ color: "#334155", fontSize: { xs: 11, sm: 11.5, lg: 12.5 }, fontWeight: 500 }}>
                {formatAudioTime(segmentEnd)}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              gridColumn: { xs: "1 / -1", sm: "auto" },
              display: "flex",
              gap: { xs: 1, lg: 1.25 },
              justifyContent: { xs: "flex-end", sm: "flex-end" },
              flexWrap: "nowrap",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Replay5Icon />}
              onClick={() => onRewind(5)}
              sx={{
                height: { xs: 32, lg: 36, xl: 38 },
                minWidth: { xs: 64, lg: 74 },
                px: { xs: 1, lg: 1.5 },
                borderRadius: { xs: 1.5, lg: 2 },
                color: "#0f172a",
                borderColor: "#d5deea",
                textTransform: "none",
                fontWeight: 700,
                fontSize: { xs: 12, lg: 13 },
                backgroundColor: "#fff",
              }}
            >
              5s
            </Button>

            <Button
              variant="outlined"
              onClick={onOpenSpeedMenu}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                height: { xs: 32, lg: 36, xl: 38 },
                minWidth: { xs: 78, lg: 88 },
                px: { xs: 1, lg: 1.5 },
                borderRadius: { xs: 1.5, lg: 2 },
                color: "#0f172a",
                borderColor: "#d5deea",
                textTransform: "none",
                fontWeight: 700,
                fontSize: { xs: 12, lg: 13 },
                backgroundColor: "#fff",
              }}
            >
              {playbackRate.toFixed(1)}x
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
                  {rate.toFixed(rate === 1 ? 1 : 2)}x
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>

      </Box>

      <Box
        className="dictation-difficulty"
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "minmax(220px, 300px) 1fr",
            lg: "minmax(240px, 300px) 1fr",
          },
          gap: { xs: 1, sm: 1.25, lg: 1.5 },
          mb: { xs: 1, sm: 1.25, lg: 1.5 },
        }}
      >
        <Box
          sx={{
            p: { xs: 1, lg: 1.25 },
            minHeight: { xs: 50, lg: 58 },
            borderRadius: { xs: 1.5, lg: 2 },
            border: "1px solid #b8d3ff",
            backgroundColor: "#f8fbff",
            display: "flex",
            alignItems: "center",
            gap: 1.25,
          }}
        >
          <Box
            sx={{
              width: { xs: 26, lg: 30 },
              height: { xs: 26, lg: 30 },
              flex: "0 0 auto",
              borderRadius: 1.25,
              color: "#2563eb",
              border: "1px solid #93c5fd",
              display: "grid",
              placeItems: "center",
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: { xs: 15, lg: 17 } }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: "#2563eb", fontWeight: 800, fontSize: { xs: 12.5, sm: 13.5, lg: 14.5 } }}>
              Chế độ: {difficultyLabels[difficulty]}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            p: { xs: 1, lg: 1.25 },
            minHeight: { xs: 50, lg: 58 },
            borderRadius: { xs: 1.5, lg: 2 },
            border: "1px solid #dbe3ef",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.25,
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
          }}
        >
          <Box display="flex" alignItems="center" gap={0.75} sx={{ minWidth: 0 }}>
            <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: { xs: 12.5, sm: 13.5, lg: 14.5 } }}>
              Tự động chuyển câu
            </Typography>
            <Tooltip title="Xem lại hướng dẫn luyện tập">
              <IconButton
                onClick={onRestartGuide}
                size="small"
                sx={{ color: "#64748b", p: 0.5 }}
              >
                <InfoOutlinedIcon sx={{ fontSize: { xs: 15, lg: 17 } }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Switch
            checked={autoNext}
            onChange={(event) => onAutoNextChange(event.target.checked)}
            size="small"
            sx={{
              flex: "0 0 auto",
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#2563eb",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#2563eb",
                opacity: 1,
              },
            }}
          />
        </Box>
      </Box>

      <Box
        className="dictation-sentence"
        sx={{
          mb: { xs: 6, sm: 7, lg: 8 },
          p: { xs: 1.5, sm: 1.75, md: 2, lg: 2.5, xl: 3 },
          borderRadius: { xs: 2, lg: 3 },
          border: "1px solid #dbe3ef",
          backgroundColor: "#fff",
          boxShadow: "0 14px 34px rgba(15, 23, 42, 0.055)",
        }}
      >
        <Typography
          fontWeight={800}
          color="#2563eb"
          sx={{ mb: { xs: 1.5, lg: 2 }, fontSize: { xs: 15, sm: 16, lg: 18 } }}
        >
          Câu {currentIndex + 1}/{totalItems}
        </Typography>
        <Box
          textAlign="center"
          sx={{
            minHeight: { xs: 64, sm: 72, lg: 84 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
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

      <Box
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1200,
          px: { xs: 1, sm: 1.5, lg: 3 },      // giảm padding ngang
          py: { xs: 0.75, sm: 1, lg: 1.25 },  // giảm padding dọc
          borderTop: "1px solid #dbe3ef",
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 -10px 24px rgba(15, 23, 42, 0.08)", // nhẹ hơn
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: { xs: 0.5, sm: 1 }, // khoảng cách giữa các button
            width: "100%",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ChevronLeftIcon />}
            onClick={onPrev}
            disabled={currentIndex === 0}
            sx={{
              ...actionButtonSx,
              fontSize: { xs: "0.875rem", sm: "0.95rem" }, // giảm font
              paddingY: { xs: 0.5, sm: 0.6 },
              paddingX: { xs: 1, sm: 1.25 },
              minWidth: "auto",
              backgroundColor: "#fff",
              borderColor: "#2563eb",
            }}
          >
            Trước
          </Button>

          {primaryAction}

          <Button
            variant="contained"
            endIcon={<ChevronRightIcon />}
            onClick={onNext}
            disabled={nextDisabled}
            sx={{
              ...actionButtonSx,
              fontSize: { xs: "0.875rem", sm: "0.95rem" }, // giảm font
              paddingY: { xs: 0.5, sm: 0.6 },
              paddingX: { xs: 1.25, sm: 1.5 },
              minWidth: "auto",
              color: nextDisabled ? "#64748b" : "#fff",
              background: nextDisabled
                ? "#eef1f5"
                : "linear-gradient(135deg, #2563eb, #1d4ed8)",
              boxShadow: nextDisabled
                ? "none"
                : "0 10px 20px rgba(37, 99, 235, 0.22)",
              "&:hover": {
                background: nextDisabled
                  ? "#e2e8f0"
                  : "linear-gradient(135deg, #1d4ed8, #1e40af)",
                boxShadow: nextDisabled
                  ? "none"
                  : "0 12px 22px rgba(37, 99, 235, 0.26)",
              },
              "&.Mui-disabled": {
                color: "#9aa3af",
                backgroundColor: "#eef1f5",
              },
            }}
          >
            {currentIndex >= totalItems - 1 ? "Hoàn thành" : "Câu tiếp"}
          </Button>
        </Box>
      </Box>
    </>
  );
}
