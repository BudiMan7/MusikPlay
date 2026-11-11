import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Sliders,
  Database,
  Info,
  ShieldCheck,
  RotateCcw,
  Gauge,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Check,
} from 'lucide-react';
import { GlassCard } from '../design/GlassCard';
import { GlassButton } from '../design/GlassButton';
import { GlassToggle } from '../design/GlassToggle';
import { GlassSlider } from '../design/GlassSlider';
import { useTheme } from '../context/ThemeContext';
import { DESIGN_TOKENS } from '../design/tokens';
import { audioEngine } from '../services/AudioEngine';

interface SettingsViewProps {
  totalSongs: number;
  totalPlaylists: number;
  volume: number;
  onVolumeChange: (val: number) => void;
  onResetLibrary: () => void;
  onOpenEqualizer: () => void;
  onOpenInstallModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  totalSongs,
  totalPlaylists,
  volume,
  onVolumeChange,
  onResetLibrary,
  onOpenEqualizer,
  onOpenInstallModal,
}) => {
  const {
    themeMode,
    setThemeMode,
    isDark,
    accentColor,
    setAccentColor,
    effectiveAccent,
  } = useTheme();

  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(1.0);
  const [gaplessPlayback, setGaplessPlayback] = useState<boolean>(true);
  const [surroundSound, setSurroundSound] = useState<boolean>(true);

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const handleSpeedSelect = (speed: number) => {
    setPlaybackSpeedState(speed);
    audioEngine.setPlaybackSpeed(speed);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" style={{ color: effectiveAccent }} />
          Settings & Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Customize Liquid Glass iOS 26 aesthetics, audio output, library storage, and engine parameters.
        </p>
      </div>

      {/* Quick PWA / APK Download Section */}
      {onOpenInstallModal && (
        <GlassCard className="p-4 sm:p-5 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-violet-950/30 to-purple-950/20 shadow-xl" variant="glow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Pasang ke HP & Unduh Paket APK
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Siap Pakai
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Install langsung sebagai WebAPK di HP tanpa komputer atau download full source Android Studio (.zip).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <GlassButton
                variant="primary"
                size="sm"
                className="w-full sm:w-auto text-xs font-semibold py-2 px-4 shadow-lg shadow-indigo-600/25"
                onClick={onOpenInstallModal}
              >
                Buka Opsi Pasang
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      )}

      {/* 1. Appearance Section */}
      <GlassCard className="space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <Palette className="w-4 h-4" style={{ color: effectiveAccent }} />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Appearance & Theme
          </h3>
        </div>

        {/* Theme mode buttons */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Interface Theme
          </label>
          <div className="grid grid-cols-3 gap-2.5 max-w-md">
            <button
              onClick={() => setThemeMode('dark')}
              className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                themeMode === 'dark'
                  ? 'border-indigo-400 bg-white/15 text-white font-semibold shadow-sm'
                  : 'border-white/10 text-slate-500 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Dark (#090A10)
            </button>
            <button
              onClick={() => setThemeMode('light')}
              className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                themeMode === 'light'
                  ? 'border-indigo-400 bg-black/10 text-slate-900 font-semibold shadow-sm'
                  : 'border-black/10 text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Light (#F4F5FA)
            </button>
            <button
              onClick={() => setThemeMode('system')}
              className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                themeMode === 'system'
                  ? 'border-indigo-400 bg-white/20 text-slate-900 dark:text-white font-semibold shadow-sm'
                  : 'border-white/10 text-slate-500'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              Follow System
            </button>
          </div>
        </div>

        {/* Accent Palette */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Specular Glass Accent Highlight
          </label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {DESIGN_TOKENS.accents.map((acc) => {
              const color = isDark ? acc.dark : acc.light;
              const isSelected = effectiveAccent.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={acc.name}
                  onClick={() => setAccentColor(color)}
                  aria-label={acc.name}
                  className={`w-8 h-8 rounded-full border-2 transition-all relative cursor-pointer ${
                    isSelected
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white mx-auto mt-2 shadow" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* 2. Audio Engine Settings */}
      <GlassCard className="space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <Sliders className="w-4 h-4" style={{ color: effectiveAccent }} />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Audio Engine & Playback Speed
          </h3>
        </div>

        {/* Playback speed selector */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Playback Speed
            </span>
            <span className="font-mono text-indigo-400 font-bold">{playbackSpeed}x</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {speedOptions.map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedSelect(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors ${
                  playbackSpeed === s
                    ? 'bg-white/20 text-white font-bold border border-white/30'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
                style={playbackSpeed === s ? { borderColor: effectiveAccent, color: effectiveAccent } : {}}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Master Output Volume */}
        <div className="space-y-1">
          <GlassSlider
            min={0}
            max={100}
            value={volume}
            onChange={onVolumeChange}
            label="Master Output Volume"
            displayValue={`${volume}%`}
          />
        </div>

        {/* Audio features */}
        <div className="space-y-1 pt-2 border-t border-white/10">
          <GlassToggle
            checked={gaplessPlayback}
            onChange={setGaplessPlayback}
            label="Gapless Playback"
            description="Eliminates silent gaps between queue tracks with continuous crossfade"
          />
          <GlassToggle
            checked={surroundSound}
            onChange={setSurroundSound}
            label="Stereo Soundstage Expansion"
            description="Broadens acoustics with studio stereo panner"
          />
        </div>
      </GlassCard>

      {/* 3. Storage & Library Maintenance */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <Database className="w-4 h-4" style={{ color: effectiveAccent }} />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Library & Storage Maintenance
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-mono text-slate-400">Indexed Tracks</span>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{totalSongs}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-mono text-slate-400">Playlists</span>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{totalPlaylists}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-mono text-slate-400">Storage Health</span>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">Optimized</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <GlassButton
            size="sm"
            variant="glass"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => {
              if (confirm('Reset library to default demo tracks and clear local imported files?')) {
                onResetLibrary();
              }
            }}
          >
            Reset Library & Clear Cache
          </GlassButton>
        </div>
      </GlassCard>

      {/* 4. Android Release & APK Build Guide (Phase 10) */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Android Gradle & APK Release Build
          </h3>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          The complete native Android project source files (<code className="text-indigo-400">/app</code>,{' '}
          <code className="text-indigo-400">build.gradle.kts</code>,{' '}
          <code className="text-indigo-400">settings.gradle.kts</code>,{' '}
          <code className="text-indigo-400">AndroidManifest.xml</code>) are pre-configured with Android Gradle Plugin 8.8,
          Kotlin 2.1, Jetpack Compose Material 3, Room 2.6.1, and AndroidX Media3 ExoPlayer 1.5.0.
        </p>

        <div className="p-3 rounded-xl bg-black/30 font-mono text-[11px] text-slate-300 space-y-1">
          <p className="text-slate-400"># To build release APK in Android Studio / CLI:</p>
          <p className="text-emerald-400">$ ./gradlew assembleRelease</p>
          <p className="text-slate-400"># Output APK artifact location:</p>
          <p className="text-slate-300">app/build/outputs/apk/release/app-release-unsigned.apk</p>
        </div>
      </GlassCard>
    </div>
  );
};
