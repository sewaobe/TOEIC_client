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
    coherence: number;
    lexicalRange: number;
    grammaticalAccuracy: number;
    /** Optional overall average score from BE */
    averageScore?: number;
    totalTurns?: number;
    totalMistakes?: number;
    /** Tổng kết chung sau buổi học (map từ report_overall của BE) */
    generalFeedback: string;
    /** Các câu cần cải thiện, dùng lại Mistake (original/correction/explanation/type) */
    paraphrasedLines: Mistake[];
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