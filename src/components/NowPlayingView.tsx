import React from 'react';
import {
  ChevronDown,
  ListMusic,
  Heart,
  Shuffle,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Sliders,
  Mic2,
  Disc3,
  Share2,
} from 'lucide-react';
import { Song, RepeatMode } from '../types/music';
import { GlassCard } from '../design/GlassCard';
import { GlassIconButton } from '../design/GlassIconButton';
import { GlassSlider } from '../design/GlassSlider';
import { GlassButton } from '../design/GlassButton';
import { useTheme } from '../context/ThemeContext';
import { formatTime } from '../utils/audioMath';

interface NowPlayingViewProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onToggleFavorite: () => void;
  onOpenQueue: () => void;
  onOpenEqualizer: () => void;
  onOpenLyrics: () => void;
}

export const NowPlayingView: React.FC<NowPlayingViewProps> = ({
  isOpen,
  onClose,
  currentSong,
  isPlaying,
  currentTime,
  duration,
  shuffle,
  repeatMode,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onToggleShuffle,
  onCycleRepeat,
  onToggleFavorite,
  onOpenQueue,
  onOpenEqualizer,
  onOpenLyrics,
}) => {
  const { effectiveAccent, isDark } = useTheme();

  if (!isOpen || !currentSong) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Now Playing Full Screen"
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-slate-950 text-white select-none transition-all duration-300"
    >
      {/* Dynamic Ambient Blurred Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {currentSong.artworkUrl && (
          <img
            src={currentSong.artworkUrl}
            alt=""
            className="w-full h-full object-cover blur-[80px] opacity-40 scale-125 saturate-200"
            referrerPolicy="no-referrer"
          />
        )}
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{ backgroundColor: effectiveAccent }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      </div>

      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between z-10">
        <GlassIconButton
          size="md"
          icon={<ChevronDown className="w-5 h-5" />}
          aria-label="Minimize Player"
          onClick={onClose}
        >
          <ChevronDown className="w-5 h-5 text-white" />
        </GlassIconButton>

        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
            Now Playing
          </span>
          <p className="text-xs font-semibold text-white/90 truncate max-w-[200px]">
            {currentSong.album}
          </p>
        </div>

        <GlassIconButton
          size="md"
          icon={<ListMusic className="w-5 h-5" />}
          aria-label="Open Queue"
          onClick={onOpenQueue}
        >
          <ListMusic className="w-5 h-5 text-white" />
        </GlassIconButton>
      </header>

      {/* Center: Large Album Artwork & Disc Reflection */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-4 z-10 max-w-md mx-auto w-full">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-[32px] overflow-hidden p-2.5 liquid-glass border border-white/25 shadow-2xl">
          {currentSong.artworkUrl ? (
            <img
              src={currentSong.artworkUrl}
              alt={currentSong.title}
              className={`w-full h-full object-cover rounded-[24px] shadow-lg transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full rounded-[24px] bg-slate-900/80 flex items-center justify-center">
              <Disc3 className={`w-24 h-24 text-white/40 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
            </div>
          )}

          {/* Audio Bitrate Pill */}
          <div className="absolute bottom-5 left-5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono tracking-tight text-white/90">
            Hi-Res Audio · 96kHz / 24-bit
          </div>
        </div>

        {/* Title, Artist, and Favorite Toggle */}
        <div className="w-full mt-8 flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate tracking-tight">
              {currentSong.title}
            </h2>
            <p className="text-sm font-medium text-white/70 truncate mt-1">
              {currentSong.artist}
            </p>
          </div>

          <button
            onClick={onToggleFavorite}
            aria-label={currentSong.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className="w-12 h-12 rounded-full flex items-center justify-center liquid-glass-subtle active:scale-90 transition-transform cursor-pointer shrink-0"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                currentSong.isFavorite
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-white/70 hover:text-white'
              }`}
            />
          </button>
        </div>

        {/* Progress Bar & Timestamps */}
        <div className="w-full mt-6 space-y-1.5">
          <GlassSlider
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={onSeek}
            aria-label="Playback timeline"
          />
          <div className="flex justify-between items-center text-xs font-mono tabular-nums text-white/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Primary Playback Controls Strip */}
        <div className="w-full mt-6 flex items-center justify-between">
          {/* Shuffle Toggle */}
          <button
            onClick={onToggleShuffle}
            aria-label="Toggle shuffle"
            className={`p-3 rounded-full transition-all active:scale-90 ${
              shuffle ? 'text-white' : 'text-white/40 hover:text-white/70'
            }`}
            style={shuffle ? { color: effectiveAccent } : {}}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous Track */}
          <GlassIconButton
            size="md"
            icon={<SkipBack className="w-5 h-5" />}
            aria-label="Previous track"
            onClick={onPrevious}
          >
            <SkipBack className="w-5 h-5 fill-current text-white" />
          </GlassIconButton>

          {/* Play/Pause Central Floating Pill */}
          <button
            onClick={onPlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-18 h-18 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform cursor-pointer"
            style={{
              backgroundColor: effectiveAccent,
              color: '#000000',
              boxShadow: `0 8px 30px ${effectiveAccent}60`,
            }}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          {/* Next Track */}
          <GlassIconButton
            size="md"
            icon={<SkipForward className="w-5 h-5" />}
            aria-label="Next track"
            onClick={onNext}
          >
            <SkipForward className="w-5 h-5 fill-current text-white" />
          </GlassIconButton>

          {/* Repeat Mode Cycle */}
          <button
            onClick={onCycleRepeat}
            aria-label={`Repeat mode: ${repeatMode}`}
            className={`p-3 rounded-full transition-all active:scale-90 ${
              repeatMode !== 'off' ? 'text-white' : 'text-white/40 hover:text-white/70'
            }`}
            style={repeatMode !== 'off' ? { color: effectiveAccent } : {}}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>
      </main>

      {/* Bottom Action Shortcuts: Equalizer & Lyrics */}
      <footer className="px-6 py-6 flex items-center justify-center gap-4 z-10 max-w-md mx-auto w-full">
        <GlassButton
          variant="glass"
          size="sm"
          onClick={onOpenEqualizer}
          icon={<Sliders className="w-4 h-4" />}
          className="flex-1"
        >
          10-Band EQ
        </GlassButton>

        <GlassButton
          variant="glass"
          size="sm"
          onClick={onOpenLyrics}
          icon={<Mic2 className="w-4 h-4" />}
          className="flex-1"
        >
          LRC Lyrics
        </GlassButton>
      </footer>
    </div>
  );
};
