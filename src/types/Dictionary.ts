export interface DictionaryData {
  englishWord: string;
  phonetic?: string;
  phonetic_uk?: string;
  phonetic_us?: string;
  audio_uk?: string;
  audio_us?: string;
  phonetics?: PhoneticInfo[];
  translations: TranslationEntry[];
  examples?: ExamplePair[];
  synonyms?: RelatedWord[];
  antonyms?: RelatedWord[];
  word_family?: WordFamilyItem[];
  collocations?: CollocationItem[];
  imageKeywords?: string[];
  imageUrls?: string[];
  source?: DictionarySource;
  fallback?: DictionaryFallback;
  metadata?: DictionaryMetadata;
  cached?: boolean;
  model?: string;
}

export type DictionarySource =
  | "gemini-core"
  | "gemini+dictionaryapi"
  | "gemini+dictionaryapi+datamuse"
  | "dictionaryapi.dev"
  | string;

export interface DictionaryFallback {
  used: boolean;
  reason?: string;
  missingFields?: string[];
}

export interface DictionaryMetadata {
  source?: string;
  enrichedByAI?: boolean;
  missingFieldsFilledByAI?: string[];
  [key: string]: unknown;
}

export interface PhoneticInfo {
  text?: string;
  audio?: string;
}

export interface TranslationEntry {
  partOfSpeech: string;
  meanings?: TranslatedDefinition[];
  translatedDefinitions?: TranslatedDefinition[];
  examples?: ExamplePair[];
  synonyms?: string[];
  antonyms?: string[];
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

export type SynonymMeaning = RelatedWord;

export interface WordFamilyItem {
  word: string;
  partOfSpeech: string;
}

export type WordFamilyEntry = WordFamilyItem;

export interface CollocationItem {
  phrase: string;
  meaning: string;
}

export type CollocationEntry = CollocationItem;
