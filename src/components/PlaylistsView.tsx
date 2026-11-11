import React, { useState } from 'react';
import {
  ListMusic,
  Plus,
  Play,
  Trash2,
  Edit2,
  Check,
  X,
  Music2,
  Sparkles,
} from 'lucide-react';
import { Song, Playlist } from '../types/music';
import { GlassCard } from '../design/GlassCard';
import { GlassButton } from '../design/GlassButton';
import { GlassIconButton } from '../design/GlassIconButton';
import { useTheme } from '../context/ThemeContext';
import { generateSmartPlaylists, addSongToPlaylist, removeSongFromPlaylist } from '../utils/playlistOps';
import { formatTime } from '../utils/audioMath';

interface PlaylistsViewProps {
  playlists: Playlist[];
  songs: Song[];
  onPlayPlaylist: (playlistSongs: Song[]) => void;
  onUpdatePlaylists: (updated: Playlist[]) => void;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  playlists,
  songs,
  onPlayPlaylist,
  onUpdatePlaylists,
}) => {
  const { effectiveAccent, isDark } = useTheme();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const smartPlaylists = generateSmartPlaylists(songs);
  const allPlaylists = [...smartPlaylists, ...playlists];

  const activePlaylist = allPlaylists.find((p) => p.id === selectedPlaylistId) || null;
  const activeSongs = activePlaylist
    ? songs.filter((s) => activePlaylist.songIds.includes(s.id))
    : [];

  const handleCreatePlaylist = () => {
    if (!newPlaylistTitle.trim()) return;
    const newPl: Playlist = {
      id: `custom-pl-${Date.now()}`,
      title: newPlaylistTitle.trim(),
      description: 'Custom user collection',
      songIds: [],
      createdAt: Date.now(),
      isSmart: false,
    };
    const updated = [newPl, ...playlists];
    onUpdatePlaylists(updated);
    setNewPlaylistTitle('');
    setIsCreateModalOpen(false);
    setSelectedPlaylistId(newPl.id);
  };

  const handleDeletePlaylist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this playlist?')) {
      const updated = playlists.filter((p) => p.id !== id);
      onUpdatePlaylists(updated);
      if (selectedPlaylistId === id) setSelectedPlaylistId(null);
    }
  };

  const handleAddSongToActive = (songId: string) => {
    if (!activePlaylist || activePlaylist.isSmart) return;
    const updatedPl = addSongToPlaylist(activePlaylist, songId);
    const updated = playlists.map((p) => (p.id === updatedPl.id ? updatedPl : p));
    onUpdatePlaylists(updated);
  };

  const handleRemoveSongFromActive = (songId: string) => {
    if (!activePlaylist || activePlaylist.isSmart) return;
    const updatedPl = removeSongFromPlaylist(activePlaylist, songId);
    const updated = playlists.map((p) => (p.id === updatedPl.id ? updatedPl : p));
    onUpdatePlaylists(updated);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ListMusic className="w-5 h-5" style={{ color: effectiveAccent }} />
            Playlist Collections ({allPlaylists.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Smart automatic mixes and custom user playlists with persistent storage.
          </p>
        </div>

        <GlassButton
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Playlist
        </GlassButton>
      </div>

      {/* Detail view of active playlist if selected */}
      {activePlaylist ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedPlaylistId(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
            >
              ← Back to all playlists
            </button>
            <div className="flex items-center gap-2">
              {!activePlaylist.isSmart && (
                <GlassButton
                  size="sm"
                  variant="glass"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsAddSongModalOpen(true)}
                >
                  Add Tracks
                </GlassButton>
              )}
              {activeSongs.length > 0 && (
                <GlassButton
                  size="sm"
                  variant="primary"
                  icon={<Play className="w-4 h-4 fill-current ml-0.5" />}
                  onClick={() => onPlayPlaylist(activeSongs)}
                >
                  Play All ({activeSongs.length})
                </GlassButton>
              )}
            </div>
          </div>

          <GlassCard className="p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activePlaylist.title}
                </h3>
                {activePlaylist.isSmart && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/20 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                    Smart
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activePlaylist.description || `${activeSongs.length} tracks`}
              </p>
            </div>

            {/* Song list in playlist */}
            <div className="divide-y divide-white/10">
              {activeSongs.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No tracks in this playlist yet. Click &quot;Add Tracks&quot; to pick songs from your library.
                </div>
              ) : (
                activeSongs.map((song, idx) => (
                  <div
                    key={song.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-center font-mono text-slate-400">{idx + 1}</span>
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                        {song.artworkUrl ? (
                          <img src={song.artworkUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Music2 className="w-4 h-4 text-white/50 m-auto mt-2.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {song.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{song.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-slate-400">{formatTime(song.duration)}</span>
                      {!activePlaylist.isSmart && (
                        <button
                          onClick={() => handleRemoveSongFromActive(song.id)}
                          aria-label="Remove song"
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      ) : (
        /* Playlist Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {allPlaylists.map((pl) => {
            const trackCount = pl.songIds.length;
            return (
              <GlassCard
                key={pl.id}
                onClick={() => setSelectedPlaylistId(pl.id)}
                className="p-4 flex flex-col justify-between h-40 group cursor-pointer hover:border-white/40 select-none"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/20 shadow-md"
                    style={{ backgroundColor: `${effectiveAccent}25` }}
                  >
                    {pl.isSmart ? (
                      <Sparkles className="w-6 h-6" style={{ color: effectiveAccent }} />
                    ) : (
                      <ListMusic className="w-6 h-6" style={{ color: effectiveAccent }} />
                    )}
                  </div>

                  {!pl.isSmart && (
                    <button
                      onClick={(e) => handleDeletePlaylist(pl.id, e)}
                      aria-label="Delete playlist"
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {pl.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {pl.description || `${trackCount} songs`}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[10px] font-mono text-slate-400">
                    <span>{trackCount} tracks</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Open →
                    </span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Create Playlist Modal */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <div className="liquid-glass rounded-[28px] max-w-sm w-full p-6 border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create New Playlist
            </h3>
            <input
              type="text"
              autoFocus
              placeholder="Playlist name..."
              value={newPlaylistTitle}
              onChange={(e) => setNewPlaylistTitle(e.target.value)}
              className="w-full h-11 px-4 rounded-xl liquid-glass text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none border border-white/20"
            />
            <div className="flex justify-end gap-2 pt-2">
              <GlassButton
                size="sm"
                variant="glass"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </GlassButton>
              <GlassButton
                size="sm"
                variant="primary"
                onClick={handleCreatePlaylist}
              >
                Create
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      {/* Add Songs Picker Modal */}
      {isAddSongModalOpen && activePlaylist && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <div className="liquid-glass rounded-[28px] max-w-lg w-full max-h-[80vh] flex flex-col p-6 border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add Songs to &quot;{activePlaylist.title}&quot;
              </h3>
              <button
                onClick={() => setIsAddSongModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Done
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {songs.map((song) => {
                const isAdded = activePlaylist.songIds.includes(song.id);
                return (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {song.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{song.artist}</p>
                    </div>

                    <button
                      onClick={() =>
                        isAdded
                          ? handleRemoveSongFromActive(song.id)
                          : handleAddSongToActive(song.id)
                      }
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
                        isAdded
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20 border border-white/15'
                      }`}
                    >
                      {isAdded ? 'Added ✓' : '+ Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
