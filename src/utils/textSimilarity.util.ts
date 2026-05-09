const CONTRACTIONS: Record<string, string> = {
    "i'm": "i am",
    "you're": "you are",
    "he's": "he is",
    "she's": "she is",
    "it's": "it is",
    "we're": "we are",
    "they're": "they are",

    "i've": "i have",
    "you've": "you have",
    "we've": "we have",
    "they've": "they have",

    "i'll": "i will",
    "you'll": "you will",
    "he'll": "he will",
    "she'll": "she will",
    "it'll": "it will",
    "we'll": "we will",
    "they'll": "they will",

    "i'd": "i would",
    "you'd": "you would",
    "he'd": "he would",
    "she'd": "she would",
    "it'd": "it would",
    "we'd": "we would",
    "they'd": "they would",

    "can't": "cannot",
    "won't": "will not",
    "don't": "do not",
    "doesn't": "does not",
    "didn't": "did not",
    "isn't": "is not",
    "aren't": "are not",
    "wasn't": "was not",
    "weren't": "were not",
    "haven't": "have not",
    "hasn't": "has not",
    "hadn't": "had not",
    "shouldn't": "should not",
    "wouldn't": "would not",
    "couldn't": "could not",
    "mustn't": "must not",
    "mightn't": "might not",
    "needn't": "need not",
};

export const expandContractions = (text: string): string => {
    return text.replace(/\b[a-z]+(?:'[a-z]+)\b/gi, (match) => {
        const lower = match.toLowerCase();
        return CONTRACTIONS[lower] || lower;
    });
};

export const normalizeForDictation = (text: string): string => {
    return expandContractions(text)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/gi, "")
        .replace(/\s+/g, " ")
        .trim();
};

export const tokenizeForDictation = (text: string): string[] => {
    const normalized = normalizeForDictation(text);
    if (!normalized) return [];

    return normalized.split(" ").filter(Boolean);
};

export const wordEditDistance = (
    sourceWords: string[],
    targetWords: string[]
): number => {
    const dp = Array.from({ length: sourceWords.length + 1 }, () =>
        Array(targetWords.length + 1).fill(0)
    );

    for (let i = 0; i <= sourceWords.length; i++) {
        dp[i][0] = i;
    }

    for (let j = 0; j <= targetWords.length; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= sourceWords.length; i++) {
        for (let j = 1; j <= targetWords.length; j++) {
            const cost = sourceWords[i - 1] === targetWords[j - 1] ? 0 : 1;

            dp[i][j] = Math.min(
                dp[i - 1][j] + 1, // deletion
                dp[i][j - 1] + 1, // insertion
                dp[i - 1][j - 1] + cost // substitution / match
            );
        }
    }

    return dp[sourceWords.length][targetWords.length];
};

export const calculateWordSimilarity = (
    correctText: string,
    userText: string
): number => {
    const correctWords = tokenizeForDictation(correctText);
    const userWords = tokenizeForDictation(userText);

    if (correctWords.length === 0) return 0;
    if (userWords.length === 0) return 0;

    const distance = wordEditDistance(userWords, correctWords);

    const accuracy = Math.max(0, 1 - distance / correctWords.length);

    return Math.round(accuracy * 100);
};