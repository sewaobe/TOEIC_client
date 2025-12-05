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
}

export interface TurnResponse {
  feedback: Feedback;
  botText: string;
  botTranslation: string;
  userTranscript: string;
  userTranslation?: string;
  isUnintelligible: boolean;
}

export interface PracticeResult {
    score: number;
    feedback: string;
    detectedText: string;
}