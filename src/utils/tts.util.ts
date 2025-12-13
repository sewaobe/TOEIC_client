import { UserConfig } from '../types/PracticeSpeaking';

const pickVoiceForTone = (botTone: string): SpeechSynthesisVoice | null => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();

    const isFemale = (v: SpeechSynthesisVoice) =>
        /female/i.test(v.name) || /Jenny|Sara|Mary|Samantha|Linda/i.test(v.name);

    const isMale = (v: SpeechSynthesisVoice) =>
        /male/i.test(v.name) || /Guy|Jason|David|John|James/i.test(v.name);

    const enVoices = voices.filter(v => v.lang.startsWith('en'));

    switch (botTone) {
        case 'Friendly & Encouraging':
            return enVoices.find(isFemale) || enVoices[0] || null;
        case 'Professional & Formal':
            return enVoices.find(isMale) || enVoices[0] || null;
        case 'Strict & Correction-focused':
            return enVoices.find(isMale) || enVoices[0] || null;
        case 'Funny & Casual':
            return enVoices.find(isMale) || enVoices[0] || null;
        case 'Fast Native Speaker':
            return enVoices[0] || null;
        default:
            return enVoices[0] || null;
    }
};

/**
 * Text-to-Speech sử dụng Web Speech Synthesis API
 * @param text Văn bản cần đọc
 * @param botTone Tông giọng bot (optional)
 * @param botSpeed Tốc độ đọc (optional)
 */
export const speakText = (
    text: string,
    botTone?: string,
    botSpeed?: UserConfig['botSpeed']
) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;
    
    // Dừng tất cả audio đang phát (bao gồm cả bot audio và TTS)
    if (synth.speaking) synth.cancel();
    
    // Dừng bot audio nếu đang phát
    if (typeof window !== 'undefined' && (window as any).__stopAllAudio) {
        (window as any).__stopAllAudio();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';

    // Map tốc độ từ botSpeed sang rate của Web Speech API
    const speedToRate: Record<NonNullable<UserConfig['botSpeed']>, number> = {
        slow: 0.8,
        normal: 1.0,
        fast: 1.2,
    };

    utterance.rate = speedToRate[botSpeed ?? 'normal'];

    if (botTone) {
        const voice = pickVoiceForTone(botTone);
        if (voice) utterance.voice = voice;
    }

    synth.speak(utterance);
};
