import React, { useEffect, useRef, useState, RefObject } from 'react';
import {
	ArrowBack as ArrowLeft,
	Mic,
	VolumeUp as Volume2,
	PlayArrow as Play,
	Replay as RotateCcw,
	RotateRight as RotateCw,
	Flag,
	Tune as Settings2,
	SkipPrevious as SkipBack,
	SkipNext as SkipForward,
	BarChart as BarChart2,
	AutoAwesome as Sparkles,
	Stop as Square,
	Pause,
	AccessTime as Clock,
	Share as Share2,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface ActiveTranscriptData {
	text: string;
	ipa?: string;
	translationVi: string;
	startTime?: number;
	endTime?: number;
}

interface TimingSegment {
	id: number;
	startTime: number;
	endTime: number;
}

interface ShadowingMediaData {
	title: string;
	sourceType: 'audio' | 'youtube';
	audioUrl: string;
	videoSourceId?: string;
	thumbnailUrl?: string;
	level?: string;
	duration?: number;
	segmentCount: number;
}

interface RightContentProps {
	activeIndex: number;
	activeTranscriptId: number | null;
	shadowingData: ShadowingMediaData;
	activeTranscriptData?: ActiveTranscriptData;
	transcriptTimings: TimingSegment[];
	appState: 'idle' | 'recording' | 'feedback';
	recordTimer: number;
	mediaMode: 'video' | 'audio';
	isVideoPlaying: boolean;
	iframeRef: RefObject<HTMLIFrameElement>;
	showSentence: boolean;
	showIPA: boolean;
	showTranslation: boolean;
	onToggleShowSentence: () => void;
	onToggleShowIPA: () => void;
	onToggleShowTranslation: () => void;
	onStartRecording: () => void;
	onStopRecording: () => void;
	onSetActiveTranscriptId: (id: number) => void;
	onToggleVideoPlayback: () => void;
	onHandleNext: () => void;
	onHandlePrevious: () => void;
}

const SPEED_OPTIONS = ['0.5x', '0.75x', '1x', '1.25x', '1.5x'];

const FEEDBACK_WORDS = [
	{ word: 'faced', correct: false },
	{ word: 'with', correct: false },
	{ word: 'the', correct: false },
	{ word: 'realities', correct: false },
	{ word: 'of', correct: false },
	{ word: 'current', correct: false },
	{ word: 'crises', correct: false },
	{ word: 'faced', correct: false },
	{ word: 'with', correct: false },
	{ word: 'the', correct: false },
	{ word: 'realities', correct: false },
	{ word: 'of', correct: false },
	{ word: 'current', correct: false },
	{ word: 'crises', correct: false },
];

const getWordPattern = (text: string): number[] => {
	if (!text) return [];
	const words = text.replace(/[.,!?;:]/g, '').split(/\s+/);
	return words.filter(w => w.length > 0).map(w => w.length);
};

interface AudioPlayerProps {
	activeIndex: number;
	segmentCount: number;
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	currentSpeed: string;
	onSeek: (time: number) => void;
	onSpeedChange: (speed: string) => void;
	onTogglePlayback: () => void;
	onSkipBack?: () => void;
	onRotateCcw?: () => void;
	onRotateCw?: () => void;
	onSkipForward?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
	activeIndex,
	segmentCount,
	isPlaying,
	currentTime,
	duration,
	currentSpeed,
	onSeek,
	onSpeedChange,
	onTogglePlayback,
	onSkipBack,
	onRotateCcw,
	onRotateCw,
	onSkipForward
}) => {
	const baseHeights = [8, 12, 16, 12, 20, 14, 24, 32, 22, 16, 28, 20, 14, 26, 18, 12, 16, 10, 8, 6];
	const numBars = baseHeights.length;

	const [wavePhase, setWavePhase] = useState(-5);
	const [isAnimating, setIsAnimating] = useState(false);
	const formatTime = (timeInSec: number) => {
		if (!Number.isFinite(timeInSec) || timeInSec < 0) return '0:00';
		const min = Math.floor(timeInSec / 60);
		const sec = Math.floor(timeInSec % 60).toString().padStart(2, '0');
		return `${min}:${sec}`;
	};

	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | undefined;

		if (isPlaying || isAnimating) {
			setIsAnimating(true);
			interval = setInterval(() => {
				setWavePhase((prev) => {
					const nextPhase = prev + 1;
					if (nextPhase >= numBars + 5) {
						if (!isPlaying) {
							setIsAnimating(false);
							return -5;
						}
						return -5;
					}
					return nextPhase;
				});
			}, 60);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isPlaying, isAnimating, numBars]);

	return (
		<div className="w-full h-full bg-[#f8f9fd] flex flex-col items-center justify-center shrink-0 relative z-30 transition-all duration-300">
			<div className="w-full max-w-[420px] bg-[#e0e4eb] rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center shadow-sm border border-white/50">
				<div className="text-center mb-3">
					<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Segment {activeIndex} of {segmentCount}</span>
				</div>
				<div className="flex justify-center mb-3">
					{/* 1. Thêm 'relative' vào container cha để làm mốc tọa độ cho con 'absolute' */}
					<div className="relative flex items-center pl-6 pr-4 py-2 rounded-2xl bg-white/60 backdrop-blur-sm border border-white shadow-sm min-h-[52px]">

						{/* 2. Dấu chấm đỏ, sử dụng positioning absolute */}
						{isPlaying && (
							<div className="absolute left-2 top-1/2 -translate-y-1/2 flex h-2.5 w-2.5 items-center justify-center">
								{/* Hiệu ứng tỏa vòng tròn (Ping) */}
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
								{/* Dấu chấm đỏ chính có đổ bóng nhẹ để trông "nổi" hơn */}
								<span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
							</div>
						)}

						{/* 3. Phần text thời gian */}
						<span className="text-xl md:text-2xl font-mono font-bold text-gray-900 tracking-wider w-full text-center">
							{formatTime(currentTime)}
						</span>
					</div>
				</div>

				<div className="flex items-center justify-center gap-1.5 h-14 w-full mb-3 opacity-40">
					{baseHeights.map((base, idx) => {
						let currentHeight = 8;
						if (isAnimating) {
							let multiplier = 1;
							const distance = idx - wavePhase;
							if (distance >= -3 && distance <= 3) {
								const swell = [2.5, 2.0, 1.4, 1.1];
								multiplier = swell[Math.abs(distance)];
							}
							currentHeight = base * multiplier;
						}
						return (
							<div
								key={idx}
								className="w-1.5 bg-gray-800 rounded-full transition-all duration-75 ease-linear"
								style={{ height: `${currentHeight}px`, minHeight: '8px' }}
							></div>
						);
					})}
				</div>
				<div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
					<button onClick={onSkipBack} className="inline-flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/60 active:bg-white active:scale-95 transition-all">
						<SkipBack className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
					</button>
					<button onClick={onRotateCcw} className="inline-flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/60 active:bg-white active:scale-95 transition-all">
						<RotateCcw className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
					</button>
					<button
						onClick={onTogglePlayback}
						className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all hover:scale-105 active:scale-95 bg-gray-900 text-white hover:bg-black w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg mx-1"
					>
						{isPlaying ? <Pause className="w-6 h-6 md:w-7 md:h-7" aria-hidden="true" /> : <Play className="w-6 h-6 md:w-7 md:h-7" aria-hidden="true" />}
					</button>
					<button onClick={onRotateCw} className="inline-flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/60 active:bg-white active:scale-95 transition-all">
						<RotateCw className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
					</button>
					<button onClick={onSkipForward} className="inline-flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/60 active:bg-white active:scale-95 transition-all">
						<SkipForward className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
					</button>
				</div>
				<div className="flex items-center justify-center">
					<div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm rounded-lg p-1 border border-white/60 shadow-sm">
						{['0.5x', '0.75x', '1x', '1.25x', '1.5x'].map(speed => (
							<button
								key={speed}
								onClick={() => onSpeedChange(speed)}
								className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${speed === currentSpeed ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/80 active:bg-white active:scale-95'}`}
							>
								{speed}
							</button>
						))}
					</div>
				</div>
				<div className="mt-3 w-full px-2 hidden">
					<input
						type="range"
						min={0}
						max={Math.max(duration, 1)}
						step={0.1}
						value={Math.min(currentTime, Math.max(duration, 1))}
						onChange={(e) => onSeek(Number(e.target.value))}
						className="w-full accent-gray-800"
					/>
					<div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
						<span>{formatTime(currentTime)}</span>
						<span>{formatTime(duration)}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default function RightContent({
	activeIndex,
	activeTranscriptId,
	shadowingData,
	activeTranscriptData,
	transcriptTimings,
	appState,
	recordTimer,
	mediaMode,
	isVideoPlaying,
	iframeRef,
	showSentence,
	showIPA,
	showTranslation,
	onToggleShowSentence,
	onToggleShowIPA,
	onToggleShowTranslation,
	onStartRecording,
	onStopRecording,
	onSetActiveTranscriptId,
	onToggleVideoPlayback,
	onHandleNext,
	onHandlePrevious
}: RightContentProps) {
	const wordPattern = activeTranscriptData ? getWordPattern(activeTranscriptData.text) : [];
	const wordCount = wordPattern.length;
	const tagName = shadowingData.level || 'Audio';
	const hasVideoSource = shadowingData.sourceType === 'youtube' && Boolean(shadowingData.videoSourceId);
	const isAudioSource = shadowingData.sourceType === 'audio';
	const [currentSpeed, setCurrentSpeed] = useState('1x');
	const audioRef = useRef<HTMLAudioElement>(null);
	const [audioCurrentTime, setAudioCurrentTime] = useState(0);
	const [audioDuration, setAudioDuration] = useState(shadowingData.duration || 0);
	const hasMountedSegmentRef = useRef(false);
	const previousSegmentIdRef = useRef<number | null>(null);
	const mediaContainerStyle = mediaMode === 'video'
		? {
			height: 'clamp(375px, 46vh, 520px)',
			maxHeight: '520px',
		}
		: {
			height: 'clamp(375px, 50vh, 580px)',
			maxHeight: '580px',
		};

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || !isAudioSource) return;

		const handleTimeUpdate = () => {
			const current = audio.currentTime || 0;
			setAudioCurrentTime(current);

			const segmentEnd = activeTranscriptData?.endTime;
			if (typeof segmentEnd === 'number' && current >= segmentEnd) {
				audio.currentTime = segmentEnd;
				setAudioCurrentTime(segmentEnd);
				audio.pause();
				if (isVideoPlaying) {
					onToggleVideoPlayback();
				}
				return;
			}

			if (transcriptTimings.length === 0) return;

			const segmentIndexByTime = transcriptTimings.findIndex(
				(segment) => current >= segment.startTime && current < segment.endTime,
			);

			if (segmentIndexByTime >= 0) {
				const segmentByTime = transcriptTimings[segmentIndexByTime];
				if (segmentByTime.id !== activeTranscriptId) {
					onSetActiveTranscriptId(segmentByTime.id);
				}
			}

			const currentSegmentIndex = activeTranscriptId
				? transcriptTimings.findIndex((segment) => segment.id === activeTranscriptId)
				: segmentIndexByTime;

			if (currentSegmentIndex < 0) return;
		};
		const handleLoadedMetadata = () => {
			setAudioDuration(audio.duration || shadowingData.duration || 0);
		};
		const handleEnded = () => {
			setAudioCurrentTime(audio.duration || 0);
			if (isVideoPlaying) {
				onToggleVideoPlayback();
			}
		};

		audio.addEventListener('timeupdate', handleTimeUpdate);
		audio.addEventListener('loadedmetadata', handleLoadedMetadata);
		audio.addEventListener('ended', handleEnded);

		return () => {
			audio.removeEventListener('timeupdate', handleTimeUpdate);
			audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
			audio.removeEventListener('ended', handleEnded);
		};
	}, [
		activeTranscriptId,
		activeTranscriptData?.endTime,
		isAudioSource,
		isVideoPlaying,
		onSetActiveTranscriptId,
		onToggleVideoPlayback,
		shadowingData.duration,
		transcriptTimings,
	]);

	useEffect(() => {
		if (!isAudioSource) return;
		const audio = audioRef.current;
		if (!audio) return;

		const speed = Number(currentSpeed.replace('x', ''));
		audio.playbackRate = Number.isFinite(speed) ? speed : 1;
	}, [currentSpeed, isAudioSource]);

	useEffect(() => {
		if (isVideoPlaying) {
			if (isAudioSource) {
				const audio = audioRef.current;
				if (!audio) return;
				const playPromise = audio.play();
				if (playPromise && typeof playPromise.catch === 'function') {
					playPromise.catch(() => {
						// Ignore autoplay rejection and keep UI stable.
					});
				}
			}
		} else if (isAudioSource) {
			const audio = audioRef.current;
			if (!audio) return;
			audio.pause();
		}
	}, [isAudioSource, isVideoPlaying]);

	useEffect(() => {
		const nextTime = activeTranscriptData?.startTime ?? 0;
		const currentSegmentId = activeTranscriptId ?? null;
		const isSegmentChanged = previousSegmentIdRef.current !== currentSegmentId;
		if (!isSegmentChanged) return;

		previousSegmentIdRef.current = currentSegmentId;

		if (isAudioSource) {
			const audio = audioRef.current;
			if (!audio) return;
			audio.currentTime = nextTime;
			setAudioCurrentTime(nextTime);
		} else if (hasVideoSource && iframeRef.current?.contentWindow) {
			try {
				iframeRef.current.contentWindow.postMessage(
					JSON.stringify({ event: 'command', func: 'seekTo', args: [nextTime, true] }),
					'*',
				);
			} catch (e) {
				console.error('Iframe cross-origin block');
			}
		}

		if (!hasMountedSegmentRef.current) {
			hasMountedSegmentRef.current = true;
			return;
		}

		if (!isVideoPlaying) {
			onToggleVideoPlayback();
		}
	}, [
		activeTranscriptId,
		activeTranscriptData?.startTime,
		hasVideoSource,
		iframeRef,
		isAudioSource,
		isVideoPlaying,
		onToggleVideoPlayback,
	]);

	useEffect(() => {
		if (isAudioSource || !hasVideoSource || !isVideoPlaying || !activeTranscriptData) return;

		const segmentStart = activeTranscriptData.startTime ?? 0;
		const segmentEnd = activeTranscriptData.endTime ?? segmentStart;
		const durationMs = Math.max((segmentEnd - segmentStart) * 1000, 0);
		if (durationMs <= 0) return;

		const timeoutId = setTimeout(() => {
			if (iframeRef.current?.contentWindow) {
				try {
					iframeRef.current.contentWindow.postMessage(
						JSON.stringify({ event: 'command', func: 'seekTo', args: [segmentEnd, true] }),
						'*',
					);
				} catch (e) {
					console.error('Iframe cross-origin block');
				}
			}

			if (isVideoPlaying) {
				onToggleVideoPlayback();
			}
		}, durationMs);

		return () => clearTimeout(timeoutId);
	}, [
		activeTranscriptData,
		activeTranscriptId,
		hasVideoSource,
		isAudioSource,
		isVideoPlaying,
		onSetActiveTranscriptId,
		onToggleVideoPlayback,
		transcriptTimings,
	]);

	const handleSeekAudio = (time: number) => {
		if (!isAudioSource) return;
		const audio = audioRef.current;
		if (!audio) return;
		audio.currentTime = time;
		setAudioCurrentTime(time);
	};

	const handleToggleMediaPlayBack = () => {
		// Kiểm tra an toàn dữ liệu đầu vào
		if (
			!activeTranscriptData ||
			typeof activeTranscriptData.endTime !== 'number' ||
			typeof activeTranscriptData.startTime !== 'number'
		) {
			onToggleVideoPlayback();
			return;
		}

		// Lấy thời gian hiện tại trực tiếp từ audio element (nếu là audio) để chính xác nhất
		const currentTime = isAudioSource && audioRef.current
			? audioRef.current.currentTime
			: audioCurrentTime;

		// Dùng >= để đảm bảo bắt đúng logic kết thúc segment
		if (currentTime >= activeTranscriptData.endTime) {

			if (isAudioSource && audioRef.current) {
				// Cập nhật trực tiếp currentTime của Audio DOM Node
				audioRef.current.currentTime = activeTranscriptData.startTime;
			} else if (hasVideoSource && iframeRef.current?.contentWindow) {
				// Tua lại đối với Youtube Iframe
				try {
					iframeRef.current.contentWindow.postMessage(
						JSON.stringify({ event: 'command', func: 'seekTo', args: [activeTranscriptData.startTime, true] }),
						'*',
					);
				} catch (e) {
					console.error('Iframe cross-origin block');
				}
			}

			// Cập nhật lại React state
			setAudioCurrentTime(activeTranscriptData.startTime);
		}

		// Kích hoạt play/pause
		onToggleVideoPlayback();
	};

	const handleToggleMediaRotate = () => {
		// Kiểm tra an toàn dữ liệu đầu vào
		if (
			!activeTranscriptData ||
			typeof activeTranscriptData.endTime !== 'number' ||
			typeof activeTranscriptData.startTime !== 'number'
		) {
			return;
		}

		if (isAudioSource && audioRef.current) {
			// Cập nhật trực tiếp currentTime của Audio DOM Node
			audioRef.current.currentTime = activeTranscriptData.startTime;
		} else if (hasVideoSource && iframeRef.current?.contentWindow) {
			// Tua lại đối với Youtube Iframe
			try {
				iframeRef.current.contentWindow.postMessage(
					JSON.stringify({ event: 'command', func: 'seekTo', args: [activeTranscriptData.startTime, true] }),
					'*',
				);
			} catch (e) {
				console.error('Iframe cross-origin block');
			}
		}

		// Cập nhật lại React state
		setAudioCurrentTime(activeTranscriptData.startTime);

		// Kích hoạt play
		if (!isVideoPlaying) onToggleVideoPlayback();
	};

	return (
		<>
			{isAudioSource && <audio ref={audioRef} src={shadowingData.audioUrl} preload="metadata" />}
			{/* =============================== */}
			{/* 3. KHU VỰC THỰC HÀNH (PRACTICE) */}
			{/* =============================== */}
			<div className="col-start-1 row-start-2 col-span-1 row-span-1 z-10 overflow-y-auto no-scrollbar flex flex-col transition-all duration-500 lg:row-start-1 lg:col-start-1 lg:row-span-2">
				<div
					className={`w-full relative shrink-0 transition-all duration-300 ${mediaMode === 'video' ? 'bg-gray-900 overflow-hidden' : 'bg-[#f8f9fd] overflow-visible'}`}
					style={mediaContainerStyle}
				>
					{mediaMode === 'audio' && (
						<AudioPlayer
							activeIndex={activeIndex}
							segmentCount={shadowingData.segmentCount}
							isPlaying={isVideoPlaying}
							currentTime={audioCurrentTime}
							duration={audioDuration}
							currentSpeed={currentSpeed}
							onSeek={handleSeekAudio}
							onSpeedChange={setCurrentSpeed}
							onTogglePlayback={handleToggleMediaPlayBack}
							onSkipForward={onHandleNext}
							onSkipBack={onHandlePrevious}
							onRotateCcw={handleToggleMediaRotate}
							onRotateCw={handleToggleMediaRotate}
						/>
					)}

					<div className={`w-full h-full relative group transition-opacity duration-300 ${mediaMode === 'audio' ? 'opacity-0 pointer-events-none absolute inset-0 z-[-1]' : 'opacity-100 z-10'}`}>
						{hasVideoSource && (
							<iframe
								ref={iframeRef}
								className="absolute inset-0 w-full h-full"
								src={`https://www.youtube.com/embed/${shadowingData.videoSourceId}?enablejsapi=1&controls=0&rel=0`}
								title="YouTube video player"
								frameBorder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							></iframe>
						)}

						{!hasVideoSource && mediaMode === 'video' && (
							<div className="absolute inset-0 flex flex-col items-center justify-center text-white/90 px-6 text-center">
								<p className="text-lg font-semibold">Video source is not available</p>
								<p className="text-sm text-white/70 mt-2">This shadowing item currently provides audio_url only.</p>
							</div>
						)}

						{!isVideoPlaying && mediaMode === 'video' && (
							<>
								{shadowingData.thumbnailUrl && (
									<img src={shadowingData.thumbnailUrl} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60" />
								)}
								<div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between pointer-events-none">
									<div className="flex items-center gap-3">
										<div className="px-2 py-1 bg-black/80 rounded-md text-white flex items-center justify-center font-bold text-xs">{tagName}</div>
										<span className="text-white font-medium text-sm truncate w-48">{shadowingData.title}</span>
									</div>
									<div className="flex gap-2">
										<button className="p-2 hover:bg-white/20 rounded-full text-white pointer-events-auto"><Share2 className="w-4 h-4" /></button>
										<button className="p-2 hover:bg-white/20 rounded-full text-white pointer-events-auto"><Clock className="w-4 h-4" /></button>
									</div>
								</div>

								<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
									<button
										onClick={onToggleVideoPlayback}
										className={`w-16 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 pointer-events-auto ${hasVideoSource ? 'bg-red-600 cursor-pointer' : 'bg-gray-500 cursor-not-allowed'}`}
										disabled={!hasVideoSource}
									>
										<Play className="w-6 h-6 text-white fill-white" />
									</button>
								</div>

								<div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm pointer-events-auto cursor-pointer">
									<SkipBack className="w-4 h-4" />
									<span className="text-sm font-medium">Skip to start</span>
								</div>
							</>
						)}
					</div>
				</div>

				<div className="w-full mx-auto p-4 md:p-6 lg:p-8">
					{/* Top Bar */}
					<div className="flex justify-between items-center mb-4">
						<div className="flex items-center gap-3">
							<span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">#{activeIndex}</span>
							<span className="text-sm text-gray-500 font-medium">{wordCount} words</span>
						</div>
						<button className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm transition-colors">
							<Flag className="w-4 h-4" /> <span className="hidden sm:inline">Report</span>
						</button>
					</div>

					{/* Main Sentence Card */}
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6 transition-all duration-300">

						<div className="flex flex-wrap justify-end gap-2 md:gap-4 mb-4 text-xs font-medium">
							<button onClick={onToggleShowSentence} className={`flex items-center gap-1 transition-colors ${showSentence ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
								<Settings2 className="w-3.5 h-3.5" /> Sentence
							</button>
							<button onClick={onToggleShowIPA} className={`flex items-center gap-1 transition-colors ${showIPA ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
								<Settings2 className="w-3.5 h-3.5" /> IPA
							</button>
							<button onClick={onToggleShowTranslation} className={`flex items-center gap-1 transition-colors ${showTranslation ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
								<Settings2 className="w-3.5 h-3.5" /> Translation
							</button>
						</div>

						<div className="mb-6 space-y-3">
							{showSentence ? (
								<h2 className="text-xl md:text-2xl font-medium text-gray-800">
									{activeTranscriptData?.text}
								</h2>
							) : (
								<div className="flex flex-wrap gap-2 py-2">
									{wordPattern.map((_len, idx) => (
										<span key={idx} className="inline-block w-12 h-6 bg-gray-100 rounded"></span>
									))}
								</div>
							)}

							<div className="flex flex-wrap items-center gap-2 text-gray-400 text-xs md:text-sm">
								<span className="inline-block w-4 h-4 border border-gray-300 rounded text-center leading-none text-[10px]">📖</span>
								Click each word to look up
							</div>

							{showIPA && (
								<div className="pl-4 border-l-2 border-blue-100 font-mono text-gray-400 tracking-wide text-sm md:text-base break-words">
									<span className="border-b border-dashed border-gray-300 pb-0.5">
										{activeTranscriptData?.ipa || 'IPA is not available for this segment.'}
									</span>
								</div>
							)}

							{showTranslation && (
								<div className="pl-4 border-l-2 border-amber-200 text-gray-600 text-sm md:text-base italic">
									{activeTranscriptData?.translationVi}
								</div>
							)}
						</div>

						<motion.div layout className="flex flex-col justify-center w-full overflow-hidden">

							{/* AnimatePresence mode="wait" giúp state cũ mờ đi hẳn rồi state mới mới hiện ra */}
							<AnimatePresence mode="wait">

								{appState === 'idle' && (
									<motion.div
										key="idle"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.2 }}
										className="w-full flex justify-center"
									>
										<div
											onClick={onStartRecording}
											// Thêm h-56 và bỏ p-8. Flexbox sẽ tự động căn giữa nội dung
											className="w-full h-56 bg-blue-50/60 border border-blue-100 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors group"
										>
											<div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm">
												<Mic className="w-8 h-8" />
											</div>
											<h3 className="text-lg font-medium text-gray-800">Click to start recording</h3>
											<p className="text-sm text-gray-500">(Max 30 seconds)</p>
										</div>
									</motion.div>
								)}

								{appState === 'recording' && (
									<motion.div
										key="recording"
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ duration: 0.2 }}
										// Thêm h-56 và bỏ py-8 để chiều cao khớp 100% với box Idle ở trên
										className="h-56 flex flex-col items-center justify-center w-full"
									>
										<div className="relative mb-4">
											<div className="absolute inset-0 bg-gray-200 rounded-full animate-ping opacity-50 scale-150"></div>
											<button
												onClick={onStopRecording}
												className="relative w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-black transition-colors"
											>
												<Square className="w-6 h-6 text-white fill-white rounded-sm" />
											</button>
										</div>
										<div className="flex flex-col items-center w-64">
											<div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
												<div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
												{recordTimer}s / 30s
											</div>
											<div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
												<div
													className="h-full bg-gray-600 transition-all duration-1000 ease-linear"
													style={{ width: `${(recordTimer / 30) * 100}%` }}
												></div>
											</div>
										</div>
									</motion.div>
								)}

								{appState === 'feedback' && (
									<motion.div
										key="feedback"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.3 }}
										className="w-full"
									>
										<div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-3">
											<BarChart2 className="w-4 h-4" /> 0/{wordCount} words correct
										</div>

										<div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
											<span className="text-sm text-gray-500 mb-3 block">You said:</span>
											<div className="flex items-center gap-4">
												<button className="text-gray-800"><Play className="w-5 h-5 fill-current" /></button>
												<span className="text-sm font-medium w-10">0:00</span>
												<div className="flex-1 h-1.5 bg-gray-200 rounded-full relative cursor-pointer">
													<div className="absolute top-1/2 -translate-y-1/2 left-[30%] w-3 h-3 bg-gray-800 rounded-full"></div>
													<div className="h-full bg-gray-800 rounded-full w-[30%]"></div>
												</div>
												<button className="text-gray-500"><Volume2 className="w-5 h-5" /></button>
											</div>
										</div>

										<div className="flex flex-wrap gap-2 mb-6">
											{FEEDBACK_WORDS.slice(0, wordCount).map((item, idx) => (
												<div key={idx} className="bg-red-50 text-red-500 border border-red-100 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5">
													{item.word} <span className="text-xs">x</span>
												</div>
											))}
										</div>

										<button className="w-full py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors border border-indigo-100">
											<Sparkles className="w-4 h-4" /> Ask AI for Pronunciation Feedback
										</button>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					</div>

					{/* Bottom Controls Area */}
					<div className="mb-6">
						<p className="text-sm text-gray-500 mb-3 font-medium">Listen and repeat the sentence above</p>
						<div className="flex flex-wrap gap-2">
							{wordPattern.map((length, idx) => (
								<div key={idx} className="px-2 md:px-3 py-1 md:py-1.5 bg-gray-100 rounded-lg text-gray-400 font-bold tracking-[0.2em] text-base md:text-lg">
									{'.'.repeat(length)}
								</div>
							))}
						</div>
					</div>

					{/* Playback Controls & Next Button */}
					<div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-6 md:mt-8 gap-6 sm:gap-0">
						<div className="hidden sm:block w-24"></div>

						<div className="flex flex-wrap justify-center items-center gap-3 md:gap-4">
							<button onClick={onHandlePrevious} className="text-gray-400 hover:text-gray-600"><SkipBack className="w-4 h-4 md:w-5 md:h-5" /></button>
							<button onClick={handleToggleMediaRotate} className="text-gray-400 hover:text-gray-600"><RotateCcw className="w-4 h-4 md:w-5 md:h-5" /></button>

							<button
								onClick={handleToggleMediaPlayBack}
								className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-md hover:bg-black transition-colors shrink-0"
							>
								{isVideoPlaying ? (
									<Pause className="w-4 h-4 md:w-5 md:h-5 text-white fill-white" />
								) : (
									<Play className="w-4 h-4 md:w-5 md:h-5 text-white fill-white" />
								)}
							</button>

							<div className="flex bg-gray-200/50 rounded-lg p-0.5 overflow-x-auto max-w-[150px] sm:max-w-none no-scrollbar">
								{SPEED_OPTIONS.map(speed => (
									<button
										key={speed}
										onClick={() => setCurrentSpeed(speed)}
										className={`px-2 py-1 md:py-1.5 text-[10px] md:text-[11px] font-bold rounded-md transition-colors whitespace-nowrap ${speed === currentSpeed ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
											}`}
									>
										{speed}
									</button>
								))}
							</div>
						</div>

						<button
							onClick={onHandleNext}
							className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition-colors w-full sm:w-auto"
						>
							Next <ArrowLeft className="w-4 h-4 rotate-180" />
						</button>
					</div>

				</div>
			</div>
		</>
	);
}
