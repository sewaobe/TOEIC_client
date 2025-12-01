import React from 'react';
import { useHistoryViewModel } from '../../viewmodels/useHistoryViewModel';
import {
    Box, Container, Typography, Button, Card, CardContent, Stack, Chip, IconButton, Pagination,
    Divider
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, History as HistoryIcon, EventNote as EventNoteIcon } from '@mui/icons-material';
import { SessionResult } from '../../types/PracticeSpeaking';

interface Props {
    results: SessionResult[];
    onBack: () => void;
}

const HistoryPracticeSpeakingPage: React.FC<Props> = ({ results, onBack }) => {
    const { page, setPage, totalPages, displayedResults } = useHistoryViewModel(results);

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #FDF2F8 100%)',
            py: 4
        }}>
            <Container maxWidth="md">
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton onClick={onBack} size="small" sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#f8fafc' } }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5" fontWeight="bold" color="text.primary">Practice History</Typography>
                    </Stack>
                </Stack>

                {results.length === 0 ? (
                    <Card variant="outlined" sx={{ textAlign: 'center', py: 8, borderStyle: 'dashed', bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
                        <HistoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">No sessions yet</Typography>
                        <Typography variant="body2" color="text.disabled">Complete a conversation to see your progress here.</Typography>
                        <Button variant="contained" onClick={onBack} sx={{ mt: 3 }}>
                            Start New Session
                        </Button>
                    </Card>
                ) : (
                    <>
                        <Stack spacing={2} mb={4}>
                            {displayedResults.map((res, idx) => (
                                <Card
                                    key={idx}
                                    elevation={1}
                                    sx={{
                                        borderRadius: 3,
                                        bgcolor: 'rgba(255,255,255,0.8)',
                                        backdropFilter: 'blur(8px)',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                                            bgcolor: 'white'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                                        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>

                                            {/* Left Side: Info */}
                                            <Box sx={{ flex: 1, width: '100%' }}>
                                                <Typography variant="h6" fontWeight="bold" color="text.primary" noWrap title={res.config.scenario || "Custom Scenario"}>
                                                    {res.config.scenario || "Custom Scenario"}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                                                    <Chip
                                                        icon={<EventNoteIcon fontSize="small" />}
                                                        label={new Date(res.date).toLocaleDateString()}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ bgcolor: 'white', borderColor: 'divider' }}
                                                    />
                                                    <Chip
                                                        label={res.config.level}
                                                        size="small"
                                                        color="primary"
                                                        sx={{ fontWeight: 'bold' }}
                                                    />
                                                </Stack>
                                            </Box>

                                            {/* Right Side: Stats */}
                                            <Stack
                                                direction="row"
                                                spacing={{ xs: 2, sm: 4 }}
                                                divider={<Divider orientation="vertical" flexItem sx={{ height: 40, alignSelf: 'center' }} />}
                                                alignItems="center"
                                                justifyContent={{ xs: 'space-around', md: 'flex-end' }}
                                                sx={{
                                                    width: { xs: '100%', md: 'auto' },
                                                    bgcolor: { xs: 'rgba(255,255,255,0.5)', md: 'transparent' },
                                                    p: { xs: 2, md: 0 },
                                                    borderRadius: 2
                                                }}
                                            >
                                                <Box textAlign="center" minWidth={60}>
                                                    <Typography variant="h4" fontWeight="900" lineHeight={1} color={
                                                        res.averageScore >= 80 ? 'success.main' :
                                                            res.averageScore >= 60 ? 'warning.main' : 'error.main'
                                                    }>
                                                        {res.averageScore}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>SCORE</Typography>
                                                </Box>

                                                <Box textAlign="center" minWidth={60}>
                                                    <Typography variant="h5" fontWeight="bold" lineHeight={1} color="text.primary">
                                                        {res.messageCount}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>TURNS</Typography>
                                                </Box>

                                                <Box textAlign="center" minWidth={60}>
                                                    <Typography variant="h5" fontWeight="bold" lineHeight={1} color="error.main">
                                                        {res.mistakeCount}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>ERRORS</Typography>
                                                </Box>
                                            </Stack>

                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>

                        {totalPages > 1 && (
                            <Box display="flex" justifyContent="center">
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(_, p) => setPage(p)}
                                    color="primary"
                                    size="large"
                                    shape="rounded"
                                />
                            </Box>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};

export default HistoryPracticeSpeakingPage;