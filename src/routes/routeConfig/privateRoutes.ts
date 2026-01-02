import { ComponentType, lazy } from "react";
import ProtectedRoute from "../guards/ProtectedRoute";
const HomePage = lazy(() => import("../../views/pages/HomePage"));
const ProfilePage = lazy(() => import("../../views/pages/ProfilePage"));
const PracticeFlashCardPage = lazy(
  () => import("../../views/pages/PracticeFlashCardPage")
);
const FlashCardPage = lazy(() => import("../../views/pages/FlashCardPage"));
const FlashCardDetailPage = lazy(
  () => import("../../views/pages/FlashcardDetailPage")
);
const ResultTestPage = lazy(() => import("../../views/pages/ResultTestPage"));
const StudyCalendarPage = lazy(
  () => import("../../views/pages/StudyCalendarPage")
);
const PracticeSkillPage = lazy(
  () => import("../../views/pages/PracticeSkillPage")
);
const PracticeMiniTestPage = lazy(
  () => import("../../views/pages/PracticeMiniTestPage")
);
const PracticeDictationPage = lazy(
  () => import("../../views/pages/PracticeDictationPage")
);
const PracticeChallengePage = lazy(
  () => import("../../views/pages/PracticeChallengePage")
);
const PracticeShadowingPage = lazy(
  () => import("../../views/pages/PracticeShadowingPage")
);
const PracticeQuizPage = lazy(
  () => import("../../views/pages/PracticeQuizPage")
);
const ResultStatisticPage = lazy(
  () => import("../../views/pages/ResultStatisticPage")
);
const AnswerDetailPage = lazy(
  () => import("../../views/pages/AnswerDetailPage")
);
const RetryWrongAnswersPage = lazy(
  () => import("../../views/pages/RetryWrongAnswersPage")
);
const LearningCompletion = lazy(
  () => import("../../components/learningPath/LearningPathCompletion")
);
const PracticeDefinitionBasedPage = lazy(
  () => import("../../views/pages/PracticeDefinitionBasedPage")
);
const PracticeDefinitionBasedDetailPage = lazy(
  () => import("../../views/pages/PracticeDefinitionBasedDetailPage")
);

const PracticeSpeakingPage = lazy(
  () => import("../../views/pages/PracticeSpeakingPage")
);
const NativeHumanHomePage = lazy(() => import("../../views/pages/NativeHumanHomePage"));

export interface AppRoute {
  path: string;
  element: ComponentType;
  guard?: ComponentType<{ children: JSX.Element }>;
}

const privateRoutes: AppRoute[] = [
  { path: "/native/home", element: NativeHumanHomePage, guard: ProtectedRoute },
  { path: "/home", element: HomePage, guard: ProtectedRoute },
  { path: "/profile", element: ProfilePage, guard: ProtectedRoute },
  { path: "/flash-cards", element: FlashCardPage, guard: ProtectedRoute },
  {
    path: "/flash-cards/:id",
    element: FlashCardDetailPage,
    guard: ProtectedRoute,
  },
  {
    path: "/flash-cards/:id/practice",
    element: PracticeFlashCardPage,
    guard: ProtectedRoute,
  },
  {
    path: "/tests/:testId/result/:historyId",
    element: ResultTestPage,
    guard: ProtectedRoute,
  },
  {
    path: "/tests/:testId/result/:historyId/answers",
    element: AnswerDetailPage,
    guard: ProtectedRoute,
  },
  {
    path: "/tests/:testId/result/:historyId/retry",
    element: RetryWrongAnswersPage,
    guard: ProtectedRoute,
  },
  {
    path: "/study-calendar",
    element: StudyCalendarPage,
    guard: ProtectedRoute,
  },
  {
    path: "/practice-skill",
    element: PracticeSkillPage,
    guard: ProtectedRoute,
  },
  {
    path: "/practice-skill/mini-test",
    element: PracticeMiniTestPage,
    guard: ProtectedRoute,
  },
  {
    path: "/practice-skill/dictation",
    element: PracticeDictationPage,
    guard: ProtectedRoute,
  },
  {
    path: "/practice-skill/dictation/:id",
    element: PracticeDictationPage,
    guard: ProtectedRoute,
  },
  {
    path: "/practice-skill/challenge",
    element: PracticeChallengePage,
    guard: ProtectedRoute,
  },
  {
    path: "/practice-skill/shadowing",
    element: PracticeShadowingPage,
    guard: ProtectedRoute,
  },
  {
    path: "/practice-skill/shadowing/:id",
    element: PracticeShadowingPage,
    guard: ProtectedRoute,
  },
  {
    path: "/practice-skill/definition_based",
    element: PracticeDefinitionBasedPage,
    guard: ProtectedRoute,
  },
  {
    path: "/practice-skill/definition_based/:mode/:topicId",
    element: PracticeDefinitionBasedDetailPage,
    guard: ProtectedRoute,
  },
  {
    path: "/practice-skill/quiz",
    element: PracticeQuizPage,
    guard: ProtectedRoute,
  },
  {
    path: "/practice-skill/quiz/:id",
    element: PracticeQuizPage,
    guard: ProtectedRoute,
  },
  {
    path: "/result-statistic",
    element: ResultStatisticPage,
    guard: ProtectedRoute,
  },
  {
    path: "/practice-skill/speaking_conversation",
    element: PracticeSpeakingPage,
    guard: ProtectedRoute,
  },
  {
    path: "/learning-completion",
    element: LearningCompletion,
    guard: ProtectedRoute,
  },
];

export default privateRoutes;
