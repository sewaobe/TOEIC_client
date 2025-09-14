import { PlacementResult, Weekday, WeeklyPlan } from "../types/PlanWizard";


export const LS_KEY = "toeic_plan_draft";
export const LS_PLACEMENT_KEY = "toeic_placement_result";


export const SCORE_MIN = 200;
export const SCORE_MAX = 990;
export const SCORE_MARKS = [450, 550, 650, 750, 850].map((v) => ({ value: v, label: String(v) }));


export const MIN_MINUTES = 30;
export const MAX_MINUTES = 240;
export const STEP_MINUTES = 15;


export const WEEK_LABELS: Record<Weekday, string> = {
    Mon: "Thứ 2", Tue: "Thứ 3", Wed: "Thứ 4", Thu: "Thứ 5", Fri: "Thứ 6", Sat: "Thứ 7", Sun: "Chủ nhật",
};


export const DEFAULT_WEEKLY: WeeklyPlan = { Mon: 60, Tue: 60, Wed: 60, Thu: 60, Fri: 60, Sat: 90, Sun: 90 };


export const PLACEMENT_MOCK: PlacementResult = {
    currentScore: 520,
    parts: [
        { name: "Listening P1", accuracy: 0.62 },
        { name: "Listening P2", accuracy: 0.55 },
        { name: "Listening P3", accuracy: 0.48 },
        { name: "Listening P4", accuracy: 0.44 },
        { name: "Reading P5", accuracy: 0.58 },
        { name: "Reading P6", accuracy: 0.52 },
        { name: "Reading P7", accuracy: 0.47 },
    ],
    createdAt: new Date().toISOString(),
};