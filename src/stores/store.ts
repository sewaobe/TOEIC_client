import { configureStore } from '@reduxjs/toolkit';
import answerReducer from './answerSlice';
import examReducer from './examSlice';
export const store = configureStore({
  reducer: {
    answer: answerReducer,
    exam: examReducer,
  },
});

// Infer type cho RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
