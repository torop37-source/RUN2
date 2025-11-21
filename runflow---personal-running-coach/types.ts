
export interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

export type SessionType = 'run' | 'rest' | 'interval' | 'long' | 'test' | 'recovery' | 'tempo';

export interface RunSession {
  id: string;
  day: string; // e.g., "LUN 5"
  date: string; // ISO string
  type: SessionType;
  title: string;
  description: string;
  details?: {
    warmup?: string;
    main?: string;
    cooldown?: string;
  };
  distance?: string;
  duration?: string;
  completed?: boolean;
  rpe?: number;
  feedback?: string;
}

export interface WeeklyPlan {
  weekNumber: number;
  dates: string; // e.g. "5 Sept - 11 Sept"
  sessions: RunSession[];
}

export interface ProgramData {
  goal: string;
  level: string;
  weeks: WeeklyPlan[];
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  date: string;
  type: string;
  distance: string;
  duration: string;
  speed: string;
}

export type ViewMode = 'week' | 'month';

export interface UserProfile {
  name: string;
  level: string;
  avatar: string;
}
