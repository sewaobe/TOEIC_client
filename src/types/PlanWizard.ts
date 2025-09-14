export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface WeeklyPlan {
    Mon: number; Tue: number; Wed: number; Thu: number; Fri: number; Sat: number; Sun: number;
}

export interface PlacementPart { name: string; accuracy: number; }

export interface PlacementResult { currentScore: number; parts: PlacementPart[]; createdAt: string; }

export interface PlanDraft {
    targetScore?: number;
    weeklyPlan?: WeeklyPlan; // per-day template for a "typical" week
    weeklyTotals?: number[]; // minutes per week (length = weeks)
    endDate?: string; // ISO yyyy-mm-dd
    activeStep?: number;
}