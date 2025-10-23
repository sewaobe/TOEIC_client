import { useCallback, useEffect, useState } from 'react';

export type VoiceType = 'US' | 'UK';

export function useSpeech(defaultVoice: VoiceType = 'US') {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Lấy danh sách voice khi load
  useEffect(() => {
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  const speak = useCallback(
    (text: string, voice: VoiceType = defaultVoice) => {
      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      const selected = voices.find((v) =>
        voice === 'US' ? v.lang === 'en-US' : v.lang === 'en-GB',
      );

      if (selected) utterance.voice = selected;
      utterance.rate = 1;     // tốc độ
      utterance.pitch = 1;    // cao độ
      utterance.volume = 1;   // âm lượng

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [voices, defaultVoice],
  );

  return { speak, voices };
}
