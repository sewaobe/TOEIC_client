import { DictionaryData } from "../types/Dictionary";
import axiosClient from "./axiosClient";

const BASE_URL = '/gemini';

type RawDictionaryResponse =
    | DictionaryData
    | Array<{ result?: unknown }>
    | {
        json?: unknown;
        data?: unknown;
        result?: unknown;
        source?: unknown;
        fallback?: unknown;
        cached?: unknown;
        model?: unknown;
        metadata?: unknown;
    }
    | null
    | undefined;

type DictionaryWrapperMetadata = Pick<DictionaryData, "cached" | "model" | "metadata" | "source" | "fallback">;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    Boolean(value && typeof value === "object" && !Array.isArray(value));

const trimString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const unwrapDictionaryPayload = (payload: RawDictionaryResponse): unknown => {
    let source: unknown = payload;

    for (let i = 0; i < 4; i += 1) {
        if (Array.isArray(source)) {
            const firstResult = source.find((item) => item && typeof item === "object" && "result" in item);
            if (!firstResult || !("result" in firstResult)) break;
            source = firstResult.result;
            continue;
        }

        if (!source || typeof source !== "object" || Array.isArray(source)) break;

        const record = source as { json?: unknown; data?: unknown; result?: unknown };
        const next = record.json ?? record.data ?? record.result;
        if (!next || next === source) break;

        source = next;
    }

    return source;
};

const collectDictionaryWrapperMetadata = (payload: RawDictionaryResponse): DictionaryWrapperMetadata => {
    let source: unknown = payload;
    const metadata: DictionaryWrapperMetadata = {};

    for (let i = 0; i < 4; i += 1) {
        if (!isRecord(source)) break;

        if (typeof source.cached === "boolean") metadata.cached = source.cached;
        if (typeof source.model === "string") metadata.model = source.model.trim();
        if (isRecord(source.metadata)) metadata.metadata = source.metadata as DictionaryData["metadata"];
        if (typeof source.source === "string") metadata.source = source.source;
        if (isRecord(source.fallback)) metadata.fallback = source.fallback as DictionaryData["fallback"];

        const next = source.json ?? source.data ?? source.result;
        if (!next || next === source) break;
        source = next;
    }

    return metadata;
};

