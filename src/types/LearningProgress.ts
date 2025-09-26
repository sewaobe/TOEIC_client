export interface Session {
  start: string;
  end: string;
  activity: string;
  focus: number; // 0..10
  understanding: number; // 0..5
  correct: number;
  total: number;
}

export interface Topic {
  key: string;
  label: string;
  hours: number;
  score: number;
}

export interface Badge {
  icon: string;
  label: string;
}

export interface DayTask {
  id: number;
  text: string;
  impact: "H" | "M" | "L";
}
