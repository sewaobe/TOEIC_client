import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ThemeProviderWrapper from './ThemeProviderWrapper.tsx';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AppRouter } from './routes/AppRouter.tsx';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, store } from './stores/store.ts';
import { getUserThunk } from './stores/userSlice.ts';
import GlobalSnackbar from './components/common/GlobalSnackbar.tsx';
import { User } from './types/user.ts';

type SentryModule = typeof import('@sentry/react');

let sentryModulePromise: Promise<SentryModule | null> | null = null;

const getSentryModule = () => {
  if (!import.meta.env.PROD || !import.meta.env.VITE_SENTRY_DSN) {
    return Promise.resolve(null);
  }

  if (!sentryModulePromise) {
    sentryModulePromise = import('@sentry/react')
      .then((Sentry) => {
        Sentry.init({
          dsn: import.meta.env.VITE_SENTRY_DSN,
          integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
              maskAllText: false,
              blockAllMedia: false,
            }),
          ],
          tracePropagationTargets: ['localhost', /^https:\/\/api\.toeic-smart\.io\.vn/],
          // Keep observability but avoid heavy client-side sampling on initial navigation.
          tracesSampleRate: 0.1,
          replaysSessionSampleRate: 0.0,
          replaysOnErrorSampleRate: 0.2,
        });

        return Sentry;
      })
      .catch(() => null);
  }

  return sentryModulePromise;
};

const initSentryWhenIdle = () => {
  if (!import.meta.env.PROD || !import.meta.env.VITE_SENTRY_DSN) {
    return;
  }

  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  };

  const start = () => {
    void getSentryModule();
  };

  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(start, { timeout: 4000 });
    return;
  }

  window.setTimeout(start, 2000);
};

const PROTECTED_ROUTE_PREFIXES = [
  '/native/home',
  '/home',
  '/profile',
  '/flash-cards',
  '/study-calendar',
  '/practice-skill',
  '/result-statistic',
  '/learning-completion',
  '/programs',
  '/lesson',
  '/credit',
];

const shouldBootstrapUser = (pathname: string) =>
  PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

const setSentryUserContext = async (user: User | null) => {
  const Sentry = await getSentryModule();
  if (!Sentry) {
    return;
  }

  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user._id,
    email: user.email,
    username: user.username,
  });
};

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { initialized, loading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (initialized || loading || !shouldBootstrapUser(location.pathname)) {
      return;
    }

    dispatch(getUserThunk())
      .unwrap()
      .then((user) => {
        void setSentryUserContext(user);
      })
      .catch(() => {
        void setSentryUserContext(null);
      });
  }, [dispatch, initialized, loading, location.pathname]);

  return <>
    {children}
    <GlobalSnackbar />
  </>;
};

initSentryWhenIdle();

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