const normalizeDictionaryData = (payload: RawDictionaryResponse, query: string): DictionaryData => {
    const source = unwrapDictionaryPayload(payload);
    const dict = (source && typeof source === "object") ? (source as Partial<DictionaryData>) : {};
    const wrapperMetadata = collectDictionaryWrapperMetadata(payload);
    const audioUk = trimString(dict.audio_uk);
    const audioUs = trimString(dict.audio_us);
    const phoneticUk = trimString(dict.phonetic_uk);
    const phoneticUs = trimString(dict.phonetic_us);

    const rootExamples = Array.isArray(dict.examples)
        ? dict.examples
            .filter((ex) => !!ex)
            .map((ex) => ({
                en: ex?.en?.trim() || "",
                vi: ex?.vi?.trim() || "",
            }))
            .filter((ex) => Boolean(ex.en || ex.vi))
        : undefined;

    const rootSynonyms = Array.isArray(dict.synonyms)
        ? dict.synonyms
            .filter((synonym) => !!synonym)
            .map((synonym) => ({
                word: synonym?.word?.trim() || "",
                meaning: synonym?.meaning?.trim() || "",
            }))
            .filter((synonym) => Boolean(synonym.word || synonym.meaning))
        : undefined;

    const rootAntonyms = Array.isArray(dict.antonyms)
        ? dict.antonyms
            .filter((antonym) => !!antonym)
            .map((antonym) => ({
                word: trimString(antonym?.word),
                meaning: trimString(antonym?.meaning),
            }))
            .filter((antonym) => Boolean(antonym.word || antonym.meaning))
        : undefined;

    const phonetics = Array.isArray(dict.phonetics)
        ? dict.phonetics
            .filter((item): item is NonNullable<DictionaryData["phonetics"]>[number] => !!item)
            .map((item) => ({
                text: trimString(item?.text) || undefined,
                audio: trimString(item?.audio) || undefined,
            }))
            .filter((item) => Boolean(item.text || item.audio))
        : [];

    const audioPhonetics = [
        audioUk || phoneticUk ? { text: phoneticUk ? `UK ${phoneticUk}` : "UK", audio: audioUk || undefined } : null,
        audioUs || phoneticUs ? { text: phoneticUs ? `US ${phoneticUs}` : "US", audio: audioUs || undefined } : null,
    ].filter((item): item is NonNullable<typeof item> => Boolean(item));

    const mergedPhonetics = phonetics.length ? phonetics : audioPhonetics;
    const metadata = isRecord(dict.metadata)
        ? { ...wrapperMetadata.metadata, ...dict.metadata }
        : wrapperMetadata.metadata;
    const sourceValue = trimString(dict.source) || trimString(metadata?.source) || trimString(wrapperMetadata.source) || undefined;

    return {
        englishWord: trimString(dict.englishWord) || query.trim(),
        phonetic: trimString(dict.phonetic) || phoneticUs || phoneticUk || undefined,
        phonetic_uk: phoneticUk || undefined,
        phonetic_us: phoneticUs || undefined,
        audio_uk: audioUk || undefined,
        audio_us: audioUs || undefined,
        phonetics: mergedPhonetics.length ? mergedPhonetics : undefined,
        translations: Array.isArray(dict.translations)
            ? dict.translations
                .filter((item): item is NonNullable<DictionaryData["translations"]>[number] => !!item)
                .map((translation) => ({
                    partOfSpeech: trimString(translation?.partOfSpeech) || "other",
                    meanings: Array.isArray(translation?.meanings)
                        ? translation.meanings
                            .filter((def) => !!def)
                            .map((def) => ({
                                en: trimString(def?.en),
                                vi: trimString(def?.vi),
                            }))
                            .filter((def) => Boolean(def.en || def.vi))
                        : undefined,
                    translatedDefinitions: Array.isArray(translation?.translatedDefinitions) || Array.isArray(translation?.meanings)
                        ? (translation.translatedDefinitions ?? translation.meanings ?? [])
                            .filter((def) => !!def)
                            .map((def) => ({
                                en: trimString(def?.en),
                                vi: trimString(def?.vi),
                            }))
                            .filter((def) => Boolean(def.en || def.vi))
                        : [],
                    examples: Array.isArray(translation?.examples)
                        ? translation.examples
                            .filter((ex) => !!ex)
                            .map((ex) => ({
                                en: trimString(ex?.en),
                                vi: trimString(ex?.vi),
                            }))
                            .filter((ex) => Boolean(ex.en || ex.vi))
                        : undefined,
                    synonyms: Array.isArray(translation?.synonyms)
                        ? translation.synonyms.map((syn) => trimString(syn)).filter((syn): syn is string => Boolean(syn))
                        : undefined,
                    antonyms: Array.isArray(translation?.antonyms)
                        ? translation.antonyms.map((ant) => trimString(ant)).filter((ant): ant is string => Boolean(ant))
                        : undefined,
                }))
                .filter((translation) => translation.translatedDefinitions.length > 0 || Boolean(translation.partOfSpeech))
            : [],
        imageKeywords: Array.isArray(dict.imageKeywords)
            ? dict.imageKeywords.map((keyword) => trimString(keyword)).filter((keyword): keyword is string => Boolean(keyword))
            : undefined,
        imageUrls: Array.isArray(dict.imageUrls)
            ? dict.imageUrls.map((url) => trimString(url)).filter((url): url is string => Boolean(url))
            : undefined,
        examples: rootExamples,
        synonyms: rootSynonyms,
        antonyms: rootAntonyms,
        word_family: Array.isArray(dict.word_family)
            ? dict.word_family
                .filter((item) => !!item)
                .map((item) => ({
                    word: trimString(item?.word),
                    partOfSpeech: trimString(item?.partOfSpeech),
                }))
                .filter((item) => Boolean(item.word))
            : undefined,
        collocations: Array.isArray(dict.collocations)
            ? dict.collocations
                .filter((item) => !!item)
                .map((item) => ({
                    phrase: trimString(item?.phrase),
                    meaning: trimString(item?.meaning),
                }))
                .filter((item) => Boolean(item.phrase || item.meaning))
            : undefined,
        source: sourceValue,
        fallback: dict.fallback ?? wrapperMetadata.fallback,
        metadata,
        cached: typeof dict.cached === "boolean" ? dict.cached : wrapperMetadata.cached,
        model: trimString(dict.model) || wrapperMetadata.model,
    };
};

export const dictionaryService = {
    async lookup(query: string): Promise<DictionaryData> {
        const res = await axiosClient.post(
            `${BASE_URL}/dictionary`,
            { query }
        );

        const payload = res?.data ?? res;
        if (!payload) {
            throw new Error("Không thể tra cứu từ điển");
        }

        return normalizeDictionaryData(payload, query);
    },
    async suggestWords(prefix: string): Promise<string[]> {
        if (!prefix.trim()) return [];

        try {
            const res = await fetch(
                `https://api.datamuse.com/sug?s=${encodeURIComponent(prefix)}`
            );

            if (!res.ok) {
                throw new Error("Lỗi khi gọi Datamuse API");
            }

            const data: { word: string; score: number }[] = await res.json();

            // Lọc gợi ý top 7 từ, loại trùng lặp
            const uniqueWords = Array.from(new Set(data.map((item) => item.word)));

            return uniqueWords.slice(0, 7);
        } catch (err) {
            console.error("Lỗi gợi ý Datamuse:", err);
            return [];
        }
    },
}
