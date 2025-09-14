import { configureStore } from '@reduxjs/toolkit';
import answerReducer from './answerSlice';
import examReducer from './examSlice';
import userReducer from './userSlice';
import snackbarReducer from './snackbarSlice';

export const store = configureStore({
  reducer: {
    answer: answerReducer,
    exam: examReducer,
    user: userReducer,
    snackbar: snackbarReducer
  },
});

// Infer type cho RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
