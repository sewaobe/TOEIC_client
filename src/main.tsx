import { createRoot } from 'react-dom/client';
import './index.css';
import { lazy, Suspense } from 'react';
import ThemeProviderWrapper from './ThemeProviderWrapper';

const LandingApp = lazy(() => import('./LandingApp'));
const FullApp = lazy(() => import('./FullApp'));

const isLanding =
  window.location.pathname === '/' ||
  window.location.pathname === '/landing-page';

createRoot(document.getElementById('root')!).render(
  <ThemeProviderWrapper>
    <Suspense fallback={null}>
      {isLanding ? <LandingApp /> : <FullApp />}
    </Suspense>
  </ThemeProviderWrapper>
);