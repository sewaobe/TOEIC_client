import React, { useState } from 'react';

import {
    Fab,
    Zoom,
    Tooltip,
    IconButton,
    Stack,
    Box,
    Typography,
    Grid
} from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';
import { SessionResult, SessionWithDetail, UserConfig } from '../../types/PracticeSpeaking';
import SetupPracticeSpeakingPage from './SetupPracticeSpeakingPage';
import ConversationPracticeSpeakingPage from './ConversationPracticeSpeakingPage';
import HistoryPracticeSpeakingPage from './HistoryPracticeSpeakingPage';
import PracticeLayout from '../layouts/PracticeLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import SessionDetailModal from './SessionDetailModal';
import TimelineIcon from '@mui/icons-material/Timeline';
import AnalyticsTimeLine from '../../components/practices/speaking/AnalyticsTimeLine';
import RolePlayCard from '../../components/practices/speaking/CardType/RolePlayCard';
import LiveCallCard from '../../components/practices/speaking/CardType/LiveCallCard';


enum PracticeSpeakingState {
    SETUP,
    CONVERSATION,
    HISTORY,
    ANALYTICS,
    SPEAKING_CONVERSATION,
    SPEAKING_LIVE
}

const PracticeSpeakingPage: React.FC = () => {
    const [appState, setAppState] = useState<PracticeSpeakingState>(PracticeSpeakingState.SETUP);
    const [currentConfig, setCurrentConfig] = useState<UserConfig | null>(null);
    const [history, setHistory] = useState<SessionResult[]>([]);
    const [selectedSession, setSelectedSession] = useState<SessionWithDetail | null>(null);
    const navigate = useNavigate();

    const handleStart = (config: UserConfig) => {
        setCurrentConfig(config);
        setAppState(PracticeSpeakingState.CONVERSATION);
    };

    const handleFinish = (result: SessionResult & { _id?: string }, detail?: SessionWithDetail | null) => {
        setHistory(prev => [...prev, result]);

        if (detail) {
            setSelectedSession(detail);
        }

        setAppState(PracticeSpeakingState.HISTORY);
    };

    const renderScreen = () => {
        switch (appState) {
            case PracticeSpeakingState.SETUP:
                return (
                    <PracticeLayout>
                        <IconButton
                            sx={{
                                position: "fixed",
                                top: 100,
                                left: 16,
                                zIndex: 999,
                                backgroundColor: "white",
                                boxShadow: 2,
                                "&:hover": { backgroundColor: "#f3f4f6" }
                            }}
                            onClick={() => navigate(-1)}
                        >
                            <ArrowBackIcon />
                        </IconButton>

                        <Box sx={{
                            minHeight: '100%',
                            p: 8,
                            px: { xs: 2, md: 6 },
                            textAlign: 'left',
                        }}>
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, textAlign: 'center' }}>
                                Choose your speaking mode
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }} >
                                    <RolePlayCard onClick={() => setAppState(PracticeSpeakingState.SPEAKING_CONVERSATION)} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <LiveCallCard onClick={() => setAppState(PracticeSpeakingState.SPEAKING_LIVE)} />
                                </Grid>
                            </Grid>
                        </Box>

                        <Stack direction="column" spacing={2} sx={{ position: 'fixed', bottom: 24, right: 24 }}>
                            <Zoom in={true}>
                                <Tooltip title="Learning Analytics" placement="left">
                                    <Fab
                                        color="primary"
                                        aria-label="analytics"
                                        onClick={() => setAppState(PracticeSpeakingState.ANALYTICS)}
                                    >
                                        <TimelineIcon />
                                    </Fab>
                                </Tooltip>
                            </Zoom>

                            <Zoom in={true}>
                                <Tooltip title="View History" placement="left">
                                    <Fab
                                        color="secondary"
                                        aria-label="history"
                                        onClick={() => setAppState(PracticeSpeakingState.HISTORY)}
                                    >
                                        <HistoryIcon />
                                    </Fab>
                                </Tooltip>
                            </Zoom>
                        </Stack>
                    </PracticeLayout>
                );
            case PracticeSpeakingState.CONVERSATION:
                return currentConfig ? (
                    <ConversationPracticeSpeakingPage
                        config={currentConfig}
                        onFinish={handleFinish}
                        onBack={() => setAppState(PracticeSpeakingState.SETUP)}
                    />
                ) : null;
            case PracticeSpeakingState.SPEAKING_CONVERSATION:
                return (
                    <PracticeLayout>
                        <IconButton
                            sx={{
                                position: 'fixed',
                                top: 100,
                                left: 16,
                                zIndex: 999,
                                backgroundColor: 'white',
                                boxShadow: 2,
                                '&:hover': { backgroundColor: '#f3f4f6' }
                            }}
                            onClick={() => setAppState(PracticeSpeakingState.SETUP)}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <SetupPracticeSpeakingPage onStart={handleStart} />
                    </PracticeLayout>
                );
            case PracticeSpeakingState.HISTORY:
                return (
                    <PracticeLayout>
                        <HistoryPracticeSpeakingPage
                            onBack={() => setAppState(PracticeSpeakingState.SETUP)}
                            onOpenDetail={setSelectedSession}
                        />
                    </PracticeLayout>
                );
            case PracticeSpeakingState.SPEAKING_LIVE:
                return (
                    <PracticeLayout>
                        <IconButton
                            sx={{
                                position: 'fixed',
                                top: 100,
                                left: 16,
                                zIndex: 999,
                                backgroundColor: 'white',
                                boxShadow: 2,
                                '&:hover': { backgroundColor: '#f3f4f6' }
                            }}
                            onClick={() => setAppState(PracticeSpeakingState.SETUP)}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Box sx={{ mt: 12, textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Live Speaking with Native Speaker
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                This is the speaking_live area. You can implement your live call UI here.
                            </Typography>
                        </Box>
                    </PracticeLayout>
                );
            case PracticeSpeakingState.ANALYTICS:
                return (
                    <PracticeLayout>
                        <AnalyticsTimeLine
                            onBack={() => setAppState(PracticeSpeakingState.SETUP)}
                        />
                    </PracticeLayout>
                )
            default:
                return null;
        }
    };

    return (
        <>
            {renderScreen()}
            <SessionDetailModal
                session={selectedSession}
                onClose={() => setSelectedSession(null)}
            />
        </>
    );
};

export default PracticeSpeakingPage;