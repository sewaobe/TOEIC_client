export enum CERFLevel {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
}

export interface VocabularyWord {
  _id: string;
  word: string;
  phonetic?: string;
  type?: string;
  definitions: string[];
  hints?: string[];
  examples?: string[];
  image?: string;
  audio?: string;
  tags?: string[];
  level?: string;
  part?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PracticeTopicVocabulary {
  _id: string;
  title: string;
  description?: string;
  tags?: string[];
  level?: CERFLevel;
  vocabulary_words: VocabularyWord[] | string[];
  vocabulary_count?: number;
  created_at: Date;
  created_by: string;
  updated_at: Date;
}

export interface PracticeDefinitionTopicsResponse {
  items: PracticeTopicVocabulary[];
  total: number;
  page: number;
  pageCount: number;
}

export interface VocabularyWordsResponse {
  items: VocabularyWord[];
  total: number;
  page: number;
  pageCount: number;
}
