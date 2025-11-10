export interface Word {
    word: string
    start: number
    end: number
}

export interface Segment {
    text: string
    startTime: number
    endTime: number
    words?: Word[]
}

export type DisplayMode = "sentence" | "word"
export type PartType = 1 | 2 | 3 | 4 | 5 | 6 | 7
export interface Dictation {
    _id: string
    title: string
    transcript: string
    audio_url?: string
    duration?: number
    part_type: PartType
    timings: Segment[]
    display_mode: DisplayMode
    level: string
    status: string
    weight: number
    created_at: string
    updated_at?: string
    topic?: string[]
}

export interface DictationAttemptLog {
    index: number
    accuracy: number
    answers: Record<number, string>
    difficulty?: "easy" | "medium" | "hard"
    mistakes: string[]
    duration: number
    started_at: string  // ISO date
    finished_at: string // ISO date
}
