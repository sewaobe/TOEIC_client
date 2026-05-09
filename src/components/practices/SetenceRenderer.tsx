import { useState } from "react";
import { Box, Chip, TextField, Typography } from "@mui/material";
import type { DictationWord } from "./DictationContentV2";

interface Props {
  mode: "easy" | "medium" | "hard";
  sentence: { words: DictationWord[]; text: string };
  userAnswers: Record<number, string>;
  onChange: (index: number, value: string) => void;
  showAnswer: boolean;
}

export default function SentenceRenderer({
  mode,
  sentence,
  userAnswers,
  onChange,
  showAnswer,
}: Props) {
  if (!sentence) return null;

  switch (mode) {
    case "easy":
      return (
        <EasyMode
          sentence={sentence}
          showAnswer={showAnswer}
          onChange={onChange}
        />
      );
    case "medium":
      return (
        <MediumMode
          sentence={sentence}
          userAnswers={userAnswers}
          onChange={onChange}
          showAnswer={showAnswer}
        />
      );
    case "hard":
      return <HardMode showAnswer={showAnswer} onChange={onChange} />;
  }
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

const fieldSx = {
  width: {
    xs: "min(100%, 170px)",
    sm: 210,
    md: 250,
    lg: 280,
    xl: 300,
  },
  "& .MuiOutlinedInput-root": {
    height: { xs: 42, sm: 46, md: 50, lg: 54, xl: 56 },
    borderRadius: 1.5,
    backgroundColor: "#fff",
    fontSize: { xs: 16, sm: 17, md: 18, lg: 19, xl: 20 },
    "& fieldset": {
      borderColor: "#cfd8e6",
    },
    "&:hover fieldset": {
      borderColor: "#8fb4ff",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2563eb",
      borderWidth: 2,
      boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)",
    },
  },
  "& .MuiInputBase-input": {
    textAlign: "center",
    fontWeight: 700,
    color: "#0f172a",
  },
};

function EasyMode({
  sentence,
  onChange,
  showAnswer,
}: {
  sentence: { words: DictationWord[] };
  onChange: (index: number, value: string) => void;
  showAnswer: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const [shuffledWords] = useState(() => {
    const shuffled = [...sentence.words];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const handleSelect = (word: string) => {
    if (showAnswer) return;
    setSelected((prev) => {
      const next = prev.includes(word)
        ? prev.filter((item) => item !== word)
        : [...prev, word];
      onChange(0, next.join(" "));
      return next;
    });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        sx={{
          color: "#334155",
          fontWeight: 700,
          mb: { xs: 1, lg: 1.5 },
          fontSize: { xs: 13, sm: 14, lg: 15 },
        }}
      >
        Chọn từ theo thứ tự bạn nghe được:
      </Typography>
      <Box
        display="flex"
        flexWrap="wrap"
        gap={{ xs: 0.75, sm: 1, lg: 1.25 }}
        justifyContent="center"
      >
        {shuffledWords.map((word, index) => (
          <Chip
            key={`${word.word}-${index}`}
            label={word.word}
            clickable={!showAnswer}
            onClick={() => handleSelect(word.word)}
            sx={{
              height: { xs: 32, sm: 34, lg: 38 },
              px: 0.75,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: { xs: 12.5, sm: 13.5, lg: 14 },
              color: selected.includes(word.word) ? "#fff" : "#334155",
              backgroundColor: selected.includes(word.word) ? "#2563eb" : "#fff",
              border: "1px solid",
              borderColor: selected.includes(word.word) ? "#2563eb" : "#dbe3ef",
              boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
              "&:hover": {
                backgroundColor: selected.includes(word.word) ? "#1d4ed8" : "#f8fafc",
              },
            }}
          />
        ))}
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        value={selected.join(" ")}
        placeholder="Câu bạn sắp xếp..."
        InputProps={{ readOnly: true }}
        sx={{
          mt: { xs: 1.5, lg: 2 },
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            backgroundColor: "#fff",
          },
        }}
      />
    </Box>
  );
}

function MediumMode({
  sentence,
  userAnswers,
  onChange,
  showAnswer,
}: {
  sentence: { words: DictationWord[] };
  userAnswers: Record<number, string>;
  onChange: (index: number, value: string) => void;
  showAnswer: boolean;
}) {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: { xs: 1, sm: 1.25, md: 1.5, lg: 1.75, xl: 2 },
        color: "#111827",
        fontSize: { xs: 17, sm: 18, md: 20, lg: 21, xl: 22 },
        fontWeight: 600,
        lineHeight: { xs: "42px", sm: "46px", md: "50px", lg: "54px", xl: "56px" },
      }}
    >
      {sentence.words.map((word) => {
        if (!word.isBlank) {
          return (
            <Box component="span" key={word.index}>
              {word.word}
            </Box>
          );
        }

        const isCorrect =
          normalize(userAnswers[word.index] || "") === normalize(word.word);

        return (
          <TextField
            key={word.index}
            variant="outlined"
            value={userAnswers[word.index] || ""}
            onChange={(event) => onChange(word.index, event.target.value)}
            disabled={showAnswer}
            placeholder=""
            sx={{
              ...fieldSx,
              ...(showAnswer && {
                "& .MuiOutlinedInput-root fieldset": {
                  borderColor: isCorrect ? "#22c55e" : "#ef4444",
                },
                "& .MuiInputBase-input": {
                  backgroundColor: isCorrect ? "#dcfce7" : "#fee2e2",
                  color: isCorrect ? "#166534" : "#991b1b",
                  borderRadius: 1,
                },
              }),
            }}
          />
        );
      })}
    </Box>
  );
}

function HardMode({
  onChange,
  showAnswer,
}: {
  onChange: (index: number, value: string) => void;
  showAnswer: boolean;
}) {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        sx={{
          color: "#334155",
          fontWeight: 700,
          mb: { xs: 1, lg: 1.5 },
          fontSize: { xs: 13, sm: 14, lg: 15 },
        }}
      >
        Nhập lại toàn bộ câu bạn nghe được:
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={3}
        variant="outlined"
        placeholder="Nghe và nhập lại toàn bộ câu..."
        onChange={(event) => onChange(0, event.target.value)}
        disabled={showAnswer}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            backgroundColor: "#fff",
            "& fieldset": {
              borderColor: "#cfd8e6",
            },
            "&:hover fieldset": {
              borderColor: "#8fb4ff",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2563eb",
              borderWidth: 2,
              boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)",
            },
          },
          "& .MuiInputBase-input": {
            color: "#0f172a",
            fontSize: { xs: 14, sm: 15, lg: 16, xl: 17 },
            fontWeight: 600,
            lineHeight: 1.55,
          },
        }}
      />
    </Box>
  );
}
