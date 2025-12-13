import { useState, useEffect, useRef } from 'react';
import { UserConfig, Message, SpeakerRole, SessionResult, PracticeResult, TurnResponse, SessionWithDetail } from '../types/PracticeSpeaking';
import { blobToBase64, playAudio } from '../utils/audio.util';
import { RECORDING_TIMEOUT_MS } from '../constants/PracticeSpeaking';
import { speakingService } from '../services/speaking.service';
import { speakText } from '../utils/tts.util';

// Add type definitions for Web Speech API
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

export const useConversationViewModel = (
    config: UserConfig,
    onFinish: (result: SessionResult & { _id?: string }, detail?: SessionWithDetail | null) => void,
    replaySessionId?: string
) => {
    // State
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isBotThinking, setIsBotThinking] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [sessionTime, setSessionTime] = useState(config.durationMinutes * 60);
    const [hasStarted, setHasStarted] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [showStartOverlay, setShowStartOverlay] = useState(false);

    // Suggestion State
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);

    // Practice State
    const [isPracticeOpen, setIsPracticeOpen] = useState(false);
    const [practiceTarget, setPracticeTarget] = useState("");
    const [isPracticeRecording, setIsPracticeRecording] = useState(false);
    const [isPracticeProcessing, setIsPracticeProcessing] = useState(false);
    const [practiceResult, setPracticeResult] = useState<PracticeResult | null>(null);

    // Refs (Logic & Audio)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | undefined>(undefined);
    const timeoutRef = useRef<number | undefined>(undefined);
    const recordingStartRef = useRef<number>(0);
    const isCancelledRef = useRef<boolean>(false);

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
                if (replaySessionId) {
                    // Replay mode: load existing session messages
                    const apiRes = await speakingService.getSessionMessages(replaySessionId);
                    const messagesFromApi = apiRes;
                    setSessionId(replaySessionId);
                    const mapped: Message[] = messagesFromApi.map((m: any) => ({
                        id: m._id || `${m.sender}-${m.created_at}`,
                        role: m.sender === 'user' ? SpeakerRole.USER : SpeakerRole.BOT,
                        text: m.text,
                        translation: m.meta?.translation,
                        feedback: m.meta?.feedback || m.meta?.pronunciation_feedback,
                        audioBase64: m.meta?.audioBase64,
                        timestamp: m.created_at ? new Date(m.created_at).getTime() : Date.now(),
                    }));
                    setMessages(mapped);
                    setHasStarted(true);
                } else {
                    // Normal live session
                    const session = await speakingService.createSession({
                        title: config.scenario || "Practice speaking session",
                        config,
                    });
                    setSessionId(session._id);

                    const opening = {
                        text: "Hello! Let's start our conversation practice. How are you today?",
                        translation: "Xin chào! Hãy bắt đầu luyện tập hội thoại của chúng ta. Hôm nay bạn thế nào?",
                    };
                    await addBotMessage(opening.text, opening.translation);
                    setHasStarted(true);
                    speakText(opening.text, config.botTone);
                }
            } catch (err) {
                console.error("initChat error", err);
                setErrorMsg("Failed to start conversation. Please check API.");
            } finally {
                setIsBotThinking(false);
            }
        };
        initChat();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [replaySessionId]);

    // --- ACTIONS ---

    const handleStartAudio = async () => {
        if (analysisContextRef.current?.state === 'suspended') {
            await analysisContextRef.current.resume();
        }
        setShowStartOverlay(false);
    };

    const playBotAudio = async (base64: string) => {
        try {
            // Dừng TTS nếu đang nói
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }

            await playAudio(base64);
        } catch (e) {
            console.error("Audio playback failed", e);
            setErrorMsg("Audio playback failed.");
        }
    };

    const generateId = () => {
        return Date.now().toString() + Math.random().toString(36).substring(2, 9);
    };

    const addBotMessage = async (text: string, translation?: string, audioBase64?: string) => {
        const id = generateId();
        const msg: Message = {
            id,
            role: SpeakerRole.BOT,
            text,
            translation,
            audioBase64,
            timestamp: Date.now()
        };

        // Chỉ cập nhật state, việc auto-play sẽ do effect phía dưới xử lý
        setMessages(prev => [...prev, msg]);
    };

    // Tự động phát audio cho tin nhắn BOT mới nhất sau khi đã render UI
    const lastBotAudioIdRef = useRef<string | null>(null);

    useEffect(() => {
        const lastBotWithAudio = [...messages]
            .reverse()
            .find(m => m.role === SpeakerRole.BOT && m.audioBase64);

        if (!lastBotWithAudio) return;
        if (lastBotWithAudio.id === lastBotAudioIdRef.current) return;

        lastBotAudioIdRef.current = lastBotWithAudio.id;

        const timer = window.setTimeout(() => {
            if (lastBotWithAudio.audioBase64) {
                playBotAudio(lastBotWithAudio.audioBase64);
            }
        }, 200);

        return () => {
            window.clearTimeout(timer);
        };
    }, [messages]);

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

    const setupAudioStream = async () => {
        if (analysisContextRef.current?.state === 'suspended') {
            await analysisContextRef.current.resume();
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Visualizer Setup
        if (analysisContextRef.current) {
            const source = analysisContextRef.current.createMediaStreamSource(stream);
            const analyser = analysisContextRef.current.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            sourceRef.current = source;
            analyserRef.current = analyser;
        }
        return stream;
    };

    // --- SUGGESTIONS ---

    const getSuggestions = async () => {
        if (isSuggesting) return;
        setIsSuggesting(true);
        try {
            const history = messages.slice(-6).map(m => ({ role: m.role, text: m.text }));
            // const results = await generateSuggestions(history, config);
            const results = ["Could you suggest some alternative phrases?", "How can I improve my vocabulary?", "What are some common mistakes to avoid?"];
            setSuggestions(results);
        } catch (e) {
            console.error("Suggestion error", e);
            setErrorMsg("Failed to get suggestions.");
        } finally {
            setIsSuggesting(false);
        }
    };

    const clearSuggestions = () => {
        setSuggestions([]);
    };

    // --- MAIN RECORDING ---

    const startRecording = async () => {
        if (isRecording || isInitializing) return;

        // Clear suggestions when recording starts
        clearSuggestions();

        setErrorMsg(null);
        setIsInitializing(true);
        setRecordingTime(0);
        hasSpeechRef.current = false;
        isCancelledRef.current = false;
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
            const stream = await setupAudioStream();

            // Detection Logic
            const detectSound = () => {
                if (!analyserRef.current) return;
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                const average = sum / dataArray.length;
                if (average > 10) hasSpeechRef.current = true;
                animationFrameRef.current = requestAnimationFrame(detectSound);
            };
            detectSound();

            // Recorder Setup
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            // Web Speech API
            const SpeechRecognition = (window as unknown as IWindow).SpeechRecognition || (window as unknown as IWindow).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event: any) => {
                    let finalTrans = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) finalTrans += event.results[i][0].transcript;
                    }
                    browserTranscriptRef.current += finalTrans + " ";
                };
                try { recognitionRef.current.start(); } catch (e) { }
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

    const cancelRecording = () => {
        isCancelledRef.current = true;
        stopRecording();
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
            try { recognitionRef.current.stop(); } catch (e) { }
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
    };

    const handleRecordingStop = async () => {
        // If user cancelled, do not process
        if (isCancelledRef.current) {
            setIsRecording(false);
            return;
        }

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

            if (!sessionId) {
                throw new Error("Session not initialized");
            }

            // Gửi lượt nói lên BE để chấm điểm (mock Python hiện tại)
            const { turn: response } = await speakingService.processTurn({
                sessionId,
                userTranscript: browserTranscript || undefined,
                audioBase64: base64Audio,
            });

            if (response.isUnintelligible) {
                setErrorMsg("No distinct words detected.");
                setIsProcessing(false);
                return;
            }

            const userMsg: Message = {
                id: generateId(),
                role: SpeakerRole.USER,
                text: response.userTranscript,
                translation: response.userTranslation,
                feedback: response.feedback,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, userMsg]);

            setIsProcessing(false);
            setIsBotThinking(true);

            await addBotMessage(
                response.botText,
                response.botTranslation,
                response.botAudioBase64,
            );
            setIsBotThinking(false);

        } catch (err) {
            console.error(err);
            setErrorMsg("Processing error. Please try again.");
            setIsProcessing(false);
            setIsBotThinking(false);
        }
    };

    // --- PRACTICE MODE ---

    const openPractice = (phrase: string) => {
        setPracticeTarget(phrase);
        setPracticeResult(null);
        setIsPracticeOpen(true);
    };

    const closePractice = () => {
        stopPracticeRecording(); // Safety cleanup
        setIsPracticeOpen(false);
        setPracticeResult(null);
    };

    const startPracticeRecording = async () => {
        if (isPracticeRecording) return;

        try {
            const stream = await setupAudioStream();

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setIsPracticeProcessing(true);
                try {
                    const base64 = await blobToBase64(audioBlob);
                    // const result = await evaluatePronunciation(base64, practiceTarget);
                    const result: PracticeResult = {
                        score: 88,
                        feedback: "Good job! Focus on your intonation for better clarity.",
                        detectedText: "Hello, how are you?"
                    };

                    setPracticeResult(result);
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsPracticeProcessing(false);
                }
            };

            mediaRecorder.start();
            setIsPracticeRecording(true);
            setPracticeResult(null);

        } catch (e) {
            console.error("Practice mic error", e);
        }
    };

    const stopPracticeRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        setIsPracticeRecording(false);
        stopAnalysis();
    };

    const handleFinishSession = async () => {
        const userMessages = messages.filter(m => m.role === SpeakerRole.USER && m.feedback);
        const avgScore = userMessages.reduce((acc, m) => acc + (m.feedback?.totalScore || 0), 0) / (userMessages.length || 1);
        const totalMistakes = userMessages.reduce((acc, m) => acc + (m.feedback?.mistakes.length || 0), 0);

        const result: SessionResult & { _id?: string } = {
            date: new Date().toISOString(),
            config,
            averageScore: Math.round(avgScore),
            messageCount: messages.length,
            mistakeCount: totalMistakes,
            _id: sessionId || undefined,
        };

        // Thời lượng thực tế = thời lượng cấu hình - thời gian còn lại (nếu dùng countdown)
        const configuredSeconds = config.durationMinutes * 60;
        const actualDurationSeconds = Math.max(0, configuredSeconds - sessionTime);

        let detail: SessionWithDetail | null = null;
        const start = Date.now();
        try {
            if (sessionId) {
                setIsGeneratingReport(true);

                await speakingService.endSession({
                    sessionId,
                    actualDurationSeconds,
                });

                // Gọi BE để lấy session detail + overall report
                detail = await speakingService.getSessionDetail({
                    ...result,
                    _id: sessionId,
                } as any);

                const elapsed = Date.now() - start;
                if (elapsed < 400) {
                    await new Promise(res => setTimeout(res, 400 - elapsed));
                }
            }
        } catch (e) {
            console.error("Failed to end session on server or generate report", e);
        } finally {
            setIsGeneratingReport(false);
        }

        onFinish(result, detail);
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
        isGeneratingReport,
        analyser: analyserRef.current,

        // Suggestions
        suggestions,
        isSuggesting,
        getSuggestions,

        // Practice Props
        isPracticeOpen,
        practiceTarget,
        isPracticeRecording,
        isPracticeProcessing,
        practiceResult,
        openPractice,
        closePractice,
        startPracticeRecording,
        stopPracticeRecording,

        handleStartAudio,
        startRecording,
        stopRecording,
        cancelRecording,
        playBotAudio,
        handleFinishSession
    };
};
