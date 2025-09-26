import React, { useState, useRef, useMemo } from "react";
import {
    Box,
    Button,
    Typography,
    IconButton,
    TextField,
    Chip,
    Menu,
    MenuItem,
    Slider,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import { PlayArrow, Pause, Replay, Settings } from "@mui/icons-material";

export const LessonDictation = () => {
    const [mode, setMode] = useState(0); // 0: điền trống, 1: transcript
    const [difficulty, setDifficulty] = useState<"medium" | "hard" | "full">("medium");
    const [playing, setPlaying] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // progress slider
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // mock nhiều câu
    const sentences = [
        "He's lifting some furniture.",
        "The woman is holding a bag.",
        "They are sitting around a table.",
        "The man is opening the window.",
        "Children are playing in the park.",
    ];
    const [index, setIndex] = useState(0);

    const currentSentence = sentences[index];

    // tách từ
    const words = useMemo(
        () => currentSentence.replace(/[.]/g, "").split(" "),
        [currentSentence]
    );

    // chọn blank theo độ khó
    const blankIndices = useMemo(() => {
        if (difficulty === "full") {
            return words.map((_, i) => i); // ẩn tất cả
        }

        let candidates = words.map((w, i) => ({ word: w, index: i }));

        if (difficulty === "hard") {
            candidates = candidates.sort((a, b) => b.word.length - a.word.length);
            return candidates.slice(0, Math.min(3, words.length)).map((c) => c.index);
        }

        if (difficulty === "medium") {
            const nBlank = Math.min(2, words.length);
            const arr: number[] = [];
            while (arr.length < nBlank) {
                const r = Math.floor(Math.random() * words.length);
                if (!arr.includes(r)) arr.push(r);
            }
            return arr;
        }

        return [];
    }, [currentSentence, difficulty]);

    const [answers, setAnswers] = useState<Record<number, string>>({});

    // --- Audio logic ---
    const estimateDuration = (text: string, rate: number) => {
        const n = text.split(" ").length;
        return (n * 0.6) / rate;
    };

    const speak = (text: string) => {
        if (!("speechSynthesis" in window)) {
            alert("Trình duyệt không hỗ trợ SpeechSynthesis API");
            return;
        }
        window.speechSynthesis.cancel();
        if (timerRef.current) clearInterval(timerRef.current);

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-US";
        utter.rate = playbackRate;

        const est = estimateDuration(text, playbackRate);
        setDuration(est);
        setProgress(0);

        utter.onstart = () => {
            setPlaying(true);
            let t = 0;
            timerRef.current = setInterval(() => {
                t += 0.1;
                setProgress(Math.min(t, est));
                if (t >= est && timerRef.current) clearInterval(timerRef.current);
            }, 100);
        };
        utter.onend = () => {
            setPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            setProgress(est);
        };

        window.speechSynthesis.speak(utter);
    };

    const handlePlayPause = () => {
        if (playing) {
            window.speechSynthesis.cancel();
            setPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
        } else {
            speak(currentSentence);
        }
    };

    // setting
    const handleOpenMenu = (e: React.MouseEvent<HTMLButtonElement>) =>
        setAnchorEl(e.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);
    const handleChangeRate = (rate: number) => {
        setPlaybackRate(rate);
        handleCloseMenu();
    };

    // kiểm tra
    const checkCorrect = () => {
        setShowAnswer(true);
    };

    // chuyển câu mới
    const goNext = () => {
        if (index < sentences.length - 1) {
            setIndex(index + 1);
            setShowAnswer(false);
            setAnswers({});
        }
    };
    const goPrev = () => {
        if (index > 0) {
            setIndex(index - 1);
            setShowAnswer(false);
            setAnswers({});
        }
    };

    return (
        <Box
            sx={{
                p: 3,
                borderRadius: "16px",
                bgcolor: "#fafafa",
                width: "min(960px, 95%)",
                mx: "auto",
            }}
        >
            {/* Chế độ */}
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Chip
                    label="Điền từ"
                    clickable
                    color={mode === 0 ? "primary" : "default"}
                    variant={mode === 0 ? "filled" : "outlined"}
                    onClick={() => setMode(0)}
                />
                <Chip
                    label="Xem transcript"
                    clickable
                    color={mode === 1 ? "primary" : "default"}
                    variant={mode === 1 ? "filled" : "outlined"}
                    onClick={() => setMode(1)}
                />
            </Box>

            {/* Chọn độ khó */}
            {mode === 0 && (
                <Box sx={{ mb: 2 }}>
                    <FormControl size="small">
                        <InputLabel id="difficulty-label">Chế độ</InputLabel>
                        <Select
                            labelId="difficulty-label"
                            value={difficulty}
                            onChange={(e) =>
                                setDifficulty(e.target.value as "medium" | "hard" | "full")
                            }
                            sx={{ minWidth: 180 }}
                            MenuProps={{
                                disableScrollLock: true,  
                            }}
                        >
                            <MenuItem value="medium">Điền từ (Trung Bình)</MenuItem>
                            <MenuItem value="hard">Điền từ (Khó)</MenuItem>
                            <MenuItem value="full">Chép cả câu</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            )}

            {/* Danh sách câu (chips) */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {sentences.map((_, i) => (
                    <Chip
                        key={i}
                        label={`Câu ${i + 1}`}
                        clickable
                        color={i === index ? "primary" : "default"}
                        variant={i === index ? "filled" : "outlined"}
                        onClick={() => {
                            setIndex(i);
                            setShowAnswer(false);
                            setAnswers({});
                        }}
                    />
                ))}
            </Box>

            {/* Audio control */}
            <Box display="flex" alignItems="center" gap={2} mb={2} width="100%">
                <IconButton color="primary" onClick={handlePlayPause} size="large">
                    {playing ? <Pause /> : <PlayArrow />}
                </IconButton>
                <Slider
                    min={0}
                    max={duration || 1}
                    step={0.1}
                    value={progress}
                    sx={{ flex: 1 }}
                />
                <IconButton onClick={() => speak(currentSentence)}>
                    <Replay />
                </IconButton>
                <IconButton onClick={handleOpenMenu}>
                    <Settings />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} disableScrollLock>
                    {[0.75, 1, 1.25, 1.5].map((r) => (
                        <MenuItem
                            key={r}
                            selected={playbackRate === r}
                            onClick={() => handleChangeRate(r)}
                        >
                            {r}x
                        </MenuItem>
                    ))}
                </Menu>
            </Box>

            {/* Câu hỏi */}
            <Box
                sx={{
                    border: "1px solid #ddd",
                    p: 3,
                    borderRadius: "12px",
                    textAlign: "center",
                    mb: 2,
                    fontSize: "18px",
                }}
            >
                <b>({index + 1})</b>&nbsp;
                {mode === 0 ? (
                    <>
                        {words.map((w, i) =>
                            blankIndices.includes(i) ? (
                                <TextField
                                    key={i}
                                    value={answers[i] || ""}
                                    onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                                    variant="standard"
                                    sx={{ minWidth: 60, mx: 0.5 }}
                                />
                            ) : (
                                <span key={i} style={{ margin: "0 4px" }}>
                                    {w}
                                </span>
                            )
                        )}
                    </>
                ) : (
                    currentSentence
                )}
            </Box>

            {/* Buttons */}
            <Box display="flex" justifyContent="center" gap={1} mb={2}>
                <Button variant="outlined" onClick={goPrev} disabled={index === 0}>
                    Câu trước
                </Button>
                <Button variant="contained" onClick={checkCorrect}>
                    Kiểm tra
                </Button>
                <Button
                    variant="outlined"
                    onClick={goNext}
                    disabled={index === sentences.length - 1}
                >
                    Câu sau
                </Button>
            </Box>

            {/* Feedback */}
            {showAnswer && (
                <Box
                    sx={{
                        borderTop: "1px dashed #aaa",
                        mt: 2,
                        pt: 2,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="body1">
                        Đáp án: <b>{currentSentence}</b>
                    </Typography>
                    {blankIndices.map((i) => {
                        const userAns = (answers[i] || "").trim().toLowerCase();
                        const correct = words[i].toLowerCase();
                        return (
                            <Typography
                                key={i}
                                variant="body2"
                                color={userAns === correct ? "green" : "red"}
                            >
                                Ô trống {i + 1}: bạn nhập "{answers[i] || ""}" → đúng là "{words[i]}"
                            </Typography>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
};
