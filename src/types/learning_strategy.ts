export type LearningPathStrategyModalMode =
  | "selected_current"
  | "pending_selection"
  | "empty";

export type LearningPathStrategyType =
  | "recommended"
  | "balanced"
  | "opportunity";

export type LearningPathStrategyOptionStatus =
  | "pending_selection"
  | "selected"
  | "dismissed"
  | "expired";

export type LearningPathStrategyOptionTrigger =
  | "initial_generation"
  | "full_test_review"
  | "mini_test_completion"
  | "manual_adjustment";

export type LearningPathScenarioSnapshot =
  | "ONBOARDING"
  | "FULLTEST_MONTHLY"
  | "PRE_DEADLINE"
  | "BEHIND_SCHEDULE";

export type StrategyAssessmentType = "mini_test" | "full_test";

export type StrategyCyclePreviewStatus =
  | "preview_available"
  | "route_completed"
  | "empty";

export type StrategyCyclePreviewUnit = {
  lesson_manager_id: string;
  title: string;
  part_type: number;
  unit_type?: string;
  target_tags: string[];
  planned_minutes: number;
  estimated_gain?: number;
  reason?: string;
};

export type StrategyCyclePreviewGroup = {
  part_type: number;
  part_label: string;
  total_minutes: number;
  unit_count: number;
  units: StrategyCyclePreviewUnit[];
};

export type StrategyCyclePreview = {
  status: StrategyCyclePreviewStatus;
  title: string;
  description: string;
  assessment_type?: StrategyAssessmentType | null;
  assessment_estimated_minutes?: number;
  estimated_learning_minutes: number;
  focus_part_types: number[];
  focus_skill_keys: string[];
  groups: StrategyCyclePreviewGroup[];
  route_completed_reason?: string;
};

export type StrategyOptionView = {
  option_id: string;

  strategy: LearningPathStrategyType;
  strategy_label: string;
  strategy_description: string;

  scenario: LearningPathScenarioSnapshot;
  scenario_label: string;
  scenario_description: string;

  status: LearningPathStrategyOptionStatus;
  status_label: string;

  title: string;
  description: string;

  focus_part_types: number[];
  focus_skill_keys: string[];
  focus_skill_labels: string[];

  estimated_total_minutes: number;
  estimated_total_hours: number;
  estimated_gain: number;

  summary_reasons: string[];

  preview_cycle?: StrategyCyclePreview | null;

  trigger_type: LearningPathStrategyOptionTrigger;
  source_user_test_id?: string | null;
  source_week_study_id?: string | null;

  created_at?: string | Date;
  selected_at?: string | Date;
};

export type StrategyHistoryItem = {
  option_id: string;
  trigger_type: LearningPathStrategyOptionTrigger;
  trigger_label: string;

  strategy: LearningPathStrategyType;
  strategy_label: string;

  scenario: LearningPathScenarioSnapshot;
  scenario_label: string;

  status: LearningPathStrategyOptionStatus;
  status_label: string;

  title: string;
  description: string;

  focus_part_types: number[];
  estimated_gain: number;
  summary_reason: string;

  source_user_test_id?: string | null;
  source_week_study_id?: string | null;

  created_at?: string | Date;
  selected_at?: string | Date;
};

export type LearningPathStrategyOverviewResponse = {
  mode: LearningPathStrategyModalMode;

  current_option: StrategyOptionView | null;
  pending_options: StrategyOptionView[];

  history: StrategyHistoryItem[];

  copy: {
    estimated_gain_tooltip: string;
    strategy_note: string;
  };
};

export type SelectLearningPathStrategyOptionResponse = {
  selected_strategy_option: StrategyOptionView;
  dismissed_strategy_options_count: number;
  expired_previous_selected_count: number;
  cycle_status: "cycle_created" | "route_completed";
  generated_week_id?: string | null;
  generated_day_count: number;
};