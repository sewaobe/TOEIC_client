export interface Session {
  start: string;
  end: string;
  activity: string;
  focus: number; // 0..10
  understanding: number; // 0..5
  correct: number;
  total: number;
}

// Backend structure from API
export interface SessionItem {
  kind: string;
  activity_id?: string;
  status: string;
  completed: boolean;
}

export interface SessionDetail {
  session_no: number;
  status: string;
  part_type?: number | null;
  items: SessionItem[];
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
