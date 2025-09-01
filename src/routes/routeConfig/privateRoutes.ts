import { ComponentType, lazy } from 'react';
import ProtectedRoute from '../guards/ProtectedRoute';
const HomePage = lazy(() => import('../../views/pages/HomePage'));
const ProfilePage = lazy(() => import('../../views/pages/ProfilePage'));
const PracticeFlashCardPage = lazy(() => import('../../views/pages/PracticeFlashCardPage'));
const FlashCardPage = lazy(() => import('../../views/pages/FlashCardPage'));
const FlashCardDetailPage = lazy(() => import('../../views/pages/FlashcardDetailPage'));

export interface AppRoute {
  path: string;
  element: ComponentType;
  guard?: ComponentType<{ children: JSX.Element }>;
}

const privateRoutes: AppRoute[] = [
  { path: '/home', element: HomePage, guard: ProtectedRoute },
  { path: '/profile', element: ProfilePage, guard: ProtectedRoute },
  { path: '/flash-cards', element: FlashCardPage, guard: ProtectedRoute },
  { path: '/flash-cards/:id', element: FlashCardDetailPage, guard: ProtectedRoute },
  { path: '/flash-cards/:id/practice', element: PracticeFlashCardPage, guard: ProtectedRoute },
];

export default privateRoutes;
