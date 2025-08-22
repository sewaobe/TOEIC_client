import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { QuestionGroup, questionGroups } from '../models/QuestionType';

interface ExamState {
  groups: QuestionGroup[];
  qIdToGroupIndex: Record<number, number>;
  currentGroupIndex: number;
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
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    setCurrentGroupIndex: (state, action: PayloadAction<number>) => {
      const i = action.payload;
      if (i >= 0 && i < state.groups.length) state.currentGroupIndex = i;
    },
    setCurrentGroupByQuestionId: (state, action: PayloadAction<number>) => {
      const q = action.payload;
      const gi = state.qIdToGroupIndex[q];
      if (gi !== undefined) state.currentGroupIndex = gi;
    },
    nextGroup: (state) => {
      if (state.currentGroupIndex < state.groups.length - 1)
        state.currentGroupIndex += 1;
    },
    prevGroup: (state) => {
      if (state.currentGroupIndex > 0) state.currentGroupIndex -= 1;
    },
  },
});

export const {
  setCurrentGroupIndex,
  setCurrentGroupByQuestionId,
  nextGroup,
  prevGroup,
} = examSlice.actions;

export default examSlice.reducer;
