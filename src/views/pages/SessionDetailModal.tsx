import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Tabs,
  Tab,
  Stack,
  Chip,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as AutoAwesomeIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  Assignment as AssignmentIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import { SessionWithDetail, SpeakerRole } from '../../types/PracticeSpeaking';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface Props {
  session: SessionWithDetail | null;
  onClose: () => void;
}

const ScoreBar: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  let color = '#ef4444';
  if (score >= 80) color = '#22c55e';
  else if (score >= 60) color = '#eab308';

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography variant="body2" fontWeight="medium">{label}</Typography>
        <Typography variant="body2" fontWeight="bold" sx={{ color }}>{score}/100</Typography>
      </Stack>
      <Box sx={{ width: '100%', height: 8, bgcolor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ width: `${score}%`, height: '100%', bgcolor: color }} />
      </Box>
    </Box>
  );
};

const SessionDetailModal: React.FC<Props> = ({ session, onClose }) => {
  const [tabIndex, setTabIndex] = useState(0);

  if (!session) return null;

  const report = session.report;

  // Mock data for Tab 3 (only used when BE chưa trả thật)
  const vocabSuggestions = report?.vocabularySuggestions ?? [
    {
      word: 'very good',
      context: 'You often used "very good" to describe things.',
      alternatives: ['excellent', 'fantastic', 'really good', 'great'],
    },
    {
      word: 'a lot of',
      context: 'You used "a lot of" many times when describing quantities.',
      alternatives: ['plenty of', 'a large number of', 'numerous'],
    },
  ];

  const grammarBreakdown = report?.grammarBreakdown ?? [
    {
      structure: 'Present Perfect',
      example: "I have visit Paris last year.",
      advice: 'Use past simple with finished time: "I visited Paris last year."',
      status: 'Needs Improvement' as const,
    },
    {
      structure: 'Linking Words',
      example: "I like traveling and I learn a lot.",
      advice: 'Try using connectors: "I like traveling because I can learn a lot."',
      status: 'Correct' as const,
    },
  ];

  // Luôn dùng dữ liệu thật từ report tổng hợp BE
  const fluency = report?.fluency ?? 0;
  const pronunciation = report?.pronunciation ?? 0;
  const intonation = report?.intonation ?? 0;
  const grammaticalAccuracy = report?.grammaticalAccuracy ?? 0;

  const paraphrasedLines = report?.paraphrasedLines ?? [];

  return (
    <Dialog
      open={!!session}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 3, height: '80vh' } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {session.config.scenario}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(session.date).toLocaleString()}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} variant="fullWidth">
          <Tab icon={<AutoAwesomeIcon />} iconPosition="start" label="Analysis Report" />
          <Tab icon={<AssignmentIcon />} iconPosition="start" label="Transcript" />
          <Tab icon={<MenuBookIcon />} iconPosition="start" label="Vocab & Grammar" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }} className="no-scrollbar">
        {tabIndex === 0 && (
          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Overall Assessment */}
              <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0} variant="outlined">
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <RecordVoiceOverIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Performance Assessment
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 3,
                  }}
                >
                  <ScoreBar label="Fluency" score={fluency} />
                  <ScoreBar label="Pronunciation" score={pronunciation} />
                  <ScoreBar label="Intonation" score={intonation} />
                  <ScoreBar label="Grammatical Accuracy" score={grammaticalAccuracy} />
                </Box>
                {report && (
                  <Stack direction="row" spacing={1.5} mt={2} flexWrap="wrap">
                    {typeof (report as any).averageScore === 'number' && (
                      <Chip
                        label={`Overall Score: ${(report as any).averageScore}/100`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    )}
                    {typeof (report as any).totalTurns === 'number' && (
                      <Chip
                        label={`Turns Scored: ${(report as any).totalTurns}`}
                        variant="outlined"
                        size="small"
                      />
                    )}
                    {typeof (report as any).totalMistakes === 'number' && (
                      <Chip
                        label={`Total Mistakes: ${(report as any).totalMistakes}`}
                        color={(report as any).totalMistakes > 0 ? 'error' : 'success'}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Stack>
                )}
                <Box mt={2} p={2} bgcolor="#f1f5f9" borderRadius={2}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontStyle="italic"
                  >
                    {report?.generalFeedback ||
                      'No overall summary available for this session.'}
                  </Typography>
                </Box>
              </Paper>

              {/* Natural Phrasing */}
              <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0} variant="outlined">
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <AutoAwesomeIcon sx={{ color: '#8b5cf6' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Natural Phrasing Suggestions
                  </Typography>
                </Stack>
                <Stack spacing={2}>
                  {paraphrasedLines.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No specific paraphrasing suggestions available for this session.
                    </Typography>
                  )}
                  {paraphrasedLines.map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        bgcolor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight="bold"
                        textTransform="uppercase"
                      >
                        You said:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#ef4444',
                          mb: 1,
                          textDecoration: 'line-through',
                        }}
                      >
                        {item.original}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight="bold"
                        textTransform="uppercase"
                      >
                        Native Speaker would say:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: '#10b981', fontWeight: 'bold', mb: 1 }}
                      >
                        {item.correction}
                      </Typography>

                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        sx={{ bgcolor: '#f0fdf4', p: 1, borderRadius: 1 }}
                      >
                         {item.explanation}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Box>
        )}

        {tabIndex === 1 && (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {session.messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  alignSelf:
                    msg.role === SpeakerRole.USER ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  {msg.role === SpeakerRole.USER ? 'You' : 'Partner'}
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor:
                      msg.role === SpeakerRole.USER ? 'primary.main' : 'white',
                    color:
                      msg.role === SpeakerRole.USER
                        ? 'primary.contrastText'
                        : 'text.primary',
                    border:
                      msg.role === SpeakerRole.BOT
                        ? '1px solid #e2e8f0'
                        : 'none',
                  }}
                >
                  <Typography variant="body1">{msg.text}</Typography>
                </Paper>
                {msg.feedback && msg.feedback.mistakes.length > 0 && (
                  <Box mt={0.5} textAlign="right">
                    <Chip
                      label={`${msg.feedback.mistakes.length} mistakes`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        {tabIndex === 2 && (
          <Box sx={{ p: 3 }}>
            {!report ? (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">Report unavailable.</Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {/* Vocabulary Section */}
                <Grid size={{ xs: 12, md: 6 }} >
                  <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }} elevation={0} variant="outlined">
                    <Typography variant="h6" fontWeight="bold" color="primary.main" mb={2}>
                      Vocabulary Builder
                    </Typography>
                    <Stack spacing={2}>
                      {vocabSuggestions.map((vocab, i) => (
                        <Box
                          key={i}
                          sx={{
                            p: 2,
                            bgcolor: '#f0f9ff',
                            borderRadius: 2,
                            border: '1px solid #bae6fd',
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {vocab.word}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary" mb={1}>
                            {vocab.context}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="caption" fontWeight="bold" color="text.secondary">
                            ALTERNATIVES:
                          </Typography>
                          <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
                            {vocab.alternatives.map((alt, j) => (
                              <Chip key={j} label={alt} size="small" color="primary" variant="filled" />
                            ))}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>

                {/* Grammar Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }} elevation={0} variant="outlined">
                    <Typography variant="h6" fontWeight="bold" color="secondary.main" mb={2}>
                      Grammar Structures
                    </Typography>
                    <Stack spacing={2}>
                      {grammarBreakdown.map((gram, i) => (
                        <Box
                          key={i}
                          sx={{
                            p: 2,
                            bgcolor: gram.status === 'Correct' ? '#f0fdf4' : '#fef2f2',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: gram.status === 'Correct' ? '#bbf7d0' : '#fecaca',
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="subtitle2" fontWeight="bold">
                              {gram.structure}
                            </Typography>
                            {gram.status === 'Correct' ? (
                              <CheckCircleIcon color="success" fontSize="small" />
                            ) : (
                              <CancelIcon color="error" fontSize="small" />
                            )}
                          </Stack>
                          <Typography variant="body2" sx={{ my: 1, fontStyle: 'italic' }}>
                            "{gram.example}"
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            💡 {gram.advice}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SessionDetailModal;