import { PracticeResult } from '../types/PracticeSpeaking';

// Web Speech API types
interface IWindow extends Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

/**
 * Normalize text for comparison: lowercase, remove punctuation, trim extra spaces
 */
const normalizeText = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ')    // Normalize whitespace
        .trim();
};

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a score from 0 to 100
 */
const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = normalizeText(str1);
    const s2 = normalizeText(str2);

    if (s1 === s2) return 100;
    if (s1.length === 0 || s2.length === 0) return 0;

    // Levenshtein distance
    const matrix: number[][] = [];

    for (let i = 0; i <= s1.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    const maxLen = Math.max(s1.length, s2.length);
    const distance = matrix[s1.length][s2.length];
    const similarity = ((maxLen - distance) / maxLen) * 100;

    return Math.round(similarity);
};

/**
 * Calculate word-level accuracy
 * Returns percentage of correctly spoken words
 */
const calculateWordAccuracy = (target: string, detected: string): number => {
    const targetWords = normalizeText(target).split(' ').filter(w => w.length > 0);
    const detectedWords = normalizeText(detected).split(' ').filter(w => w.length > 0);

    if (targetWords.length === 0) return 0;

    let matchedWords = 0;
    const detectedSet = new Set(detectedWords);

    for (const word of targetWords) {
        if (detectedSet.has(word)) {
            matchedWords++;
        }
    }

    return Math.round((matchedWords / targetWords.length) * 100);
};

/**
 * Generate feedback based on score
 */
const generateFeedback = (score: number, _target: string, detected: string): string => {
    if (score >= 90) {
        return "Excellent! Your pronunciation is very clear and accurate.";
    } else if (score >= 75) {
        return "Good job! Your pronunciation is clear. Keep practicing for even better results.";
    } else if (score >= 60) {
        return "Not bad! Try to speak more slowly and clearly. Focus on each word.";
    } else if (score >= 40) {
        return "Keep practicing! Speak more slowly and focus on pronouncing each syllable clearly.";
    } else if (detected.trim().length === 0) {
        return "I couldn't detect any speech. Please speak louder and closer to the microphone.";
    } else {
        return "Let's try again. Speak slowly and clearly, focusing on each word in the phrase.";
    }
};

/**
 * Evaluate pronunciation by comparing detected speech with target phrase
 */
export const evaluatePronunciation = (
    detectedText: string,
    targetPhrase: string
): PracticeResult => {
    const similarity = calculateSimilarity(targetPhrase, detectedText);
    const wordAccuracy = calculateWordAccuracy(targetPhrase, detectedText);
    
    // Combined score: 60% similarity + 40% word accuracy
    const score = Math.round(similarity * 0.6 + wordAccuracy * 0.4);
    
    const feedback = generateFeedback(score, targetPhrase, detectedText);

    return {
        score,
        feedback,
        detectedText: detectedText || "(No speech detected)",
    };
};

/**
 * Create a Speech Recognition instance
 * Returns null if not supported
 * Note: caller can override continuous, interimResults, lang after creation
 */
export const createSpeechRecognition = (): SpeechRecognition | null => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
        console.warn('Speech Recognition is not supported in this browser');
        return null;
    }

    const recognition = new SpeechRecognitionClass();
    // Default settings - can be overridden by caller
    recognition.continuous = false;
    recognition.interimResults = true; // Enable interim for better capture
    recognition.lang = 'en-US';

    return recognition;
};

/**
 * Speech-to-Text using Web Speech API
 * Returns a Promise that resolves with the transcript
 */
export const speechToText = (
    timeoutMs: number = 10000
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const recognition = createSpeechRecognition();

        if (!recognition) {
            reject(new Error('Speech Recognition not supported'));
            return;
        }

        let transcript = '';
        let hasResult = false;

        const timeoutId = setTimeout(() => {
            recognition.abort();
            if (!hasResult) {
                resolve(''); // Return empty if no speech detected within timeout
            }
        }, timeoutMs);

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            hasResult = true;
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript;
                }
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            clearTimeout(timeoutId);
            // Don't reject for 'no-speech' or 'aborted' - these are expected
            if (event.error === 'no-speech' || event.error === 'aborted') {
                resolve('');
            } else {
                reject(new Error(`Speech recognition error: ${event.error}`));
            }
        };

        recognition.onend = () => {
            clearTimeout(timeoutId);
            resolve(transcript.trim());
        };

        try {
            recognition.start();
        } catch (e) {
            clearTimeout(timeoutId);
            reject(e);
        }
    });
};

/**
 * Full pronunciation practice evaluation:
 * Records speech, converts to text, and evaluates against target
 */
export const evaluatePracticeRecording = async (
    _audioBlob: Blob,
    targetPhrase: string,
    browserTranscript?: string
): Promise<PracticeResult> => {
    // If we already have a browser transcript from real-time recognition, use it
    const detectedText = browserTranscript?.trim() || '';
    
    return evaluatePronunciation(detectedText, targetPhrase);
};
