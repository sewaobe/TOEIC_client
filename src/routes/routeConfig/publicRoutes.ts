import { lazy, ComponentType } from 'react';

export interface AppRoute {
  path: string;
  element: ComponentType;
  guard?: ComponentType;
}
const LandingPage = lazy(() => import('../../views/pages/LandingPage'));
const AuthPage = lazy(() => import('../../views/pages/AuthPage'));
const TestDemoPage = lazy(() => import('../../views/pages/TestDemoPage'));

const publicRoutes: AppRoute[] = [
  { path: '/', element: LandingPage },
  { path: '/home', element: LandingPage },
  { path: '/login', element: AuthPage },
  {path: '/testDemo', element: TestDemoPage},
];

export default publicRoutes;
