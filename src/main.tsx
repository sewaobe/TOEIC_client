import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ThemeProviderWrapper from './ThemeProviderWrapper.tsx';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './routes/AppRouter.tsx';
import { Provider, useDispatch } from 'react-redux';
import { AppDispatch, store } from './stores/store.ts';
import { getUserThunk } from './stores/userSlice.ts';
import GlobalSnackbar from './components/common/GlobalSnackbar.tsx';
import * as Sentry from '@sentry/react';

// initial sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN, 
  
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,   // Tắt chế độ che chữ (mặc định Sentry che hết chữ thành *** để bảo mật)
      blockAllMedia: false, // Tắt chế độ che hình ảnh
    }),
  ],

  tracePropagationTargets: ["localhost", /^https:\/\/api\.toeic-smart\.io\.vn/], // Gửi trace cho cả API cùng domain và các route nội bộ
  
  // Bắt 100% các request để vẽ biểu đồ tốc độ mạng
  tracesSampleRate: 1.0, 
  
  // Quay video: Quay 10% phiên dùng bình thường, nhưng QUAY 100% nếu có lỗi
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0,
})

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    console.log("FETCH USER APP PROVIDER ==========")
    dispatch(getUserThunk());
  }, [dispatch]);

  return <>
    {children}
    <GlobalSnackbar />
  </>;
};

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <BrowserRouter>
    <Provider store={store}>
      <ThemeProviderWrapper>
        <AppProvider>
          <AppRouter />
        </AppProvider>
      </ThemeProviderWrapper>
    </Provider>
  </BrowserRouter>
  // </StrictMode>,
);