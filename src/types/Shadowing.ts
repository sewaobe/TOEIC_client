import { DisplayMode, PartType, Segment } from "./Dictation"

export interface Shadowing {
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

// export interface ShadowingAttemptLog {
//     index: number
//     accuracy: number
//     answers: Record<number, string>
//     mistakes: string[]
//     duration: number
//     started_at: string  // ISO date
//     finished_at: string // ISO date
// }
