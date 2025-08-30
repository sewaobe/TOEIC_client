// types/Exam.ts
export interface ExamQuestion {
  _id: string;
  name: string;
  textQuestion?: string;
  choices: Record<string, string>;
  correctAnswer: string;
  explanation?: string;
}

export interface ExamGroup {
  _id: string;
  part: number;
  questions: ExamQuestion[];
  audioUrl?: string;
  imagesUrl?: string[];
  transcriptEnglish?: string;
  transcriptTranslation?: string;
}

export interface ExamPart {
  part: number;
  groups: ExamGroup[];
}
