import { lazy, ComponentType } from "react";

export interface AppRoute {
  path: string;
  element: ComponentType;
  guard?: ComponentType;
}
const LandingPage = lazy(() => import("../../views/pages/LandingPage"));
const AuthPage = lazy(() => import("../../views/pages/AuthPage"));
const TestDemoPage = lazy(() => import("../../views/pages/TestDemoPage"));
const OverviewTestPage = lazy(() => import("../../views/pages/OverviewPage"));

const ResetPasswordPage = lazy(
  () => import("../../views/pages/ResetPasswordPage")
);
const ExamPage = lazy(() => import("../../views/pages/TestPage"));
const ExamDetailPage = lazy(() => import("../../views/pages/TestDetailPage"));
const PlanWizardPage = lazy(() => import("../../views/pages/PlanWizardPage"));
const DashboardDemo = lazy(() => import("../../views/pages/DashboardDemo"));
const LessonPage = lazy(() => import("../../views/pages/LessonPage"));
const CreditPage = lazy(() => import("../../views/pages/CreditPage"));
const DemoPage = lazy(() => import("../../views/pages/DemoPage"));

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
  { path: "/programs", element: DashboardDemo },
  { path: "/lesson", element: LessonPage },
  { path: "/credit", element: CreditPage },
  { path: "/demo", element: DemoPage },
];

export default publicRoutes;
