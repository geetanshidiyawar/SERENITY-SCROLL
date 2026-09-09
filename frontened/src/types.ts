export type LanguageKey = 'english' | 'hindi' | 'hinglish' | 'tamil' | 'punjabi' | 'marathi';

export interface LanguageOption {
  id: LanguageKey;
  label: string;
  nativeLabel: string;
}

export interface InterventionContent {
  title: string;
  message: string;
  activity: string;
  duration_seconds: number;
}

export interface BackendInterventionResponse {
  trigger: boolean;
  intervention: InterventionContent;
  audio_url: string;
  quote?: string;
}

export interface BackendRequestPayload {
  page: {
    url: string;
    title: string;
    text: string;
    time_spent_seconds: number;
  };
  emotion: {
    dominant_emotion: string;
    negative_score: number;
    content_type: string;
    content_text: string;
  };
  language: LanguageKey;
}

export type MoodType =
  | 'happy'
  | 'calm'
  | 'good'
  | 'neutral'
  | 'sad'
  | 'anxious'
  | 'angry'
  | 'tired'
  | 'overwhelmed';

export interface MoodOption {
  id: MoodType;
  emoji: string;
  label: string;
  color: string;
}

export interface DayMoodData {
  date: string; // e.g. "2026-09-09"
  day: string; // e.g. "Wednesday"
  shortDay: string; // e.g. "Wed"
  formattedDate: string; // e.g. "Sep 9"
  score: number; // 1 to 5 scale for calm curve
  moodEmoji: string;
  moodLabel: string;
}

export type ActiveTab = 'home' | 'mood' | 'water' | 'helpline';
