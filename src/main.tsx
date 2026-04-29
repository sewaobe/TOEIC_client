import { createRoot } from 'react-dom/client';
import './index.css';
import { lazy, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import ThemeProviderWrapper from './ThemeProviderWrapper';

const LandingApp = lazy(() => import('./LandingApp'));
const FullApp = lazy(() => import('./FullApp'));

const isLanding =
  window.location.pathname === '/' ||
  window.location.pathname === '/landing-page';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProviderWrapper>
      <Suspense fallback={null}>
        {isLanding ? <LandingApp /> : <FullApp />}
      </Suspense>
    </ThemeProviderWrapper>
  </BrowserRouter>
);