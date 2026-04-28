import { User } from '../types/user.ts';

export type SentryModule = typeof import('@sentry/react');

let sentryModulePromise: Promise<SentryModule | null> | null = null;

export const getSentryModule = () => {
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

export const setSentryUserContext = async (user: User | null) => {
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