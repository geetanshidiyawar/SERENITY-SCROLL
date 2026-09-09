import { DayMoodData, LanguageOption, MoodOption, BackendInterventionResponse, LanguageKey, InterventionContent } from '../types';

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: 'english', label: 'English', nativeLabel: 'English' },
  { id: 'hindi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { id: 'hinglish', label: 'Hinglish', nativeLabel: 'Hinglish' },
  { id: 'tamil', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { id: 'punjabi', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
  { id: 'marathi', label: 'Marathi', nativeLabel: 'मराठी' },
];

export const ENGLISH_INTERVENTION_CONTENT: InterventionContent = {
  title: "A Moment to Pause and Breathe",
  message: "You've taken in a lot today. It's okay to step away for a moment and let your mind settle.",
  activity: "Take a slow breath and look away from the screen for a minute.",
  duration_seconds: 120,
};

export const DEMO_QUOTES: string[] = [
  "Sometimes, a pause is all you need to reset your mind.",
  "You don't have to carry everything at once.",
  "Take a breath. You are allowed to slow down.",
  "Not every thought needs your attention.",
  "In the quiet space between thoughts, peace returns naturally.",
];

// Visible intervention content ALWAYS remains English.
// Only the audio generated and audio_url reflect the selected language.
export const DEMO_INTERVENTIONS: Record<LanguageKey, BackendInterventionResponse> = {
  english: {
    trigger: true,
    quote: "Sometimes, a pause is all you need to reset your mind.",
    intervention: ENGLISH_INTERVENTION_CONTENT,
    audio_url: "http://localhost:8000/audio/serenity_english_demo.mp3",
  },
  hindi: {
    trigger: true,
    quote: "Sometimes, a pause is all you need to reset your mind.",
    intervention: ENGLISH_INTERVENTION_CONTENT,
    audio_url: "http://localhost:8000/audio/serenity_hindi_demo.mp3",
  },
  hinglish: {
    trigger: true,
    quote: "Sometimes, a pause is all you need to reset your mind.",
    intervention: ENGLISH_INTERVENTION_CONTENT,
    audio_url: "http://localhost:8000/audio/serenity_hinglish_demo.mp3",
  },
  tamil: {
    trigger: true,
    quote: "Sometimes, a pause is all you need to reset your mind.",
    intervention: ENGLISH_INTERVENTION_CONTENT,
    audio_url: "http://localhost:8000/audio/serenity_tamil_demo.mp3",
  },
  punjabi: {
    trigger: true,
    quote: "Sometimes, a pause is all you need to reset your mind.",
    intervention: ENGLISH_INTERVENTION_CONTENT,
    audio_url: "http://localhost:8000/audio/serenity_punjabi_demo.mp3",
  },
  marathi: {
    trigger: true,
    quote: "Sometimes, a pause is all you need to reset your mind.",
    intervention: ENGLISH_INTERVENTION_CONTENT,
    audio_url: "http://localhost:8000/audio/serenity_marathi_demo.mp3",
  },
};

export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: '#E4A853' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: '#5B8C71' },
  { id: 'good', emoji: '🙂', label: 'Good', color: '#6B9E78' },
  { id: 'neutral', emoji: '😐', label: 'Neutral', color: '#88988E' },
  { id: 'sad', emoji: '😔', label: 'Sad', color: '#6A8CA6' },
  { id: 'anxious', emoji: '😟', label: 'Anxious', color: '#A88274' },
  { id: 'angry', emoji: '😠', label: 'Angry', color: '#B86F63' },
  { id: 'tired', emoji: '😴', label: 'Tired', color: '#8A8499' },
  { id: 'overwhelmed', emoji: '😵', label: 'Overwhelmed', color: '#A06E88' },
];

/**
 * Dynamically generates rolling 7-day mood history based on the actual current date
 * (Today and the previous 6 days) using JavaScript Date handling.
 */
export function getRolling7DayMood(): DayMoodData[] {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Base scores and archetypes for the 7 chronological days
  const baseArchetypes = [
    { score: 3.8, moodEmoji: '🙂', moodLabel: 'Good' },
    { score: 3.2, moodEmoji: '😐', moodLabel: 'Neutral' },
    { score: 2.6, moodEmoji: '😴', moodLabel: 'Tired' },
    { score: 4.4, moodEmoji: '😌', moodLabel: 'Calm' },
    { score: 4.8, moodEmoji: '😊', moodLabel: 'Happy' },
    { score: 4.1, moodEmoji: '😌', moodLabel: 'Calm' },
    { score: 4.5, moodEmoji: '😌', moodLabel: 'Calm' }, // Today
  ];

  const result: DayMoodData[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayOfWeek = d.getDay();
    const isToday = i === 0;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayOfMonth}`;

    const archetype = baseArchetypes[6 - i];

    result.push({
      date: dateStr,
      day: isToday ? `${dayNames[dayOfWeek]} (Today)` : dayNames[dayOfWeek],
      shortDay: shortDayNames[dayOfWeek],
      formattedDate: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      score: archetype.score,
      moodEmoji: archetype.moodEmoji,
      moodLabel: archetype.moodLabel,
    });
  }

  return result;
}

export const INITIAL_7_DAY_MOOD: DayMoodData[] = getRolling7DayMood();
