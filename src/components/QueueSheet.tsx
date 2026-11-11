import React from 'react';
import { X, Play, Trash2, ArrowUp, ArrowDown, Music2 } from 'lucide-react';
import { Song } from '../types/music';
import { GlassCard } from '../design/GlassCard';
import { GlassIconButton } from '../design/GlassIconButton';
import { useTheme } from '../context/ThemeContext';
import { formatTime } from '../utils/audioMath';

interface QueueSheetProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Song[];
  currentIndex: number;
  onSelectTrack: (index: number) => void;
  onRemoveTrack: (index: number) => void;
  onMoveTrack: (fromIndex: number, toIndex: number) => void;
  onClearQueue: () => void;
}

export const QueueSheet: React.FC<QueueSheetProps> = ({
  isOpen,
  onClose,
  queue,
  currentIndex,
  onSelectTrack,
  onRemoveTrack,
  onMoveTrack,
  onClearQueue,
}) => {
  const { effectiveAccent, isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Playback Queue"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md transition-opacity"
    >
      <div
        className="w-full sm:max-w-xl max-h-[85vh] h-[75vh] liquid-glass rounded-t-[32px] sm:rounded-[32px] flex flex-col overflow-hidden shadow-2xl border border-white/20"
        style={{
          boxShadow: `0 20px 50px -10px ${effectiveAccent}30`,
        }}
      >
        {/* Grab Handle & Header */}
        <div className="p-4 border-b border-white/10 flex flex-col gap-2">
          <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto" />
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <Music2 className="w-5 h-5" style={{ color: effectiveAccent }} />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Playback Queue ({queue.length})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {queue.length > 1 && (
                <button
                  onClick={onClearQueue}
                  className="text-xs text-rose-500 hover:text-rose-400 font-medium px-2.5 py-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                >
                  Clear Queue
                </button>
              )}
              <GlassIconButton
                size="sm"
                icon={<X className="w-4 h-4" />}
                aria-label="Close Queue"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </GlassIconButton>
            </div>
          </div>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {queue.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 dark:text-slate-400">
              <Music2 className="w-12 h-12 stroke-[1.5] opacity-40 mb-3" />
              <p className="text-sm font-medium">Queue is currently empty</p>
              <p className="text-xs mt-1">Add tracks from your Music Library to build a queue.</p>
            </div>
          ) : (
            queue.map((song, index) => {
              const isCurrent = index === currentIndex;
              return (
                <div
                  key={`${song.id}-${index}`}
                  className={`group flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-white/15 dark:bg-white/10 border-white/30 shadow-sm'
                      : 'border-transparent hover:bg-white/5 hover:border-white/10'
                  }`}
                  style={isCurrent ? { borderColor: `${effectiveAccent}60` } : {}}
                >
                  {/* Track number or active play indicator */}
                  <div className="w-6 text-center text-xs font-mono tabular-nums text-slate-400">
                    {isCurrent ? (
                      <span className="inline-block w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: effectiveAccent }} />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Artwork */}
                  <div
                    onClick={() => onSelectTrack(index)}
                    className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-800 cursor-pointer border border-white/10"
                  >
                    {song.artworkUrl ? (
                      <img src={song.artworkUrl} alt={song.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-4 h-4 text-white/50" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div
                    onClick={() => onSelectTrack(index)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <h4 className={`text-xs font-semibold truncate ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {song.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {song.artist} · {formatTime(song.duration)}
                    </p>
                  </div>

                  {/* Reorder / Remove buttons */}
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    {index > 0 && (
                      <button
                        onClick={() => onMoveTrack(index, index - 1)}
                        aria-label="Move track up"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {index < queue.length - 1 && (
                      <button
                        onClick={() => onMoveTrack(index, index + 1)}
                        aria-label="Move track down"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveTrack(index)}
                      aria-label="Remove from queue"
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
