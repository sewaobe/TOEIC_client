import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ThemeProviderWrapper from './ThemeProviderWrapper.tsx';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './routes/AppRouter.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProviderWrapper>
        <AppRouter />
      </ThemeProviderWrapper>
    </BrowserRouter>
  </StrictMode>,
);
