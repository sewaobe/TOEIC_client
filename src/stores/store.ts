import { configureStore } from '@reduxjs/toolkit';
import answerReducer from './answerSlice';
import examReducer from './examSlice';
import authReducer from './authSlice';
// import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    answer: answerReducer,
    exam: examReducer,
    auth: authReducer,
    // user: userReducer,
  },
});

// Infer type cho RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
