import React from 'react';
import {
    Dialog, DialogContent, DialogTitle, IconButton, Typography, Box, Button, CircularProgress, Stack, Fade
} from '@mui/material';
import { Close as CloseIcon, Mic as MicIcon, Stop as StopIcon } from '@mui/icons-material';
import AudioVisualizer from './AudioVisualizer';
import { PracticeResult } from '../../../types/PracticeSpeaking';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    targetPhrase: string;
    isRecording: boolean;
    isProcessing: boolean;
    onStartRecording: () => void;
    onStopRecording: () => void;
    analyser: AnalyserNode | null;
    result: PracticeResult | null;
}

const PracticeModal: React.FC<Props> = ({
    isOpen,
    onClose,
    targetPhrase,
    isRecording,
    isProcessing,
    onStartRecording,
    onStopRecording,
    analyser,
    result
}) => {
    return (
        <Dialog
            open={isOpen}
            onClose={!isRecording ? onClose : undefined}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: { borderRadius: 3, p: 1 }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">Pronunciation Practice</Typography>
                <IconButton onClick={onClose} disabled={isRecording}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box textAlign="center" mb={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Try to say the correction clearly:
                    </Typography>
                    <Typography variant="h5" color="primary.main" fontWeight="bold" sx={{ mt: 1 }}>
                        "{targetPhrase}"
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 200 }}>

                    {/* Visualizer / Status Area */}
                    <Box sx={{ width: '100%', height: 80, mb: 3, bgcolor: '#f1f5f9', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                        <AudioVisualizer analyser={analyser} isRecording={isRecording} />
                        {isProcessing && (
                            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.8)' }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CircularProgress size={20} />
                                    <Typography variant="caption" fontWeight="bold">Analyzing...</Typography>
                                </Stack>
                            </Box>
                        )}
                    </Box>

                    {/* Controls */}
                    {!result || isRecording || isProcessing ? (
                        <Button
                            variant="contained"
                            color={isRecording ? "error" : "primary"}
                            onClick={isRecording ? onStopRecording : onStartRecording}
                            disabled={isProcessing}
                            sx={{
                                borderRadius: '50%',
                                width: 72,
                                height: 72,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }}
                        >
                            {isRecording ? <StopIcon fontSize="large" /> : <MicIcon fontSize="large" />}
                        </Button>
                    ) : (
                        <Fade in>
                            <Box sx={{ width: '100%', textAlign: 'center' }}>
                                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                                    <CircularProgress
                                        variant="determinate"
                                        value={result.score}
                                        size={80}
                                        color={result.score >= 80 ? "success" : result.score >= 50 ? "warning" : "error"}
                                    />
                                    <Box
                                        sx={{
                                            top: 0,
                                            left: 0,
                                            bottom: 0,
                                            right: 0,
                                            position: 'absolute',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Typography variant="h6" component="div" color="text.secondary" fontWeight="bold">
                                            {result.score}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Typography variant="body1" fontWeight="bold" gutterBottom>
                                    "{result.detectedText}"
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, px: 2, bgcolor: '#f8fafc', py: 1, borderRadius: 2 }}>
                                    {result.feedback}
                                </Typography>

                                <Button variant="outlined" startIcon={<MicIcon />} onClick={onStartRecording}>
                                    Try Again
                                </Button>
                            </Box>
                        </Fade>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default PracticeModal;