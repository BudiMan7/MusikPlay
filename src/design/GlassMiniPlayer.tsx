import React from 'react';
import { Play, Pause, SkipForward, Disc3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Song } from '../types/music';

interface GlassMiniPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
  onExpand: () => void;
  className?: string;
}

export const GlassMiniPlayer: React.FC<GlassMiniPlayerProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onExpand,
  className = '',
}) => {
  const { effectiveAccent } = useTheme();

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={onExpand}
      role="region"
      aria-label="Now Playing Mini Player"
      className={`fixed bottom-22 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-md h-16 rounded-[24px] liquid-glass flex items-center px-3.5 gap-3.5 shadow-xl cursor-pointer hover:border-white/40 transition-all active:scale-[0.99] select-none ${className}`}
    >
      {/* Top micro progress bar */}
      <div className="absolute top-0 left-4 right-4 h-0.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-150"
          style={{ width: `${progress}%`, backgroundColor: effectiveAccent }}
        />
      </div>

      {/* Album Art / Icon */}
      <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-800 flex items-center justify-center border border-white/20 shadow-sm">
        {currentSong.artworkUrl ? (
          <img
            src={currentSong.artworkUrl}
            alt={currentSong.title}
            className={`w-full h-full object-cover ${isPlaying ? 'animate-pulse' : ''}`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <Disc3 className={`w-5 h-5 text-white/80 ${isPlaying ? 'animate-spin' : ''}`} />
        )}
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
          {currentSong.title}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {currentSong.artist} · {currentSong.album}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pause song' : 'Play song'}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-900 dark:text-white bg-white/20 dark:bg-white/10 hover:bg-white/30 border border-white/20 active:scale-95 transition-transform"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={onNext}
          aria-label="Skip to next track"
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-transform"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
