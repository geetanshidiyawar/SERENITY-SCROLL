import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { LanguageKey } from '../types';

interface AudioPlayerProps {
  audioUrl?: string;
  language: LanguageKey | null;
  isLocked?: boolean;
  totalDurationSeconds?: number;
  onTrackPlayState?: (isPlaying: boolean) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  language,
  isLocked = false,
  totalDurationSeconds = 120,
  onTrackPlayState,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(totalDurationSeconds);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const locked = isLocked || !language;

  const formatTime = (seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;

    setIsPlaying(false);
    setCurrentTime(0);
    setAudioError(false);
    setDuration(totalDurationSeconds);

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.load();
    }

    onTrackPlayState?.(false);
  }, [audioUrl, language, totalDurationSeconds]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePlayPause = async () => {
    if (locked) {
      return;
    }

    const audio = audioRef.current;

    if (!audio || !audioUrl) {
      console.error('SERENITY: No audio URL available.');
      setAudioError(true);
      return;
    }

    try {
      if (isPlaying) {
        audio.pause();

        setIsPlaying(false);
        onTrackPlayState?.(false);

        return;
      }

      setAudioError(false);

      await audio.play();

      setIsPlaying(true);
      onTrackPlayState?.(true);
    } catch (error) {
      console.error(
        'SERENITY: Audio playback failed:',
        error
      );

      setIsPlaying(false);
      onTrackPlayState?.(false);
      setAudioError(true);
    }
  };

  const handleReplay = async () => {
    if (locked) {
      return;
    }

    const audio = audioRef.current;

    if (!audio || !audioUrl) {
      setAudioError(true);
      return;
    }

    try {
      audio.currentTime = 0;
      setCurrentTime(0);

      await audio.play();

      setIsPlaying(true);
      onTrackPlayState?.(true);
      setAudioError(false);
    } catch (error) {
      console.error(
        'SERENITY: Audio replay failed:',
        error
      );

      setAudioError(true);
    }
  };

  const handleMute = () => {
    if (locked) {
      return;
    }

    const nextMuted = !isMuted;

    setIsMuted(nextMuted);

    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  const handleSeek = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (locked) {
      return;
    }

    const newTime = Number(event.target.value);

    setCurrentTime(newTime);

    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (
      Number.isFinite(audio.duration) &&
      audio.duration > 0
    ) {
      setDuration(audio.duration);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    setCurrentTime(audio.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }

    onTrackPlayState?.(false);
  };

  const handleAudioError = () => {
    console.error(
      'SERENITY: Browser could not load:',
      audioUrl
    );

    setIsPlaying(false);
    setAudioError(true);

    onTrackPlayState?.(false);
  };

  return (
    <div
      id="serenity-audio-player-container"
      className="w-full max-w-md mx-auto relative rounded-2xl overflow-hidden"
    >
      <div
        id="serenity-audio-player"
        className={`w-full bg-[#F7FAF7]/90 backdrop-blur-md rounded-2xl p-5 border border-[#D9E4DD] shadow-xs transition-all duration-300 flex flex-col items-center text-center ${
          locked
            ? 'opacity-40 filter blur-[1px] pointer-events-none select-none'
            : 'opacity-100'
        }`}
        aria-disabled={locked}
      >
        {audioUrl && !locked && (
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="auto"
            muted={isMuted}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={handleAudioError}
          />
        )}

        <div className="w-full flex items-center justify-between mb-3 border-b border-[#E3ECE6] pb-2.5">
          <div className="flex items-center gap-2">
            <span
              className="text-base select-none"
              role="img"
              aria-label="Audio status"
            >
              {locked ? '🔒' : '🔊'}
            </span>

            <span className="text-sm font-semibold text-[#293B30] tracking-wide">
              Serenity Audio
            </span>

            {language && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E5EEE8] text-[#486350] capitalize font-medium">
                {language}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-[#62776A]">
            <Sparkles className="w-3.5 h-3.5 text-[#5F886B]" />

            <span className="text-[11px]">
              Calming Soundscape
            </span>
          </div>
        </div>

        <div className="my-3 flex flex-col items-center">
          <button
            id="audio-play-pause-btn"
            onClick={handlePlayPause}
            disabled={locked}
            aria-label={
              isPlaying
                ? 'Pause Serenity audio'
                : 'Play Serenity audio'
            }
            className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full transition-all duration-300 focus:outline-none ${
              locked
                ? 'bg-[#738879] text-white/75 cursor-not-allowed'
                : 'bg-[#354E3D] hover:bg-[#2A4031] text-[#FAFDFB] shadow-md transform hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#354E3D]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />

                <span className="text-sm font-medium tracking-wide">
                  Pause
                </span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />

                <span className="text-sm font-medium tracking-wide">
                  Play Serenity
                </span>
              </>
            )}
          </button>

          <div className="mt-2.5 text-xs">
            {locked ? (
              <span className="text-[#8B7C72] font-medium tracking-wide">
                DISABLED until language is selected
              </span>
            ) : audioError ? (
              <span className="text-[#A35C5C] font-medium tracking-wide">
                Audio could not be loaded. Please try again.
              </span>
            ) : isPlaying ? (
              <span className="text-[#3B5945] font-medium tracking-wide flex items-center gap-1.5 justify-center">
                <span className="w-2 h-2 rounded-full bg-[#4E6B56] animate-ping" />

                Playing Serenity audio in {language}
              </span>
            ) : (
              <span className="text-[#3B5945] font-medium tracking-wide flex items-center gap-1.5 justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4E6B56]" />

                Audio Ready
              </span>
            )}
          </div>
        </div>

        {!locked && (
          <div className="w-full space-y-2 mt-2 pt-2 border-t border-[#E3ECE6]">
            <input
              id="audio-seek-slider"
              type="range"
              min="0"
              max={duration || totalDurationSeconds}
              value={Math.min(
                currentTime,
                duration || totalDurationSeconds
              )}
              onChange={handleSeek}
              disabled={audioError}
              aria-label="Seek audio position"
              className="w-full h-1.5 bg-[#E1E9E3] rounded-lg appearance-none cursor-pointer accent-[#43644D] focus:outline-none"
            />

            <div className="flex justify-between items-center text-xs text-[#6B7D72] font-mono select-none">
              <span>
                {formatTime(currentTime)}
              </span>

              <div className="flex items-center gap-2">
                <button
                  id="audio-replay-btn"
                  onClick={handleReplay}
                  disabled={audioError}
                  aria-label="Replay audio from start"
                  className="p-1 text-[#5B6F63] hover:text-[#233529] rounded transition-colors disabled:opacity-40"
                  title="Replay from start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  id="audio-mute-btn"
                  onClick={handleMute}
                  aria-label={
                    isMuted
                      ? 'Unmute audio'
                      : 'Mute audio'
                  }
                  className="p-1 text-[#5B6F63] hover:text-[#233529] rounded transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <span>
                {formatTime(duration)}
              </span>
            </div>
          </div>
        )}
      </div>

      {locked && (
        <div
          id="audio-locked-notice"
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center z-10"
        >
          <div className="bg-[#FAFDFB]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#D1DDD4] shadow-sm flex items-center gap-2 text-[#3A5242]">
            <Lock className="w-4 h-4 text-[#4E6B56]" />

            <span className="text-xs sm:text-sm font-medium">
              Please select your language above to listen
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
