import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Music2,
  Home,
  ListMusic,
  Settings as SettingsIcon,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Sparkles,
  Layers,
  Smartphone,
  CheckCircle2,
  Sun,
  Moon,
  Laptop,
  Palette,
  ShieldCheck,
  Cpu,
  Radio,
  Heart,
  Upload,
  Mic2,
  Disc3,
  ListPlus,
  Plus,
} from 'lucide-react';
import { ThemeProvider, useTheme, ThemeMode } from './context/ThemeContext';
import { DESIGN_TOKENS } from './design/tokens';
import { GlassCard } from './design/GlassCard';
import { GlassButton } from './design/GlassButton';
import { GlassIconButton } from './design/GlassIconButton';
import { GlassSlider } from './design/GlassSlider';
import { GlassToggle } from './design/GlassToggle';
import { GlassPresetCard } from './design/GlassPresetCard';
import { GlassBottomBar } from './design/GlassBottomBar';
import { GlassMiniPlayer } from './design/GlassMiniPlayer';
import { EQ_PRESETS, DEFAULT_EQ_FREQUENCIES, formatFrequencyLabel, formatTime } from './utils/audioMath';
import { Song, Playlist, RepeatMode } from './types/music';
import { StorageService } from './services/StorageService';
import { audioEngine } from './services/AudioEngine';
import { extractDominantColor } from './services/ColorExtractor';
import {
  getNextQueueIndex,
  getPreviousQueueIndex,
  playSongNext,
  reorderQueue,
} from './utils/libraryOps';
import { shuffleArray } from './utils/audioMath';
import { LibraryView } from './components/LibraryView';
import { NowPlayingView } from './components/NowPlayingView';
import { QueueSheet } from './components/QueueSheet';
import { LyricsModal } from './components/LyricsModal';
import { EqualizerView } from './components/EqualizerView';
import { PlaylistsView } from './components/PlaylistsView';
import { SettingsView } from './components/SettingsView';
import { extractAudioFileMetadata } from './services/MetadataParser';
import { InstallModal } from './components/InstallModal';
import { PWAInstallButton } from './components/PWAInstallButton';

