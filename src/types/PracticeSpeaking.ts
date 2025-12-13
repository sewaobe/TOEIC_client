export enum SpeakerRole {
    USER = 'user',
    BOT = 'bot'
}

export interface UserConfig {
    scenario: string;
    level: string;
    userRole: string;
    botTone: string;
    goal: string;
    durationMinutes: number;
    botSpeed: 'slow' | 'normal' | 'fast';
}

export interface Mistake {
    original: string;
    correction: string;
    type: 'grammar' | 'vocabulary' | 'pronunciation';
    explanation: string;
}

export interface Feedback {
    pronunciationScore: number;
    fluencyScore: number;
    intonationScore: number;
    grammarScore: number;
    mistakes: Mistake[];
    improvementTip: string;
    totalScore: number;
}

export interface Message {
    id: string;
    role: SpeakerRole;
    text: string;
    translation?: string; // Vietnamese translation of the text (for Bot messages)
    audioBase64?: string; // Changed from audioUrl to store raw PCM base64
    feedback?: Feedback; // Only present on user messages
    timestamp: number;
}

export interface SessionResult {
    date: string;
    config: UserConfig;
    averageScore: number;
    messageCount: number;
    mistakeCount: number;
    /** Actual practiced duration in seconds (optional, from history) */
    actualDurationSeconds?: number;
}

export interface SessionReport {
    /** 0–100 */
    fluency: number;
    pronunciation: number;
    intonation: number;
    grammaticalAccuracy: number;
    /** Optional overall average score from BE */
    averageScore?: number;
    totalTurns?: number;
    totalMistakes?: number;
    /** Tổng kết chung sau buổi học (map từ report_overall của BE) */
    generalFeedback: string;
    /** Các câu cần cải thiện, dùng lại Mistake (original/correction/explanation/type) */
    paraphrasedLines: Mistake[];
    // Tab 3 mock-only fields (currently BE chưa trả):
    vocabularySuggestions?: VocabSuggestion[];
    grammarBreakdown?: GrammarBreakdownItem[];
}

export interface VocabSuggestion {
    word: string;
    context: string;
    alternatives: string[]; // Synonyms or better collocations
}

export interface GrammarBreakdownItem {
    structure: string;
    example: string;
    advice: string;
    status: 'Correct' | 'Needs Improvement';
}


export interface SkillMastery {
    fluency: number;
    grammar: number;
    pronunciation: number;
    intonation: number;
}

export interface TrendPoint {
    sessionIndex: number; // 1, 2, 3...
    score: number;
    date: string;
}

export interface AdaptiveTask {
    title: string;
    description: string;
    // Categories based on specific business rules
    category: 'Foundation' | 'Advanced' | 'New Topic' | 'Spaced Repetition';
    reason: string; // Why this was suggested (e.g., "Low grammar score detected")
}

export interface LearningProfile {
    // Progress Tracker (Time Series for ALL 4 Skills)
    skillMastery: SkillMastery; // Current average
    progressTrends: {
        overall: TrendPoint[];
        fluency: TrendPoint[];
        grammar: TrendPoint[];
        intonation: TrendPoint[];      // Intonation Range
        pronunciation: TrendPoint[]; // Pronunciation
    };

    // Skill Analysis
    weakestSkill: string;
    strongestSkill: string;

    // Readiness
    readinessScore: number; // 0-100
    readinessMessage: string;

    // Adaptive Roadmap
    recommendedPath: AdaptiveTask[];
}

export interface SessionWithDetail extends SessionResult {
    messages: Message[];
    /** Báo cáo tổng hợp, có thể null nếu chưa generate */
    report: SessionReport | null;
}

export interface TurnResponse {
    feedback: Feedback;
    botText: string;
    botTranslation: string;
    userTranscript: string;
    userTranslation?: string;
    isUnintelligible: boolean;
    botAudioBase64?: string;
}

export interface PracticeResult {
    score: number;
    feedback: string;
    detectedText: string;
}