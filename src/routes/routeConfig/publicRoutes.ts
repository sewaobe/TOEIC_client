import { lazy, ComponentType } from 'react';

export interface AppRoute {
  path: string;
  element: ComponentType;
  guard?: ComponentType;
}
const LandingPage = lazy(() => import('../../views/pages/LandingPage'));
const AuthPage = lazy(() => import('../../views/pages/AuthPage'));
const TestDemoPage = lazy(() => import('../../views/pages/TestDemoPage'));
const OverviewTestPage = lazy(() => import('../../views/pages/OverviewPage'));

const ResetPasswordPage = lazy(
  () => import('../../views/pages/ResetPasswordPage'),
);
const ExamPage = lazy(() => import('../../views/pages/ExamPage'));
const ExamDetailPage = lazy(() => import('../../views/pages/ExamDetailPage'));

const publicRoutes: AppRoute[] = [
  { path: '/', element: LandingPage },
  { path: '/landing-page', element: LandingPage },
  { path: '/login', element: AuthPage },
  { path: '/overview-test', element: OverviewTestPage },
  { path: '/test', element: TestDemoPage },
  { path: '/reset-password', element: ResetPasswordPage },
  { path: '/exams', element: ExamPage },
  { path: '/exam/:id', element: ExamDetailPage },
];

export default publicRoutes;
