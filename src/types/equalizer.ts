export interface EqualizerBand {
  id: number;
  frequency: number;
  label: string;
  gain: number; // in dB (-12 to +12)
}

export type PresetName =
  | 'Flat'
  | 'Rock'
  | 'Pop'
  | 'Classical'
  | 'Jazz'
  | 'Electronic'
  | 'Hip-Hop'
  | 'Vocal'
  | 'Custom';

export type VisualizerMode = 'bars' | 'waveform' | 'circular';

export interface EqualizerState {
  enabled: boolean;
  preset: PresetName;
  bands: EqualizerBand[];
  bassBoost: number; // 0 to 100
  treble: number; // -10 to +10 dB
  stereoBalance: number; // -1 (left) to 1 (right)
  virtualizer: number; // 0 to 100
  loudness: boolean;
}
