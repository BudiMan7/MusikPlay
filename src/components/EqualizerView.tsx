import React, { useState } from 'react';
import { Sliders, RotateCcw, BookmarkPlus, Zap, Volume2 } from 'lucide-react';
import { GlassCard } from '../design/GlassCard';
import { GlassSlider } from '../design/GlassSlider';
import { GlassToggle } from '../design/GlassToggle';
import { GlassButton } from '../design/GlassButton';
import { GlassPresetCard } from '../design/GlassPresetCard';
import { AudioVisualizer } from './AudioVisualizer';
import { useTheme } from '../context/ThemeContext';
import {
  EQ_PRESETS,
  DEFAULT_EQ_FREQUENCIES,
  formatFrequencyLabel,
} from '../utils/audioMath';

interface EqualizerViewProps {
  eqGains: number[];
  selectedPreset: string;
  bassBoost: number;
  trebleBoost: number;
  stereoBalance: number;
  onPresetSelect: (preset: string) => void;
  onGainChange: (bandIndex: number, gain: number) => void;
  onBassChange: (val: number) => void;
  onTrebleChange: (val: number) => void;
  onBalanceChange: (val: number) => void;
  onReset: () => void;
}

export const EqualizerView: React.FC<EqualizerViewProps> = ({
  eqGains,
  selectedPreset,
  bassBoost,
  trebleBoost,
  stereoBalance,
  onPresetSelect,
  onGainChange,
  onBassChange,
  onTrebleChange,
  onBalanceChange,
  onReset,
}) => {
  const { effectiveAccent, isDark } = useTheme();
  const [eqEnabled, setEqEnabled] = useState(true);
  const [loudness, setLoudness] = useState(true);
  const [customPresets, setCustomPresets] = useState<Record<string, number[]>>(() => {
    try {
      const saved = localStorage.getItem('liquid_glass_custom_presets');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleSaveCustomPreset = () => {
    const name = prompt('Enter custom preset name:');
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    const updated = { ...customPresets, [cleanName]: [...eqGains] };
    setCustomPresets(updated);
    localStorage.setItem('liquid_glass_custom_presets', JSON.stringify(updated));
    onPresetSelect(cleanName);
  };

  const allPresets = { ...EQ_PRESETS, ...customPresets };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5" style={{ color: effectiveAccent }} />
            10-Band Poweramp Equalizer & DSP
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active multi-band biquad peaking filters with real-time frequency visualizer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton
            size="sm"
            variant="glass"
            icon={<BookmarkPlus className="w-4 h-4" />}
            onClick={handleSaveCustomPreset}
          >
            Save Preset
          </GlassButton>
          <GlassButton
            size="sm"
            variant="glass"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={onReset}
          >
            Reset
          </GlassButton>
        </div>
      </div>

      {/* Real-Time Audio Visualizer (Phase 7) */}
      <GlassCard className="p-3.5 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Real-Time Audio Spectrum Analyzer
          </span>
          <span className="text-[10px] font-mono text-emerald-500 font-semibold uppercase">
            Live 60 FPS
          </span>
        </div>
        <AudioVisualizer />
      </GlassCard>

      {/* Equalizer Controls */}
      <GlassCard className="space-y-6">
        {/* EQ Enable switch & Preset title */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Master Equalizer
            </span>
            <GlassToggle
              checked={eqEnabled}
              onChange={setEqEnabled}
              aria-label="Master Equalizer Toggle"
            />
          </div>

          <div className="text-xs font-mono text-slate-500">
            Current: <strong className="text-slate-800 dark:text-slate-200">{selectedPreset}</strong>
          </div>
        </div>

        {/* Presets Horizontal Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {Object.keys(allPresets).map((preset) => (
            <GlassPresetCard
              key={preset}
              title={preset}
              isSelected={selectedPreset === preset}
              onClick={() => {
                if (allPresets[preset]) {
                  allPresets[preset].forEach((g, idx) => onGainChange(idx, g));
                  onPresetSelect(preset);
                }
              }}
            />
          ))}
        </div>

        {/* 10 Vertical Sliders */}
        <div
          className={`grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-4 py-4 px-2 bg-black/5 dark:bg-black/20 rounded-2xl border border-white/10 transition-opacity duration-200 ${
            eqEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
          }`}
        >
          {DEFAULT_EQ_FREQUENCIES.map((freq, idx) => {
            const gain = eqGains[idx] || 0;
            return (
              <GlassSlider
                key={freq}
                vertical
                min={-12}
                max={12}
                step={0.5}
                value={gain}
                onChange={(val) => onGainChange(idx, val)}
                label={formatFrequencyLabel(freq)}
                displayValue={`${gain > 0 ? '+' : ''}${gain.toFixed(1)}dB`}
              />
            );
          })}
        </div>

        {/* Extra Poweramp DSP Effects: Bass, Treble, Stereo Balance, Loudness */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-white/10">
          <GlassSlider
            min={0}
            max={100}
            value={bassBoost}
            onChange={onBassChange}
            label="Bass Enhancement"
            displayValue={`${bassBoost}%`}
          />
          <GlassSlider
            min={-10}
            max={10}
            step={0.5}
            value={trebleBoost}
            onChange={onTrebleChange}
            label="Treble Tone"
            displayValue={`${trebleBoost > 0 ? '+' : ''}${trebleBoost.toFixed(1)}dB`}
          />
          <GlassSlider
            min={-1}
            max={1}
            step={0.1}
            value={stereoBalance}
            onChange={onBalanceChange}
            label="Stereo Balance"
            displayValue={
              stereoBalance === 0
                ? 'Center'
                : stereoBalance < 0
                ? `L ${Math.abs(stereoBalance).toFixed(1)}`
                : `R ${stereoBalance.toFixed(1)}`
            }
          />
          <div className="flex items-center">
            <GlassToggle
              checked={loudness}
              onChange={setLoudness}
              label="Loudness Processing"
              description="Dynamics peak limiter"
              className="w-full"
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
