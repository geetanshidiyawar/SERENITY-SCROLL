import React from 'react';

interface QuoteDisplayProps {
  quote: string;
  source?: string;
  onRefreshQuote?: () => void;
  isLoading?: boolean;
}

export const QuoteDisplay: React.FC<QuoteDisplayProps> = ({
  quote,
  source,
  onRefreshQuote,
  isLoading = false,
}) => {
  return (
    <div
      id="serenity-quote-display"
      className="w-full max-w-2xl mx-auto text-center px-4 py-6 sm:py-8 transition-all duration-500"
    >
      <div className="relative inline-block w-full">
        {/* Decorative subtle quotation mark */}
        <span 
          className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl text-[#B9CEBF]/40 font-serif select-none pointer-events-none"
          aria-hidden="true"
        >
          “
        </span>

        <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-40' : 'opacity-100'}`}>
          <blockquote className="text-xl sm:text-2xl md:text-[27px] leading-relaxed sm:leading-snug text-[#2C3B30] font-editorial italic font-normal tracking-wide px-4 sm:px-8">
            "{quote}"
          </blockquote>

          {source && (
            <p className="mt-3 text-xs tracking-widest text-[#687C6F] uppercase font-sans font-medium">
              {source}
            </p>
          )}
        </div>

        {onRefreshQuote && (
          <div className="mt-4 flex justify-center">
            <button
              id="refresh-quote-btn"
              onClick={onRefreshQuote}
              aria-label="View another calming quote"
              title="Next calming thought"
              className="inline-flex items-center gap-1.5 text-xs text-[#6F8276] hover:text-[#2C3B30] transition-colors py-1 px-3 rounded-full hover:bg-white/50 border border-transparent hover:border-[#D9E3DC]"
            >
              <span className="text-[11px]">✦</span>
              <span>Another mindful thought</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
