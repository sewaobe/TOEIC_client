import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Autorenew as Loader2,
} from '@mui/icons-material';
import Sidebar from '../../components/practices/shadowing-detail-v2/Sidebar';
import RightContent from '../../components/practices/shadowing-detail-v2/RightContent';
import PracticeLayout from '../layouts/PracticeLayout';
import { ShadowingLessonDetail, shadowingV2Service } from '../../services/shadowing_service_v2';

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

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function PracticeShadowingV2Page() {
  const { shadowingId } = useParams<{ shadowingId: string }>();
  const [shadowingData, setShadowingData] = useState<ShadowingLessonDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
  const [isCompactHeight, setIsCompactHeight] = useState<boolean>(false);

  const normalizedSourceType = shadowingData?.source_type || 'audio';
  const canUseVideo = normalizedSourceType === 'youtube';

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
      if (!shadowingId) {
        if (isMounted) {
          setShadowingData(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const data = await shadowingV2Service.getDetail(shadowingId);

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
  }, [shadowingId]);

  useEffect(() => {
    if (!canUseVideo && mediaMode === 'video') {
      setMediaMode('audio');
    }
  }, [canUseVideo, mediaMode]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (appState === 'recording') {
      interval = setInterval(() => {
        setRecordTimer(prev => {
          if (prev >= 3) {
            setAppState('feedback');
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
    setAppState('recording');
    setRecordTimer(1);
    setIsVideoPlaying(false);
  };

  const handleStopRecording = () => {
    setAppState('feedback');
    setRecordTimer(0);
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
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
        <p>Loading lesson data...</p>
      </div>
    );
  }

  if (!shadowingData) return <div className="p-8 text-red-500">Failed to load data.</div>;

  const transcriptSegments = shadowingData.timings.map((timing, index) => ({
    id: index + 1,
    text: timing.text,
    translationVi: timing.translationVi,
    ipa: '',
    startTime: timing.startTime,
    endTime: timing.endTime,
  }));

  const activeTranscriptData = transcriptSegments.find(t => t.id === activeTranscriptId);
  const activeIndex = activeTranscriptId || 1;
  const progressPercent = Math.round((activeIndex / transcriptSegments.length) * 100);

  return (
    <PracticeLayout>
      <div className="h-screen bg-slate-50 font-sans text-gray-800 flex flex-col overflow-hidden">
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
            activeTab={activeTab}
            progressPercent={progressPercent}
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
            }}
            activeTranscriptData={activeTranscriptData}
            transcriptTimings={transcriptSegments.map((segment) => ({
              id: segment.id,
              startTime: segment.startTime,
              endTime: segment.endTime,
            }))}
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
          />
        </main>
      </div>
    </PracticeLayout>
  );
}