import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import type { InterventionContent, LanguageKey } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { AudioPlayer } from './AudioPlayer';

interface InterventionCardProps {
  intervention: InterventionContent;
  audioUrl?: string;
  selectedLanguage: LanguageKey | null;
  onSelectLanguage: (lang: LanguageKey) => void;
  isLoading?: boolean;
}

export const InterventionCard: React.FC<InterventionCardProps> = ({
  intervention,
  audioUrl,
  selectedLanguage,
  onSelectLanguage,
  isLoading = false,
}) => {
  const [showBreathingGuide, setShowBreathingGuide] = useState<boolean>(false);

  // Gentle interactive breath pacing toggle
  const toggleBreathing = () => {
    setShowBreathingGuide((prev) => !prev);
  };

  const isAudioLocked = !selectedLanguage;

  return (
    <div
      id="serenity-intervention-card"
      className="w-full max-w-2xl mx-auto my-4 p-6 sm:p-9 rounded-3xl serenity-card transition-all duration-500 relative overflow-hidden shadow-xl"
    >
      {/* Decorative calm background glow */}
      <div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#E5EFE7]/70 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-7 text-center">
        {/* 1. Header: MINDFUL PAUSE & Title - ALWAYS IN ENGLISH */}
        <div className="flex flex-col items-center justify-center space-y-2 pb-2">
          <span className="text-xs sm:text-sm font-bold text-[#4E6B56] uppercase tracking-[0.25em] font-sans">
            MINDFUL PAUSE
          </span>
          <h2 className="text-2xl sm:text-3xl font-editorial font-medium text-[#223528] tracking-tight">
            {intervention.title}
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F1EB] text-[#364E3E] border border-[#D3E2D6] text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-[#4E6B56]" />
            <span>{Math.round(intervention.duration_seconds / 60)} minute reset</span>
          </div>
        </div>

        {/* 2. Calming English Message - ALWAYS IN ENGLISH */}
        <div className="max-w-lg mx-auto">
          <p className="text-base sm:text-lg text-[#2D3E33] leading-relaxed font-light italic">
            "{intervention.message}"
          </p>
        </div>

        {/* 3. Suggested Activity Box: 🌬 TRY THIS: - ALWAYS IN ENGLISH */}
        <div className="max-w-md mx-auto bg-[#F2F7F4]/95 backdrop-blur-sm rounded-2xl p-5 border border-[#D5E2D8] flex flex-col gap-3 shadow-2xs text-left">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl leading-none select-none mt-0.5" role="img" aria-label="Wind breath">
              🌬
            </span>
            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#46634E] block">
                TRY THIS:
              </span>
              <p className="text-sm sm:text-base text-[#2A3C30] font-normal leading-relaxed">
                {intervention.activity}
              </p>
            </div>
          </div>

          {/* Interactive breath circle expander */}
          <div className="pt-2 border-t border-[#DFEAE2] flex items-center justify-between">
            <button
              onClick={toggleBreathing}
              className="text-xs text-[#486650] hover:text-[#213327] font-medium inline-flex items-center gap-1.5 transition-colors focus:outline-none"
            >
              <span>{showBreathingGuide ? 'Hide breathing circle' : 'Open breathing pacer'}</span>
              <span className="text-sm">{showBreathingGuide ? '▴' : '▾'}</span>
            </button>
            <span className="text-[11px] text-[#718579]">
              Gentle mindful guidance
            </span>
          </div>

          {showBreathingGuide && (
            <div className="flex flex-col items-center justify-center py-5 space-y-3">
              <div className="relative flex items-center justify-center w-28 h-28">
                <div className="absolute inset-0 rounded-full bg-[#DFEDE3] animate-serene-breathe" />
                <div className="relative z-10 text-center">
                  <span className="text-xs font-semibold text-[#2D4434] tracking-wide block">
                    Breathe
                  </span>
                  <span className="text-[10px] text-[#556F5D]">4s In • 4s Out</span>
                </div>
              </div>
              <p className="text-xs text-[#5C7063] italic text-center max-w-xs">
                Inhale quietly through your nose, and exhale gently through your mouth.
              </p>
            </div>
          )}
        </div>

        {/* 4. Language Selection Section - APPEARS AFTER THE MINDFUL PAUSE CONTENT */}
        <div className="pt-4 border-t border-[#E3EBE5]">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onSelectLanguage={onSelectLanguage}
            isLoading={isLoading}
          />
        </div>

        {/* Gentle Loading State when waiting for Gemini + ElevenLabs */}
        {isLoading && (
          <div
            id="serenity-loading-state"
            role="status"
            aria-live="polite"
            className="p-4 rounded-2xl bg-[#F6FAF7] border border-[#D5E1D8] text-center flex flex-col items-center justify-center gap-2.5 shadow-2xs animate-pulse max-w-md mx-auto"
          >
            <div className="w-6 h-6 rounded-full border-2 border-[#4E6B56] border-t-transparent animate-spin" />
            <p className="text-sm text-[#3E5745] font-medium tracking-wide">
              Preparing your Serenity moment...
            </p>
            <span className="text-xs text-[#6F8376]">
              Tuning words and calming voice in {selectedLanguage ? selectedLanguage : 'audio'}
            </span>
          </div>
        )}

        {/* 5. Audio Player: 🔊 Serenity Audio - Locked/blurred until language is selected */}
        <div>
          <AudioPlayer
            audioUrl={audioUrl}
            language={selectedLanguage}
            isLocked={isAudioLocked}
            totalDurationSeconds={intervention.duration_seconds}
          />
        </div>
      </div>
    </div>
  );
};