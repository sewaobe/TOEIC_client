import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { QuestionGroup, questionGroups } from '../models/QuestionType';

interface ExamState {
  groups: QuestionGroup[];
  qIdToGroupIndex: Record<number, number>;
  currentGroupIndex: number;
  showIntro: boolean;
}

function buildIndex(groups: QuestionGroup[]) {
  const map: Record<number, number> = {};
  groups.forEach((g, gi) =>
    g.questionIds.forEach((qid) => {
      map[qid] = gi;
    }),
  );
  return map;
}

const initialGroups = questionGroups;
const initialState: ExamState = {
  groups: initialGroups,
  qIdToGroupIndex: buildIndex(initialGroups),
  currentGroupIndex: 0,
  showIntro: true, // khi vừa mở vào part đầu tiên -> show Intro luôn
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    setCurrentGroupIndex: (state, action: PayloadAction<number>) => {
      const i = action.payload;
      if (i >= 0 && i < state.groups.length) {
        const currentPart = state.groups[state.currentGroupIndex]?.part;
        const nextPart = state.groups[i]?.part;

        state.currentGroupIndex = i;
        // nếu đổi sang part mới thì bật intro
        if (nextPart !== currentPart) {
          state.showIntro = true;
        }
      }
    },
    setCurrentGroupByQuestionId: (state, action: PayloadAction<number>) => {
      const q = action.payload;
      const gi = state.qIdToGroupIndex[q];
      if (gi !== undefined) {
        const currentPart = state.groups[state.currentGroupIndex]?.part;
        const nextPart = state.groups[gi]?.part;

        state.currentGroupIndex = gi;
        if (nextPart !== currentPart) {
          state.showIntro = true;
        }
      }
    },
    nextGroup: (state) => {
      if (state.currentGroupIndex < state.groups.length - 1) {
        const currentPart = state.groups[state.currentGroupIndex]?.part;
        const nextPart = state.groups[state.currentGroupIndex + 1]?.part;

        state.currentGroupIndex += 1;
        if (nextPart !== currentPart) {
          state.showIntro = true;
        }
      }
    },
    prevGroup: (state) => {
      if (state.currentGroupIndex > 0) {
        const currentPart = state.groups[state.currentGroupIndex]?.part;
        const prevPart = state.groups[state.currentGroupIndex - 1]?.part;

        state.currentGroupIndex -= 1;
        if (prevPart !== currentPart) {
          state.showIntro = true;
        }
      }
    },
    setShowIntro: (state, action: PayloadAction<boolean>) => {
      state.showIntro = action.payload;
    },
  },
});

export const {
  setCurrentGroupIndex,
  setCurrentGroupByQuestionId,
  nextGroup,
  prevGroup,
  setShowIntro,
} = examSlice.actions;

export default examSlice.reducer;
