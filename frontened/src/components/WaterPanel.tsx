import React, { useState } from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

interface WaterPanelProps {
  onClose?: () => void;
}

export const WaterPanel: React.FC<WaterPanelProps> = ({ onClose }) => {
  const [glasses, setGlasses] = useState<number>(4);
  const targetGlasses = 8;

  const handleAddGlass = () => {
    setGlasses((prev) => Math.min(prev + 1, 16));
  };

  const handleRemoveGlass = () => {
    setGlasses((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setGlasses(0);
  };

  return (
    <div
      id="serenity-water-panel"
      className="w-full max-w-2xl mx-auto my-4 p-6 sm:p-8 rounded-3xl serenity-card transition-all duration-300"
    >
      <div className="flex items-center justify-between border-b border-[#E1EAE3] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label="Glass of water">
            🥛
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-editorial font-medium text-[#223327]">
              Today's Water
            </h2>
            <p className="text-xs text-[#5E7164]">
              Gentle mindful hydration check
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

      {/* Main Hydration Display */}
      <div className="text-center py-4">
        <div className="text-4xl sm:text-5xl font-editorial font-semibold text-[#25392C] tracking-tight">
          {glasses} <span className="text-xl sm:text-2xl font-sans text-[#718578] font-light">/ {targetGlasses} glasses</span>
        </div>
        <p className="text-sm sm:text-base text-[#3C5243] font-medium mt-2">
          You've had {glasses} glasses today.
        </p>
        <p className="text-xs text-[#6B7F72] mt-0.5">
          {glasses >= targetGlasses
            ? 'Wonderful! You are taking gentle care of your hydration.'
            : 'Take a calm sip whenever you are ready.'}
        </p>
      </div>

      {/* Visual representation: 🥛 glasses filling up */}
      <div className="my-6 p-5 rounded-2xl bg-[#F4F8F5]/80 border border-[#DFE8E1]">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2">
          {Array.from({ length: targetGlasses }).map((_, index) => {
            const isFilled = index < glasses;
            return (
              <button
                key={index}
                onClick={() => setGlasses(index + 1)}
                aria-label={`Set water to ${index + 1} glasses`}
                title={isFilled ? `Glass ${index + 1} logged` : `Click to fill up to ${index + 1}`}
                className={`w-11 h-12 sm:w-12 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none ${
                  isFilled
                    ? 'bg-[#E3EFE6] border border-[#B8D4C0] shadow-2xs'
                    : 'bg-white/60 border border-dashed border-[#CCD8D0] opacity-55 hover:opacity-80'
                }`}
              >
                {isFilled ? (
                  <span className="text-2xl sm:text-3xl select-none" role="img" aria-label="Water glass">
                    🥛
                  </span>
                ) : (
                  <span className="text-lg sm:text-xl text-[#8E9F94] select-none font-light">
                    ○
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          id="water-add-btn"
          onClick={handleAddGlass}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#354F3C] hover:bg-[#283D2E] text-white shadow-xs transition-all transform active:scale-95 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#354F3C]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add glass</span>
        </button>

        <button
          id="water-remove-btn"
          onClick={handleRemoveGlass}
          disabled={glasses === 0}
          className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-white/80 hover:bg-white text-[#455A4C] border border-[#D5E1D9] text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Remove one glass"
        >
          <Minus className="w-3.5 h-3.5" />
          <span>- 1 glass</span>
        </button>

        <button
          id="water-reset-btn"
          onClick={handleReset}
          className="p-3 rounded-full hover:bg-white/80 text-[#6B8072] hover:text-[#233529] transition-colors"
          title="Reset today's water count"
          aria-label="Reset water count"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Gentle Non-Medical Advice Statement */}
      <div className="mt-8 pt-4 border-t border-[#E3EAE4] text-center">
        <p className="text-xs text-[#6F8275] max-w-lg mx-auto leading-relaxed italic">
          Around 6–8 glasses can be a general reference, but hydration needs vary.
        </p>
      </div>
    </div>
  );
};
