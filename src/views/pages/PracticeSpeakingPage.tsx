import React, { useState } from 'react';

import { Fab, Zoom, Tooltip, IconButton } from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';
import { SessionResult, UserConfig } from '../../types/PracticeSpeaking';
import SetupPracticeSpeakingPage from './SetupPracticeSpeakingPage';
import ConversationPracticeSpeakingPage from './ConversationPracticeSpeakingPage';
import HistoryPracticeSpeakingPage from './HistoryPracticeSpeakingPage';
import PracticeLayout from '../layouts/PracticeLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

enum PracticeSpeakingState {
    SETUP,
    CONVERSATION,
    HISTORY,
    HISTORY_REPLAY,
}

const PracticeSpeakingPage: React.FC = () => {
    const [appState, setAppState] = useState<PracticeSpeakingState>(PracticeSpeakingState.SETUP);
    const [currentConfig, setCurrentConfig] = useState<UserConfig | null>(null);
    const [history, setHistory] = useState<SessionResult[]>([]);
    const [replaySessionId, setReplaySessionId] = useState<string | null>(null);
    const [replayDurationSeconds, setReplayDurationSeconds] = useState<number | undefined>(undefined);
    const navigate = useNavigate();

    const handleStart = (config: UserConfig) => {
        setCurrentConfig(config);
        setAppState(PracticeSpeakingState.CONVERSATION);
    };

    const handleFinish = (result: SessionResult) => {
        setHistory(prev => [...prev, result]);
        setAppState(PracticeSpeakingState.HISTORY);
    };

    const handleOpenHistorySession = (sessionId: string, config: UserConfig & { actualDurationSeconds?: number }) => {
        setCurrentConfig(config);
        setReplaySessionId(sessionId);
        setReplayDurationSeconds(config.actualDurationSeconds);
        setAppState(PracticeSpeakingState.HISTORY_REPLAY);
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
                        <SetupPracticeSpeakingPage onStart={handleStart} />
                        <Zoom in>
                            <Tooltip title="View History">
                                <Fab
                                    color="secondary"
                                    aria-label="history"
                                    sx={{ position: 'fixed', bottom: 24, right: 24 }}
                                    onClick={() => setAppState(PracticeSpeakingState.HISTORY)}
                                >
                                    <HistoryIcon />
                                </Fab>
                            </Tooltip>
                        </Zoom>
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
            case PracticeSpeakingState.HISTORY:
                return (
                    <PracticeLayout>
                        <HistoryPracticeSpeakingPage
                            results={history}
                            onBack={() => setAppState(PracticeSpeakingState.SETUP)}
                            onOpenSession={handleOpenHistorySession}
                        />
                    </PracticeLayout>
                );
            case PracticeSpeakingState.HISTORY_REPLAY:
                return currentConfig && replaySessionId ? (
                    <ConversationPracticeSpeakingPage
                        config={currentConfig}
                        onFinish={handleFinish}
                        onBack={() => setAppState(PracticeSpeakingState.HISTORY)}
                        replaySessionId={replaySessionId}
                        replayDurationSeconds={replayDurationSeconds}
                    />
                ) : null;
            default:
                return null;
        }
    };

    return renderScreen();
};

export default PracticeSpeakingPage;