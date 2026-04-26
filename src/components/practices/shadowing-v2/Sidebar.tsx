import {
    ArrowBack as ArrowLeft,
	ViewAgenda as LayoutTemplate,
	AccessTime as Clock,
	Replay as RotateCcw,
	ChevronRight,
	AutoAwesome as Sparkles,
    Videocam as Video,
    VolumeUp as Volume2,
} from '@mui/icons-material';

interface Transcript {
	id: number;
	text: string;
}

interface ShadowingDataForSidebar {
	segmentCount: number;
	transcript: Transcript[];
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

interface SidebarProps {
	shadowingData: ShadowingDataForSidebar;
	mediaMode: 'video' | 'audio';
	canUseVideo: boolean;
	isCompactHeight: boolean;
	activeIndex: number;
	activeTranscriptId: number | null;
	activeTab: 'transcript' | 'suggestions';
	progressPercent: number;
	mockSuggestions: Suggestion[];
	onBack: () => void;
	onSetMediaMode: (mode: 'video' | 'audio') => void;
	onSetActiveTab: (tab: 'transcript' | 'suggestions') => void;
	onSetActiveTranscriptId: (id: number) => void;
}

const getWordPattern = (text: string): number[] => {
	if (!text) return [];
	const words = text.replace(/[.,!?;:]/g, '').split(/\s+/);
	return words.filter(w => w.length > 0).map(w => w.length);
};

export default function Sidebar({
	shadowingData,
	mediaMode,
	canUseVideo,
	isCompactHeight,
	activeIndex,
	activeTranscriptId,
	activeTab,
	progressPercent,
	mockSuggestions,
	onBack,
	onSetMediaMode,
	onSetActiveTab,
	onSetActiveTranscriptId,
}: SidebarProps) {
	return (
		<>
			{/* ================================== */}
			{/* 2. KHU VỰC TABS & DANH SÁCH (SIDEBAR) */}
			{/* ================================== */}
			<div className="py-2 pr-2 col-start-1 row-start-3 col-span-1 row-span-1 z-10 overflow-hidden flex flex-col bg-gray-50 border-gray-200 transition-all duration-500 lg:row-start-1 lg:col-start-2 lg:row-span-2 lg:border-l">
				<div className={`${isCompactHeight ? 'px-3 py-2' : 'px-4 py-2.5'} bg-white border-b border-gray-200 flex items-center justify-between gap-2 shrink-0`}>
					<button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
						<ArrowLeft className="w-4 h-4 text-gray-700" />
					</button>
					<div className="flex bg-gray-100 p-1 rounded-lg">
						{canUseVideo && (
							<button
								onClick={() => onSetMediaMode('video')}
								className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${mediaMode === 'video' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-gray-200'}`}
							>
								<Video className="w-3.5 h-3.5" /> Video
							</button>
						)}
						<button
							onClick={() => onSetMediaMode('audio')}
							className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${mediaMode === 'audio' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-gray-200'}`}
						>
							<Volume2 className="w-3.5 h-3.5" /> Audio
						</button>
					</div>
				</div>

				{/* Tabs */}
				<div className="flex border-b border-gray-200 bg-white shrink-0">
					<button
						onClick={() => onSetActiveTab('transcript')}
						className={`flex-1 ${isCompactHeight ? 'py-2 text-xs' : 'py-3 text-sm'} font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'transcript' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
					>
						<LayoutTemplate className="w-4 h-4" /> Transcript
					</button>
					<button
						onClick={() => onSetActiveTab('suggestions')}
						className={`flex-1 ${isCompactHeight ? 'py-2 text-xs' : 'py-3 text-sm'} font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'suggestions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
					>
						<Sparkles className="w-4 h-4" /> Lesson Suggestions
					</button>
				</div>

				{/* Progress */}
				{activeTab === 'transcript' && (
					<div className={`${isCompactHeight ? 'p-3' : 'p-4'} bg-white border-b border-gray-200 shrink-0`}>
						<div className={`flex justify-between items-center ${isCompactHeight ? 'mb-2' : 'mb-3'}`}>
							<span className="text-sm font-medium text-gray-700">{activeIndex}/{shadowingData.segmentCount}</span>
							<div className="flex items-center gap-2">
								<span className="text-xs text-gray-500">Show</span>
								<div className="w-8 h-4 bg-blue-600 rounded-full relative cursor-pointer">
									<div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-1.5 w-full">
							<div className="flex justify-between items-center text-xs text-gray-400">
								<span>Progress</span>
								<span className="font-semibold text-gray-900">{progressPercent}%</span>
							</div>
							<div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
								<div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
							</div>
						</div>
					</div>
				)}

				{/* Scrollable Lists Area */}
				<div className={`flex-1 overflow-y-auto no-scrollbar bg-white ${isCompactHeight ? 'p-3' : 'p-4'}`}>

					{/* Transcript List */}
					{activeTab === 'transcript' && (
						<div className={isCompactHeight ? 'space-y-2' : 'space-y-3'}>
							{shadowingData.transcript.map((item, index) => {
								const isActive = item.id === activeTranscriptId;
								const pattern = getWordPattern(item.text);
								const localIdx = index + 1;

								return (
									<button
										key={item.id}
										id={`transcript-segment-${localIdx}`}
										type="button"
										onClick={() => onSetActiveTranscriptId(item.id)}
										className={`w-full text-left p-4 rounded-xl border group transform-gpu translate-x-0 transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:translate-x-1 ${
											isActive
												? 'bg-[#080B120D] shadow-sm border-gray-200/60'
												: 'border-transparent bg-transparent hover:border-gray-300/80 hover:bg-gray-100'
										}`}
									>
										<div className="flex items-start gap-3">
											<div className="pt-0.5 shrink-0 mt-1 flex items-center justify-center">
											{isActive ? (
												<div className="relative flex items-center justify-center w-5 h-5">
													<div className="absolute inset-0 bg-gray-900 rounded-full animate-ping opacity-25"></div>
													<div className="relative w-4 h-4 bg-gray-900 rounded-full"></div>
												</div>
											) : (
												<div className="w-4 h-4 rounded-full border-2 border-gray-300/90 group-hover:border-gray-400 transition-colors"></div>
											)}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between mb-2">
													<div className="flex items-center gap-2">
														<span className={`text-sm font-medium transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>#{localIdx}</span>
														{isActive && (
															<span className="text-[10px] font-bold bg-gray-900 text-white px-2 py-0.5 rounded uppercase tracking-wider">Now</span>
														)}
													</div>
													<div className="flex items-center gap-1 shrink-0 text-gray-500">
														<div
															className={`p-1 rounded-md transition-all cursor-pointer hover:bg-black/5 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}
															title="Replay segment"
														>
															<RotateCcw className="w-4 h-4 hover:text-gray-900 transition-colors" />
														</div>
														<ChevronRight className={`w-4 h-4 transition-all ${isActive ? 'opacity-100 text-gray-700' : 'opacity-0 group-hover:opacity-50'}`} />
													</div>
												</div>

												<div className="flex flex-wrap gap-1.5 mt-2">
													{pattern.map((length, i) => (
														<span key={i} className={`text-[10px] tracking-[0.2em] leading-none transition-colors ${isActive ? 'text-gray-900 font-bold' : 'text-gray-300 group-hover:text-gray-400'}`}>
															{'*'.repeat(length)}
														</span>
													))}
												</div>
											</div>
										</div>
									</button>
								);
							})}
						</div>
					)}

					{/* Lesson Suggestions List */}
					{activeTab === 'suggestions' && (
						<div>
							<div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar">
								<button className="px-4 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap shrink-0">All</button>
								<button className="px-4 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium rounded-lg whitespace-nowrap shrink-0">Same Topic</button>
								<button className="px-4 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium rounded-lg whitespace-nowrap shrink-0">Explore</button>
								<button className="px-4 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium rounded-lg whitespace-nowrap shrink-0">For You</button>
								<button className="px-4 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium rounded-lg whitespace-nowrap shrink-0">Popular</button>
								<button className="px-4 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium rounded-lg whitespace-nowrap shrink-0">New</button>
							</div>

							<div className="space-y-3">
								{mockSuggestions.map(item => (
									<div key={item.id} className="flex gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white group">
										<div className="relative w-28 h-16 rounded-lg overflow-hidden shrink-0">
											<img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
										</div>

										<div className="flex-1 flex flex-col justify-between py-0.5">
											<div className="flex items-center gap-2 mb-1">
												<span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.difficulty === 'B1' || item.difficulty === 'B2' ? 'bg-orange-500 text-white' :
													item.difficulty === 'A2' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
													}`}>
													{item.difficulty}
												</span>
												<span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${item.badgeType === 'warning' ? 'border-orange-200 text-orange-600 bg-orange-50/50' : 'border-blue-200 text-blue-600 bg-blue-50/50'
													}`}>
													{item.badge}
												</span>
											</div>

											<h4 className="text-sm font-medium text-gray-800 line-clamp-1 mb-1">{item.title}</h4>

											<div className="flex items-center gap-2 text-xs text-gray-500">
												<span>{item.category}</span>
												<span className="w-0.5 h-0.5 bg-gray-400 rounded-full"></span>
												<div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.duration} min</div>
											</div>

											{item.progress > 0 && (
												<div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
													<div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.progress}%` }}></div>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
