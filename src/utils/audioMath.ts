/**
 * Pure audio & theme calculation utilities for Liquid Glass Music Player.
 */

export interface EqualizerBand {
  id: number;
  frequency: number;
  label: string;
  gain: number; // in dB, typically -12 to +12
}

export const DEFAULT_EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  Rock: [4.5, 3.5, 2.0, -1.0, -2.0, 1.0, 2.5, 4.0, 4.5, 5.0],
  Pop: [-1.0, 1.5, 3.0, 4.0, 3.5, 1.0, -1.0, -1.5, 2.0, 3.0],
  Classical: [4.0, 3.0, 2.0, 1.5, -1.0, -1.0, 0.0, 2.0, 3.0, 3.5],
  Jazz: [3.5, 2.5, 1.0, 2.0, -1.5, -1.5, 0.0, 1.5, 3.0, 3.5],
  Electronic: [5.0, 4.5, 2.0, 0.0, -2.0, 2.0, 1.5, 3.0, 4.5, 5.0],
  'Hip-Hop': [5.5, 4.5, 3.0, 1.0, -1.0, -1.0, 1.5, -1.0, 2.5, 3.5],
  Vocal: [-2.0, -2.5, -1.0, 2.0, 4.5, 4.5, 3.5, 1.5, 0.0, -1.5],
  Custom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

/**
 * Format frequency to readable label (e.g. 32Hz, 1kHz, 16kHz)
 */
export function formatFrequencyLabel(freq: number): string {
  if (freq >= 1000) {
    const k = freq / 1000;
    return Number.isInteger(k) ? `${k}kHz` : `${k.toFixed(1)}kHz`;
  }
  return `${freq}Hz`;
}

/**
 * Clamp gain between min and max dB
 */
export function clampGain(gain: number, minDb: number = -12, maxDb: number = 12): number {
  if (isNaN(gain)) return 0;
  return Math.min(Math.max(gain, minDb), maxDb);
}

/**
 * Convert decibels to linear amplitude multiplier
 */
export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Format playback time in seconds to mm:ss (or hh:mm:ss if >= 1 hour)
 */
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const padSecs = secs.toString().padStart(2, '0');

  if (hrs > 0) {
    const padMins = mins.toString().padStart(2, '0');
    return `${hrs}:${padMins}:${padSecs}`;
  }
  return `${mins}:${padSecs}`;
}

/**
 * Parse standard LRC format string into synchronized lyric cues
 */
export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export function parseLrc(lrcText: string): LyricLine[] {
  if (!lrcText) return [];
  const lines = lrcText.split(/\r?\n/);
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
  const result: LyricLine[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let match: RegExpExecArray | null;
    const timestamps: number[] = [];

    while ((match = timeRegex.exec(trimmed)) !== null) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const millisStr = match[3] || '0';
      const millis = parseInt(millisStr.padEnd(3, '0').slice(0, 3), 10);
      const time = mins * 60 + secs + millis / 1000;
      timestamps.push(time);
    }

    const cleanText = trimmed.replace(timeRegex, '').trim();
    if (cleanText) {
      for (const t of timestamps) {
        result.push({ time: t, text: cleanText });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

/**
 * Find active lyric index given current playback timestamp
 */
export function getActiveLyricIndex(lyrics: LyricLine[], currentTime: number): number {
  if (!lyrics.length) return -1;
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }
  return activeIndex;
}

/**
 * Shuffle an array without mutating the original
 */
export function shuffleArray<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
