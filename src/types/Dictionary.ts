export interface DictionaryData {
  englishWord: string;
  phonetic_uk?: string;
  phonetic_us?: string;
  audio_uk?: string;
  audio_us?: string;
  translations: TranslationEntry[];
  examples?: ExamplePair[];
  synonyms?: RelatedWord[];
  antonyms?: RelatedWord[];
  word_family?: WordFamilyItem[];
  collocations?: CollocationItem[];
  imageKeywords?: string[];
  imageUrls?: string[];
  metadata?: DictionaryMetadata;
}

export interface TranslationEntry {
  partOfSpeech: string;
  meanings: TranslatedDefinition[];
}

export interface TranslatedDefinition {
  en: string;
  vi: string;
}

export interface ExamplePair {
  en: string;
  vi: string;
}

export interface RelatedWord {
  word: string;
  meaning: string;
}

export interface WordFamilyItem {
  word: string;
  partOfSpeech: string;
}

export interface CollocationItem {
  phrase: string;
  meaning: string;
}

export interface DictionaryMetadata {
  source?: string;
  enrichedByAI?: boolean;
  missingFieldsFilledByAI?: string[];
}
