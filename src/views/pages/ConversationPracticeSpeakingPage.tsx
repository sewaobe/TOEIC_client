import React, { useEffect, useRef } from 'react';
import { useConversationViewModel } from '../../viewmodels/useConversationViewModel';
import {
    Box, Button, Paper, Typography, IconButton, AppBar, Toolbar, Fade, Chip, Stack, CircularProgress
} from '@mui/material';
import {
    Mic as MicIcon, Stop as StopIcon, Replay as ReplayIcon, ArrowBack as ArrowBackIcon, Timer as TimerIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionResult, SpeakerRole, UserConfig } from '../../types/PracticeSpeaking';
import FeedbackCard from '../../components/practices/speaking/FeedbackCard';
import AudioVisualizer from '../../components/practices/speaking/AudioVisualizer';

interface Props {
    config: UserConfig;
    onFinish: (result: SessionResult) => void;
    onBack: () => void;
}

const ConversationPracticeSpeakingPage: React.FC<Props> = ({ config, onFinish, onBack }) => {
    const vm = useConversationViewModel(config, onFinish);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [vm.messages, vm.isProcessing, vm.isBotThinking, vm.isRecording]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
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
            <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
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
                        <TimerIcon fontSize="small" color={vm.sessionTime < 60 ? "error" : "disabled"} />
                        <Typography variant="body2" fontFamily="monospace" fontWeight="medium" color={vm.sessionTime < 60 ? "error.main" : "text.secondary"}>
                            {formatTime(vm.sessionTime)}
                        </Typography>
                        <Button variant="outlined" size="small" onClick={vm.handleFinishSession} sx={{ ml: 2, textTransform: 'none' }}>
                            End
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Chat Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, pb: 15, display: 'flex', flexDirection: 'column', gap: 2 }} className="custom-scrollbar">
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
                                    p: 2,
                                    borderRadius: 3,
                                    borderTopRightRadius: msg.role === SpeakerRole.USER ? 0 : 3,
                                    borderTopLeftRadius: msg.role === SpeakerRole.BOT ? 0 : 3,
                                    bgcolor: msg.role === SpeakerRole.USER ? 'primary.main' : 'white',
                                    color: msg.role === SpeakerRole.USER ? 'primary.contrastText' : 'text.primary',
                                    border: msg.role === SpeakerRole.BOT ? '1px solid #e2e8f0' : 'none',
                                    width: "fit-content",
                                    marginLeft: "auto",                                
                                }}
                            >
                                <Typography variant="body1" sx={{ lineHeight: 1.5, textAlign: "justify" }}>{msg.text}</Typography>

                                {msg.role === SpeakerRole.BOT && msg.audioBase64 && (
                                    <Button
                                        startIcon={<ReplayIcon />}
                                        size="small"
                                        onClick={() => vm.playBotAudio(msg.audioBase64!)}
                                        sx={{ mt: 1, textTransform: 'none', color: 'primary.main' }}
                                    >
                                        Replay
                                    </Button>
                                )}
                            </Paper>

                            {msg.role === SpeakerRole.USER && msg.feedback && (
                                <Box mt={1} mr={2} width="40vw" minWidth="330px" marginLeft="auto">
                                    <FeedbackCard feedback={msg.feedback} />
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
            <Paper
                elevation={4}
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 1,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    bgcolor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <AnimatePresence mode="wait">
                    {!vm.isRecording ? (
                        // IDLE STATE: Big Mic Button
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <Button
                                onClick={vm.startRecording}
                                disabled={vm.isInitializing || vm.isProcessing || vm.isBotThinking}
                                variant="contained"
                                color="primary"
                                sx={{
                                    borderRadius: '50%',
                                    width: 66,
                                    height: 66,
                                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                                    transition: 'transform 0.1s',
                                    '&:active': { transform: 'scale(0.95)' }
                                }}
                            >
                                {vm.isInitializing ? <CircularProgress size={30} color="inherit" /> : <MicIcon sx={{ fontSize: 30 }} />}
                            </Button>
                            <Typography variant="body2" color="text.secondary" mt={2} fontWeight="medium">
                                Tap to Speak
                            </Typography>
                        </motion.div>
                    ) : (
                        // RECORDING STATE: Visualizer + Stop Button
                        <motion.div
                            key="recording"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            style={{ width: '100%', maxWidth: 600 }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ flexGrow: 1, height: 60, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                                    <AudioVisualizer analyser={vm.analyser} isRecording={vm.isRecording} />
                                </Box>

                                <Button
                                    onClick={vm.stopRecording}
                                    variant="contained"
                                    color="error"
                                    sx={{
                                        borderRadius: '50%',
                                        width: 60,
                                        height: 60,
                                        minWidth: 60,
                                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                    }}
                                >
                                    <StopIcon fontSize="large" />
                                </Button>
                            </Stack>
                            <Typography variant="caption" align="center" display="block" color="error.main" mt={1} fontWeight="bold">
                                {vm.recordingTime}s • Recording...
                            </Typography>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Paper>
        </Box>
    );
};

export default ConversationPracticeSpeakingPage;