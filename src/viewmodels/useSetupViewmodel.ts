import { useState } from 'react';
import { UserConfig } from '../types/PracticeSpeaking';
import { BOT_TONES, GOALS, LEVELS, SCENARIOS } from '../constants/PracticeSpeaking';

export const useSetupViewModel = (onStart: (config: UserConfig) => void) => {
    const [config, setConfig] = useState<UserConfig>({
        scenario: SCENARIOS[0],
        level: LEVELS[1],
        userRole: 'Customer',
        botTone: BOT_TONES[0],
        goal: GOALS[0],
        durationMinutes: 10,
        botSpeed: 'normal'
    });

    const [isCustomScenario, setIsCustomScenario] = useState(false);

    const updateConfig = (field: keyof UserConfig, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleScenarioChange = (value: string) => {
        if (value === "Other") {
            setIsCustomScenario(true);
            updateConfig('scenario', '');
        } else {
            setIsCustomScenario(false);
            updateConfig('scenario', value);
        }
    };

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (config.scenario.trim().length === 0) return;
        onStart(config);
    };

    return {
        config,
        isCustomScenario,
        updateConfig,
        handleScenarioChange,
        submitForm
    };
};