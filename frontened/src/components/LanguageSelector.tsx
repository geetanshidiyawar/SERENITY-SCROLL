import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { LanguageKey, LanguageOption } from '../types';
import { LANGUAGE_OPTIONS } from '../data/demoData';

interface LanguageSelectorProps {
  selectedLanguage: LanguageKey | null;
  onSelectLanguage: (lang: LanguageKey) => void;
  isLoading?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const activeOption = selectedLanguage
    ? LANGUAGE_OPTIONS.find((opt) => opt.id === selectedLanguage)
    : null;

  const handleSelect = (langId: LanguageKey) => {
    onSelectLanguage(langId);
    setIsOpen(false);
  };

  return (
    <div
      id="serenity-language-selector"
      ref={dropdownRef}
      className="w-full max-w-sm mx-auto my-3 relative select-none"
    >
      {/* English Label - MUST ALWAYS REMAIN IN ENGLISH */}
      <div className="text-center mb-2">
        <label
          htmlFor="serenity-language-dropdown-btn"
          className="text-sm sm:text-base text-[#3E5544] font-medium tracking-wide block"
        >
          Please select your language
        </label>
        <span className="text-[11px] text-[#6B8071]">
          Audio voice and mindful guidance will be spoken in this language
        </span>
      </div>

      {/* Single Compact Dropdown Button */}
      <div className="relative">
        <button
          id="serenity-language-dropdown-btn"
          type="button"
          onClick={() => !isLoading && setIsOpen((prev) => !prev)}
          disabled={isLoading}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`w-full flex items-center justify-between px-5 py-3 rounded-2xl border transition-all duration-200 text-left font-sans backdrop-blur-md shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E6B56] ${
            isOpen
              ? 'bg-white/95 border-[#4E6B56] ring-2 ring-[#4E6B56]/15'
              : 'bg-white/80 border-[#D4E0D7] hover:bg-white hover:border-[#BED1C3]'
          } ${isLoading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            {activeOption ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#24352A]">
                  {activeOption.label}
                </span>
                <span className="text-xs text-[#6A8271]">
                  ({activeOption.nativeLabel})
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] rounded-md bg-[#E2EDE5] text-[#3A5543] font-medium ml-1">
                  ✓ Selected
                </span>
              </div>
            ) : (
              <span className="text-sm text-[#738779] font-normal">
                Select language
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[#526B5A] shrink-0 ml-2">
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180 text-[#3B5443]' : ''
              }`}
            />
          </div>
        </button>

        {/* Dropdown Menu (Appears ONLY when interacted with) */}
        {isOpen && (
          <div
            id="serenity-language-menu"
            role="listbox"
            aria-label="Available languages"
            className="absolute top-full left-0 right-0 mt-2 z-30 bg-white/95 backdrop-blur-xl border border-[#D5E1D8] rounded-2xl shadow-lg shadow-[#243B2C]/10 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {LANGUAGE_OPTIONS.map((lang: LanguageOption) => {
              const isSelected = selectedLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  id={`lang-option-${lang.id}`}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => handleSelect(lang.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-[#EAF2EC] text-[#24372B] font-semibold'
                      : 'text-[#334638] hover:bg-[#F3F8F5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{lang.label}</span>
                    <span className="text-xs text-[#758B7C] font-normal">
                      {lang.nativeLabel}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="flex items-center text-[#3B5743]">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
