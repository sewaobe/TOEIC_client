import { ComponentType, lazy } from 'react';
import ProtectedRoute from '../guards/ProtectedRoute';
const HomePage = lazy(() => import('../../views/pages/HomePage'));

export interface AppRoute {
  path: string;
  element: ComponentType;
  guard?: ComponentType<{ children: JSX.Element }>;
}

const privateRoutes: AppRoute[] = [
  { path: '/home', element: HomePage, guard: ProtectedRoute },
];

export default privateRoutes;
