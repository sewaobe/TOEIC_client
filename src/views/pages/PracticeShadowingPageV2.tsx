import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Autorenew as Loader2,
} from '@mui/icons-material';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Box, LinearProgress } from '@mui/material';
import Sidebar from '../../components/practices/shadowing-detail-v2/Sidebar';
import RightContent from '../../components/practices/shadowing-detail-v2/RightContent';
import PracticeLayout from '../layouts/PracticeLayout';
import { ShadowingLessonDetail, shadowingV2Service } from '../../services/shadowing_service_v2';
import { practiceSessionService } from '../../services/practice_session.service';
import { shadowingAttemptService } from '../../services/shadowing_attempt.service';
import { PracticeSession } from '../../types/PracticeSession';
import { ShadowingSegmentResult } from '../../types/ShadowingAttempt';
import { createSpeechRecognition, evaluatePronunciation } from '../../utils/stt.util';
import {
  buildShadowingCombinedAudioBlob,
  clearShadowingAudioChunks,
  hasShadowingAudioChunks,
  migrateShadowingAudioChunks,
  saveShadowingAudioChunk,
} from '../../utils/shadowingAudioStore';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface Suggestion {
  id: number;
  title: string;
  difficulty: string;
  badge: string;
  badgeType: 'warning' | 'info';
  category: string;
  duration: number;
  progress: number;
  thumbnailUrl: string;
}

// ==========================================
// MOCK SUGGESTIONS
// ==========================================

