export interface IUserTestHistory {
    _id: string;
    submit_at: Date;
    completedPart: string;
    score: number;
    duration: number;
    correctCount: number;
    questionCount: number;
}