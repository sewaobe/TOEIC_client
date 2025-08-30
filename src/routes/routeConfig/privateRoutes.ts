import { ComponentType, lazy } from 'react';
import ProtectedRoute from '../guards/ProtectedRoute';
const HomePage = lazy(() => import('../../views/pages/HomePage'));
const ProfilePage = lazy(() => import('../../views/pages/ProfilePage'));
const FlashCardPage = lazy(() => import('../../views/pages/FlashCardPage'));

export interface AppRoute {
  path: string;
  element: ComponentType;
  guard?: ComponentType<{ children: JSX.Element }>;
}

const privateRoutes: AppRoute[] = [
  { path: '/home', element: HomePage, guard: ProtectedRoute },
  { path: '/profile', element: ProfilePage, guard: ProtectedRoute },
  { path: '/flash-cards', element: FlashCardPage, guard: ProtectedRoute },

];

export default privateRoutes;
