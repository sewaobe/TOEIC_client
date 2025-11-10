import { useState } from "react"
import {
    Box,
    Chip,
    TextField,
    Typography
} from "@mui/material"
import { DictationWord } from "./DictationContent";


interface Props {
    mode: "easy" | "medium" | "hard"
    sentence: { words: DictationWord[]; text: string }
    userAnswers: Record<number, string>
    onChange: (index: number, value: string) => void
    showAnswer: boolean
}

export default function SentenceRenderer({
    mode,
    sentence,
    userAnswers,
    onChange,
    showAnswer,
}: Props) {
    if (!sentence) return null

    switch (mode) {
        case "easy":
            return <EasyMode sentence={sentence} showAnswer={showAnswer} onChange={onChange} />
        case "medium":
            return (
                <MediumMode
                    sentence={sentence}
                    userAnswers={userAnswers}
                    onChange={onChange}
                    showAnswer={showAnswer}
                />
            )
        case "hard":
            return <HardMode sentence={sentence} showAnswer={showAnswer} onChange={onChange} />
    }
}

/* ---------------- EASY MODE ---------------- */
const EasyMode = ({
    sentence,
    onChange,
    showAnswer,
}: {
    sentence: { words: DictationWord[] }
    onChange: (index: number, value: string) => void
    showAnswer: boolean
}) => {
    const [selected, setSelected] = useState<string[]>([])

    const handleShuffle = (arr: DictationWord[]) => {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    const [shuffledWords] = useState(() => handleShuffle(sentence.words));

    const handleSelect = (word: string) => {
        if (showAnswer) return
        setSelected((prev) => {
            const next = prev.includes(word)
                ? prev.filter((w) => w !== word)
                : [...prev, word]
            onChange(0, next.join(" "))
            return next
        })
    }

    return (
        <Box>
            <Typography fontWeight={600} mb={1}>
                Chọn từ theo thứ tự bạn nghe được:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
                {shuffledWords.map((w, i) => (
                    <Chip
                        key={i}
                        label={w.word}
                        clickable
                        color={selected.includes(w.word) ? "primary" : "default"}
                        onClick={() => handleSelect(w.word)}
                    />
                ))}
            </Box>

            <TextField
                fullWidth
                variant="outlined"
                value={selected.join(" ")}
                placeholder="Câu bạn sắp xếp..."
                InputProps={{ readOnly: true }}
                sx={{ mt: 2 }}
            />
        </Box>
    )
}

/* ---------------- MEDIUM MODE ---------------- */
const normalize = (t: string) =>
    t.toLowerCase().trim().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")

const MediumMode = ({
    sentence,
    userAnswers,
    onChange,
    showAnswer,
}: any) => {
    return (
        <Box
            textAlign="center"
            fontSize={18}
            sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1 }}
        >
            {sentence.words.map((w: DictationWord) =>
                !w.isBlank ? (
                    <span key={w.index} style={{ fontWeight: 500, lineHeight: "34px" }}>
                        {w.word}
                    </span>
                ) : (
                    <TextField
                        key={w.index}
                        variant="outlined"
                        size="small"
                        value={userAnswers[w.index] || ""}
                        onChange={(e) => onChange(w.index, e.target.value)}
                        disabled={showAnswer}
                        placeholder="____"
                        sx={{
                            minWidth: 90,
                            "& .MuiInputBase-input": {
                                textAlign: "center",
                                fontWeight: 600,
                                color: "#000",
                            },
                            ...(showAnswer && {
                                "& fieldset": {
                                    borderColor:
                                        normalize(userAnswers[w.index] || "") === normalize(w.word)
                                            ? "#22c55e"
                                            : "#ef4444",
                                },
                                "& .MuiInputBase-input": {
                                    backgroundColor:
                                        normalize(userAnswers[w.index] || "") === normalize(w.word)
                                            ? "#dcfce7"
                                            : "#fee2e2",
                                    color:
                                        normalize(userAnswers[w.index] || "") === normalize(w.word)
                                            ? "#166534"
                                            : "#991b1b",
                                    fontWeight: 700,
                                    borderRadius: 1,
                                },
                            }),
                        }}
                    />
                )
            )}
        </Box>
    )
}

/* ---------------- HARD MODE ---------------- */
const HardMode = ({
    sentence,
    onChange,
    showAnswer,
}: {
    sentence: { text: string }
    onChange: (index: number, value: string) => void
    showAnswer: boolean
}) => (
    <Box>
        <Typography fontWeight={600} mb={1}>
            Nhập lại toàn bộ câu bạn nghe được:
        </Typography>
        <TextField
            fullWidth
            multiline
            minRows={3}
            variant="outlined"
            placeholder="Nghe và nhập lại toàn bộ câu..."
            onChange={(e) => onChange(0, e.target.value)}
            disabled={showAnswer}
            sx={{
                "& .MuiInputBase-input": {
                    fontSize: 16,
                    fontWeight: 500,
                    lineHeight: 1.6,
                },
            }}
        />
    </Box>
)
