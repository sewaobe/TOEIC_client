export interface DictionaryData {
  englishWord: string;                     // Từ tiếng Anh chính
  phonetic?: string;                       // Phiên âm chính
  phonetics?: PhoneticInfo[];              // Danh sách các phiên âm kèm audio
  translations: TranslationEntry[];        // Danh sách các nghĩa (theo từ loại)
  imageKeywords?: string[];                // Gợi ý từ khóa hình ảnh
  imageUrls?: string[];                    // Danh sách URL hình ảnh minh họa
}

export interface PhoneticInfo {
  text?: string;                           // Dạng phiên âm (IPA)
  audio?: string;                          // Link phát âm
}

export interface TranslationEntry {
  partOfSpeech: string;                    // Từ loại (N, V, Adj, Adv, ...)
  translatedDefinitions: TranslatedDefinition[]; // Danh sách định nghĩa song ngữ
  examples?: ExamplePair[];                // Ví dụ (Anh - Việt)
  synonyms?: string[];                     // Từ đồng nghĩa
  antonyms?: string[];                     // Từ trái nghĩa
}

export interface TranslatedDefinition {
  en: string;                              // Nghĩa tiếng Anh
  vi: string;                              // Nghĩa tiếng Việt
}

export interface ExamplePair {
  en: string;                              // Ví dụ tiếng Anh
  vi: string;                              // Dịch tiếng Việt
}
