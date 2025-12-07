import React, { useEffect, useRef, useState } from 'react';
import { useConversationViewModel } from '../../viewmodels/useConversationViewModel';
import {
    Box,
    Button,
    Paper,
    Typography,
    IconButton,
    AppBar,
    Toolbar,
    Fade,
    Chip,
    Stack,
    CircularProgress,
    Collapse,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent
} from '@mui/material';
import {
    Mic as MicIcon,
    Stop as StopIcon,
    Replay as ReplayIcon,
    ArrowBack as ArrowBackIcon,
    Timer as TimerIcon,
    Close as CloseIcon,
    TipsAndUpdates as TipsAndUpdatesIcon,
    Translate as TranslateIcon,
    Send as SendIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Feedback, SessionResult, SpeakerRole, UserConfig } from '../../types/PracticeSpeaking';
import FeedbackCard from '../../components/practices/speaking/FeedbackCard';
import AudioVisualizer from '../../components/practices/speaking/AudioVisualizer';
import PracticeModal from '../../components/practices/speaking/PracticeModal';

interface Props {
    config: UserConfig;
    onFinish: (result: SessionResult) => void;
    onBack: () => void;
    replaySessionId?: string;
    replayDurationSeconds?: number;
}

const ConversationPracticeSpeakingPage: React.FC<Props> = ({ config, onFinish, onBack, replaySessionId, replayDurationSeconds }) => {
    const vm = useConversationViewModel(config, onFinish, replaySessionId);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [expandedTranslations, setExpandedTranslations] = useState<Set<string>>(new Set());
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [vm.messages, vm.isProcessing, vm.isBotThinking, vm.isRecording, vm.suggestions]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const toggleTranslation = (id: string) => {
        setExpandedTranslations(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f4f6f8', position: 'relative' }}>

            {/* Tap to Start Overlay */}
            <AnimatePresence>
                {vm.showStartOverlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)' }}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            onClick={vm.handleStartAudio}
                            sx={{ py: 2, px: 4, borderRadius: 4, fontSize: '1.2rem' }}
                        >
                            Tap to Enable Audio
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white', zIndex: 10 }}>
                <Toolbar>
                    <IconButton edge="start" onClick={onBack} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>
                            {config.scenario}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {config.userRole} • {config.level}
                        </Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <TimerIcon fontSize="small" color={replaySessionId ? "disabled" : (vm.sessionTime < 60 ? "error" : "disabled")} />
                        <Typography
                            variant="body2"
                            fontFamily="monospace"
                            fontWeight="medium"
                            color={replaySessionId ? "text.secondary" : (vm.sessionTime < 60 ? "error.main" : "text.secondary")}
                        >
                            {replaySessionId
                                ? (() => {
                                    const seconds = replayDurationSeconds;
                                    if (typeof seconds === 'number') {
                                        const m = Math.floor(seconds / 60);
                                        const s = seconds % 60;
                                        return `${m}m ${s}s`;
                                    }
                                    return `${config.durationMinutes} min session`;
                                })()
                                : formatTime(vm.sessionTime)}
                        </Typography>
                        {!replaySessionId && (
                            <Button variant="outlined" size="small" onClick={vm.handleFinishSession} sx={{ ml: 2, textTransform: 'none' }}>
                                End
                            </Button>
                        )}
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Chat Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, pb: 15, display: 'flex', flexDirection: 'column', gap: 2 }} className="no-scrollbar">
                <AnimatePresence>
                    {vm.messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            layout
                            style={{
                                alignSelf: msg.role === SpeakerRole.USER ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                width: 'fit-content'
                            }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    borderRadius: msg.role === SpeakerRole.BOT ? "0 10px 10px 0" : "10px 0 0 10px",
                                    bgcolor: msg.role === SpeakerRole.USER ? 'primary.main' : 'white',
                                    color: msg.role === SpeakerRole.USER ? 'primary.contrastText' : 'text.primary',
                                    border: msg.role === SpeakerRole.BOT ? '1px solid #e2e8f0' : 'none',
                                    width: "fit-content",
                                    marginLeft: "auto",
                                }}
                            >
                                <Typography variant="body1" sx={{ lineHeight: 1.5, textAlign: "justify" }}>{msg.text}</Typography>
                                {msg.role === SpeakerRole.BOT && (
                                    <Collapse in={expandedTranslations.has(msg.id)}>
                                        <Typography variant="caption" color="text.secondary" fontStyle="italic" sx={{ mt: 0.5, borderLeft: '2px solid #cbd5e1', pl: 1 }}>
                                            {msg.translation || "Translation unavailable"}
                                        </Typography>
                                    </Collapse>
                                )}
                                {msg.role === SpeakerRole.USER && (
                                    <Collapse in={expandedTranslations.has(msg.id)}>
                                        <Typography variant="caption" color="#e0e0e0" fontStyle="italic" sx={{ mt: 0.5, borderRight: '2px solid #cbd5e1', pr: 1, textAlign: 'right' }}>
                                            {msg.translation || "Translation unavailable"}
                                        </Typography>
                                    </Collapse>
                                )}
                            </Paper>

                            {!replaySessionId && msg.role === SpeakerRole.BOT && (
                                <Stack direction="row" spacing={1}>
                                    {msg.audioBase64 && (
                                        <Button
                                            startIcon={<ReplayIcon />}
                                            size="small"
                                            onClick={() => vm.playBotAudio(msg.audioBase64!)}
                                            sx={{ textTransform: 'none', color: 'primary.main', minWidth: 'auto' }}
                                        >
                                            Replay
                                        </Button>
                                    )}

                                    <Tooltip title="Toggle Vietnamese Translation">
                                        <IconButton
                                            size="small"
                                            onClick={() => toggleTranslation(msg.id)}
                                            sx={{
                                                color: expandedTranslations.has(msg.id) ? 'primary.main' : 'text.secondary',
                                                bgcolor: expandedTranslations.has(msg.id) ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                                            }}
                                        >
                                            <TranslateIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            )}

                            {!replaySessionId && msg.role === SpeakerRole.USER && (
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Tooltip title="Toggle Vietnamese Translation">
                                        <IconButton
                                            size="small"
                                            onClick={() => toggleTranslation(msg.id)}
                                            sx={{
                                                color: 'inherit',
                                                bgcolor: expandedTranslations.has(msg.id) ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
                                            }}
                                        >
                                            <TranslateIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            )}
                            {msg.role === SpeakerRole.USER && msg.feedback && (
                                <Box mt={1} mr={1} width="40vw" minWidth="330px" marginLeft="auto">
                                    <FeedbackCard
                                        feedback={msg.feedback}
                                        onPractice={vm.openPractice}
                                        onClick={() => setSelectedFeedback(msg.feedback || null)}
                                    />
                                </Box>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loaders */}
                <AnimatePresence>
                    {vm.isProcessing && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ alignSelf: 'flex-end' }}>
                            <Chip label="Analyzing your speech..." color="primary" variant="outlined" icon={<CircularProgress size={16} />} />
                        </motion.div>
                    )}

                    {vm.isBotThinking && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ alignSelf: 'flex-start' }}>
                            <Chip label="Partner is thinking..." sx={{ bgcolor: 'white' }} icon={<CircularProgress size={16} />} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {vm.errorMsg && (
                    <Fade in>
                        <Box sx={{ textAlign: 'center', my: 2 }}>
                            <Chip label={vm.errorMsg} color="error" size="small" />
                        </Box>
                    </Fade>
                )}

                <div ref={chatEndRef} />
            </Box>

            {/* Bottom Controls */}
            {!replaySessionId && (
                <Paper
                    elevation={6}
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: 'white',
                        zIndex: 20,
                        borderTop: '1px solid #e2e8f0'
                    }}
                >
                    {/* Floating Suggestions (Above the bar) */}
                    <AnimatePresence>
                        {vm.suggestions.length > 0 && !vm.isRecording && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: 0,
                                    right: 0,
                                    paddingBottom: 8,
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}
                            >
                                <Stack direction="row" spacing={1} overflow="auto" sx={{ maxWidth: '100%', px: 2, pb: 1 }}>
                                    {vm.suggestions.map((s, i) => (
                                        <Chip
                                            key={i}
                                            label={s}
                                            onClick={() => { }} // Could be used to autofill TTS in future
                                            variant="filled"
                                            color="primary"
                                            size="medium"
                                            sx={{ boxShadow: 2 }}
                                        />
                                    ))}
                                </Stack>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Box sx={{ p: 1.5, minHeight: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AnimatePresence mode="wait">
                            {!vm.isRecording ? (
                                // IDLE STATE: Horizontal Layout
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{ width: '100%', maxWidth: 800, display: 'flex', alignItems: 'center', gap: 12 }}
                                >
                                    {/* Suggestion Button */}
                                    <Tooltip title="Get hints">
                                        <IconButton
                                            onClick={vm.getSuggestions}
                                            disabled={vm.isSuggesting || vm.isBotThinking}
                                            sx={{
                                                bgcolor: '#f1f5f9',
                                                color: vm.isSuggesting ? 'text.disabled' : '#f59e0b',
                                                border: '1px solid #e2e8f0'
                                            }}
                                        >
                                            {vm.isSuggesting ? <CircularProgress size={20} /> : <TipsAndUpdatesIcon />}
                                        </IconButton>
                                    </Tooltip>

                                    {/* Fake Input Field (Visual Cue) */}
                                    <Box
                                        onClick={vm.isInitializing || vm.isProcessing || vm.isBotThinking ? undefined : vm.startRecording}
                                        sx={{
                                            flexGrow: 1,
                                            height: 44,
                                            bgcolor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 24,
                                            display: 'flex',
                                            alignItems: 'center',
                                            px: 2,
                                            cursor: 'pointer',
                                            color: 'text.secondary',
                                            '&:hover': { bgcolor: '#f1f5f9' }
                                        }}
                                    >
                                        <Typography variant="body2">Tap microphone to speak...</Typography>
                                    </Box>

                                    {/* Mic Button */}
                                    <Button
                                        onClick={vm.startRecording}
                                        disabled={vm.isInitializing || vm.isProcessing || vm.isBotThinking}
                                        variant="contained"
                                        color="primary"
                                        sx={{
                                            borderRadius: '50%',
                                            minWidth: 56,
                                            width: 56,
                                            height: 56,
                                            boxShadow: 3
                                        }}
                                    >
                                        {vm.isInitializing ? <CircularProgress size={24} color="inherit" /> : <MicIcon fontSize="medium" />}
                                    </Button>
                                </motion.div>
                            ) : (
                                // RECORDING STATE: Horizontal Layout
                                <motion.div
                                    key="recording"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{ width: '100%', maxWidth: 800, display: 'flex', alignItems: 'center', gap: 12 }}
                                >
                                    {/* Cancel Button */}
                                    <IconButton
                                        onClick={vm.cancelRecording}
                                        sx={{
                                            color: '#ef4444',
                                            border: '1px solid #fee2e2',
                                            bgcolor: '#fef2f2'
                                        }}
                                    >
                                        <CloseIcon />
                                    </IconButton>

                                    {/* Visualizer Container */}
                                    <Box sx={{ flexGrow: 1, height: 48, bgcolor: '#f1f5f9', borderRadius: 24, overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0' }}>
                                        <AudioVisualizer analyser={vm.analyser} isRecording={vm.isRecording} />
                                        <Box sx={{ position: 'absolute', right: 16, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="caption" fontWeight="bold" color="error">
                                                {vm.recordingTime}s
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Send/Stop Button */}
                                    <Button
                                        onClick={vm.stopRecording}
                                        variant="contained"
                                        color="primary" // Changed to primary (Send) metaphor, or Error (Stop) metaphor. Let's use Send Icon for positive action.
                                        sx={{
                                            borderRadius: '50%',
                                            minWidth: 56,
                                            width: 56,
                                            height: 56,
                                            boxShadow: 3
                                        }}
                                    >
                                        <SendIcon />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>
                </Paper>
            )}

            {/* Practice Modal */}
            <PracticeModal
                isOpen={vm.isPracticeOpen}
                onClose={vm.closePractice}
                targetPhrase={vm.practiceTarget}
                isRecording={vm.isPracticeRecording}
                isProcessing={vm.isPracticeProcessing}
                onStartRecording={vm.startPracticeRecording}
                onStopRecording={vm.stopPracticeRecording}
                analyser={vm.analyser}
                result={vm.practiceResult}
            />

            {/* Feedback Zoom Dialog */}
            <Dialog
                open={!!selectedFeedback}
                onClose={() => setSelectedFeedback(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">Detailed Analysis</Typography>
                    <IconButton onClick={() => setSelectedFeedback(null)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {selectedFeedback && (
                        <FeedbackCard
                            feedback={selectedFeedback}
                            onPractice={(phrase) => {
                                vm.openPractice(phrase);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default ConversationPracticeSpeakingPage;