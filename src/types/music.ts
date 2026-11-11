export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  audioUrl: string;
  artworkUrl?: string;
  genre?: string;
  folder?: string;
  lyrics?: string; // LRC formatted string
  isFavorite: boolean;
  playCount: number;
  dateAdded: number; // timestamp
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  trackCount: number;
  duration: number;
  year?: number;
}

export interface Artist {
  id: string;
  name: string;
  artworkUrl?: string;
  trackCount: number;
  albumCount: number;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  artworkUrl?: string;
  songIds: string[];
  createdAt: number;
  isSmart?: boolean;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlaybackState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  volume: number;
  queue: Song[];
  queueIndex: number;
}
