import React from 'react';

interface HelplinePanelProps {
  onClose?: () => void;
}

export const HelplinePanel: React.FC<HelplinePanelProps> = ({ onClose }) => {
  return (
    <div
      id="serenity-helpline-panel"
      className="w-full max-w-xl mx-auto my-6 p-8 sm:p-10 rounded-3xl serenity-card text-center transition-all duration-300"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#EBF3ED] flex items-center justify-center text-3xl">
        <span role="img" aria-label="Telephone">☎</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-editorial font-medium text-[#25392C]">
        Helpline
      </h2>

      <p className="text-base text-[#526B5A] mt-2 font-medium">
        Coming soon.
      </p>

      <p className="text-xs sm:text-sm text-[#728578] mt-4 max-w-sm mx-auto leading-relaxed">
        Verified wellness and support directory will be integrated here. Take a gentle pause and remember to care for yourself today.
      </p>

      {onClose && (
        <div className="mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#3D5644] hover:bg-[#2F4435] text-white text-xs font-medium tracking-wide transition-colors"
          >
            ← Back to Serenity
          </button>
        </div>
      )}
    </div>
  );
};
