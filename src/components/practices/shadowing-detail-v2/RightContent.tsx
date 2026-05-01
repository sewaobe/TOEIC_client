import React, { useCallback, useEffect, useRef, useState, RefObject } from 'react';
import {
	ArrowBack as ArrowLeft,
	Mic,
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
} from '@mui/icons-material';
import { Popover, Box, Typography, IconButton, CircularProgress, Divider } from '@mui/material';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
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
	level?: string;
	duration?: number;
	segmentCount: number;
}

interface RightContentProps {
	activeIndex: number;
	activeTranscriptId: number | null;
	shadowingData: ShadowingMediaData;
	activeTranscriptData?: ActiveTranscriptData;
	currentFeedback?: {
		transcript: string;
		score: number;
		feedback: string;
		wordResults?: { word: string; correct: boolean }[];
	} | null;
	completedIndices?: number[];
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
	onCompletePractice?: () => void;
}

interface DictData {
	word: string;
	ipa: string;
	audioUrl: string;
	mainTranslation: string;
	meanings: {
		partOfSpeech: string;
		definitions: string[];
	}[];
	notFound?: boolean;
}

const SPEED_OPTIONS = ['0.5x', '0.75x', '1x', '1.25x', '1.5x'];

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
	currentFeedback,
	completedIndices = [],
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
	onHandlePrevious,
	onCompletePractice,
}: RightContentProps) {
	const wordPattern = activeTranscriptData ? getWordPattern(activeTranscriptData.text) : [];
	const wordCount = wordPattern.length;
	const completedSegmentCount = completedIndices.length;
	const hasVideoSource = shadowingData.sourceType === 'youtube' && Boolean(shadowingData.videoSourceId);
	const isAudioSource = shadowingData.sourceType === 'audio';
	const [currentSpeed, setCurrentSpeed] = useState('1x');
	const audioRef = useRef<HTMLAudioElement>(null);
	const [audioCurrentTime, setAudioCurrentTime] = useState(0);
	const [youtubeCurrentTime, setYoutubeCurrentTime] = useState(0);
	const youtubeCurrentTimeRef = useRef(0);
	const youtubeStopHandledRef = useRef(false);
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
	const hasUserStartedVideoRef = useRef(false);
	const youtubeOrigin = typeof window !== 'undefined' ? window.location.origin : '';

	const postYoutubeMessage = useCallback((message: Record<string, unknown>) => {
		if (!iframeRef.current?.contentWindow) return;

		try {
			iframeRef.current.contentWindow.postMessage(
				JSON.stringify(message),
				'*',
			);
		} catch (e) {
			console.error('Iframe cross-origin block');
		}
	}, [iframeRef]);

	const postYoutubeCommand = useCallback((func: string, args: unknown[] = []) => {
		postYoutubeMessage({ event: 'command', func, args });
	}, [postYoutubeMessage]);

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
		if (!hasVideoSource) return;

		const speed = Number(currentSpeed.replace('x', ''));
		postYoutubeCommand('setPlaybackRate', [Number.isFinite(speed) ? speed : 1]);
	}, [currentSpeed, hasVideoSource, postYoutubeCommand]);

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

	const segmentStart = activeTranscriptData?.startTime ?? 0;
	const segmentEnd = activeTranscriptData?.endTime ?? segmentStart;

	useEffect(() => {
		if (!hasVideoSource) return;

		postYoutubeMessage({ event: 'listening', id: 'shadowing-youtube-player' });
		postYoutubeCommand('getCurrentTime');

		const handleYoutubeMessage = (event: MessageEvent) => {
			if (typeof event.origin === 'string' && !event.origin.includes('youtube.com')) return;

			let data: any;
			try {
				data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
			} catch {
				return;
			}

			if (data?.event !== 'infoDelivery' || typeof data?.info?.currentTime !== 'number') return;

			const currentTime = data.info.currentTime;
			youtubeCurrentTimeRef.current = currentTime;
			setYoutubeCurrentTime(currentTime);

			if (typeof data.info.playerState === 'number') {
				console.log('[Shadowing YouTube state]', {
					playerState: data.info.playerState,
					currentTime: Number(currentTime.toFixed(2)),
					activeTranscriptId,
					segmentStart,
					segmentEnd,
				});
			}
		};

		window.addEventListener('message', handleYoutubeMessage);

		return () => {
			window.removeEventListener('message', handleYoutubeMessage);
		};
	}, [activeTranscriptId, hasVideoSource, postYoutubeCommand, postYoutubeMessage, segmentEnd, segmentStart]);

	useEffect(() => {
		const nextTime = activeTranscriptData?.startTime ?? 0;
		const currentSegmentId = activeTranscriptId ?? null;
		const isSegmentChanged = previousSegmentIdRef.current !== currentSegmentId;
		if (!isSegmentChanged) return;

		previousSegmentIdRef.current = currentSegmentId;
		youtubeStopHandledRef.current = false;

		if (!hasMountedSegmentRef.current && !isAudioSource && hasVideoSource && currentSegmentId === 1) {
			hasMountedSegmentRef.current = true;
			youtubeCurrentTimeRef.current = 0;
			setYoutubeCurrentTime(0);
			postYoutubeMessage({ event: 'listening', id: 'shadowing-youtube-player' });
			postYoutubeCommand('getCurrentTime');
			console.log('[Shadowing YouTube initial intro]', {
				activeTranscriptId: currentSegmentId,
				currentTime: 0,
				firstSegmentStart: nextTime,
				segmentEnd: activeTranscriptData?.endTime,
			});
			return;
		}

		if (isAudioSource) {
			const audio = audioRef.current;
			if (!audio) return;
			audio.currentTime = nextTime;
			setAudioCurrentTime(nextTime);
		} else if (hasVideoSource) {
			postYoutubeCommand('seekTo', [nextTime, true]);
			postYoutubeCommand('getCurrentTime');
			youtubeCurrentTimeRef.current = nextTime;
			setYoutubeCurrentTime(nextTime);
			console.log('[Shadowing YouTube seek segment]', {
				activeTranscriptId: currentSegmentId,
				seekTo: nextTime,
				segmentEnd: activeTranscriptData?.endTime,
			});
		}

		if (!hasMountedSegmentRef.current) {
			hasMountedSegmentRef.current = true;
			return;
		}

		if (!isAudioSource && !hasUserStartedVideoRef.current) {
			return;
		}

		if (!isVideoPlaying) {
			onToggleVideoPlayback();
		}
	}, [
		activeTranscriptId,
		activeTranscriptData?.startTime,
		activeTranscriptData?.endTime,
		hasVideoSource,
		iframeRef,
		isAudioSource,
		isVideoPlaying,
		onToggleVideoPlayback,
		postYoutubeCommand,
		postYoutubeMessage,
	]);

	useEffect(() => {
		if (isAudioSource || !hasVideoSource || !isVideoPlaying || !activeTranscriptData) return;
		if (!hasUserStartedVideoRef.current) return;

		youtubeStopHandledRef.current = false;

		const intervalId = setInterval(() => {
			postYoutubeCommand('getCurrentTime');

			const current = youtubeCurrentTimeRef.current;
			console.log('[Shadowing YouTube time]', {
				activeTranscriptId,
				currentTime: Number(current.toFixed(2)),
				segmentStart,
				segmentEnd,
				remaining: Number((segmentEnd - current).toFixed(2)),
			});

			if (!youtubeStopHandledRef.current && current >= segmentEnd - 0.05) {
				youtubeStopHandledRef.current = true;
				postYoutubeCommand('seekTo', [segmentEnd, true]);
				postYoutubeCommand('pauseVideo');
				onToggleVideoPlayback();
				console.log('[Shadowing YouTube auto stop]', {
					activeTranscriptId,
					currentTime: Number(current.toFixed(2)),
					segmentEnd,
				});
			}
		}, 250);

		return () => clearInterval(intervalId);
	}, [
		activeTranscriptId,
		segmentStart,
		segmentEnd,
		activeTranscriptData,
		hasVideoSource,
		isAudioSource,
		isVideoPlaying,
		onToggleVideoPlayback,
		postYoutubeCommand,
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
			: youtubeCurrentTimeRef.current;
		const shouldPlayInitialYoutubeIntro =
			!isAudioSource &&
			activeTranscriptId === 1 &&
			!hasUserStartedVideoRef.current;

		// Dùng >= để đảm bảo bắt đúng logic kết thúc segment
		if (
			!shouldPlayInitialYoutubeIntro &&
			(
				currentTime >= activeTranscriptData.endTime ||
				currentTime < activeTranscriptData.startTime ||
				(!isAudioSource && !hasUserStartedVideoRef.current)
			)
		) {

			if (isAudioSource && audioRef.current) {
				// Cập nhật trực tiếp currentTime của Audio DOM Node
				audioRef.current.currentTime = activeTranscriptData.startTime;
			} else if (hasVideoSource) {
				postYoutubeCommand('seekTo', [activeTranscriptData.startTime, true]);
				postYoutubeCommand('getCurrentTime');
				youtubeCurrentTimeRef.current = activeTranscriptData.startTime;
				setYoutubeCurrentTime(activeTranscriptData.startTime);
				youtubeStopHandledRef.current = false;
				console.log('[Shadowing YouTube reset before play]', {
					activeTranscriptId,
					fromCurrentTime: Number(currentTime.toFixed(2)),
					seekTo: activeTranscriptData.startTime,
					segmentEnd: activeTranscriptData.endTime,
				});
			}

			// Cập nhật lại React state
			setAudioCurrentTime(activeTranscriptData.startTime);
		}

		if (!isAudioSource && !isVideoPlaying) {
			hasUserStartedVideoRef.current = true;
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
		} else if (hasVideoSource) {
			postYoutubeCommand('seekTo', [activeTranscriptData.startTime, true]);
			postYoutubeCommand('getCurrentTime');
			youtubeCurrentTimeRef.current = activeTranscriptData.startTime;
			setYoutubeCurrentTime(activeTranscriptData.startTime);
			youtubeStopHandledRef.current = false;
			console.log('[Shadowing YouTube replay]', {
				activeTranscriptId,
				seekTo: activeTranscriptData.startTime,
				segmentEnd: activeTranscriptData.endTime,
			});
		}

		// Cập nhật lại React state
		setAudioCurrentTime(activeTranscriptData.startTime);

		// Kích hoạt play
		if (!isVideoPlaying) onToggleVideoPlayback();
	};

	// --- DICTIONARY POPOVER STATE ---
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [dictData, setDictData] = useState<DictData | null>(null);
	const [loading, setLoading] = useState(false);

	const handleWordClick = async (event: React.MouseEvent<HTMLElement>, rawWord: string) => {
		const cleanWord = rawWord.replace(/[.,!?;:]/g, '').toLowerCase();
		if (!cleanWord) return;

		setAnchorEl(event.currentTarget);
		setLoading(true);
		setDictData(null);

		try {
			// Gọi song song 2 API để tối ưu tốc độ
			const [enRes, viRes] = await Promise.allSettled([
				fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`),
				fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&q=${cleanWord}`)
			]);

			let ipa = '';
			let audioUrl = '';
			let viMeanings: any[] = [];
			let mainTranslation = '';

			// 1. Lấy IPA và Audio từ Free Dictionary API
			if (enRes.status === 'fulfilled' && enRes.value.ok) {
				const enData = await enRes.value.json();
				const entry = enData[0];
				ipa = entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || '';
				audioUrl = entry.phonetics?.find((p: any) => p.audio !== "")?.audio || '';
			}

			// 2. Lấy nghĩa từ Google Translate API
			if (viRes.status === 'fulfilled' && viRes.value.ok) {
				const viData = await viRes.value.json();
				mainTranslation = viData[0]?.[0]?.[0] || '';

				if (viData[1]) {
					viMeanings = viData[1].map((item: any) => ({
						partOfSpeech: item[0],
						definitions: item[1] || []
					}));
				} else if (mainTranslation) {
					viMeanings = [{ partOfSpeech: "translation", definitions: [mainTranslation] }];
				}
			}

			setDictData({
				word: cleanWord,
				ipa,
				audioUrl,
				mainTranslation,
				meanings: viMeanings,
				notFound: !mainTranslation && viMeanings.length === 0
			});

		} catch (error) {
			console.error("Lỗi API từ điển:", error);
			setDictData({ word: cleanWord, ipa: '', audioUrl: '', mainTranslation: "", meanings: [], notFound: true });
		} finally {
			setLoading(false);
		}
	};

	// Hàm phát âm thanh dự phòng bằng Web Speech API của trình duyệt
	const fallbackTTS = (text: string) => {
		if (!text || !window.speechSynthesis) return;
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = 'en-US';
		window.speechSynthesis.speak(utterance);
	};

	const playAudio = () => {
		if (dictData?.audioUrl) {
			// Thử phát audio chuẩn từ Free Dictionary API
			const audio = new Audio(dictData.audioUrl);
			audio.play().catch(() => {
				// Nếu trình duyệt chặn hoặc link chết, dùng giọng đọc mặc định của trình duyệt
				fallbackTTS(dictData.word);
			});
		} else if (dictData?.word) {
			fallbackTTS(dictData.word);
		}
	};

	const handleClosePopover = () => {
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}

		setAnchorEl(null);
	};


	const openPopover = Boolean(anchorEl);

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
							currentTime={hasVideoSource ? youtubeCurrentTime : audioCurrentTime}
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
								className="absolute inset-0 w-full h-full pointer-events-none"
								src={`https://www.youtube.com/embed/${shadowingData.videoSourceId}?enablejsapi=1&controls=0&rel=0&origin=${encodeURIComponent(youtubeOrigin)}`}
								title="YouTube video player"
								frameBorder="0"
								onLoad={() => {
									postYoutubeMessage({ event: 'listening', id: 'shadowing-youtube-player' });
									postYoutubeCommand('getCurrentTime');
								}}
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							></iframe>
						)}

						<div
							className={`absolute inset-0 z-10 cursor-pointer ${isVideoPlaying ? '' : 'bg-black/10'}`}
							onClick={hasVideoSource ? handleToggleMediaPlayBack : undefined}
						>
							{!isVideoPlaying && (
								<div className="absolute inset-0 flex items-center justify-center">
									<button
										className={`w-16 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${hasVideoSource ? 'bg-red-600 cursor-pointer' : 'bg-gray-500 cursor-not-allowed'}`}
										disabled={!hasVideoSource}
									>
										<Play className="w-6 h-6 text-white fill-white" />
									</button>
								</div>
							)}
						</div>

						<div className="absolute top-4 right-4 z-20 flex items-center gap-2">
							<button
								onClick={onHandlePrevious}
								className="h-9 w-9 rounded-full bg-black/50 text-white hover:bg-black/70"
							>
								<SkipBack className="w-4 h-4" />
							</button>
							<button
								onClick={handleToggleMediaRotate}
								className="h-9 w-9 rounded-full bg-black/50 text-white hover:bg-black/70"
							>
								<RotateCcw className="w-4 h-4" />
							</button>
							<button
								onClick={onHandleNext}
								className="h-9 w-9 rounded-full bg-black/50 text-white hover:bg-black/70"
							>
								<SkipForward className="w-4 h-4" />
							</button>
						</div>

						{!hasVideoSource && mediaMode === 'video' && (
							<div className="absolute inset-0 flex flex-col items-center justify-center text-white/90 px-6 text-center">
								<p className="text-lg font-semibold">Video source is not available</p>
								<p className="text-sm text-white/70 mt-2">This shadowing item currently provides audio_url only.</p>
							</div>
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
								<h2 className="text-xl md:text-2xl font-medium text-gray-800 flex flex-wrap gap-x-[5px] gap-y-1">
									{activeTranscriptData?.text?.split(' ').map((word, idx) => (
										<span
											key={idx}
											onClick={(e) => handleWordClick(e, word)}
											className="cursor-pointer hover:bg-blue-100 hover:text-blue-600 rounded px-[2px] transition-colors"
										>
											{word}
										</span>
									))}
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
											<BarChart2 className="w-4 h-4" /> Score {currentFeedback?.score ?? 0}/100
										</div>

										<div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
											<span className="text-sm text-gray-500 mb-3 block">You said:</span>
											<p className="text-sm font-medium text-gray-800">
												{currentFeedback?.transcript || '(No speech detected)'}
											</p>
										</div>

										<div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-6">
											<p className="text-sm font-medium text-blue-700">
												{currentFeedback?.feedback || 'Recording saved.'}
											</p>
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
							{currentFeedback?.wordResults?.length ? currentFeedback.wordResults.map((item, idx) => (
								<div
									key={`${item.word}-${idx}`}
									className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg border text-sm md:text-base font-semibold ${
										item.correct
											? 'bg-green-50 text-green-700 border-green-200'
											: 'bg-red-50 text-red-600 border-red-200'
									}`}
								>
									{item.word}
								</div>
							)) : wordPattern.map((length, idx) => (
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

					<div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4">
						<p className="text-sm text-gray-500">
							Completed {completedSegmentCount}/{shadowingData.segmentCount} segments
						</p>
						<button
							onClick={onCompletePractice}
							disabled={!onCompletePractice || completedSegmentCount < shadowingData.segmentCount}
							className="w-full sm:w-auto rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
						>
							Submit shadowing
						</button>
					</div>

				</div>
			</div>
			<Popover
				open={openPopover}
				anchorEl={anchorEl}
				onClose={handleClosePopover}
				disableRestoreFocus
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
				PaperProps={{
					sx: { width: 320, p: 2, borderRadius: 2, mt: 1, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }
				}}
			>
				{loading ? (
					<Box display="flex" justifyContent="center" p={3}>
						<CircularProgress size={24} />
					</Box>
				) : dictData?.notFound ? (
					<Typography color="text.secondary" variant="body2" align="center">
						Không tìm thấy nghĩa cho "{dictData.word}".
					</Typography>
				) : dictData ? (
					<Box>
						{/* Header: Word + Actions */}
						<Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
							<Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
								<Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a' }}>
									{dictData.word}
								</Typography>

								{/* --- IPA --- */}
								{dictData.ipa && (
									<Typography variant="body2" sx={{ color: '#64748b', fontFamily: 'monospace', ml: 1 }}>
										{dictData.ipa}
									</Typography>
								)}
								<IconButton size="small" onClick={playAudio} sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' } }}>
									<VolumeUpOutlinedIcon fontSize="small" />
								</IconButton>
							</Box>
							<Box display="flex" gap={0.5}>
								<IconButton size="small" sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' } }}>
									<StarBorderIcon sx={{ fontSize: 18 }} />
								</IconButton>
								<IconButton size="small" sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' } }}>
									<MenuBookIcon sx={{ fontSize: 18 }} />
								</IconButton>
							</Box>
						</Box>

						<Divider sx={{ mb: 1.5, borderColor: '#f1f5f9' }} />

						{/* List Meanings */}
						<Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
							{dictData.meanings.map((meaning, mIdx) => (
								<Box key={mIdx}>
									{meaning.partOfSpeech !== 'translation' && (
										<Typography
											variant="caption"
											sx={{ display: 'inline-block', px: 1, py: 0.25, bgcolor: '#f1f5f9', color: '#64748b', borderRadius: 1, mb: 1, fontWeight: 600, fontSize: '10px' }}
										>
											{meaning.partOfSpeech}
										</Typography>
									)}
									<Box display="flex" flexDirection="column" gap={0.5}>
										{/* Lấy tối đa 3 nghĩa đầu tiên cho mỗi loại từ để đỡ rối */}
										{meaning.definitions.slice(0, 3).map((def, dIdx) => (
											<Box key={dIdx} display="flex" alignItems="center" gap={1}>
												<Typography variant="body2" sx={{ fontWeight: 600, fontStyle: 'italic', color: '#3b82f6', mt: '2px', opacity: 0.8 }}>
													{meaning.partOfSpeech !== 'translation' ? meaning.partOfSpeech : 'vi'}
												</Typography>
												<Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, lineHeight: 1.4 }}>
													{def}
												</Typography>
											</Box>
										))}
									</Box>
								</Box>
							))}
						</Box>
					</Box>
				) : null}
			</Popover>
		</>
	);
}
