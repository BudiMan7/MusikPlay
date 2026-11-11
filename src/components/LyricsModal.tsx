import React, { useEffect, useRef } from 'react';
import { X, Mic2, FileText, Upload } from 'lucide-react';
import { Song } from '../types/music';
import { GlassIconButton } from '../design/GlassIconButton';
import { GlassButton } from '../design/GlassButton';
import { parseLrc, getActiveLyricIndex } from '../utils/audioMath';
import { useTheme } from '../context/ThemeContext';
import { audioEngine } from '../services/AudioEngine';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  currentTime: number;
  onImportLyrics?: (songId: string, lrcText: string) => void;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  isOpen,
  onClose,
  song,
  currentTime,
  onImportLyrics,
}) => {
  const { effectiveAccent } = useTheme();
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lrcFileInputRef = useRef<HTMLInputElement | null>(null);

  const lyrics = song?.lyrics ? parseLrc(song.lyrics) : [];
  const activeIndex = getActiveLyricIndex(lyrics, currentTime);

  // Auto-scroll to active lyric line smoothly
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  const handleLrcFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && song && onImportLyrics) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          onImportLyrics(song.id, text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLineClick = (time: number) => {
    audioEngine.seek(time);
  };

  if (!isOpen || !song) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Synchronized Lyrics"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
    >
      <input
        type="file"
        ref={lrcFileInputRef}
        accept=".lrc,.txt"
        onChange={handleLrcFileUpload}
        className="hidden"
      />

      <div className="w-full max-w-lg h-[80vh] liquid-glass rounded-[32px] flex flex-col overflow-hidden border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mic2 className="w-5 h-5" style={{ color: effectiveAccent }} />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                {song.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tap line to seek timestamp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => lrcFileInputRef.current?.click()}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center gap-1 transition-colors"
            >
              <Upload className="w-3 h-3" />
              Import .LRC
            </button>

            <GlassIconButton size="sm" aria-label="Close Lyrics" onClick={onClose}>
              <X className="w-4 h-4" />
            </GlassIconButton>
          </div>
        </div>

        {/* Lyrics Scrollable Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-6 py-12 space-y-6 text-center scrollbar-none"
        >
          {lyrics.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <FileText className="w-12 h-12 stroke-[1.5] opacity-40 mb-3" />
              <p className="text-sm font-medium">No synchronized lyrics loaded</p>
              <p className="text-xs mt-1 text-slate-500 mb-4">
                You can import an external .LRC file or add timestamped lyrics.
              </p>
              <GlassButton
                size="sm"
                variant="glass"
                icon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => lrcFileInputRef.current?.click()}
              >
                Upload .LRC File
              </GlassButton>
            </div>
          ) : (
            lyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={`${line.time}-${idx}`}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => handleLineClick(line.time)}
                  className={`transition-all duration-300 font-medium cursor-pointer py-1 rounded-lg px-2 hover:bg-white/5 ${
                    isActive
                      ? 'text-lg sm:text-xl font-bold scale-105 opacity-100'
                      : 'text-sm sm:text-base text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-90'
                  }`}
                  style={isActive ? { color: effectiveAccent } : {}}
                >
                  {line.text}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
