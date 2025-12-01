import React from 'react';
import {
    Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select,
    TextField, Typography, Slider, Stack, Container, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { PlayArrow as PlayArrowIcon, SettingsVoice as SettingsVoiceIcon } from '@mui/icons-material';
import { UserConfig } from '../../types/PracticeSpeaking';
import { useSetupViewModel } from '../../viewmodels/useSetupViewmodel';
import { BOT_TONES, LEVELS, SCENARIOS } from '../../constants/PracticeSpeaking';

interface Props {
    onStart: (config: UserConfig) => void;
}

const SetupPracticeSpeakingPage: React.FC<Props> = ({ onStart }) => {
    const { config, isCustomScenario, updateConfig, handleScenarioChange, submitForm } = useSetupViewModel(onStart);

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #FDF2F8 100%)',
            py: 4,
            display: 'flex',
            alignItems: 'center'
        }}>
            <Container maxWidth="md">
                <Card sx={{ borderRadius: 4, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}>
                    <Box sx={{ bgcolor: 'primary.main', p: 4, color: 'white', textAlign: 'center' }}>
                        <SettingsVoiceIcon sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
                        <Typography variant="h4" fontWeight="bold">Role-Play Practice</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.8 }}>Setup your conversational partner</Typography>
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                        <form onSubmit={submitForm}>
                            <Stack spacing={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Scenario</InputLabel>
                                    <Select
                                        value={isCustomScenario ? "Other" : config.scenario}
                                        label="Scenario"
                                        onChange={(e) => handleScenarioChange(e.target.value as string)}
                                    >
                                        {SCENARIOS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                        <MenuItem value="Other">Custom Scenario...</MenuItem>
                                    </Select>
                                </FormControl>

                                {isCustomScenario && (
                                    <TextField
                                        fullWidth
                                        label="Describe your custom scenario"
                                        variant="outlined"
                                        value={config.scenario}
                                        onChange={(e) => updateConfig('scenario', e.target.value)}
                                        required
                                        autoFocus
                                    />
                                )}

                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                                    <TextField
                                        fullWidth
                                        label="Your Role"
                                        value={config.userRole}
                                        onChange={(e) => updateConfig('userRole', e.target.value)}
                                        helperText="e.g. Customer, Patient, Interviewee"
                                    />

                                    <FormControl fullWidth>
                                        <InputLabel>Difficulty</InputLabel>
                                        <Select
                                            value={config.level}
                                            label="Difficulty"
                                            onChange={(e) => updateConfig('level', e.target.value)}
                                        >
                                            {LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Stack>

                                <FormControl fullWidth>
                                    <InputLabel>Partner Tone</InputLabel>
                                    <Select
                                        value={config.botTone}
                                        label="Partner Tone"
                                        onChange={(e) => updateConfig('botTone', e.target.value)}
                                    >
                                        {BOT_TONES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                    </Select>
                                </FormControl>

                                <Box sx={{ px: 1 }}>
                                    <Typography gutterBottom variant="body2" color="text.secondary">
                                        Session Duration: <strong>{config.durationMinutes} minutes</strong>
                                    </Typography>
                                    <Slider
                                        value={config.durationMinutes}
                                        onChange={(_, val) => updateConfig('durationMinutes', val)}
                                        step={5}
                                        marks
                                        min={5}
                                        max={30}
                                        valueLabelDisplay="auto"
                                    />
                                </Box>

                                <Box>
                                    <Typography gutterBottom variant="body2" color="text.secondary">
                                        Partner Speed
                                    </Typography>
                                    <ToggleButtonGroup
                                        color="primary"
                                        value={config.botSpeed}
                                        exclusive
                                        onChange={(_, val) => { if (val !== null) updateConfig('botSpeed', val); }}
                                        fullWidth
                                    >
                                        <ToggleButton value="slow" sx={{ '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } } }}>Slow</ToggleButton>
                                        <ToggleButton value="normal" sx={{ '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } } }}>Normal</ToggleButton>
                                        <ToggleButton value="fast" sx={{ '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } } }}>Fast</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={<PlayArrowIcon />}
                                    sx={{ py: 1.5, fontSize: '1.1rem', borderRadius: 2, boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' }}
                                >
                                    Start Conversation
                                </Button>
                            </Stack>
                        </form>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default SetupPracticeSpeakingPage;