
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
                            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                                    <TimelineIcon color="primary" />
                                    <Typography variant="h6" fontWeight="bold">Skill Progress Tracker</Typography>
                                </Stack>

                                <Grid container spacing={2}>
                                    {/* Fluency */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                                <SpeedIcon fontSize="small" color="primary" />
                                                <Typography variant="subtitle2" fontWeight="bold">Fluency</Typography>
                                            </Stack>
                                            <Box sx={{ height: 80 }}>
                                                <SimpleLineChart data={profile.progressTrends.fluency} color="#6366f1" />
                                            </Box>
                                        </Box>
                                    </Grid>
                                    {/* Grammar */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                                <GavelIcon fontSize="small" color="secondary" />
                                                <Typography variant="subtitle2" fontWeight="bold">Grammar</Typography>
                                            </Stack>
                                            <Box sx={{ height: 80 }}>
                                                <SimpleLineChart data={profile.progressTrends.grammar} color="#ec4899" />
                                            </Box>
                                        </Box>
                                    </Grid>
                                    {/* Lexical Range */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                                <MenuBookIcon fontSize="small" color="success" />
                                                <Typography variant="subtitle2" fontWeight="bold">Lexical Range</Typography>
                                            </Stack>
                                            <Box sx={{ height: 80 }}>
                                                <SimpleLineChart data={profile.progressTrends.lexical} color="#10b981" />
                                            </Box>
                                        </Box>
                                    </Grid>
                                    {/* Pronunciation */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                                <RecordVoiceOverIcon fontSize="small" color="warning" />
                                                <Typography variant="subtitle2" fontWeight="bold">Pronunciation</Typography>
                                            </Stack>
                                            <Box sx={{ height: 80 }}>
                                                <SimpleLineChart data={profile.progressTrends.pronunciation} color="#f59e0b" />
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 3 }} />

                                <Stack direction="row" spacing={4} flexWrap="wrap">
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption" display="block" color="text.secondary">STRONGEST SKILL</Typography>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <TrendingUpIcon color="success" fontSize="small" />
                                            <Typography fontWeight="bold">{profile.strongestSkill}</Typography>
                                        </Stack>
                                    </Box>
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption" display="block" color="text.secondary">NEEDS FOCUS</Typography>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <TrendingDownIcon color="error" fontSize="small" />
                                            <Typography fontWeight="bold">{profile.weakestSkill}</Typography>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>

                        {/* 2. READINESS SCORE */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper sx={{ p: 3, borderRadius: 3, height: '100%', bgcolor: 'primary.main', color: 'white' }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>Level Readiness</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                                        <CircularProgress
                                            variant="determinate"
                                            value={profile.readinessScore}
                                            size={140}
                                            thickness={4}
                                            sx={{ color: 'white' }}
                                        />
                                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography variant="h2" fontWeight="bold">{profile.readinessScore}%</Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body1" align="center" sx={{ opacity: 0.9, px: 2 }}>
                                        {profile.readinessMessage}
                                    </Typography>
                                    {profile.readinessScore >= 80 && (
                                        <Button variant="contained" color="secondary" sx={{ mt: 4, borderRadius: 4, width: '100%' }}>
                                            Try Next Level
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
