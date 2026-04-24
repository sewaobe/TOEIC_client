import React, { useState, useEffect, useRef } from 'react';
import {
  Autorenew as Loader2,
} from '@mui/icons-material';
import Sidebar from '../../components/practices/shadowing-v2/Sidebar';
import RightContent from '../../components/practices/shadowing-v2/RightContent';
import PracticeLayout from '../layouts/PracticeLayout';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface ShadowingTiming {
  endTime: number;
  startTime: number;
  text: string;
  translationVi: string;
}

interface ShadowingData {
  _id: { $oid: string };
  title: string;
  level: string;
  part_type: number;
  source_type: "audio" | "youtube";
  status: string;
  transcript: string;
  audio_url: string;
  duration: number;
  timings: ShadowingTiming[];
}

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
// MOCK API & HELPERS
// ==========================================

const mockShadowingData: ShadowingData = {
  _id: { $oid: '69eaf8099c1d00c0b0ae0958' },
  title: 'Oakwood Weather and Sports',
  level: 'B1',
  part_type: 3,
  status: 'approved',
  source_type: "audio",
  transcript: "For the remainder of today, we're looking at mostly dry conditions with overcast skies here in Oakwood. However, starting tomorrow, temperatures are set to drop, and we should expect a fair bit of snow accumulation. So if you're heading out, don't forget to bundle up, a warm coat will be essential. Moving into next week, there are signs that warmer weather might finally arrive, hinting that spring is just around the corner. Now, let's shift gears and talk about our local sports scene, including an exciting win from our basketball team last night!",
  audio_url: 'https://res.cloudinary.com/dgi1g967z/video/upload/v1777003937/shadowings/vjs4hqi95yitj51jwgay.mp3',
  duration: 41,
  timings: [
    {
      text: "For the remainder of today, we're looking at mostly dry conditions with overcast skies here in Oakwood.",
      translationVi: 'Trong phần còn lại của ngày hôm nay, chúng tôi đang xem xét điều kiện chủ yếu khô ráo với bầu trời u ám ở Oakwood.',
      startTime: 0,
      endTime: 6.39,
    },
    {
      text: 'However, starting tomorrow, temperatures are set to drop,',
      translationVi: 'Tuy nhiên, bắt đầu từ ngày mai, nhiệt độ sẽ giảm xuống,',
      startTime: 6.71,
      endTime: 10.77,
    },
    {
      text: 'and we should expect a fair bit of snow accumulation.',
      translationVi: 'và chúng ta nên mong đợi một chút tuyết tích tụ.',
      startTime: 10.77,
      endTime: 14.18,
    },
    {
      text: "So if you're heading out, don't forget to bundle up,",
      translationVi: 'Vì vậy, nếu bạn đang đi ra ngoài, đừng quên bó lại,',
      startTime: 14.45,
      endTime: 18.15,
    },
    {
      text: 'a warm coat will be essential.',
      translationVi: 'Một chiếc áo khoác ấm sẽ là điều cần thiết.',
      startTime: 18.27,
      endTime: 20.72,
    },
    {
      text: 'Moving into next week,',
      translationVi: 'Chuyển sang tuần tới,',
      startTime: 21.26,
      endTime: 22.8,
    },
    {
      text: 'there are signs that warmer weather might finally arrive,',
      translationVi: 'có những dấu hiệu cho thấy thời tiết ấm hơn cuối cùng cũng có thể đến,',
      startTime: 22.8,
      endTime: 26.28,
    },
    {
      text: 'hinting that spring is just around the corner.',
      translationVi: 'gợi ý rằng mùa xuân đang đến gần.',
      startTime: 26.28,
      endTime: 29.38,
    },
    {
      text: "Now, let's shift gears and talk about our local sports scene,",
      translationVi: 'Bây giờ, hãy chuyển hướng và nói về bối cảnh thể thao địa phương của chúng ta,',
      startTime: 29.49,
      endTime: 34.2,
    },
    {
      text: 'including an exciting win from our basketball team last night!',
      translationVi: 'bao gồm cả chiến thắng thú vị từ đội bóng rổ của chúng tôi đêm qua!',
      startTime: 34.2,
      endTime: 38.26,
    },
  ],
};

const mockSuggestions: Suggestion[] = [
  { id: 1, title: "Apartment Cleaning Quote Request", difficulty: "B1", badge: "Improve weak area", badgeType: "warning", category: "TOEIC", duration: 1, progress: 0, thumbnailUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&auto=format&fit=crop" },
  { id: 2, title: "Marketing Conference Update", difficulty: "B1", badge: "Improve weak area", badgeType: "warning", category: "TOEIC", duration: 1, progress: 0, thumbnailUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=300&auto=format&fit=crop" },
  { id: 3, title: "Sourdough Bread Workshop Introduction", difficulty: "A2", badge: "Improve weak area", badgeType: "warning", category: "TOEIC", duration: 1, progress: 0, thumbnailUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop" },
  { id: 4, title: "Conference Preparation Updates", difficulty: "B2", badge: "Improve weak area", badgeType: "warning", category: "TOEIC", duration: 1, progress: 0, thumbnailUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=300&auto=format&fit=crop" },
  { id: 5, title: "Oakwood Weather and Sports", difficulty: "B1", badge: "Continue series", badgeType: "info", category: "TOEIC", duration: 1, progress: 65, thumbnailUrl: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=300&auto=format&fit=crop" },
  { id: 6, title: "Can you \"see\" images in your mind? Some...", difficulty: "C1", badge: "Same topic", badgeType: "info", category: "General", duration: 3, progress: 0, thumbnailUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=300&auto=format&fit=crop" },
];

const fetchShadowingData = (): Promise<ShadowingData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockShadowingData);
    }, 1000);
  });
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function PracticeShadowingV2Page() {
  const [shadowingData, setShadowingData] = useState<ShadowingData | null>(null);
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

  useEffect(() => {
    const updateCompactMode = () => {
      setIsCompactHeight(window.innerHeight <= 700);
    };

    updateCompactMode();
    window.addEventListener('resize', updateCompactMode);
    return () => window.removeEventListener('resize', updateCompactMode);
  }, []);

  useEffect(() => {
    fetchShadowingData().then((data) => {
      setShadowingData(data);
      if (data.timings.length > 0) {
        setActiveTranscriptId(1);
      }
      setLoading(false);
    });
  }, []);

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
            activeIndex={activeIndex}
            activeTranscriptId={activeTranscriptId}
            activeTab={activeTab}
            progressPercent={progressPercent}
            mockSuggestions={mockSuggestions}
            isCompactHeight={isCompactHeight}
            onBack={handleBack}
            onSetMediaMode={setMediaMode}
            onSetActiveTab={setActiveTab}
            onSetActiveTranscriptId={setActiveTranscriptId}
          />

          <RightContent
            activeIndex={activeIndex}
            shadowingData={{
              title: shadowingData.title,
              audioUrl: shadowingData.audio_url,
              sourceType: shadowingData.source_type,
              level: shadowingData.level,
              duration: shadowingData.duration,
              segmentCount: transcriptSegments.length,
            }}
            activeTranscriptData={activeTranscriptData}
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
            onToggleVideoPlayback={toggleVideoPlayback}
            onHandleNext={handleNext}
          />
        </main>
      </div>
    </PracticeLayout>
  );
}