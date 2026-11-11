import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Upload,
  ArrowUpDown,
  Music2,
  Disc3,
  User,
  Folder,
  Heart,
  MoreVertical,
  Play,
  Plus,
  Check,
} from 'lucide-react';
import { Song, Album, Artist } from '../types/music';
import { GlassCard } from '../design/GlassCard';
import { GlassButton } from '../design/GlassButton';
import { GlassIconButton } from '../design/GlassIconButton';
import { useTheme } from '../context/ThemeContext';
import { filterSongs, sortSongs, SortField, SortOrder } from '../utils/libraryOps';
import { formatTime } from '../utils/audioMath';

interface LibraryViewProps {
  songs: Song[];
  onPlaySong: (song: Song) => void;
  onPlayNext: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  onImportFiles: (files: FileList) => void;
  currentSongId?: string;
  isPlaying?: boolean;
}

type LibraryTab = 'songs' | 'albums' | 'artists' | 'folders' | 'favorites';

export const LibraryView: React.FC<LibraryViewProps> = ({
  songs,
  onPlaySong,
  onPlayNext,
  onAddToQueue,
  onToggleFavorite,
  onImportFiles,
  currentSongId,
  isPlaying,
}) => {
  const { effectiveAccent, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<LibraryTab>('songs');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter & Sort
  const filteredSongs = useMemo(() => {
    let result = filterSongs(songs, searchQuery);
    if (activeTab === 'favorites') {
      result = result.filter((s) => s.isFavorite);
    }
    return sortSongs(result, sortField, sortOrder);
  }, [songs, searchQuery, activeTab, sortField, sortOrder]);

  // Group by Albums
  const albums: Album[] = useMemo(() => {
    const map = new Map<string, Album>();
    songs.forEach((s) => {
      const albumKey = `${s.album}-${s.artist}`;
      if (!map.has(albumKey)) {
        map.set(albumKey, {
          id: albumKey,
          title: s.album,
          artist: s.artist,
          artworkUrl: s.artworkUrl,
          trackCount: 1,
          duration: s.duration,
        });
      } else {
        const item = map.get(albumKey)!;
        item.trackCount += 1;
        item.duration += s.duration;
      }
    });
    return Array.from(map.values());
  }, [songs]);

  // Group by Artists
  const artists: Artist[] = useMemo(() => {
    const map = new Map<string, Artist>();
    songs.forEach((s) => {
      if (!map.has(s.artist)) {
        map.set(s.artist, {
          id: s.artist,
          name: s.artist,
          artworkUrl: s.artworkUrl,
          trackCount: 1,
          albumCount: 1,
        });
      } else {
        const item = map.get(s.artist)!;
        item.trackCount += 1;
      }
    });
    return Array.from(map.values());
  }, [songs]);

  // Group by Folders
  const folders = useMemo(() => {
    const map = new Map<string, Song[]>();
    songs.forEach((s) => {
      const f = s.folder || '/Music/Local';
      if (!map.has(f)) map.set(f, []);
      map.get(f)!.push(s);
    });
    return Array.from(map.entries());
  }, [songs]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        accept="audio/*"
        className="hidden"
      />

      {/* Header & Local Audio Scanner CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Music2 className="w-5 h-5" style={{ color: effectiveAccent }} />
            Music Library ({songs.length} Tracks)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Indexed local storage with instant multi-criteria search and sorting.
          </p>
        </div>

        <GlassButton
          variant="primary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          icon={<Upload className="w-4 h-4" />}
        >
          Scan / Import Audio Files
        </GlassButton>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search title, artist, album, genre, folder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-full liquid-glass text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-white/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort Trigger */}
        <div className="relative">
          <GlassButton
            size="md"
            variant="glass"
            onClick={() => setShowSortMenu(!showSortMenu)}
            icon={<ArrowUpDown className="w-4 h-4" />}
          >
            Sort
          </GlassButton>

          {showSortMenu && (
            <div className="absolute right-0 top-13 z-30 w-48 rounded-2xl liquid-glass border border-white/20 p-2 shadow-2xl space-y-1">
              {(['title', 'artist', 'album', 'duration', 'dateAdded'] as SortField[]).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    if (sortField === f) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField(f);
                      setSortOrder('asc');
                    }
                    setShowSortMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium capitalize text-left transition-colors ${
                    sortField === f
                      ? 'bg-white/15 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <span>{f === 'dateAdded' ? 'Date Added' : f}</span>
                  {sortField === f && (
                    <span className="text-[10px] font-mono text-indigo-400 uppercase">
                      {sortOrder}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Library Sub-navigation Segmented Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 overflow-x-auto scrollbar-none">
        {(
          [
            { id: 'songs', label: 'Songs', icon: Music2 },
            { id: 'albums', label: 'Albums', icon: Disc3 },
            { id: 'artists', label: 'Artists', icon: User },
            { id: 'folders', label: 'Folders', icon: Folder },
            { id: 'favorites', label: 'Favorites', icon: Heart },
          ] as { id: LibraryTab; label: string; icon: React.ElementType }[]
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={isActive ? { borderColor: effectiveAccent } : {}}
            >
              <Icon className="w-3.5 h-3.5" style={isActive ? { color: effectiveAccent } : {}} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Songs List View */}
      {(activeTab === 'songs' || activeTab === 'favorites') && (
        <div className="space-y-2">
          {filteredSongs.length === 0 ? (
            <GlassCard className="text-center py-12 text-slate-500">
              <Music2 className="w-12 h-12 stroke-[1.5] opacity-40 mx-auto mb-2" />
              <p className="text-sm font-semibold">No tracks found</p>
              <p className="text-xs mt-1">Try another search or import audio files from your device.</p>
            </GlassCard>
          ) : (
            filteredSongs.map((song, idx) => {
              const isCurrent = song.id === currentSongId;
              return (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song)}
                  className={`group flex items-center gap-3.5 p-3 rounded-2xl liquid-glass-subtle hover:border-white/40 cursor-pointer transition-all select-none border ${
                    isCurrent ? 'border-indigo-400 bg-white/10 dark:bg-white/10' : 'border-white/10'
                  }`}
                >
                  {/* Track index / Play indicator */}
                  <div className="w-6 text-center text-xs font-mono text-slate-400 shrink-0">
                    {isCurrent && isPlaying ? (
                      <span className="inline-block w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: effectiveAccent }} />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Artwork */}
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-800 border border-white/15">
                    {song.artworkUrl ? (
                      <img src={song.artworkUrl} alt={song.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-5 h-5 text-white/50" />
                      </div>
                    )}
                  </div>

                  {/* Song Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-indigo-400 font-bold' : 'text-slate-900 dark:text-white'}`}>
                      {song.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {song.artist} · {song.album}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="text-xs font-mono tabular-nums text-slate-400 shrink-0">
                    {formatTime(song.duration)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleFavorite(song.id)}
                      aria-label="Toggle favorite"
                      className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => onPlayNext(song)}
                      title="Play Next"
                      aria-label="Play Next"
                      className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Albums Grid View */}
      {activeTab === 'albums' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {albums.map((album) => (
            <GlassCard key={album.id} className="p-3 flex flex-col gap-2.5 group cursor-pointer hover:border-white/40">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-800 border border-white/15">
                {album.artworkUrl ? (
                  <img src={album.artworkUrl} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Disc3 className="w-12 h-12 text-white/40" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {album.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {album.artist}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-1">
                  <span>{album.trackCount} tracks</span>
                  <span>·</span>
                  <span>{formatTime(album.duration)}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Tab 3: Artists Grid View */}
      {activeTab === 'artists' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {artists.map((artist) => (
            <GlassCard key={artist.id} className="p-4 flex flex-col items-center text-center gap-3 cursor-pointer hover:border-white/40">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-800 border border-white/20 shadow-md">
                {artist.artworkUrl ? (
                  <img src={artist.artworkUrl} alt={artist.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white/50" />
                  </div>
                )}
              </div>
              <div className="w-full">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {artist.name}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {artist.trackCount} tracks in library
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Tab 4: Folders Grouping View */}
      {activeTab === 'folders' && (
        <div className="space-y-3">
          {folders.map(([folderPath, folderSongs]) => (
            <GlassCard key={folderPath} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5" style={{ color: effectiveAccent }} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                      {folderPath}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {folderSongs.length} audio tracks
                    </span>
                  </div>
                </div>

                <GlassButton
                  size="sm"
                  variant="glass"
                  onClick={() => onPlaySong(folderSongs[0])}
                  icon={<Play className="w-3.5 h-3.5" />}
                >
                  Play Folder
                </GlassButton>
              </div>

              <div className="divide-y divide-white/10 pt-1">
                {folderSongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => onPlaySong(song)}
                    className="py-2 flex items-center justify-between text-xs hover:text-indigo-400 cursor-pointer"
                  >
                    <span className="truncate pr-4 text-slate-700 dark:text-slate-300">
                      {song.title} — {song.artist}
                    </span>
                    <span className="font-mono text-slate-400 shrink-0">
                      {formatTime(song.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
