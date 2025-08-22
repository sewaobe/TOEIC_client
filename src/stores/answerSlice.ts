import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Answer {
  questionId: number; // số câu (1..200)
  answer: string; // đáp án user chọn
  isFlagged: boolean; // có gắn cờ không
}

interface AnswerState {
  answers: Answer[]; // mảng 200 phần tử
}

const initialState: AnswerState = {
  answers: Array.from({ length: 200 }, (_, i) => ({
    questionId: i + 1,
    answer: '',
    isFlagged: false,
  })),
};

const answerSlice = createSlice({
  name: 'answer',
  initialState,
  reducers: {
    setAnswer: (
      state,
      action: PayloadAction<{ questionId: number; answer: string }>,
    ) => {
      const { questionId, answer } = action.payload;
      const idx = questionId - 1; // index trong mảng
      if (idx >= 0 && idx < state.answers.length) {
        state.answers[idx].answer = answer;
      }
    },
    toggleFlag: (state, action: PayloadAction<{ questionId: number }>) => {
      const { questionId } = action.payload;
      const idx = questionId - 1;
      if (idx >= 0 && idx < state.answers.length) {
        state.answers[idx].isFlagged = !state.answers[idx].isFlagged;
      }
    },
    resetAnswers: (state) => {
      state.answers = initialState.answers.map((q) => ({ ...q }));
    },
  },
});

export const { setAnswer, toggleFlag, resetAnswers } = answerSlice.actions;
export default answerSlice.reducer;
