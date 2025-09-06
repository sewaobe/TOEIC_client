// stores/examSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ExamGroup } from '../types/Exam';
import testService from '../services/test.service';

// ----------------- Async thunk để fetch test -----------------
interface FetchExamOptions {
  testId: string;
  parts?: number[]; // mảng số các part
}

export const fetchExamById = createAsyncThunk(
  'exam/fetchById',
  async (options: FetchExamOptions, thunkAPI) => {
    try {
      const { testId, parts } = options;

      const { test } = await testService.getTestById(testId, {
        full: !parts,          // nếu không có parts thì lấy full
        parts: parts?.map(String), // chuyển mảng số sang mảng string
      });

      const groups = formatTestToGroups(test);
      console.log(groups)
      return { testId: test._id, groups };
    } catch (err) {
      return thunkAPI.rejectWithValue(err);
    }
  }
);

function formatTestToGroups(test: any): ExamGroup[] {
  const groups: ExamGroup[] = [];
  const parts = Object.keys(test.questions || {});

  parts.forEach((partName) => {
    const partData = test.questions[partName];
    const partGroups = partData.groups || [];

    partGroups.forEach((g: any, gi: number) => {
      const qs = g.questions || [];
      groups.push({
        _id: `${partName}-${gi}`, // unique id
        part: Number(partName.match(/\d+/)),
        audioUrl: g.audioUrl?.url || null,
        imagesUrl: g.imagesUrl?.map((i: any) => i.url) || [],
        transcriptEnglish: g.transcriptEnglish || "",
        transcriptTranslation: g.transcriptTranslation || "",
        questions: qs.map((q: any) => ({
          _id: q._id,
          name: q.name,
          textQuestion: q.textQuestion,
          choices: q.choices || {},
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
      });
    });
  });

  return groups;
}

// ----------------- State -----------------
interface ExamState {
  currentTestId: string;      // thêm field lưu testId
  groups: ExamGroup[];
  qIdToGroupIndex: Record<string, number>;
  currentGroupIndex: number;
  showIntro: boolean;
}

function buildIndex(groups: ExamGroup[]) {
  const map: Record<string, number> = {};
  groups.forEach((g, gi) =>
    g.questions.forEach((q) => {
      map[q._id] = gi;
    })
  );
  return map;
}

const initialState: ExamState = {
  currentTestId:'',  // mặc định null
  groups: [],
  qIdToGroupIndex: {},
  currentGroupIndex: 0,
  showIntro: true,
};

// ----------------- Slice -----------------
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
        if (nextPart !== currentPart) state.showIntro = true;
      }
    },
    setCurrentGroupByQuestionId: (state, action: PayloadAction<string>) => {
      const qid = action.payload;
      const gi = state.qIdToGroupIndex[qid];
      if (gi !== undefined) {
        const currentPart = state.groups[state.currentGroupIndex]?.part;
        const nextPart = state.groups[gi]?.part;

        state.currentGroupIndex = gi;
        if (nextPart !== currentPart) state.showIntro = true;
      }
    },
    nextGroup: (state) => {
      if (state.currentGroupIndex < state.groups.length - 1) {
        const currentPart = state.groups[state.currentGroupIndex]?.part;
        const nextPart = state.groups[state.currentGroupIndex + 1]?.part;

        state.currentGroupIndex += 1;
        if (nextPart !== currentPart) state.showIntro = true;
      }
    },
    prevGroup: (state) => {
      if (state.currentGroupIndex > 0) {
        const currentPart = state.groups[state.currentGroupIndex]?.part;
        const prevPart = state.groups[state.currentGroupIndex - 1]?.part;

        state.currentGroupIndex -= 1;
        if (prevPart !== currentPart) state.showIntro = true;
      }
    },
    setShowIntro: (state, action: PayloadAction<boolean>) => {
      state.showIntro = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchExamById.fulfilled, (state, action: PayloadAction<{ testId: string; groups: ExamGroup[] }>) => {
      state.groups = action.payload.groups;
      state.qIdToGroupIndex = buildIndex(action.payload.groups);
      state.currentGroupIndex = 0;
      state.showIntro = true;
      state.currentTestId = action.payload.testId;  // lưu testId
    });
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
