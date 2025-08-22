import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ThemeProviderWrapper from './ThemeProviderWrapper.tsx';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './routes/AppRouter.tsx';
import { Provider } from 'react-redux';
import { store } from './stores/store.ts';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <ThemeProviderWrapper>
          <AppRouter />
        </ThemeProviderWrapper>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);
