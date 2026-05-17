export interface FlashcardRepeatPolicyRule {
    ratio: number;
    min: number;
    max: number;
}

export interface FlashcardRepeatPolicy {
    vague: FlashcardRepeatPolicyRule;
    unknown_or_forgot: FlashcardRepeatPolicyRule;
}

export type FlashcardRepeatPolicyKey = keyof FlashcardRepeatPolicy;

export interface FlashcardReviewOptionPreview {
    difficulty?: number;
    half_life_days?: number;
    interval_days?: number;
    repeat_policy_key?: FlashcardRepeatPolicyKey;
}

export interface FlashcardNewCardPreviewOptions {
    remember: FlashcardReviewOptionPreview;
    vague: FlashcardReviewOptionPreview;
    unknown: FlashcardReviewOptionPreview;
}

export interface FlashcardNewCardPreview {
    card_type: "NEW";
    options: FlashcardNewCardPreviewOptions;
}

export interface FlashcardReviewCardPreviewOptions {
    remember: FlashcardReviewOptionPreview;
    vague: FlashcardReviewOptionPreview;
    forgot: FlashcardReviewOptionPreview;
}

export interface FlashcardReviewMemorySnapshot {
    difficulty: number;
    half_life_days: number;
    last_reviewed_at: string | null;
    p_recall_now: number;
}

export interface FlashcardReviewCardPreview {
    card_type: "REVIEW";
    memory_snapshot: FlashcardReviewMemorySnapshot;
    options: FlashcardReviewCardPreviewOptions;
}

export type FlashcardCardPreview =
    | FlashcardNewCardPreview
    | FlashcardReviewCardPreview;

export interface FlashcardPreviewMetadata {
    repeat_policy: FlashcardRepeatPolicy;
    cards: Record<string, FlashcardCardPreview>;
}

export interface FlashcardCurrentOptionPreview {
    key: "remember" | "vague" | "unknown" | "forgot";
    label: string;
    preview: string;
    repeat_after_cards?: number;
}

export interface FlashcardCurrentPreview {
    card_type: "NEW" | "REVIEW";
    options: FlashcardCurrentOptionPreview[];
}
