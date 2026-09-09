import React from 'react';
import { DayMoodData } from '../types';

interface MoodChartProps {
  data: DayMoodData[];
}

export const MoodChart: React.FC<MoodChartProps> = ({ data }) => {
  const maxScore = 5;

  return (
    <div
      id="serenity-mood-chart"
      className="w-full bg-[#FAFBF9]/90 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-[#DFE8E2] mt-6 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-5">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-[#283A2E] tracking-wide">
            7-Day Mood Flow
          </h3>
          <p className="text-[11px] sm:text-xs text-[#6E8174]">
            Actual rolling 7-day calendar history mapped to daily check-ins
          </p>
        </div>
        <span className="self-start sm:self-center text-[11px] px-2.5 py-0.5 rounded-full bg-[#EAF2EC] text-[#41624B] font-medium border border-[#D7E5DB]">
          Rolling 7 Days
        </span>
      </div>

      {/* Visual bars mapped to actual rolling dates */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-3 items-end h-48 pt-4 pb-2">
        {data.map((item, idx) => {
          const heightPercent = Math.max(22, (item.score / maxScore) * 100);
          const isToday = idx === data.length - 1;

          return (
            <div
              key={item.date || idx}
              className="group flex flex-col items-center justify-end h-full relative"
            >
              {/* Tooltip on hover with full date and score */}
              <div className="absolute -top-11 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 bg-[#24372A] text-white text-[10px] sm:text-[11px] py-1.5 px-3 rounded-xl whitespace-nowrap shadow-md -translate-y-1 group-hover:translate-y-0">
                <span className="font-semibold">{item.moodEmoji} {item.moodLabel}</span>
                <span className="text-[#B9D0C0] ml-1.5">• {item.formattedDate}</span>
                <span className="text-[#DCEAE0] ml-1">({item.date})</span>
              </div>

              {/* Day Emoji indicator */}
              <span className="text-base sm:text-lg mb-2 transform group-hover:scale-125 transition-transform duration-200 select-none">
                {item.moodEmoji}
              </span>

              {/* Bar track and fill */}
              <div className="w-full max-w-[26px] sm:max-w-[32px] bg-[#E7EFE9] rounded-full h-24 p-1 flex flex-col justify-end">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-full transition-all duration-700 ease-out ${
                    isToday
                      ? 'bg-gradient-to-t from-[#3B5743] to-[#5D876A] shadow-xs'
                      : 'bg-gradient-to-t from-[#7A9884] to-[#A1BBA7]'
                  }`}
                />
              </div>

              {/* REAL DATE-BASED LABELS (e.g. Sep 3, Sep 4 ... Sep 9) */}
              <div className="flex flex-col items-center mt-2.5 select-none text-center">
                <span
                  className={`text-[10px] sm:text-xs tracking-tight ${
                    isToday ? 'font-bold text-[#1F3324]' : 'font-medium text-[#465C4E]'
                  }`}
                >
                  {item.formattedDate}
                </span>
                <span className="text-[9px] text-[#718578] font-light">
                  {isToday ? 'Today' : item.shortDay}
                </span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4E6B56] mt-0.5" title="Today" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#E7EFE9] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#718578] gap-1">
        <span>Associated with actual daily check-in dates ({data[0]?.date} to {data[data.length - 1]?.date})</span>
        <span>Latest 7 days calculated automatically</span>
      </div>
    </div>
  );
};
