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

const HomePage = lazy(() => import('../../views/pages/HomePage'));

const publicRoutes: AppRoute[] = [
  { path: '/', element: LandingPage },
  { path: '/ladingPage', element: LandingPage },
  { path: '/login', element: AuthPage },
  { path: '/overview-test', element: OverviewTestPage },
  { path: '/test-demo', element: TestDemoPage },
  { path: '/home', element: HomePage },
];

export default publicRoutes;
