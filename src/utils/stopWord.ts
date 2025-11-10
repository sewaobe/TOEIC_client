let STOP_WORDS: Set<string> | null = null;

export const loadStopWords = async () => {
    if (STOP_WORDS) return STOP_WORDS; // cached

    try {
        const response = await fetch("/stopwords-en.txt");
        const text = await response.text();
        STOP_WORDS = new Set(
            text
                .split(/\r?\n/)
                .map((w) => w.trim().toLowerCase())
                .filter(Boolean)
        );
        return STOP_WORDS;
    } catch (error) {
        console.error("Failed to load stopwords:", error);
        STOP_WORDS = new Set();
        return STOP_WORDS;
    }
};