function MainApp() {
  const {
    themeMode,
    setThemeMode,
    isDark,
    accentColor,
    setAccentColor,
    setDynamicArtworkColor,
    effectiveAccent,
  } = useTheme();

  // Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'equalizer' | 'playlists' | 'settings'>('home');

  // Library & Playback State
  const [songs, setSongs] = useState<Song[]>(() => StorageService.getSongs());
  const [playlists, setPlaylists] = useState<Playlist[]>(() => StorageService.getPlaylists());
  const [queue, setQueue] = useState<Song[]>(() => StorageService.getSongs());
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(214);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [volume, setVolume] = useState<number>(85);

  // Equalizer State
  const [selectedPreset, setSelectedPreset] = useState<string>('Rock');
  const [eqGains, setEqGains] = useState<number[]>(EQ_PRESETS['Rock']);
  const [bassBoost, setBassBoost] = useState<number>(40);
  const [trebleBoost, setTrebleBoost] = useState<number>(2);
  const [stereoBalance, setStereoBalance] = useState<number>(0);
  const [surroundSound, setSurroundSound] = useState<boolean>(true);
  const [gaplessPlayback, setGaplessPlayback] = useState<boolean>(true);

  // Modals & Sheets
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  const currentSong: Song | null = queue[queueIndex] || songs[0] || null;

  // Subscribe to AudioEngine playback position & completion
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setCurrentTime(state.currentTime);
      if (state.duration > 0) {
        setDuration(state.duration);
      }
    });

    audioEngine.setOnTrackEnded(() => {
      handleNext(false);
    });

    return () => unsubscribe();
  }, [queue, queueIndex, repeatMode, shuffle]);

  // Extract dynamic artwork dominant color when song changes
  useEffect(() => {
    if (currentSong?.artworkUrl) {
      extractDominantColor(currentSong.artworkUrl).then((color) => {
        if (color) {
          setDynamicArtworkColor(color);
        }
      });
    }
  }, [currentSong?.artworkUrl, setDynamicArtworkColor]);

  // Register MediaSession lockscreen handlers
  useEffect(() => {
    audioEngine.registerMediaSessionHandlers({
      onPlay: () => handlePlayPause(),
      onPause: () => handlePlayPause(),
      onNext: () => handleNext(true),
      onPrevious: () => handlePrevious(),
      onSeek: (time) => handleSeek(time),
    });
  }, [queue, queueIndex, isPlaying, currentTime]);

  // Playback Handlers
  const handlePlaySong = (song: Song) => {
    let newIndex = queue.findIndex((s) => s.id === song.id);
    if (newIndex === -1) {
      const updatedQueue = [song, ...queue];
      setQueue(updatedQueue);
      newIndex = 0;
    }
    setQueueIndex(newIndex);
    audioEngine.playSong(song, 0);
  };

  const handlePlayPause = () => {
    if (!currentSong) return;
    if (isPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.resume();
    }
  };

  const handleNext = (isManual: boolean = true) => {
    const nextIdx = getNextQueueIndex(queueIndex, queue.length, repeatMode, isManual);
    if (nextIdx !== -1 && queue[nextIdx]) {
      setQueueIndex(nextIdx);
      audioEngine.playSong(queue[nextIdx], 0);
    } else {
      audioEngine.pause();
    }
  };

  const handlePrevious = () => {
    const { index, shouldRestartCurrent } = getPreviousQueueIndex(
      queueIndex,
      queue.length,
      currentTime,
      3
    );
    if (shouldRestartCurrent) {
      audioEngine.seek(0);
    } else if (index !== -1 && queue[index]) {
      setQueueIndex(index);
      audioEngine.playSong(queue[index], 0);
    }
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  };

  const handleToggleShuffle = () => {
    const newShuffle = !shuffle;
    setShuffle(newShuffle);
    if (newShuffle && currentSong) {
      const remaining = queue.filter((s) => s.id !== currentSong.id);
      const shuffled = [currentSong, ...shuffleArray(remaining)];
      setQueue(shuffled);
      setQueueIndex(0);
    } else {
      setQueue([...songs]);
      if (currentSong) {
        const originalIdx = songs.findIndex((s) => s.id === currentSong.id);
        setQueueIndex(originalIdx !== -1 ? originalIdx : 0);
      }
    }
  };

  const handleCycleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const handleToggleFavorite = (songId: string) => {
    const updatedSongs = songs.map((s) =>
      s.id === songId ? { ...s, isFavorite: !s.isFavorite } : s
    );
    setSongs(updatedSongs);
    StorageService.saveSongs(updatedSongs);

    // Also update in queue
    setQueue((prev) =>
      prev.map((s) => (s.id === songId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  const handlePlayNext = (song: Song) => {
    const updatedQueue = playSongNext(queue, queueIndex, song);
    setQueue(updatedQueue);
  };

  const handleAddToQueue = (song: Song) => {
    setQueue((prev) => [...prev, song]);
  };

  const handleImportFiles = async (files: FileList) => {
    const imported: Song[] = [];
    const lrcMap = new Map<string, string>();

    // Pass 1: Collect any companion .lrc text files in the selection
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.toLowerCase().endsWith('.lrc')) {
        try {
          const lrcText = await file.text();
          const baseName = file.name.replace(/\.lrc$/i, '').toLowerCase();
          lrcMap.set(baseName, lrcText);
        } catch {}
      }
    }

    // Pass 2: Parse audio files, ID3 tags, embedded cover art, and lyrics
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.toLowerCase().endsWith('.lrc')) continue;

      const objectUrl = URL.createObjectURL(file);
      const parsedMeta = await extractAudioFileMetadata(file);

      const baseName = file.name.replace(/\.[^/.]+$/, '').toLowerCase();
      const companionLyrics = lrcMap.get(baseName);
      const finalLyrics = companionLyrics || parsedMeta.lyrics;

      imported.push({
        id: `local-${Date.now()}-${i}`,
        title: parsedMeta.title || file.name.replace(/\.[^/.]+$/, ''),
        artist: parsedMeta.artist || 'Local Artist',
        album: parsedMeta.album || 'Local Storage',
        duration: parsedMeta.duration || 210,
        audioUrl: objectUrl,
        artworkUrl: parsedMeta.artworkUrl,
        folder: '/Storage/Imported',
        genre: parsedMeta.genre || 'Local Audio',
        lyrics: finalLyrics,
        isFavorite: false,
        playCount: 0,
        dateAdded: Date.now(),
      });
    }

    if (imported.length > 0) {
      const updatedList = [...imported, ...songs];
      setSongs(updatedList);
      StorageService.saveSongs(updatedList);
      setQueue((prev) => [...imported, ...prev]);
      handlePlaySong(imported[0]);
    }
  };

  // Equalizer Handlers
  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    if (EQ_PRESETS[preset]) {
      const gains = [...EQ_PRESETS[preset]];
      setEqGains(gains);
      audioEngine.setAllBands(gains);
    }
  };

  const handleGainChange = (bandIndex: number, gain: number) => {
    const updated = [...eqGains];
    updated[bandIndex] = gain;
    setEqGains(updated);
    setSelectedPreset('Custom');
    audioEngine.setBandGain(bandIndex, gain);
  };

  const handleBassChange = (val: number) => {
    setBassBoost(val);
    audioEngine.setBassBoost(val);
  };

  const handleTrebleChange = (val: number) => {
    setTrebleBoost(val);
    audioEngine.setTrebleTone(val);
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    audioEngine.setVolume(val / 100);
  };

  return (
    <div className="min-h-screen pb-56 transition-colors duration-300">
      {/* Dynamic Background Mesh with Specular Ambient Highlights */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[110px] opacity-40 transition-all duration-700"
          style={{ backgroundColor: effectiveAccent }}
        />
        <div
          className="absolute top-1/2 -right-32 w-80 h-80 rounded-full blur-[120px] opacity-30 transition-all duration-700"
          style={{ backgroundColor: effectiveAccent }}
        />
        <div
          className="absolute bottom-10 left-1/3 w-72 h-72 rounded-full blur-[100px] opacity-20 transition-all duration-700"
          style={{ backgroundColor: isDark ? '#292C3A' : '#E5E7F0' }}
        />
      </div>

      {/* Top Bar - Zone 1: Wordmark, Zone 2: Navigation Links, Zone 3: CTA */}
      <header className="sticky top-0 z-30 px-6 py-4 backdrop-blur-xl border-b border-white/10 dark:border-white/5 flex items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg border border-white/30"
            style={{ backgroundColor: effectiveAccent }}
          >
            <Music2 className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Liquid Glass
            </span>
            <span className="ml-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300">
              iOS 26
            </span>
          </div>
        </div>

        {/* Mid bar stats / pills */}
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <span>Phases 1–4 Complete</span>
          <span aria-hidden="true">·</span>
          <span>{songs.length} Library Tracks</span>
          <span aria-hidden="true">·</span>
          <span>MediaSession & ExoPlayer Ready</span>
        </div>

        {/* Right CTA & Theme Quick Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
            <button
              onClick={() => setThemeMode('dark')}
              aria-label="Dark Mode"
              className={`p-1.5 rounded-full transition-all ${
                themeMode === 'dark'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setThemeMode('light')}
              aria-label="Light Mode"
              className={`p-1.5 rounded-full transition-all ${
                themeMode === 'light'
                  ? 'bg-black/10 text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setThemeMode('system')}
              aria-label="System Theme"
              className={`p-1.5 rounded-full transition-all ${
                themeMode === 'system'
                  ? 'bg-black/10 dark:bg-white/20 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
          </div>

          <PWAInstallButton onOpenModal={() => setShowInstallModal(true)} />

          <GlassButton
            size="sm"
            variant="glass"
            onClick={() => setShowArchitectureModal(true)}
            icon={<Cpu className="w-3.5 h-3.5" />}
          >
            Android Architecture
          </GlassButton>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* TAB 1: HOME DASHBOARD */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Hero Banner */}
            <section className="relative overflow-hidden rounded-[28px] p-6 sm:p-8 liquid-glass border border-white/30 dark:border-white/10 shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/20 dark:bg-white/10 border border-white/20 mb-4 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: effectiveAccent }} />
                  <span>Apple iOS 26 Liquid Glass Music Player</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  High-Fidelity Audio Architecture with Translucent Frosted Glass
                </h1>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Phases 1, 2, 3, and 4 are fully integrated: Local Music Library with instant search,
                  Web Audio + ExoPlayer background engine, full-screen Now Playing modal with ambient artwork
                  glow, and 10-band precision equalizer.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <GlassButton
                    variant="primary"
                    onClick={() => {
                      if (currentSong) handlePlaySong(currentSong);
                      setIsNowPlayingOpen(true);
                    }}
                    icon={<Play className="w-4 h-4 fill-current ml-0.5" />}
                  >
                    Open Now Playing
                  </GlassButton>
                  <GlassButton
                    variant="glass"
                    onClick={() => setActiveTab('library')}
                    icon={<Music2 className="w-4 h-4" />}
                  >
                    Browse Library ({songs.length})
                  </GlassButton>
                </div>
              </div>

              {/* Frosted Rotating Visual Asset */}
              <div className="hidden lg:block absolute -right-6 -bottom-6 w-72 h-72 rounded-full border border-white/20 liquid-glass opacity-70 pointer-events-none p-6">
                <div
                  className="w-full h-full rounded-full border border-dashed border-white/30 flex items-center justify-center animate-spin"
                  style={{ animationDuration: '30s' }}
                >
                  <Radio className="w-12 h-12 text-white/50" />
                </div>
              </div>
            </section>

            {/* Quick Metrics Bar */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <GlassCard variant="subtle" className="p-4 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Songs</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{songs.length}</p>
              </GlassCard>
              <GlassCard variant="subtle" className="p-4 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Favorites</span>
                <p className="text-xl font-extrabold text-rose-500 mt-1">
                  {songs.filter((s) => s.isFavorite).length}
                </p>
              </GlassCard>
              <GlassCard variant="subtle" className="p-4 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Audio Engine</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">10-Band EQ</p>
              </GlassCard>
              <GlassCard variant="subtle" className="p-4 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Background Svc</span>
                <p className="text-xl font-extrabold text-emerald-500 mt-1">Active</p>
              </GlassCard>
            </section>

            {/* Recently Played / Featured Tracks */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Featured Audio Tracks</h3>
                <button
                  onClick={() => setActiveTab('library')}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: effectiveAccent }}
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {songs.slice(0, 4).map((song) => (
                  <div
                    key={song.id}
                    onClick={() => handlePlaySong(song)}
                    className="flex items-center gap-3.5 p-3 rounded-2xl liquid-glass-subtle hover:border-white/40 cursor-pointer transition-all select-none border border-white/10 group"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800 border border-white/20">
                      {song.artworkUrl ? (
                        <img src={song.artworkUrl} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music2 className="w-5 h-5 text-white/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {song.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {song.artist} · {song.album}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-400 pr-1">
                      {formatTime(song.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: LIBRARY VIEW */}
        {activeTab === 'library' && (
          <LibraryView
            songs={songs}
            onPlaySong={handlePlaySong}
            onPlayNext={handlePlayNext}
            onAddToQueue={handleAddToQueue}
            onToggleFavorite={handleToggleFavorite}
            onImportFiles={handleImportFiles}
            currentSongId={currentSong?.id}
            isPlaying={isPlaying}
          />
        )}

        {/* TAB 3: EQUALIZER VIEW (Phase 5 & 7) */}
        {activeTab === 'equalizer' && (
          <EqualizerView
            eqGains={eqGains}
            selectedPreset={selectedPreset}
            bassBoost={bassBoost}
            trebleBoost={trebleBoost}
            stereoBalance={stereoBalance}
            onPresetSelect={handlePresetSelect}
            onGainChange={handleGainChange}
            onBassChange={handleBassChange}
            onTrebleChange={handleTrebleChange}
            onBalanceChange={(v) => {
              setStereoBalance(v);
              audioEngine.setStereoBalance(v);
            }}
            onReset={() => {
              handlePresetSelect('Flat');
              handleBassChange(0);
              handleTrebleChange(0);
              setStereoBalance(0);
              audioEngine.setStereoBalance(0);
            }}
          />
        )}

        {/* TAB 4: PLAYLISTS VIEW (Phase 6) */}
        {activeTab === 'playlists' && (
          <PlaylistsView
            playlists={playlists}
            songs={songs}
            onPlayPlaylist={(playlistSongs) => {
              if (playlistSongs.length > 0) {
                setQueue(playlistSongs);
                handlePlaySong(playlistSongs[0]);
              }
            }}
            onUpdatePlaylists={(updated) => {
              setPlaylists(updated);
              StorageService.savePlaylists(updated);
            }}
          />
        )}

        {/* TAB 5: SETTINGS VIEW (Phase 8 & 10) */}
        {activeTab === 'settings' && (
          <SettingsView
            totalSongs={songs.length}
            totalPlaylists={playlists.length}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            onResetLibrary={() => {
              const defaultSongs = StorageService.getSongs();
              setSongs(defaultSongs);
              StorageService.saveSongs(defaultSongs);
              setQueue(defaultSongs);
              setQueueIndex(0);
              if (defaultSongs[0]) {
                audioEngine.playSong(defaultSongs[0], 0);
              }
            }}
            onOpenEqualizer={() => setActiveTab('equalizer')}
            onOpenInstallModal={() => setShowInstallModal(true)}
          />
        )}
      </main>

      {/* Floating Mini Player (Permanent above nav bar) */}
      <GlassMiniPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlayPause={(e) => {
          e.stopPropagation();
          handlePlayPause();
        }}
        onNext={(e) => {
          e.stopPropagation();
          handleNext(true);
        }}
        onExpand={() => setIsNowPlayingOpen(true)}
      />

      {/* Floating Liquid Glass Bottom Navigation Bar */}
      <GlassBottomBar>
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            activeTab === 'home'
              ? 'text-slate-900 dark:text-white scale-105'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
          style={activeTab === 'home' ? { color: effectiveAccent } : {}}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            activeTab === 'library'
              ? 'text-slate-900 dark:text-white scale-105'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
          style={activeTab === 'library' ? { color: effectiveAccent } : {}}
        >
          <Music2 className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Library</span>
        </button>

        <button
          onClick={() => setActiveTab('equalizer')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            activeTab === 'equalizer'
              ? 'text-slate-900 dark:text-white scale-105'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
          style={activeTab === 'equalizer' ? { color: effectiveAccent } : {}}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Equalizer</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            activeTab === 'playlists'
              ? 'text-slate-900 dark:text-white scale-105'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
          style={activeTab === 'playlists' ? { color: effectiveAccent } : {}}
        >
          <ListMusic className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Playlists</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            activeTab === 'settings'
              ? 'text-slate-900 dark:text-white scale-105'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
          style={activeTab === 'settings' ? { color: effectiveAccent } : {}}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Settings</span>
        </button>
      </GlassBottomBar>

      {/* Full-Screen Now Playing View (Phase 4) */}
      <NowPlayingView
        isOpen={isNowPlayingOpen}
        onClose={() => setIsNowPlayingOpen(false)}
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        shuffle={shuffle}
        repeatMode={repeatMode}
        onPlayPause={handlePlayPause}
        onNext={() => handleNext(true)}
        onPrevious={handlePrevious}
        onSeek={handleSeek}
        onToggleShuffle={handleToggleShuffle}
        onCycleRepeat={handleCycleRepeat}
        onToggleFavorite={() => currentSong && handleToggleFavorite(currentSong.id)}
        onOpenQueue={() => setIsQueueOpen(true)}
        onOpenEqualizer={() => {
          setIsNowPlayingOpen(false);
          setActiveTab('equalizer');
        }}
        onOpenLyrics={() => setIsLyricsOpen(true)}
      />

      {/* Queue Sheet (Phase 3) */}
      <QueueSheet
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        queue={queue}
        currentIndex={queueIndex}
        onSelectTrack={(idx) => {
          setQueueIndex(idx);
          if (queue[idx]) audioEngine.playSong(queue[idx], 0);
          setIsQueueOpen(false);
        }}
        onRemoveTrack={(idx) => {
          const updated = queue.filter((_, i) => i !== idx);
          setQueue(updated);
          if (idx < queueIndex) {
            setQueueIndex(queueIndex - 1);
          }
        }}
        onMoveTrack={(from, to) => {
          const updated = reorderQueue(queue, from, to);
          setQueue(updated);
          if (from === queueIndex) setQueueIndex(to);
        }}
        onClearQueue={() => {
          if (currentSong) {
            setQueue([currentSong]);
            setQueueIndex(0);
          }
        }}
      />

      {/* Synced Lyrics Modal (Phase 6) */}
      <LyricsModal
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
        song={currentSong}
        currentTime={currentTime}
        onImportLyrics={(songId, lrcText) => {
          const updated = songs.map((s) => (s.id === songId ? { ...s, lyrics: lrcText } : s));
          setSongs(updated);
          StorageService.saveSongs(updated);
          setQueue((prev) => prev.map((s) => (s.id === songId ? { ...s, lyrics: lrcText } : s)));
        }}
      />

      {/* Android Architecture Modal */}
      {showArchitectureModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <div className="liquid-glass rounded-[28px] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 border border-white/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Phases 1–4 Technical Architecture
                </h3>
              </div>
              <button
                onClick={() => setShowArchitectureModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-black/10 dark:bg-white/5 border border-white/10">
                <h4 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Phase 2: MediaStore Audio Scanner & Room DB
                </h4>
                <p className="mt-1">
                  Android MediaStore cursor scanning titles, artists, albums, duration, and content URIs with Room entities
                  and DAOs. In the Web preview, native file input supports drag-and-drop import and local object URLs.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/10 dark:bg-white/5 border border-white/10">
                <h4 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  Phase 3: MediaSessionService & Web Audio Engine
                </h4>
                <p className="mt-1">
                  ExoPlayer with audio focus and background foreground service, mirrored in web via Web Audio API and
                  <code className="text-indigo-400">navigator.mediaSession</code> with lockscreen controls.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/10 dark:bg-white/5 border border-white/10">
                <h4 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Phase 4: Now Playing Immersive Screen & Dynamic Palette
                </h4>
                <p className="mt-1">
                  Full-screen immersive view with dynamic ambient blurred background sampled from album art, seeking timeline,
                  vinyl animations, and shortcuts to EQ and synchronized lyrics.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <GlassButton size="sm" variant="primary" onClick={() => setShowArchitectureModal(false)}>
                Close
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      {/* PWA & APK Install/Download Modal */}
      <InstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
