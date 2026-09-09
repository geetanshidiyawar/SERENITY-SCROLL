import React, { useState, useEffect } from 'react';
import { Leaf, Sparkles, X, Play } from 'lucide-react';

interface InterventionSimulatorProps {
  onTriggerIntervention: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const InterventionSimulator: React.FC<InterventionSimulatorProps> = ({
  onTriggerIntervention,
  isDemoMode,
  onToggleDemoMode,
}) => {
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);

  useEffect(() => {
    let timer: number | undefined;
    if (showNotification && countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showNotification && countdown === 0) {
      setShowNotification(false);
      setCountdown(10);
      onTriggerIntervention();
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showNotification, countdown, onTriggerIntervention]);

  const handleStartSimulation = () => {
    setCountdown(10);
    setShowNotification(true);
  };

  const handleSkipWait = () => {
    setShowNotification(false);
    setCountdown(10);
    onTriggerIntervention();
  };

  const handleDismiss = () => {
    setShowNotification(false);
    setCountdown(10);
  };

  return (
    <>
      {/* Top Demo Bar */}
      <div className="w-full flex items-center justify-between px-4 sm:px-8 py-2.5 text-xs text-[#526B59] select-none border-b border-[#E1ECE3]/70 bg-white/30 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#528A64] animate-pulse" />
          <span className="font-medium text-[#384F3F]">
            {isDemoMode ? 'Serenity is currently in demo mode.' : 'Serenity connected to live backend.'}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="demo-simulate-trigger-btn"
            onClick={handleStartSimulation}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E5EFE8] hover:bg-[#D7E6DC] text-[#294230] font-medium transition-colors text-[11px] border border-[#CADBCF]"
            title="Simulate Chrome Extension trigger notification"
          >
            <Leaf className="w-3 h-3 text-[#4B7356]" />
            <span>Simulate Extension Trigger</span>
          </button>

          <button
            onClick={onToggleDemoMode}
            className="text-[11px] text-[#6A8172] hover:text-[#25392C] underline underline-offset-2 transition-colors hidden sm:inline-block"
            title="Toggle between mock data and live localhost:8000"
          >
            {isDemoMode ? 'Test Live API' : 'Switch to Demo'}
          </button>
        </div>
      </div>

      {/* Simulated Chrome Extension Notification: "Let's have a little pause 🌿" */}
      {showNotification && (
        <div 
          id="extension-pause-notification"
          className="fixed top-6 right-6 z-50 max-w-sm w-full bg-white/95 backdrop-blur-xl border border-[#C6DDD0] shadow-xl rounded-2xl p-4.5 animate-bounce-short transition-all duration-300"
          role="alert"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl select-none" role="img" aria-label="Leaf">🌿</span>
              <div>
                <h4 className="text-sm font-semibold text-[#253A2C]">
                  Let's have a little pause 🌿
                </h4>
                <p className="text-xs text-[#5B7163] mt-0.5">
                  Mindless scrolling pattern detected.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss notification"
              className="text-[#7D9183] hover:text-[#273B2E] p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-[#E3ECE6] flex items-center justify-between text-xs">
            <span className="text-[#516B58] font-medium">
              Opening Serenity in <strong className="font-mono text-sm">{countdown}s</strong>...
            </span>
            <button
              onClick={handleSkipWait}
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-[#3D5644] text-white hover:bg-[#2F4435] transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Open now</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
