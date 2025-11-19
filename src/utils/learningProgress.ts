import { Session, SessionDetail } from "../types/LearningProgress";

export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const hmToMinutes = (hhmm: string): number => {
  if (!hhmm || typeof hhmm !== 'string') return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const durationMin = (s: Session | any): number => {
  // Check if this is a mock Session with start/end times
  if (s && s.start && s.end && typeof s.start === 'string' && typeof s.end === 'string') {
    return Math.max(1, hmToMinutes(s.end) - hmToMinutes(s.start));
  }
  // For backend SessionDetail objects or missing fields, estimate 30 minutes per session
  return 30;
};

/**
 * Transform backend SessionDetail[] to frontend Session[] format
 * Generates realistic time slots and session labels
 */
export const transformBackendSessions = (backendSessions: SessionDetail[] | any[]): Session[] => {
  if (!backendSessions || backendSessions.length === 0) {
    return [];
  }

  return (backendSessions || []).map((session, index) => {
    // Generate realistic time slots (start from 06:00)
    const sessionDurationMinutes = 30;
    const totalMinutes = index * sessionDurationMinutes;
    const startHour = 6 + Math.floor(totalMinutes / 60);
    const startMin = totalMinutes % 60;
    
    const startTime = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
    
    const endTotalMinutes = totalMinutes + sessionDurationMinutes;
    const endHour = 6 + Math.floor(endTotalMinutes / 60);
    const endMin = endTotalMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
    
    // Get activity label from items or session structure
    const activityLabel = getActivityLabel(session);
    
    return {
      start: startTime,
      end: endTime,
      activity: activityLabel,
      focus: 7,              // Default values until backend provides real data
      understanding: 4,
      correct: 0,
      total: 0,
    };
  });
};

/**
 * Generate human-readable activity label from backend session structure
 */
export const getActivityLabel = (session: SessionDetail | any): string => {
  if (!session) return 'Session';
  
  // Try to get from items array
  if (session.items && session.items.length > 0) {
    const kinds = session.items.map((item: any) => item.kind);
    const uniqueKinds = [...new Set(kinds)];
    
    // Map activity kind to display label
    const kindLabels: Record<string, string> = {
      'QUIZ': 'Bài quiz',
      'DICTATION': 'Dictation',
      'SHADOWING': 'Shadowing',
      'FLASH_CARD': 'Flashcards',
      'LESSON': 'Bài học',
      'MINI_TEST': 'Mini test',
    };
    
    return uniqueKinds.map((k: any) => kindLabels[k as string] || k).join(' + ');
  }
  
  // Fallback to part type
  if (session.part_type) {
    const partLabels: Record<number, string> = {
      1: 'Part 1',
      2: 'Part 2',
      3: 'Part 3',
      4: 'Part 4',
      5: 'Part 5',
      6: 'Part 6',
      7: 'Part 7',
    };
    return partLabels[session.part_type] || 'Session';
  }
  
  return `Session ${session.session_no || ''}`.trim();
};

export const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

export const generateColors = (count: number) =>
  Array.from({ length: count }, (_, i) => `hsl(${(i * 360) / Math.max(count, 1)}, 70%, 50%)`);

export function computePercent(totalWeeks: number, daysPerWeek: number, week: number, day: number) {
  const TW = Math.max(1, Math.floor(totalWeeks));
  const DPW = Math.max(1, Math.floor(daysPerWeek));
  const w = clamp(Math.floor(week), 1, TW);
  const d = clamp(Math.floor(day), 1, DPW);
  const totalDays = TW * DPW;
  const completedDays = (w - 1) * DPW + (d - 1);
  return Math.round((completedDays / totalDays) * 100);
}

export function computeDailyEfficiency(sessions: Session[]) {
  if (!sessions.length) return 0;
  const focusAvg = sessions.reduce((a, s) => a + s.focus, 0) / sessions.length;
  const understandingAvg = sessions.reduce((a, s) => a + s.understanding, 0) / sessions.length;
  const taskRate = 0.8; // giả định 80% task done
  return Math.round(50 * (focusAvg / 10) + 30 * (understandingAvg / 5) + 20 * taskRate);
}
