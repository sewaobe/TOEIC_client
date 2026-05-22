// types/Exam.ts
export interface ExamQuestion {
  _id: string;
  name: string;
  questionNumber: number;
  textQuestion?: string;
  choices: Record<string, string>;
  correctAnswer: string;
  explanation?: string;
  tags?: string[];
}

export interface ExamGroup {
  _id: string;
  part: number;
  questions: ExamQuestion[];
  audioUrl?: string | null;
  imagesUrl?: string[];
  transcriptEnglish?: string;
  transcriptTranslation?: string;
}

export interface ExamPart {
  part: number;
  groups: ExamGroup[];
}
