import React from 'react';
import { Box, Card, CardContent, Typography, Chip, Stack, Divider } from '@mui/material';
import { Lightbulb as LightbulbIcon } from '@mui/icons-material';
import { Feedback } from '../../../types/PracticeSpeaking';

interface Props {
    feedback: Feedback;
}

const ScoreRing: React.FC<{ score: number; label: string }> = ({ score, label }) => {
    const r = 18;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (score / 100) * circumference;

    let color = '#ef4444'; // Red
    if (score >= 80) color = '#22c55e'; // Green
    else if (score >= 60) color = '#eab308'; // Yellow

    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            <Box position="relative" width={48} height={48}>
                <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                    <circle cx="24" cy="24" r={r} stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
                    <circle
                        cx="24" cy="24" r={r}
                        stroke={color}
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>
                <Box position="absolute" top={0} left={0} bottom={0} right={0} display="flex" alignItems="center" justifyContent="center">
                    <Typography variant="caption" fontWeight="bold" color="text.primary">{score}</Typography>
                </Box>
            </Box>
            <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 'bold', color: 'text.secondary' }}>
                {label}
            </Typography>
        </Box>
    );
};

const FeedbackCard: React.FC<Props> = ({ feedback }) => {
    return (
        <Card variant="outlined" sx={{ mt: 1, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#fff', minWidth: { xs: '100%', sm: 400 } }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">Turn Analysis</Typography>
                    <Chip
                        label={`Overall: ${feedback.totalScore}`}
                        size="small"
                        color={feedback.totalScore >= 80 ? "success" : feedback.totalScore >= 60 ? "warning" : "error"}
                        sx={{ fontWeight: 'bold' }}
                    />
                </Stack>

                <Stack direction="row" justifyContent="space-between" mb={2}>
                    <ScoreRing score={feedback.pronunciationScore} label="Pronun." />
                    <ScoreRing score={feedback.fluencyScore} label="Fluency" />
                    <ScoreRing score={feedback.grammarScore} label="Grammar" />
                    <ScoreRing score={feedback.intonationScore} label="Inton." />
                </Stack>

                {feedback.mistakes.length > 0 && (
                    <Box mb={2}>
                        <Typography variant="caption" display="block" fontWeight="bold" color="error.main" mb={1} textTransform="uppercase">Mistakes</Typography>
                        <Stack spacing={1}>
                            {feedback.mistakes.map((m, idx) => (
                                <Box key={idx} sx={{ bgcolor: '#fef2f2', p: 1, borderRadius: 1, border: '1px solid #fecaca' }}>
                                    <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#991b1b' }}>{m.original}</Typography>
                                    <Typography variant="body2" fontWeight="bold" color="success.main">{m.correction}</Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">{m.explanation}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                )}

                <Divider sx={{ my: 1.5 }} />

                <Stack direction="row" alignItems="start" spacing={1}>
                    <LightbulbIcon fontSize="small" color="primary" sx={{ mt: 0.3 }} />
                    <Typography variant="body2" color="text.primary">
                        {feedback.improvementTip}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default FeedbackCard;