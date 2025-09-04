export interface ITestCard {
    _id: string;
    title: string;
    topic: string;
    score?: number;
    countComment: number;
    countSubmit: number;
    isNew: boolean;
}