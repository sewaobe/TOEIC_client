export type SkillMapTab = "parts" | "skills" | "history";

export type SkillMapAbilityStatus = "weak" | "medium" | "strong";

export type SkillMapAbsoluteLevel = "very_low" | "low" | "medium" | "high";

export type SkillMapTrend = "improving" | "stable" | "declining";

export type SkillMapSkillGroup = "basic" | "core" | "advanced";

export type SkillMapPart = {
  part_type: number;
  skill_domain: "Listening" | "Reading";
  ability_percent: number;
  status: SkillMapAbilityStatus;
  absolute_level: SkillMapAbsoluteLevel;
  trend?: SkillMapTrend;
  trend_delta_percent?: number;
  history_count?: number;
  item_count?: number;
  correct_count?: number;
  is_focus_part: boolean;
  last_evaluated_at?: string | Date;
};

export type SkillMapSkill = {
  skill_key: string;
  label_vi: string;
  part_type?: number;
  skill_domain?: "Listening" | "Reading";
  skill_group?: SkillMapSkillGroup;
  ability_percent: number;
  status: SkillMapAbilityStatus;
  absolute_level: SkillMapAbsoluteLevel;
  trend?: SkillMapTrend;
  trend_delta_percent?: number;
  history_count?: number;
  item_count?: number;
  correct_count?: number;
  is_focus_skill: boolean;
  last_evaluated_at?: string | Date;
};

export type SkillMapHistoryPart = {
  part_type: number;
  ability_percent: number;
  status: SkillMapAbilityStatus;
  absolute_level?: SkillMapAbsoluteLevel;
  item_count?: number;
  correct_count?: number;
};

export type SkillMapScoreTrendItem = {
  history_id: string;
  label: string;
  submitted_at?: string | Date;
  score?: number | null;
};

export type SkillMapHistoryItem = {
  history_id: string;
  source_user_test_id?: string | null;
  trigger_type: string;
  label: string;
  submitted_at?: string | Date;
  score?: number | null;
  duration?: number | null;
  submit_type?: string | null;
  parts: SkillMapHistoryPart[];
  weakest_parts: number[];
};

export type SkillMapPartsResponse = {
  tab: "parts";
  summary: {
    weakest_parts: number[];
    strongest_parts: number[];
    improving_parts: number[];
    declining_parts: number[];
    focus_part_types: number[];
    last_evaluated_at?: string | Date;
  };
  parts: SkillMapPart[];
};

export type SkillMapSkillsResponse = {
  tab: "skills";
  summary: {
    weakest_skills: Array<{
      skill_key: string;
      label_vi: string;
      part_type?: number;
      ability_percent: number;
    }>;
    focus_skill_count: number;
    improving_skill_count: number;
    last_evaluated_at?: string | Date;
  };
  filters: {
    status?: SkillMapAbilityStatus;
    part_type?: number;
    skill_group?: SkillMapSkillGroup;
    focus_only?: boolean;
    q?: string;
  };
  skills: SkillMapSkill[];
  meta: {
    total: number;
  };
};

export type SkillMapHistoryResponse = {
  tab: "history";
  summary: {
    assessment_count: number;
    latest_submitted_at?: string | Date | null;
    improved_part_count?: number | null;
  };
  score_trend: SkillMapScoreTrendItem[];
  histories: SkillMapHistoryItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

export type LearningPathSkillMapResponse =
  | SkillMapPartsResponse
  | SkillMapSkillsResponse
  | SkillMapHistoryResponse;

export type GetLearningPathSkillMapParams = {
  tab?: SkillMapTab;
  status?: SkillMapAbilityStatus;
  part_type?: number;
  skill_group?: SkillMapSkillGroup;
  focus_only?: boolean;
  q?: string;
  page?: number;
  limit?: number;
};
