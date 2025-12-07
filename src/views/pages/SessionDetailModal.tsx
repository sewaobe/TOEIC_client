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
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as AutoAwesomeIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { SessionWithDetail, SpeakerRole } from '../../types/PracticeSpeaking';

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
  const userMessages = session.messages.filter(m => m.role === SpeakerRole.USER && m.feedback);

  // Luôn dùng dữ liệu thật từ report tổng hợp BE
  const fluency = report?.fluency ?? 0;
  const coherence = report?.coherence ?? 0;
  const lexicalRange = report?.lexicalRange ?? 0;
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
                  <ScoreBar label="Coherence" score={coherence} />
                  <ScoreBar label="Lexical Range (Vocabulary)" score={lexicalRange} />
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
      </DialogContent>
    </Dialog>
  );
};

export default SessionDetailModal;
