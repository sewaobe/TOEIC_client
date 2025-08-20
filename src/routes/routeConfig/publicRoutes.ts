import { lazy, ComponentType } from 'react';

export interface AppRoute {
  path: string;
  element: ComponentType;
  guard?: ComponentType;
}
const LandingPage = lazy(() => import('../../views/pages/LandingPage'));
const LoginPage = lazy(() => import('../../views/pages/LoginPage'));

const publicRoutes: AppRoute[] = [
  { path: '/', element: LandingPage },
  { path: '/home', element: LandingPage },
  { path: '/login', element: LoginPage },
];

export default publicRoutes;
