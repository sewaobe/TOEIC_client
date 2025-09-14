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