import { useEffect, useState } from 'react';
import { SessionResult, Feedback, SpeakerRole } from '../types/PracticeSpeaking';
import { speakingService } from '../services/speaking.service';

const PAGE_SIZE = 5;

interface ChatMessageFromApi {
  _id: string;
  sender: 'user' | 'bot';
  text: string;
  created_at: string;
  meta?: {
    pronunciation_feedback?: Feedback;
  };
}

interface ChatSessionFromApi {
  _id: string;
  title: string;
  type: string;
  created_at: string;
  updated_at: string;
  config?: any;
}

export const useSpeakingHistoryViewModel = () => {
  const [results, setResults] = useState<SessionResult[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = async (pageToLoad: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { items, total } = await speakingService.getSessions(pageToLoad, PAGE_SIZE);

      // Với mỗi session, lấy messages để tính score/mistakes
      const sessionResults: SessionResult[] = [];

      for (const rawSession of items as ChatSessionFromApi[]) {
        const messages = await speakingService.getSessionMessages(rawSession._id) as ChatMessageFromApi[];

        const userMessages = messages.filter(m => m.sender === SpeakerRole.USER && m.meta?.pronunciation_feedback);

        const avgScore =
          userMessages.reduce((acc, m) => acc + (m.meta?.pronunciation_feedback?.totalScore || 0), 0) /
          (userMessages.length || 1);

        const totalMistakes = userMessages.reduce(
          (acc, m) => acc + (m.meta?.pronunciation_feedback?.mistakes.length || 0),
          0
        );

        const config = rawSession.config || {};

        sessionResults.push({
          date: rawSession.updated_at || rawSession.created_at,
          config,
          averageScore: Math.round(avgScore),
          messageCount: messages.length,
          mistakeCount: totalMistakes,
        });
      }

      setResults(sessionResults);
      setPage(pageToLoad);
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    } catch (e) {
      console.error('Failed to load speaking history', e);
      setError('Failed to load history. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (nextPage: number) => {
    fetchPage(nextPage);
  };

  // Pagination on already-fetched page results (server-side pagination already applied)
  const displayedResults = results;

  return {
    results,
    displayedResults,
    page,
    totalPages,
    setPage: handlePageChange,
    isLoading,
    error,
  };
};