const mockSuggestions: Suggestion[] = [
  { id: 1, title: "Apartment Cleaning Quote Request", difficulty: "B1", badge: "Improve weak area", badgeType: "warning", category: "TOEIC", duration: 1, progress: 0, thumbnailUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&auto=format&fit=crop" },
  { id: 2, title: "Marketing Conference Update", difficulty: "B1", badge: "Improve weak area", badgeType: "warning", category: "TOEIC", duration: 1, progress: 0, thumbnailUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=300&auto=format&fit=crop" },
  { id: 3, title: "Sourdough Bread Workshop Introduction", difficulty: "A2", badge: "Improve weak area", badgeType: "warning", category: "TOEIC", duration: 1, progress: 0, thumbnailUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop" },
  { id: 4, title: "Conference Preparation Updates", difficulty: "B2", badge: "Improve weak area", badgeType: "warning", category: "TOEIC", duration: 1, progress: 0, thumbnailUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=300&auto=format&fit=crop" },
  { id: 5, title: "Oakwood Weather and Sports", difficulty: "B1", badge: "Continue series", badgeType: "info", category: "TOEIC", duration: 1, progress: 65, thumbnailUrl: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=300&auto=format&fit=crop" },
  { id: 6, title: "Can you \"see\" images in your mind? Some...", difficulty: "C1", badge: "Same topic", badgeType: "info", category: "General", duration: 3, progress: 0, thumbnailUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=300&auto=format&fit=crop" },
];

type SavePromptIntent = 'milestone' | 'exit' | 'submit';

interface LocalShadowingDraft {
  draftId: string;
  activeTranscriptId: number;
  segmentResults: ShadowingSegmentResult[];
  completedIndices: number[];
  declinedMilestonePrompt: boolean;
}

const LOCAL_DRAFT_PREFIX = 'toeic_shadowing_local_draft';

const getLocalDraftStorageKey = (shadowingId: string) => `${LOCAL_DRAFT_PREFIX}:${shadowingId}`;

const createLocalDraftId = (shadowingId: string) => `local-shadowing:${shadowingId}:${Date.now()}`;

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function PracticeShadowingV2Page() {
  const { shadowingId, id } = useParams<{ shadowingId?: string; id?: string }>();
  const resolvedShadowingId = shadowingId || id;
  const [shadowingData, setShadowingData] = useState<ShadowingLessonDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionLoading, setSessionLoading] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);
  const [savePromptIntent, setSavePromptIntent] = useState<SavePromptIntent | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [resumeAudioMissing, setResumeAudioMissing] = useState<boolean>(false);
  const [segmentResults, setSegmentResults] = useState<ShadowingSegmentResult[]>([]);
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<{
    transcript: string;
    score: number;
    feedback: string;
    wordResults?: { word: string; correct: boolean }[];
  } | null>(null);

  const [appState, setAppState] = useState<'idle' | 'recording' | 'feedback'>('idle');
  const [recordTimer, setRecordTimer] = useState<number>(0);
  const [activeTranscriptId, setActiveTranscriptId] = useState<number | null>(null);

  // Trạng thái phát video và chế độ Media (Video / Audio)
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [mediaMode, setMediaMode] = useState<'video' | 'audio'>('audio');

  // Trạng thái Sidebar Tabs
  const [activeTab, setActiveTab] = useState<'transcript' | 'suggestions'>('transcript');

  // Interactive Toggles States
  const [showSentence, setShowSentence] = useState<boolean>(true);
  const [showIPA, setShowIPA] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);

  // Thêm iframeRef để call Youtube API
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const pendingRecordCountRef = useRef(0);
  const latestSegmentResultsRef = useRef<ShadowingSegmentResult[]>([]);
  const latestCompletedIndicesRef = useRef<number[]>([]);
  const localDraftIdRef = useRef<string>('');
  const declinedMilestonePromptRef = useRef(false);
  const [isCompactHeight, setIsCompactHeight] = useState<boolean>(false);

  const normalizedSourceType = shadowingData?.source_type || 'audio';
  const canUseVideo = normalizedSourceType === 'youtube';

  const normalizeWords = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s']/g, '')
      .split(/\s+/)
      .filter(Boolean);
  };

  const buildWordResults = (targetText: string, transcript: string) => {
    const spokenWords = new Set(normalizeWords(transcript));
    return targetText
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({
        word,
        correct: spokenWords.has(word.toLowerCase().replace(/[^\w']/g, '')),
      }));
  };

  const getAverageScore = (results: ShadowingSegmentResult[]) => {
    if (results.length === 0) return 0;
    return Math.round(
      results.reduce((sum, segment) => {
        const latest = segment.attempts[segment.attempts.length - 1];
        return sum + (latest?.similarity_score || 0);
      }, 0) / results.length,
    );
  };

  const getAudioStorageId = () => currentSession?._id || localDraftIdRef.current;

  const persistLocalDraft = (
    results = latestSegmentResultsRef.current,
    indices = latestCompletedIndicesRef.current,
    activeId = activeTranscriptId || 1,
  ) => {
    if (!resolvedShadowingId || currentSession) return;
    if (!localDraftIdRef.current) {
      localDraftIdRef.current = createLocalDraftId(resolvedShadowingId);
    }

    const draft: LocalShadowingDraft = {
      draftId: localDraftIdRef.current,
      activeTranscriptId: activeId,
      segmentResults: results,
      completedIndices: indices,
      declinedMilestonePrompt: declinedMilestonePromptRef.current,
    };
    localStorage.setItem(getLocalDraftStorageKey(resolvedShadowingId), JSON.stringify(draft));
  };

  const clearLocalDraft = async (draftId = localDraftIdRef.current) => {
    if (resolvedShadowingId) {
      localStorage.removeItem(getLocalDraftStorageKey(resolvedShadowingId));
    }
    if (draftId) {
      await clearShadowingAudioChunks(draftId);
    }
    localDraftIdRef.current = resolvedShadowingId ? createLocalDraftId(resolvedShadowingId) : '';
    declinedMilestonePromptRef.current = false;
  };

  useEffect(() => {
    const updateCompactMode = () => {
      setIsCompactHeight(window.innerHeight <= 700);
    };

    updateCompactMode();
    window.addEventListener('resize', updateCompactMode);
    return () => window.removeEventListener('resize', updateCompactMode);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchShadowingDetail = async () => {
      if (!resolvedShadowingId) {
        if (isMounted) {
          setShadowingData(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const data = await shadowingV2Service.getDetail(resolvedShadowingId);

        if (isMounted) {
          setShadowingData(data);
          if (data?.timings.length) {
            setActiveTranscriptId(1);
          }
        }
      } catch (error) {
        console.error('Failed to load shadowing detail:', error);
        if (isMounted) {
          setShadowingData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchShadowingDetail();

    return () => {
      isMounted = false;
    };
  }, [resolvedShadowingId]);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      if (!resolvedShadowingId || !shadowingData) return;

      try {
        setSessionLoading(true);
        const existingSession = await practiceSessionService.getByTopic(resolvedShadowingId, 'shadowing');

        if (!isMounted) return;

        if (existingSession) {
          setCurrentSession(existingSession);
          setCompletedIndices(existingSession.completed_indices || []);
          setActiveTranscriptId((existingSession.current_index || 0) + 1);
          const existingAttempt = await shadowingAttemptService.getBySession(existingSession._id);
          if (!isMounted) return;
          const restoredSegmentResults = existingAttempt?.segment_results || [];
          setSegmentResults(restoredSegmentResults);
          latestSegmentResultsRef.current = restoredSegmentResults;
          latestCompletedIndicesRef.current = existingSession.completed_indices || [];
          setResumeAudioMissing(Boolean(existingAttempt?.segment_results?.length) && !(await hasShadowingAudioChunks(existingSession._id)));
          setShowResumeModal(true);
          return;
        }

        const rawLocalDraft = localStorage.getItem(getLocalDraftStorageKey(resolvedShadowingId));
        if (rawLocalDraft) {
          try {
            const localDraft = JSON.parse(rawLocalDraft) as LocalShadowingDraft;
            localDraftIdRef.current = localDraft.draftId || createLocalDraftId(resolvedShadowingId);
            declinedMilestonePromptRef.current = Boolean(localDraft.declinedMilestonePrompt);
            setSegmentResults(localDraft.segmentResults || []);
            setCompletedIndices(localDraft.completedIndices || []);
            setActiveTranscriptId(localDraft.activeTranscriptId || 1);
            latestSegmentResultsRef.current = localDraft.segmentResults || [];
            latestCompletedIndicesRef.current = localDraft.completedIndices || [];
          } catch (error) {
            console.warn('Failed to restore local shadowing draft:', error);
            localDraftIdRef.current = createLocalDraftId(resolvedShadowingId);
          }
        } else {
          localDraftIdRef.current = createLocalDraftId(resolvedShadowingId);
        }
      } catch (error) {
        console.error('Failed to bootstrap shadowing session:', error);
      } finally {
        if (isMounted) {
          setSessionLoading(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [resolvedShadowingId, shadowingData]);

  useEffect(() => {
    if (canUseVideo) {
      setMediaMode('video');
    }
  }, [canUseVideo, mediaMode]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (appState === 'recording') {
      interval = setInterval(() => {
        setRecordTimer(prev => {
          if (prev >= 30) {
            if (recorderRef.current && recorderRef.current.state === 'recording') {
              recorderRef.current.stop();
            }
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [appState]);

  // Gửi lệnh điều khiển video thực tế cho YouTube iframe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const action = isVideoPlaying ? 'playVideo' : 'pauseVideo';
      try {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: action, args: [] }), '*');
      } catch (e) {
        console.error("Iframe cross-origin block");
      }
    }
  }, [isVideoPlaying]);

  const handleStartRecording = () => {
    const start = async () => {
      if (!activeTranscriptData) return;
      if (!createSpeechRecognition()) {
        alert('Trình duyệt hiện tại không hỗ trợ Web Speech API. Vui lòng dùng Chrome hoặc Edge để luyện shadowing.');
        return;
      }

      try {
        setCurrentFeedback(null);
        setIsVideoPlaying(false);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorderRef.current = recorder;
        recordingChunksRef.current = [];
        transcriptRef.current = '';

        const recognition = createSpeechRecognition();
        if (recognition) {
          recognitionRef.current = recognition;
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              }
            }
            if (finalTranscript) {
              transcriptRef.current = `${transcriptRef.current} ${finalTranscript}`.trim();
            }
          };
          recognition.onerror = (event: any) => {
            console.warn('[Shadowing STT] error', event.error);
          };
          try {
            recognition.start();
          } catch (error) {
            console.warn('[Shadowing STT] start failed', error);
          }
        }

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordingChunksRef.current.push(event.data);
          }
        };
        recorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch {
              // ignore
            }
            recognitionRef.current = null;
          }

          await new Promise((resolve) => setTimeout(resolve, 250));
          const blob = new Blob(recordingChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          await handleRecordingResult(blob);
        };

        recorder.start();
        recordingStartRef.current = Date.now();
        setAppState('recording');
        setRecordTimer(1);
      } catch (error) {
        console.error('Failed to start recording:', error);
        alert('Không thể bật microphone. Vui lòng kiểm tra quyền truy cập microphone.');
      }
    };

    start();
  };

  const handleStopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
    setRecordTimer(0);
  };

  const handleRecordingResult = async (blob: Blob) => {
    const audioStorageId = getAudioStorageId();
    if (!audioStorageId || !activeTranscriptData || !activeTranscriptId || blob.size === 0) {
      setAppState('idle');
      return;
    }

    const segmentIndex = activeTranscriptId - 1;
    const transcript = transcriptRef.current.trim();
    const result = evaluatePronunciation(transcript, activeTranscriptData.text);
    const duration = Math.round((Date.now() - recordingStartRef.current) / 1000);
    const attempt = {
      user_transcript: transcript,
      similarity_score: result.score,
      accuracy_score: result.score,
      feedback: result.feedback,
      duration,
      attempted_at: new Date(),
    };

    await saveShadowingAudioChunk(audioStorageId, segmentIndex, blob);

    const nextSegmentResults = (() => {
      const existing = segmentResults.find((segment) => segment.index === segmentIndex);
      const others = segmentResults.filter((segment) => segment.index !== segmentIndex);
      const attempts = [...(existing?.attempts || []), attempt].slice(-3);
      return [
        ...others,
        {
          index: segmentIndex,
          text: activeTranscriptData.text,
          attempts,
        },
      ].sort((a, b) => a.index - b.index);
    })();

    const nextCompletedIndices = Array.from(new Set([...completedIndices, segmentIndex])).sort((a, b) => a - b);
    setSegmentResults(nextSegmentResults);
    setCompletedIndices(nextCompletedIndices);
    setCurrentFeedback({
      transcript: result.detectedText,
      score: result.score,
      feedback: result.feedback,
      wordResults: buildWordResults(activeTranscriptData.text, transcript),
    });
    setAppState('feedback');

    latestSegmentResultsRef.current = nextSegmentResults;
    latestCompletedIndicesRef.current = nextCompletedIndices;
    persistLocalDraft(nextSegmentResults, nextCompletedIndices, activeTranscriptId);
    pendingRecordCountRef.current += 1;

    if (!currentSession && nextCompletedIndices.length >= 5 && !declinedMilestonePromptRef.current) {
      setSavePromptIntent('milestone');
      return;
    }

    if (currentSession && pendingRecordCountRef.current >= 5) {
      await flushShadowingDraft(segmentIndex, nextSegmentResults, nextCompletedIndices);
    }
  };

  const flushShadowingDraft = async (
    currentIndex = (activeTranscriptId || 1) - 1,
    results = latestSegmentResultsRef.current,
    indices = latestCompletedIndicesRef.current,
  ) => {
    if (!currentSession || !shadowingData) return;
    if (results.length === 0 && indices.length === 0) return;

    try {
      await Promise.all([
        practiceSessionService.updateProgress(currentSession._id, {
          current_index: Math.max(currentIndex, 0),
          completed_items: indices.length,
          completed_indices: indices,
          total_accuracy: getAverageScore(results),
        }),
        shadowingAttemptService.saveDraft(currentSession._id, {
          total_segments: shadowingData.timings.length,
          completed_segments: indices.length,
          segment_results: results,
        }),
      ]);
      pendingRecordCountRef.current = 0;
    } catch (error) {
      console.error('Failed to save shadowing draft:', error);
    }
  };

  const createSessionAndSaveDraft = async (
    currentIndex = (activeTranscriptId || 1) - 1,
    results = latestSegmentResultsRef.current,
    indices = latestCompletedIndicesRef.current,
  ) => {
    if (!resolvedShadowingId || !shadowingData) return null;
    if (results.length === 0 && indices.length === 0) return null;

    const oldDraftId = localDraftIdRef.current;
    const sessionResponse = await practiceSessionService.startOrResume({
      practice_type: 'shadowing',
      topic_id: resolvedShadowingId,
      total_items: shadowingData.timings.length,
    });
    const session = sessionResponse.session;

    if (oldDraftId) {
      await migrateShadowingAudioChunks(oldDraftId, session._id);
    }

    await Promise.all([
      practiceSessionService.updateProgress(session._id, {
        current_index: Math.max(currentIndex, 0),
        completed_items: indices.length,
        completed_indices: indices,
        total_accuracy: getAverageScore(results),
      }),
      shadowingAttemptService.saveDraft(session._id, {
        total_segments: shadowingData.timings.length,
        completed_segments: indices.length,
        segment_results: results,
      }),
    ]);

    setCurrentSession(session);
    pendingRecordCountRef.current = 0;
    if (resolvedShadowingId) {
      localStorage.removeItem(getLocalDraftStorageKey(resolvedShadowingId));
    }
    return session;
  };

  const handleNext = () => {
    setAppState('idle');
    if (!shadowingData) return;

    const currentIndex = (activeTranscriptId || 1) - 1;
    if (currentIndex >= 0 && currentIndex < shadowingData.timings.length - 1) {
      setActiveTranscriptId(currentIndex + 2);
    } else {
      setActiveTranscriptId(1);
    }
  };

  const handlePrevious = () => {
    setAppState('idle');
    if (!shadowingData) return;

    const currentIndex = (activeTranscriptId || 1);
    if (currentIndex === 1) return;

    if (currentIndex >= 2 && currentIndex <= shadowingData.timings.length) {
      setActiveTranscriptId(currentIndex - 1);
    } else {
      setActiveTranscriptId(1);
    }
  }

  const handleSelectedTranscriptTab = (transcriptId: number) => {
    setAppState('idle');
    setActiveTranscriptId(transcriptId);
  }

  const toggleVideoPlayback = () => {
    console.log(isVideoPlaying)
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleBack = async () => {
    if (!currentSession && latestCompletedIndicesRef.current.length > 0) {
      setSavePromptIntent('exit');
      return;
    }

    await flushShadowingDraft();
    window.history.back();
  };

  const handleResumeSession = () => {
    setShowResumeModal(false);
    setSessionLoading(false);
  };

  const handleCancelSessionAndRestart = async () => {
    if (!currentSession || !resolvedShadowingId || !shadowingData) return;

    const oldSessionId = currentSession._id;
    setShowResumeModal(false);
    setSessionLoading(true);

    try {
      await Promise.all([
        shadowingAttemptService.deleteBySession(oldSessionId),
        clearShadowingAudioChunks(oldSessionId),
        practiceSessionService.cancel(oldSessionId),
      ]);
      setCurrentSession(null);
      localDraftIdRef.current = createLocalDraftId(resolvedShadowingId);
      localStorage.removeItem(getLocalDraftStorageKey(resolvedShadowingId));
      setSegmentResults([]);
      setCompletedIndices([]);
      latestSegmentResultsRef.current = [];
      latestCompletedIndicesRef.current = [];
      pendingRecordCountRef.current = 0;
      declinedMilestonePromptRef.current = false;
      setActiveTranscriptId(1);
      setCurrentFeedback(null);
      setResumeAudioMissing(false);
    } catch (error) {
      console.error('Failed to restart shadowing session:', error);
      setShowResumeModal(true);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleCompletePractice = async () => {
    if (completedIndices.length < transcriptSegments.length) {
      alert('Bạn cần hoàn thành tất cả câu trước khi submit bài shadowing.');
      return;
    }

    if (!currentSession) {
      setSavePromptIntent('submit');
      return;
    }

    const audioBlob = await buildShadowingCombinedAudioBlob(currentSession._id);
    if (!audioBlob) {
      alert('Không tìm thấy dữ liệu ghi âm cục bộ. Vui lòng quay lại thiết bị/trình duyệt cũ để tiếp tục đầy đủ, hoặc bắt đầu lại bài.');
      return;
    }

    try {
      await flushShadowingDraft();
      await shadowingAttemptService.complete(currentSession._id, {
        total_segments: transcriptSegments.length,
        completed_segments: completedIndices.length,
        segment_results: segmentResults,
        similarity_score: getAverageScore(segmentResults),
      }, audioBlob);
      await clearShadowingAudioChunks(currentSession._id);
      alert('Đã hoàn thành bài shadowing.');
    } catch (error) {
      console.error('Failed to complete shadowing practice:', error);
      alert('Không thể submit bài shadowing. Vui lòng thử lại.');
    }
  };

  const handleConfirmSavePrompt = async () => {
    if (!savePromptIntent || !shadowingData) return;

    setIsSavingDraft(true);
    try {
      const session = await createSessionAndSaveDraft();
      setSavePromptIntent(null);

      if (savePromptIntent === 'exit') {
        window.history.back();
        return;
      }

      if (savePromptIntent === 'submit' && session) {
        const audioBlob = await buildShadowingCombinedAudioBlob(session._id);
        if (!audioBlob) {
          alert('Không tìm thấy dữ liệu ghi âm cục bộ. Vui lòng quay lại thiết bị/trình duyệt cũ để tiếp tục đầy đủ, hoặc bắt đầu lại bài.');
          return;
        }

        await shadowingAttemptService.complete(session._id, {
          total_segments: transcriptSegments.length,
          completed_segments: completedIndices.length,
          segment_results: segmentResults,
          similarity_score: getAverageScore(segmentResults),
        }, audioBlob);
        await clearShadowingAudioChunks(session._id);
        alert('Đã hoàn thành bài shadowing.');
      }
    } catch (error) {
      console.error('Failed to save shadowing progress:', error);
      alert('Không thể lưu tiến trình shadowing. Vui lòng thử lại.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleDeclineSavePrompt = async () => {
    if (!savePromptIntent) return;

    if (savePromptIntent === 'milestone') {
      declinedMilestonePromptRef.current = true;
      persistLocalDraft();
      setSavePromptIntent(null);
      return;
    }

    if (savePromptIntent === 'exit') {
      const draftId = localDraftIdRef.current;
      setSavePromptIntent(null);
      await clearLocalDraft(draftId);
      window.history.back();
      return;
    }

    setSavePromptIntent(null);
  };


  const transcriptSegments = useMemo(() => {
    if (!shadowingData) return [];
    return shadowingData.timings.map((timing, index) => ({
      id: index + 1,
      text: timing.text,
      translationVi: timing.translationVi,
      ipa: timing.ipa,
      startTime: timing.startTime,
      endTime: timing.endTime,
    }));
  }, [shadowingData]);

  const transcriptTimings = useMemo(() => {
    return transcriptSegments.map((segment) => ({
      id: segment.id,
      startTime: segment.startTime,
      endTime: segment.endTime,
    }));
  }, [transcriptSegments]);

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
        <p>Loading lesson data...</p>
      </div>
    );
  }

  if (sessionLoading) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
        <p>Preparing practice session...</p>
      </div>
    );
  }

  if (!shadowingData) return <div className="p-8 text-red-500">Failed to load data.</div>;

  const activeTranscriptData = transcriptSegments.find(t => t.id === activeTranscriptId);
  const activeIndex = activeTranscriptId || 1;

  return (
    <PracticeLayout>
      <div className="h-screen bg-slate-50 font-sans text-gray-800 flex flex-col overflow-hidden">
        <Dialog open={showResumeModal} maxWidth="sm" fullWidth>
          <DialogTitle>Tiếp tục phiên học trước?</DialogTitle>
          <DialogContent>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Bạn đang có một phiên shadowing chưa hoàn thành. Bạn muốn tiếp tục từ tiến trình đã lưu hay bắt đầu lại?
            </Typography>
            {currentSession && (
              <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#f8fafc' }}>
                <Typography variant="body2" fontWeight={600}>
                  Tiến độ: {currentSession.completed_items}/{currentSession.total_items} câu
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(currentSession.completed_items / Math.max(currentSession.total_items, 1)) * 100}
                  sx={{ mt: 1.5, height: 8, borderRadius: 4 }}
                />
              </Box>
            )}
            {resumeAudioMissing && (
              <Typography color="warning.main" sx={{ mt: 2 }}>
                Không tìm thấy dữ liệu ghi âm cục bộ trên thiết bị này. Vui lòng quay lại thiết bị/trình duyệt cũ để tiếp tục đầy đủ, hoặc bắt đầu lại bài.
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCancelSessionAndRestart} color="error" variant="outlined">
              Bắt đầu lại
            </Button>
            <Button onClick={handleResumeSession} variant="contained">
              Tiếp tục học
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={Boolean(savePromptIntent)} maxWidth="sm" fullWidth>
          <DialogTitle>Lưu lịch sử bài học?</DialogTitle>
          <DialogContent>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Bạn đã record {completedIndices.length} timing. Bạn có muốn lưu tiến trình shadowing này để lần sau có thể học tiếp không?
            </Typography>
            <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#f8fafc' }}>
              <Typography variant="body2" fontWeight={600}>
                Tiến độ hiện tại: {completedIndices.length}/{transcriptSegments.length} câu
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(completedIndices.length / Math.max(transcriptSegments.length, 1)) * 100}
                sx={{ mt: 1.5, height: 8, borderRadius: 4 }}
              />
            </Box>
            {savePromptIntent === 'milestone' && (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Nếu chưa lưu bây giờ, dữ liệu vẫn được giữ cục bộ trên trình duyệt này. Hệ thống sẽ hỏi lại khi bạn thoát hoặc submit bài.
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleDeclineSavePrompt} color="inherit" disabled={isSavingDraft}>
              Không lưu
            </Button>
            <Button onClick={handleConfirmSavePrompt} variant="contained" disabled={isSavingDraft}>
              {isSavingDraft ? 'Đang lưu...' : 'Lưu tiến trình'}
            </Button>
          </DialogActions>
        </Dialog>
        <main
          className="flex-1 grid overflow-hidden transition-[grid-template-columns] duration-500 ease-in-out bg-slate-50 relative grid-cols-1 grid-rows-[auto_auto_1fr] lg:grid-cols-[65%_35%] lg:grid-rows-[auto_1fr] lg:gap-x-3"
        >

          <Sidebar
            shadowingData={{
              segmentCount: transcriptSegments.length,
              transcript: transcriptSegments,
            }}
            mediaMode={mediaMode}
            canUseVideo={canUseVideo}
            activeIndex={activeIndex}
            activeTranscriptId={activeTranscriptId}
            completedIndices={completedIndices}
            activeTab={activeTab}
            progressPercent={Math.round((completedIndices.length / Math.max(transcriptSegments.length, 1)) * 100)}
            mockSuggestions={mockSuggestions}
            isCompactHeight={isCompactHeight}
            onBack={handleBack}
            onSetMediaMode={setMediaMode}
            onSetActiveTab={setActiveTab}
            onSetActiveTranscriptId={handleSelectedTranscriptTab}
          />

          <RightContent
            activeIndex={activeIndex}
            activeTranscriptId={activeTranscriptId}
            shadowingData={{
              title: shadowingData.title,
              audioUrl: shadowingData.audio_url,
              sourceType: normalizedSourceType,
              level: shadowingData.level,
              duration: shadowingData.duration,
              segmentCount: transcriptSegments.length,
              videoSourceId: shadowingData.source_type === "youtube" ? shadowingData.audio_url.split("?v=")[1] : undefined,
            }}
            activeTranscriptData={activeTranscriptData}
            currentFeedback={currentFeedback}
            completedIndices={completedIndices}
            transcriptTimings={transcriptTimings}
            appState={appState}
            recordTimer={recordTimer}
            mediaMode={mediaMode}
            isVideoPlaying={isVideoPlaying}
            iframeRef={iframeRef}
            showSentence={showSentence}
            showIPA={showIPA}
            showTranslation={showTranslation}
            onToggleShowSentence={() => setShowSentence(!showSentence)}
            onToggleShowIPA={() => setShowIPA(!showIPA)}
            onToggleShowTranslation={() => setShowTranslation(!showTranslation)}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onSetActiveTranscriptId={setActiveTranscriptId}
            onToggleVideoPlayback={toggleVideoPlayback}
            onHandleNext={handleNext}
            onHandlePrevious={handlePrevious}
            onCompletePractice={handleCompletePractice}
          />
        </main>
      </div>
    </PracticeLayout>
  );
}
