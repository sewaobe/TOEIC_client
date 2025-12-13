import {
    CardContent,
    Box,
    Avatar,
    Typography,
    Chip,
    Button,
    Card,
    Stack,
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FaceIcon from '@mui/icons-material/Face';
import { motion } from 'framer-motion';

const LiveCallCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
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
                // Updated Gradient: Removed pure white start. Using Rose 50 -> Rose 200.
                background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 50%, #FECDD3 100%)',
                border: '1px solid',
                borderColor: '#FDA4AF', // Rose 300
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: '0 25px 50px -12px rgba(244, 63, 94, 0.35)',
                    borderColor: '#FB7185', // Rose 400
                    transform: 'scale(1.01)'
                }
            }}
        >
            {/* Decorative Background Elements */}
            <Box sx={{ position: 'absolute', top: -30, right: -30, opacity: 0.08, transform: 'rotate(-10deg)' }}>
                <VideoCallIcon sx={{ fontSize: 190, color: '#881337' }} />
            </Box>

            {/* "Live" Pulse Effect */}
            <Box sx={{ position: 'absolute', top: 30, right: 30, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.9)', px: 1.5, py: 0.5, borderRadius: 10, border: '1px solid #fecdd3', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <Box sx={{ position: 'relative', width: 10, height: 10 }}>
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#e11d48', borderRadius: '50%' }} />
                    <motion.div
                        animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        style={{ position: 'absolute', inset: -2, backgroundColor: '#e11d48', borderRadius: '50%', opacity: 0.5 }}
                    />
                </Box>
                <Typography variant="caption" fontWeight="900" color="#e11d48" letterSpacing={1}>LIVE</Typography>
            </Box>

            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', height: '100%', position: 'relative', zIndex: 2 }}>
                <Box sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#e11d48', width: 48, height: 48, mb: 1.5, boxShadow: '0 6px 12px rgba(225, 29, 72, 0.3)' }}>
                        <FaceIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="overline" color="#e11d48" fontWeight="bold" letterSpacing={1.2}>
                        IMMERSIVE EXPERIENCE
                    </Typography>
                    <Typography variant="h5" fontWeight="900" sx={{ color: '#881337', mt: 1, mb: 0.5 }}>
                        Live Native Speaker
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#9f1239', maxWidth: '85%', lineHeight: 1.5, fontWeight: 500, fontSize: '0.95rem' }}>
                        Jump into a realistic video call with an native speaker. Improve fluency under pressure.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={0.8} mt={2.5} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                    <Chip label="Video Call" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)', color: '#9f1239', fontWeight: 'bold' }} />
                    <Chip label="Real-time" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)', color: '#9f1239', fontWeight: 'bold' }} />
                    <Chip label="Free Talk" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)', color: '#9f1239', fontWeight: 'bold' }} />
                </Stack>

                <Box mt="auto">
                    <Button
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            bgcolor: '#e11d48',
                            borderRadius: 3,
                            px: 2.5,
                            py: 1.2,
                            fontSize: '0.95rem',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            boxShadow: '0 8px 20px -4px rgba(225, 29, 72, 0.4)',
                            '&:hover': { bgcolor: '#be123c' }
                        }}
                    >
                        Call Now
                    </Button>
                </Box>
            </CardContent>
        </Card>
    </motion.div>
);

export default LiveCallCard;