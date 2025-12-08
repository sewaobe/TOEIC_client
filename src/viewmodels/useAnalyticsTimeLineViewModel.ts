
import { useState, useEffect } from 'react';
import { LearningProfile, SessionResult } from '../types/PracticeSpeaking';
import { speakingService } from '../services/speaking.service';

export const useAnalyticsTimeLineViewModel = () => {
    const [profile, setProfile] = useState<LearningProfile | null>(null);
    const [history, setHistory] = useState<SessionResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                // 1) Load history from BE (first page, large limit to cover most sessions)
                const res = await speakingService.getSessions(1, 100);
                const items = (res.items || []) as (SessionResult & { _id?: string })[];
                setHistory(items);

                // 2) MOCK analytics với dữ liệu cố định 10 điểm để dễ quan sát lên/xuống
                const sessionCount = 10;
                const baseDates = items.length
                    ? [...items]
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .slice(0, sessionCount)
                    : [];

                const makeTrend = (scores: number[]) =>
                    scores.map((score, idx) => ({
                        sessionIndex: idx + 1,
                        score,
                        date: baseDates[idx]?.date ?? new Date().toISOString(),
                    }));

                const fluencyTrend = makeTrend([60, 65, 63, 70, 68, 75, 73, 78, 80, 82]);
                const grammarTrend = makeTrend([55, 58, 56, 60, 62, 61, 64, 66, 65, 68]);
                const lexicalTrend = makeTrend([50, 55, 57, 60, 63, 67, 70, 72, 74, 76]);
                const pronunciationTrend = makeTrend([45, 50, 52, 55, 58, 60, 63, 65, 67, 70]);

                const overallTrend = makeTrend([
                    53,
                    57,
                    57,
                    61,
                    63,
                    66,
                    68,
                    71,
                    72,
                    74,
                ]);

                const avgFluency = fluencyTrend.reduce((acc, p) => acc + p.score, 0) / fluencyTrend.length;
                const avgGrammar = grammarTrend.reduce((acc, p) => acc + p.score, 0) / grammarTrend.length;
                const avgLexical = lexicalTrend.reduce((acc, p) => acc + p.score, 0) / lexicalTrend.length;
                const avgPronunciation =
                    pronunciationTrend.reduce((acc, p) => acc + p.score, 0) / pronunciationTrend.length;
                const overallAvg = overallTrend.reduce((acc, p) => acc + p.score, 0) / overallTrend.length;

                const mockProfile: LearningProfile = {
                    skillMastery: {
                        fluency: Math.round(avgFluency),
                        grammar: Math.round(avgGrammar),
                        vocabulary: Math.round(avgLexical),
                        pronunciation: Math.round(avgPronunciation),
                    },
                    progressTrends: {
                        overall: overallTrend,
                        fluency: fluencyTrend,
                        grammar: grammarTrend,
                        lexical: lexicalTrend,
                        pronunciation: pronunciationTrend,
                    },
                    weakestSkill: avgGrammar <= avgLexical && avgGrammar <= avgPronunciation ? 'grammar' : 'pronunciation',
                    strongestSkill: avgFluency >= avgLexical && avgFluency >= avgPronunciation ? 'fluency' : 'lexical',
                    readinessScore: Math.round(overallAvg),
                    readinessMessage:
                        overallAvg >= 80
                            ? 'You are ready for advanced speaking tasks.'
                            : overallAvg >= 60
                            ? 'Solid foundation. Keep practicing to reach advanced level.'
                            : 'Focus on building core fluency and accuracy.',
                    recommendedPath: [
                        {
                            title: 'Grammar Accuracy Booster',
                            description:
                                'Short drills focusing on tenses and subject-verb agreement based on your recent sessions.',
                            category: 'Foundation',
                            reason: 'Grammar is currently your weakest skill in the profile.',
                        },
                        {
                            title: 'Fluency Warm-up Routine',
                            description:
                                'Timed speaking prompts to improve speed and reduce hesitation.',
                            category: 'Spaced Repetition',
                            reason: 'Maintain your strong fluency with regular warm-ups.',
                        },
                    ],
                };

                setProfile(mockProfile);
            } catch (e) {
                console.error(e);
                setError("Failed to generate analytics. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return {
        profile,
        history,
        isLoading,
        error,
    };
};
