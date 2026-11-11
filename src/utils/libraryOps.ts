import { Song, RepeatMode } from '../types/music';

/**
 * Filter songs matching search query across title, artist, album, genre, folder
 */
export function filterSongs(songs: Song[], query: string): Song[] {
  if (!query || !query.trim()) return songs;
  const q = query.toLowerCase().trim();
  return songs.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.album.toLowerCase().includes(q) ||
      (s.genre && s.genre.toLowerCase().includes(q)) ||
      (s.folder && s.folder.toLowerCase().includes(q))
  );
}

export type SortField = 'title' | 'artist' | 'album' | 'duration' | 'dateAdded';
export type SortOrder = 'asc' | 'desc';

/**
 * Sort songs by field and order
 */
export function sortSongs(songs: Song[], field: SortField, order: SortOrder = 'asc'): Song[] {
  const sorted = [...songs].sort((a, b) => {
    let cmp = 0;
    if (field === 'title') cmp = a.title.localeCompare(b.title);
    else if (field === 'artist') cmp = a.artist.localeCompare(b.artist);
    else if (field === 'album') cmp = a.album.localeCompare(b.album);
    else if (field === 'duration') cmp = a.duration - b.duration;
    else if (field === 'dateAdded') cmp = a.dateAdded - b.dateAdded;
    return order === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

/**
 * Calculate the next track index in queue given current index, shuffle, and repeat mode
 */
export function getNextQueueIndex(
  currentIndex: number,
  queueLength: number,
  repeatMode: RepeatMode,
  isManualUserNext: boolean = false
): number {
  if (queueLength === 0) return -1;
  if (repeatMode === 'one' && !isManualUserNext) {
    return currentIndex;
  }
  if (currentIndex < queueLength - 1) {
    return currentIndex + 1;
  }
  if (repeatMode === 'all') {
    return 0;
  }
  return -1; // playback stops at end of queue if repeat is 'off'
}

/**
 * Calculate the previous track index in queue
 */
export function getPreviousQueueIndex(
  currentIndex: number,
  queueLength: number,
  currentTime: number,
  seekThresholdSeconds: number = 3
): { index: number; shouldRestartCurrent: boolean } {
  if (queueLength === 0) return { index: -1, shouldRestartCurrent: false };
  // If user has listened to more than 3 seconds, previous restarts the current track first
  if (currentTime > seekThresholdSeconds) {
    return { index: currentIndex, shouldRestartCurrent: true };
  }
  if (currentIndex > 0) {
    return { index: currentIndex - 1, shouldRestartCurrent: false };
  }
  // If at start, loop to end if there are tracks
  return { index: queueLength - 1, shouldRestartCurrent: false };
}

/**
 * Add a song to queue right after the currently playing song
 */
export function playSongNext(queue: Song[], currentIndex: number, songToPlay: Song): Song[] {
  const newQueue = [...queue];
  // Remove if already in queue to avoid duplicates
  const existingIdx = newQueue.findIndex((s) => s.id === songToPlay.id);
  if (existingIdx !== -1) {
    newQueue.splice(existingIdx, 1);
  }
  const insertIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
  newQueue.splice(insertIndex, 0, songToPlay);
  return newQueue;
}

/**
 * Reorder an item in queue from startIndex to endIndex
 */
export function reorderQueue(queue: Song[], fromIndex: number, toIndex: number): Song[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= queue.length || toIndex >= queue.length) {
    return queue;
  }
  const result = [...queue];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Check if a hex color has sufficient luminance for dark mode or light mode
 */
export function getRelativeLuminance(hexColor: string): number {
  const cleanHex = hexColor.replace('#', '');
  if (cleanHex.length !== 6) return 0.5;
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}
