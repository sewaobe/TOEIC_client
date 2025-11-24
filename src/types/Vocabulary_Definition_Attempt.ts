export interface VocabularyDefinitionAttempt {
  vocabulary_id: string;
  session_id?: string;
  answer: string;
  is_correct: boolean;
  accuracy_score: number;
  mode: "definition" | "guess"; // Chế độ luyện tập
  attempt_at: Date;
}
