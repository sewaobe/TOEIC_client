import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';
import {
    Stack,
    Card,
    CardContent,
    Box,
    Avatar,
    Typography,
    Paper,
    Chip,
    Button,
} from '@mui/material';

const RolePlayCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -8 }}
    >
        <Card
            onClick={onClick}
            elevation={0}
            sx={{
                height: '100%',
                minHeight: 320,
                cursor: 'pointer',
                borderRadius: 5,
                position: 'relative',
                overflow: 'hidden',
                // Updated Gradient: Removed pure white start. Using Indigo 50 -> Indigo 200 for a richer, solid feel.
                background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%)',
                border: '1px solid',
                borderColor: '#A5B4FC', // Stronger border (Indigo 300)
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.35)',
                    borderColor: '#818CF8', // Indigo 400
                    transform: 'scale(1.01)'
                }
            }}
        >
            {/* Decorative Background Elements */}
            <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.08, transform: 'rotate(15deg)' }}>
                <SettingsVoiceIcon sx={{ fontSize: 160, color: '#312E81' }} />
            </Box>
            <Box sx={{ position: 'absolute', bottom: 40, right: 20, opacity: 0.9 }}>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                    <Paper elevation={3} sx={{ p: 1.2, borderRadius: '18px 18px 0 18px', bgcolor: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <ChatBubbleIcon fontSize="small" />
                        <Typography variant="caption" fontWeight="bold">Hello!</Typography>
                    </Paper>
                </motion.div>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 1.5 }}>
                    <Paper elevation={3} sx={{ mt: 1, p: 1.2, borderRadius: '18px 18px 18px 0', bgcolor: 'white', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography variant="caption" fontWeight="bold">How are you?</Typography>
                    </Paper>
                </motion.div>
            </Box>

            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', height: '100%', position: 'relative', zIndex: 2 }}>
                <Box sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#4f46e5', width: 48, height: 48, mb: 1.5, boxShadow: '0 6px 12px rgba(79, 70, 229, 0.25)' }}>
                        <RecordVoiceOverIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="overline" color="primary" fontWeight="bold" letterSpacing={1.2}>
                        STRUCTURED LEARNING
                    </Typography>
                    <Typography variant="h5" fontWeight="900" sx={{ color: '#1e1b4b', mt: 1, mb: 0.5 }}>
                        Role-Play Scenarios
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#312e81', maxWidth: '80%', lineHeight: 1.5, fontWeight: 500, fontSize: '0.95rem' }}>
                        Master specific situations like interviews, ordering coffee, or negotiations with AI feedback.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={0.8} mt={2.5} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                    <Chip label="Grammar Check" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)', color: '#3730a3', fontWeight: 'bold' }} />
                    <Chip label="Pronunciation" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)', color: '#3730a3', fontWeight: 'bold' }} />
                    <Chip label="Instant Feedback" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)', color: '#3730a3', fontWeight: 'bold' }} />
                </Stack>

                <Box mt="auto">
                    <Button
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            bgcolor: '#4f46e5',
                            borderRadius: 3,
                            px: 2.5,
                            py: 1.2,
                            fontSize: '0.95rem',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.4)',
                            '&:hover': { bgcolor: '#4338ca' }
                        }}
                    >
                        Start Practice
                    </Button>
                </Box>
            </CardContent>
        </Card>
    </motion.div>
);

export default RolePlayCard;