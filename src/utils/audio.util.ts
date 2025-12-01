// Simple in-memory cache for TTS to reduce costs (Constraint F)
// Maps key -> Base64 string
const ttsCache = new Map<string, string>();

export const getCachedAudio = (text: string, speed: string): string | undefined => {
  const key = `${text}-${speed}`;
  return ttsCache.get(key);
};

export const cacheAudio = (text: string, speed: string, base64: string) => {
  const key = `${text}-${speed}`;
  ttsCache.set(key, base64);
  
  // Clear cache item after 5 minutes
  setTimeout(() => {
    if (ttsCache.has(key)) {
        ttsCache.delete(key);
    }
  }, 5 * 60 * 1000);
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// --- MOCK PCM DECODING LOGIC (For Gemini Direct API) ---
// This logic is only needed because Gemini Live API returns raw PCM.
// Once you switch to Azure TTS (WAV), this part becomes legacy fallback.

let pcmAudioContext: AudioContext | null = null;

const getPcmAudioContext = () => {
  if (!pcmAudioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    pcmAudioContext = new AudioContextClass({ sampleRate: 24000 });
  }
  return pcmAudioContext;
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const playPCM = async (base64: string): Promise<void> => {
  const ctx = getPcmAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  const arrayBuffer = base64ToArrayBuffer(base64);
  const int16View = new Int16Array(arrayBuffer);
  const float32Data = new Float32Array(int16View.length);
  for (let i = 0; i < int16View.length; i++) {
    float32Data[i] = int16View[i] / 32768.0;
  }
  
  const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
  audioBuffer.getChannelData(0).set(float32Data);

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  
  return new Promise((resolve) => {
    source.onended = () => resolve();
    source.start();
  });
};

// --- FUTURE STANDARD WAV LOGIC (For Azure TTS Backend) ---

const playWav = (base64: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(`data:audio/wav;base64,${base64}`);
    audio.onended = () => resolve();
    audio.onerror = (e) => reject(e);
    audio.play().catch(reject);
  });
};

// --- UNIFIED PLAYER INTERFACE ---

/**
 * Smart Audio Player
 * Automatically detects if the data is a standard WAV (RIFF header) or raw PCM.
 * - Future: Backend sends WAV -> Uses HTML5 Audio (Simple).
 * - Now: Mock sends PCM -> Uses Web Audio API (Complex fallback).
 */
export const playAudio = async (base64: string): Promise<void> => {
  // Check for RIFF header (WAV file signature)
  // "RIFF" in base64 is usually "UklGR"
  if (base64.startsWith("UklGR")) {
    // FUTURE: Production Mode (Backend returns WAV)
    console.log("Audio format: WAV (Standard)");
    return playWav(base64);
  } else {
    // CURRENT: Mock Mode (Gemini returns PCM)
    console.log("Audio format: PCM (Mock)");
    return playPCM(base64);
  }
};