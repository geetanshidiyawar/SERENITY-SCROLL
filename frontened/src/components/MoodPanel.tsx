import React, { useState } from 'react';
import { MOOD_OPTIONS, INITIAL_7_DAY_MOOD } from '../data/demoData';
import { MoodChart } from './MoodChart';
import { MoodType, DayMoodData } from '../types';
import { Check, Heart } from 'lucide-react';

interface MoodPanelProps {
  onClose?: () => void;
}

export const MoodPanel: React.FC<MoodPanelProps> = ({ onClose }) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>('calm');
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<DayMoodData[]>(INITIAL_7_DAY_MOOD);

  const handleSelectMood = (moodId: MoodType) => {
    setSelectedMood(moodId);
    setConfirmationMessage('Thanks for checking in.');

    // Update today's entry on the 7-day chart
    const chosen = MOOD_OPTIONS.find((m) => m.id === moodId);
    if (chosen) {
      const scoreMap: Record<MoodType, number> = {
        happy: 5,
        calm: 4.8,
        good: 4.2,
        neutral: 3.0,
        sad: 2.2,
        anxious: 2.0,
        angry: 1.8,
        tired: 2.4,
        overwhelmed: 1.5,
      };

      setHistoryData((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        updated[lastIdx] = {
          ...updated[lastIdx],
          moodEmoji: chosen.emoji,
          moodLabel: chosen.label,
          score: scoreMap[moodId] || 3.5,
        };
        return updated;
      });
    }

    // Gentle fade of confirmation notice after 3.5 seconds
    setTimeout(() => {
      setConfirmationMessage(null);
    }, 3500);
  };

  return (
    <div
      id="serenity-mood-panel"
      className="w-full max-w-2xl mx-auto my-4 p-6 sm:p-8 rounded-3xl serenity-card transition-all duration-300"
    >
      <div className="flex items-center justify-between border-b border-[#E1EAE3] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl sm:text-3xl" role="img" aria-label="Mood face">🙂</span>
          <div>
            <h2 className="text-xl sm:text-2xl font-editorial font-medium text-[#223327]">
              How are you feeling right now?
            </h2>
            <p className="text-xs text-[#5D7063]">
              A moment to acknowledge your emotions without judgment
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-[#5B7163] hover:text-[#233529] py-1.5 px-3.5 rounded-full hover:bg-white/60 border border-[#DCE4DF] transition-colors whitespace-nowrap"
          >
            ← Back to Serenity
          </button>
        )}
      </div>

      {/* Mood Selector Grid: all requested 9 choices */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5 sm:gap-3.5 my-4">
        {MOOD_OPTIONS.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              id={`mood-option-${mood.id}`}
              onClick={() => handleSelectMood(mood.id)}
              aria-pressed={isSelected}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E6B56] ${
                isSelected
                  ? 'bg-[#3A5241] border-[#3A5241] text-white shadow-sm scale-102'
                  : 'bg-white/80 border-[#DBE4DD] text-[#2F4235] hover:bg-white hover:border-[#BED0C4] hover:shadow-2xs'
              }`}
            >
              <span className="text-2xl sm:text-3xl mb-1.5 transform group-hover:scale-110 transition-transform">
                {mood.emoji}
              </span>
              <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-white' : 'text-[#2D3E33]'}`}>
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Small Confirmation Message */}
      {confirmationMessage && (
        <div
          id="mood-confirmation-toast"
          role="status"
          aria-live="polite"
          className="my-4 p-3 rounded-2xl bg-[#EAF2EC] border border-[#D0E2D5] text-[#294634] text-xs sm:text-sm font-medium flex items-center justify-center gap-2 animate-fadeIn"
        >
          <Check className="w-4 h-4 text-[#3F6A4E]" />
          <span>{confirmationMessage}</span>
          <span className="text-xs text-[#527560] font-normal">• Take this breath with you.</span>
        </div>
      )}

      {/* 7-Day Mood Graph */}
      <MoodChart data={historyData} />
    </div>
  );
};
