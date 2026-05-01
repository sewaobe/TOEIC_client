import { lazy, ComponentType } from 'react';
const LandingPage = lazy(() => import('../../views/pages/LandingPage'));

export interface AppRoute {
  path: string;
  element: ComponentType;
  guard?: ComponentType;
}
const AuthPage = lazy(() => import('../../views/pages/AuthPage'));
const TestDemoPage = lazy(() => import('../../views/pages/TestDemoPage'));
const OverviewTestPage = lazy(() => import('../../views/pages/OverviewPage'));

const ResetPasswordPage = lazy(() => import('../../views/pages/ResetPasswordPage'));
const ExamPage = lazy(() => import('../../views/pages/TestPage'));
const ExamDetailPage = lazy(() => import('../../views/pages/TestDetailPage'));
const PlanWizardPage = lazy(() => import('../../views/pages/PlanWizardPage'));
// const DemoPage = lazy(() => import('../../views/pages/PracticeShadowingListPageV2'));
// const DemoPageDetail = lazy(() => import('../../views/pages/PracticeShadowingPageV2'));

const publicRoutes: AppRoute[] = [
  { path: "/", element: LandingPage },
  { path: "/landing-page", element: LandingPage },
  { path: "/login", element: AuthPage },
  { path: "/overview-test", element: OverviewTestPage },
  { path: "/reset-password", element: ResetPasswordPage },
  { path: "/tests", element: ExamPage },
  { path: "/test", element: TestDemoPage },
  { path: "/tests/:id", element: ExamDetailPage },
  { path: "/plan", element: PlanWizardPage },
  // { path: "/demo", element: DemoPage },
  // { path: "/demo/:shadowingId", element: DemoPageDetail },
];

export default publicRoutes;
