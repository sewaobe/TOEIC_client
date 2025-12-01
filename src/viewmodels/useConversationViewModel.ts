import { useState, useEffect, useRef } from 'react';
import { Message, SessionResult, SpeakerRole, UserConfig } from '../types/PracticeSpeaking';
import { blobToBase64, playAudio } from '../utils/audio.util';
import { RECORDING_TIMEOUT_MS } from '../constants/PracticeSpeaking';

// Add type definitions for Web Speech API
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

export const useConversationViewModel = (
    config: UserConfig,
    onFinish: (result: SessionResult) => void
) => {
    // State
    const [messages, setMessages] = useState<Message[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isBotThinking, setIsBotThinking] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [sessionTime, setSessionTime] = useState(config.durationMinutes * 60);
    const [hasStarted, setHasStarted] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showStartOverlay, setShowStartOverlay] = useState(false);

    // Refs (Logic & Audio)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | undefined>(undefined);
    const timeoutRef = useRef<number | undefined>(undefined);
    const recordingStartRef = useRef<number>(0);

    const analysisContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const hasSpeechRef = useRef<boolean>(false);

    const recognitionRef = useRef<any>(null);
    const browserTranscriptRef = useRef<string>("");

    // --- INITIALIZATION ---

    useEffect(() => {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        analysisContextRef.current = new AudioContextClass();

        if (analysisContextRef.current.state === 'suspended') {
            setShowStartOverlay(true);
        }

        return () => {
            stopAnalysis();
            analysisContextRef.current?.close();
        };
    }, []);

    useEffect(() => {
        if (!hasStarted) return;
        const interval = window.setInterval(() => {
            setSessionTime(prev => {
                if (prev <= 0) {
                    handleFinishSession();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [hasStarted]);

    useEffect(() => {
        const initChat = async () => {
            setIsBotThinking(true);
            try {
                // const openingText = await generateOpening(config);
                const openingText = "Hello! Let's start our conversation.";
                await addBotMessage(openingText);
                setHasStarted(true);
            } catch (err) {
                setErrorMsg("Failed to start conversation. Please check API key.");
            } finally {
                setIsBotThinking(false);
            }
        };
        initChat();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- ACTIONS ---

    const handleStartAudio = async () => {
        if (analysisContextRef.current?.state === 'suspended') {
            await analysisContextRef.current.resume();
        }
        setShowStartOverlay(false);
    };

    const playBotAudio = async (base64: string) => {
        try {
            await playAudio(base64);
        } catch (e) {
            console.error("Audio playback failed", e);
            setErrorMsg("Audio playback failed.");
        }
    };

    const addBotMessage = async (text: string) => {
        const id = Date.now().toString();
        let audioBase64: string | undefined;
        try {
            // audioBase64 = await generateSpeech(text, config.botSpeed);
        } catch (e) {
            console.error("TTS failed", e);
        }

        const msg: Message = {
            id,
            role: SpeakerRole.BOT,
            text,
            audioBase64,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, msg]);

        if (audioBase64) {
            await playBotAudio(audioBase64);
        }
    };

    const stopAnalysis = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
    };

    const startRecording = async () => {
        if (isRecording || isInitializing) return;

        setErrorMsg(null);
        setIsInitializing(true);
        setRecordingTime(0);
        hasSpeechRef.current = false;
        browserTranscriptRef.current = "";

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = undefined;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }

        try {
            if (analysisContextRef.current?.state === 'suspended') {
                await analysisContextRef.current.resume();
                setShowStartOverlay(false);
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            const SpeechRecognition = (window as unknown as IWindow).SpeechRecognition || (window as unknown as IWindow).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event: any) => {
                    let finalTrans = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTrans += event.results[i][0].transcript;
                        }
                    }
                    browserTranscriptRef.current += finalTrans + " ";
                };

                try {
                    recognitionRef.current.start();
                } catch (e) {
                    console.warn("Speech recognition failed to start", e);
                }
            }

            if (analysisContextRef.current) {
                const source = analysisContextRef.current.createMediaStreamSource(stream);
                const analyser = analysisContextRef.current.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);

                sourceRef.current = source;
                analyserRef.current = analyser;

                const detectSound = () => {
                    if (!analyserRef.current) return;

                    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                    analyserRef.current.getByteFrequencyData(dataArray);

                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / dataArray.length;

                    // Lowered threshold from 20 to 10
                    if (average > 10) {
                        hasSpeechRef.current = true;
                    }

                    animationFrameRef.current = requestAnimationFrame(detectSound);
                };
                detectSound();
            }

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = handleRecordingStop;

            mediaRecorder.start();
            recordingStartRef.current = Date.now();
            setIsRecording(true);
            setIsInitializing(false);

            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= RECORDING_TIMEOUT_MS / 1000) return prev;
                    return prev + 1;
                });
            }, 1000);

            timeoutRef.current = window.setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    stopRecording();
                    setErrorMsg("Recording limit reached (10s).");
                }
            }, RECORDING_TIMEOUT_MS);

        } catch (err) {
            console.error("Mic error", err);
            setErrorMsg("Could not access microphone.");
            setIsInitializing(false);
        }
    };

    const stopRecording = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = undefined;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }

        stopAnalysis();

        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) { }
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
    };

    const handleRecordingStop = async () => {
        const duration = Date.now() - recordingStartRef.current;

        if (duration < 1000) {
            setErrorMsg("Audio too short (< 1s).");
            setIsRecording(false);
            return;
        }

        if (!hasSpeechRef.current) {
            setErrorMsg("No voice detected. Please speak closer.");
            setIsRecording(false);
            return;
        }

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

        if (audioBlob.size < 500) {
            setErrorMsg("Audio file too small.");
            setIsRecording(false);
            return;
        }

        setIsProcessing(true);

        try {
            const base64Audio = await blobToBase64(audioBlob);
            const browserTranscript = browserTranscriptRef.current.trim();

            const history = messages.slice(-6).map(m => ({
                role: m.role,
                text: m.text
            }));

            // const response = await processUserTurn(base64Audio, history, config, browserTranscript);
            // Mock data
            const response = {
                isUnintelligible: false,
                userTranscript: browserTranscript || "Sample user transcript. Sample user transcript. Sample user transcript. Sample user transcript. Sample user transcript. Sample user transcript. Sample user transcript. Sample user transcrip",
                botText: "This is a sample bot response.",
                feedback: {
                    pronunciationScore: 85,
                    fluencyScore: 80,
                    intonationScore: 75,
                    grammarScore: 90,
                    mistakes: [],
                    improvementTip: "Try to speak more clearly.",
                    totalScore: 75
                }
            }

            if (response.isUnintelligible) {
                setErrorMsg("No distinct words detected.");
                setIsProcessing(false);
                return;
            }

            const userMsg: Message = {
                id: Date.now().toString(),
                role: SpeakerRole.USER,
                text: response.userTranscript,
                feedback: response.feedback,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, userMsg]);

            setIsProcessing(false);
            setIsBotThinking(true);

            await addBotMessage(response.botText);
            setIsBotThinking(false);

        } catch (err) {
            console.error(err);
            setErrorMsg("Processing error. Please try again.");
            setIsProcessing(false);
            setIsBotThinking(false);
        }
    };

    const handleFinishSession = () => {
        const userMessages = messages.filter(m => m.role === SpeakerRole.USER && m.feedback);
        const avgScore = userMessages.reduce((acc, m) => acc + (m.feedback?.totalScore || 0), 0) / (userMessages.length || 1);
        const totalMistakes = userMessages.reduce((acc, m) => acc + (m.feedback?.mistakes.length || 0), 0);

        const result: SessionResult = {
            date: new Date().toISOString(),
            config,
            averageScore: Math.round(avgScore),
            messageCount: messages.length,
            mistakeCount: totalMistakes
        };
        onFinish(result);
    };

    return {
        messages,
        isRecording,
        isInitializing,
        isProcessing,
        isBotThinking,
        recordingTime,
        sessionTime,
        errorMsg,
        showStartOverlay,
        analyser: analyserRef.current,
        handleStartAudio,
        startRecording,
        stopRecording,
        playBotAudio,
        handleFinishSession
    };
};