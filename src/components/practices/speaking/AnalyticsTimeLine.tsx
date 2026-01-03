
import React from 'react';
import {
    Box, Container, Typography, IconButton, Paper, Grid, Stack, Chip, CircularProgress,
    Card, Button, Stepper, Step, StepLabel, StepContent, Divider
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Timeline as TimelineIcon,
    School as SchoolIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Flag as FlagIcon,
    RecordVoiceOver as RecordVoiceOverIcon,
    MenuBook as MenuBookIcon,
    Gavel as GavelIcon,
    Speed as SpeedIcon,
    Refresh as RefreshIcon,
    Star as StarIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { SessionResult, TrendPoint } from '../../../types/PracticeSpeaking';
import { useAnalyticsTimeLineViewModel } from '../../../viewmodels/useAnalyticsTimeLineViewModel';
import { LineChart } from '@mui/x-charts/LineChart';
import { RadarChart } from '@mui/x-charts/RadarChart';

interface Props {
    onBack: () => void;
}

// Simple Line Chart using MUI X Charts
const SimpleLineChart: React.FC<{ data: TrendPoint[]; color: string; height?: number }> = ({
    data,
    color,
    height = 120,
}) => {
    if (data.length < 2) {
        return (
            <Box height={height} display="flex" alignItems="center" justifyContent="center">
                <Typography variant="caption" color="text.disabled">
                    Not enough data
                </Typography>
            </Box>
        );
    }

    const xData = data.map((d) => d.sessionIndex);
    const yData = data.map((d) => d.score);

    return (
        <LineChart
            height={height}
            series={[
                {
                    data: yData,
                    color,
                    curve: 'linear',
                    showMark: true,
                },
            ]}
            xAxis={[
                {
                    data: xData,
                    label: 'Session',
                    tickMinStep: 1,
                    scaleType: 'point',
                },
            ]}
            yAxis={[
                {
                    min: 0,
                    max: 100,
                    label: 'Score',
                },
            ]}
            grid={{ vertical: false, horizontal: true }}
            margin={{ top: 10, right: 10, bottom: 30, left: 40 }}
        />
    );
};

const AnalyticsTimeLine: React.FC<Props> = ({ onBack }) => {
    const { profile, history, isLoading, error } = useAnalyticsTimeLineViewModel();

    const getTaskIcon = (category: string) => {
        switch (category) {
            case 'Foundation': return <SchoolIcon color="info" />;
            case 'Advanced': return <StarIcon color="warning" />;
            case 'New Topic': return <AddIcon color="success" />;
            case 'Spaced Repetition': return <RefreshIcon color="secondary" />;
            default: return <FlagIcon />;
        }
    };

    const getTaskColor = (category: string) => {
        switch (category) {
            case 'Foundation': return 'info';
            case 'Advanced': return 'warning';
            case 'New Topic': return 'success';
            case 'Spaced Repetition': return 'secondary';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #FDF2F8 100%)', py: 4 }}>
            <Container maxWidth="lg">
                <Stack direction="row" alignItems="center" spacing={1} mb={4}>
                    <IconButton onClick={onBack} size="small" sx={{ bgcolor: 'white', boxShadow: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" fontWeight="bold" color="text.primary">Personal Coaching Hub</Typography>
                </Stack>

                {history.length === 0 ? (
                    <Card sx={{ p: 5, textAlign: 'center' }}>
                        <Typography color="text.secondary">Complete sessions to unlock your personalized coach!</Typography>
                    </Card>
                ) : isLoading ? (
                    <Box textAlign="center" py={10}>
                        <CircularProgress />
                        <Typography mt={2} color="text.secondary">Analyzing long-term progress...</Typography>
                    </Box>
                ) : error || !profile ? (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fef2f2' }}><Typography color="error">{error}</Typography></Paper>
                ) : (
                    <Grid container spacing={3}>

                        {/* 1. SKILL PROGRESS TRACKER (4 CHARTS) */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Paper 
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 3, 
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    border: '1px solid #e2e8f0',
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                                    <Box sx={{ 
                                        p: 1, 
                                        borderRadius: 2, 
                                        bgcolor: 'primary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <TimelineIcon sx={{ color: 'white', fontSize: 20 }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold">Skill Progress Tracker</Typography>
                                </Stack>

                                <Grid container spacing={2}>
                                    {/* Fluency */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ 
                                            p: 2, 
                                            bgcolor: 'white', 
                                            borderRadius: 2, 
                                            border: '1px solid #e2e8f0',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
                                                borderColor: '#6366f1',
                                            }
                                        }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                                <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: '#eef2ff' }}>
                                                    <SpeedIcon fontSize="small" sx={{ color: '#6366f1' }} />
                                                </Box>
                                                <Typography variant="subtitle2" fontWeight="bold">Fluency</Typography>
                                                <Chip 
                                                    label={profile.skillMastery.fluency} 
                                                    size="small" 
                                                    sx={{ 
                                                        ml: 'auto', 
                                                        bgcolor: '#6366f1', 
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        minWidth: 40,
                                                    }} 
                                                />
                                            </Stack>
                                            <Box sx={{ height: 80 }}>
                                                <SimpleLineChart data={profile.progressTrends.fluency} color="#6366f1" />
                                            </Box>
                                        </Box>
                                    </Grid>
                                    {/* Grammar */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ 
                                            p: 2, 
                                            bgcolor: 'white', 
                                            borderRadius: 2, 
                                            border: '1px solid #e2e8f0',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.15)',
                                                borderColor: '#ec4899',
                                            }
                                        }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                                <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: '#fdf2f8' }}>
                                                    <GavelIcon fontSize="small" sx={{ color: '#ec4899' }} />
                                                </Box>
                                                <Typography variant="subtitle2" fontWeight="bold">Grammar</Typography>
                                                <Chip 
                                                    label={profile.skillMastery.grammar} 
                                                    size="small" 
                                                    sx={{ 
                                                        ml: 'auto', 
                                                        bgcolor: '#ec4899', 
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        minWidth: 40,
                                                    }} 
                                                />
                                            </Stack>
                                            <Box sx={{ height: 80 }}>
                                                <SimpleLineChart data={profile.progressTrends.grammar} color="#ec4899" />
                                            </Box>
                                        </Box>
                                    </Grid>
                                    {/* Intonation Range */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ 
                                            p: 2, 
                                            bgcolor: 'white', 
                                            borderRadius: 2, 
                                            border: '1px solid #e2e8f0',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                                                borderColor: '#10b981',
                                            }
                                        }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                                <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: '#ecfdf5' }}>
                                                    <MenuBookIcon fontSize="small" sx={{ color: '#10b981' }} />
                                                </Box>
                                                <Typography variant="subtitle2" fontWeight="bold">Intonation</Typography>
                                                <Chip 
                                                    label={profile.skillMastery.intonation} 
                                                    size="small" 
                                                    sx={{ 
                                                        ml: 'auto', 
                                                        bgcolor: '#10b981', 
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        minWidth: 40,
                                                    }} 
                                                />
                                            </Stack>
                                            <Box sx={{ height: 80 }}>
                                                <SimpleLineChart data={profile.progressTrends.intonation} color="#10b981" />
                                            </Box>
                                        </Box>
                                    </Grid>
                                    {/* Pronunciation */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ 
                                            p: 2, 
                                            bgcolor: 'white', 
                                            borderRadius: 2, 
                                            border: '1px solid #e2e8f0',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
                                                borderColor: '#f59e0b',
                                            }
                                        }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                                <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: '#fffbeb' }}>
                                                    <RecordVoiceOverIcon fontSize="small" sx={{ color: '#f59e0b' }} />
                                                </Box>
                                                <Typography variant="subtitle2" fontWeight="bold">Pronunciation</Typography>
                                                <Chip 
                                                    label={profile.skillMastery.pronunciation} 
                                                    size="small" 
                                                    sx={{ 
                                                        ml: 'auto', 
                                                        bgcolor: '#f59e0b', 
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        minWidth: 40,
                                                    }} 
                                                />
                                            </Stack>
                                            <Box sx={{ height: 80 }}>
                                                <SimpleLineChart data={profile.progressTrends.pronunciation} color="#f59e0b" />
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 2 }} />

                                <Stack direction="row" spacing={3} flexWrap="wrap">
                                    <Box sx={{ 
                                        flex: 1, 
                                        minWidth: 140,
                                        p: 2, 
                                        bgcolor: '#f0fdf4', 
                                        borderRadius: 2,
                                        border: '1px solid #bbf7d0',
                                    }}>
                                        <Typography variant="caption" display="block" color="text.secondary" fontWeight="bold">
                                            STRONGEST SKILL
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                                            <TrendingUpIcon color="success" fontSize="small" />
                                            <Typography fontWeight="bold" color="success.dark">{profile.strongestSkill}</Typography>
                                        </Stack>
                                    </Box>
                                    <Box sx={{ 
                                        flex: 1,
                                        minWidth: 140,
                                        p: 2, 
                                        bgcolor: '#fef2f2', 
                                        borderRadius: 2,
                                        border: '1px solid #fecaca',
                                    }}>
                                        <Typography variant="caption" display="block" color="text.secondary" fontWeight="bold">
                                            NEEDS FOCUS
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                                            <TrendingDownIcon color="error" fontSize="small" />
                                            <Typography fontWeight="bold" color="error.dark">{profile.weakestSkill}</Typography>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>

                        {/* 2. SKILL OVERVIEW with Radar Chart */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper 
                                sx={{ 
                                    borderRadius: 3, 
                                    height: '100%',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {/* Header with gradient */}
                                <Box sx={{
                                    p: 2,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        Skill Overview
                                    </Typography>
                                </Box>
                                
                                {/* Radar Chart */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center',
                                    p: 2,
                                    bgcolor: '#fafaff',
                                }}>
                                    <RadarChart
                                        height={200}
                                        series={[
                                            {
                                                data: [
                                                    profile.skillMastery.fluency,
                                                    profile.skillMastery.grammar,
                                                    profile.skillMastery.pronunciation,
                                                    profile.skillMastery.intonation,
                                                ],
                                                color: '#667eea',
                                            },
                                        ]}
                                        radar={{
                                            metrics: [
                                                { name: 'Fluency' },
                                                { name: 'Grammar' },
                                                { name: 'Pronunciation' },
                                                { name: 'Intonation' },
                                            ],
                                            max: 100,
                                        }}
                                    />
                                </Box>

                                {/* Readiness Score */}
                                <Box sx={{ 
                                    p: 3, 
                                    textAlign: 'center',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }}>
                                    <Box sx={{ position: 'relative', display: 'inline-flex', mx: 'auto', mb: 2 }}>
                                        {/* Background track */}
                                        <CircularProgress
                                            variant="determinate"
                                            value={100}
                                            size={100}
                                            thickness={5}
                                            sx={{ color: 'rgba(255,255,255,0.2)', position: 'absolute' }}
                                        />
                                        {/* Actual progress */}
                                        <CircularProgress
                                            variant="determinate"
                                            value={profile.readinessScore}
                                            size={100}
                                            thickness={5}
                                            sx={{ 
                                                color: profile.readinessScore >= 80 ? '#4ade80' : profile.readinessScore >= 50 ? '#fbbf24' : '#f87171',
                                            }}
                                        />
                                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography variant="h4" fontWeight="bold">
                                                {profile.readinessScore}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.9, letterSpacing: 1, mb: 1 }}>
                                        🎯 LEVEL READINESS
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        {profile.readinessMessage}
                                    </Typography>
                                    {profile.readinessScore >= 80 && (
                                        <Button 
                                            variant="contained" 
                                            size="small"
                                            sx={{ 
                                                mt: 2, 
                                                borderRadius: 3,
                                                bgcolor: 'white',
                                                color: '#667eea',
                                                fontWeight: 'bold',
                                                '&:hover': {
                                                    bgcolor: 'rgba(255,255,255,0.9)',
                                                },
                                            }}
                                        >
                                            🚀 Try Next Level
                                        </Button>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>

                        {/* 3. ADAPTIVE ROADMAP */}
                        <Grid size={{ xs: 12 }}>
                            <Paper sx={{ p: 3, borderRadius: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                                    <FlagIcon color="secondary" />
                                    <Typography variant="h6" fontWeight="bold">Adaptive Learning Path</Typography>
                                </Stack>

                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    Based on your time-series progress, here is your personalized curriculum:
                                </Typography>

                                <Stepper orientation="vertical">
                                    {profile.recommendedPath.map((step, index) => (
                                        <Step key={index} active={true}>
                                            <StepLabel
                                                StepIconComponent={() => (
                                                    <Box sx={{
                                                        width: 36, height: 36, borderRadius: '50%',
                                                        bgcolor: 'white', border: '2px solid',
                                                        borderColor: `${getTaskColor(step.category)}.main`,
                                                        color: `${getTaskColor(step.category)}.main`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        {getTaskIcon(step.category)}
                                                    </Box>
                                                )}
                                            >
                                                <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" gap={1}>
                                                    <Typography variant="subtitle1" fontWeight="bold">{step.title}</Typography>
                                                    <Chip label={step.category} size="small" color={getTaskColor(step.category) as any} variant="filled" />
                                                </Stack>
                                            </StepLabel>
                                            <StepContent>
                                                <Box sx={{ mb: 2, mt: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2, borderLeft: '3px solid', borderColor: `${getTaskColor(step.category)}.main` }}>
                                                    <Typography variant="body2" gutterBottom>{step.description}</Typography>
                                                    <Typography variant="caption" color="text.secondary">🎯 Analysis: {step.reason}</Typography>
                                                </Box>
                                            </StepContent>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Paper>
                        </Grid>

                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default AnalyticsTimeLine;
