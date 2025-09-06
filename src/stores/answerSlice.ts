import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Answer {
  _id: string;
  question: number; // số câu (1..200)
  answer: string; // đáp án user chọn
  isFlagged: boolean; // có gắn cờ không
}

interface AnswerState {
  answers: Answer[]; // mảng 200 phần tử
}

const initialState: AnswerState = {
  answers: Array.from({ length: 200 }, (_, i) => ({
    _id: "",
    question: i + 1,
    answer: "",
    isFlagged: false,
  })),
};

const answerSlice = createSlice({
  name: "answer",
  initialState,
  reducers: {
    setInitialAnswers: (state, action: PayloadAction<Answer[]>) => {
      state.answers = action.payload;
    },

    setAnswer: (
      state,
      action: PayloadAction<{ question: number; answer: string }>
    ) => {
      const { question, answer } = action.payload;
      const idx = state.answers.findIndex((a) => a.question === question); // index trong mảng
      if (idx >= 0 && idx < state.answers.length) {
        state.answers[idx].answer = answer;
      }
    },
    toggleFlag: (state, action: PayloadAction<{ question: number }>) => {
      const { question } = action.payload;
      const idx = state.answers.findIndex((a) => a.question === question); // index trong mảng
      if (idx >= 0 && idx < state.answers.length) {
        state.answers[idx].isFlagged = !state.answers[idx].isFlagged;
      }
    },
    resetAnswers: (state) => {
      state.answers = initialState.answers.map((q) => ({ ...q }));
    },
  },
});

export const { setInitialAnswers, setAnswer, toggleFlag, resetAnswers } =
  answerSlice.actions;
export default answerSlice.reducer;
