import { Song, Playlist } from '../types/music';

const STORAGE_KEY_SONGS = 'liquid_glass_songs_library';
const STORAGE_KEY_FAVORITES = 'liquid_glass_favorites';
const STORAGE_KEY_PLAYLISTS = 'liquid_glass_playlists';
const STORAGE_KEY_LAST_SONG_ID = 'liquid_glass_last_song_id';
const STORAGE_KEY_LAST_POSITION = 'liquid_glass_last_position';

export const INITIAL_DEMO_SONGS: Song[] = [
  {
    id: 'track-1',
    title: 'Liquid Serenade',
    artist: 'Aetherial Soundscape',
    album: 'Poweramp Audio Lab Vol. 1',
    duration: 198,
    audioUrl: '', // uses audio engine procedural synthesizer if no file uploaded
    artworkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    genre: 'Ambient Electronic',
    folder: '/Music/Ambient',
    isFavorite: true,
    playCount: 48,
    dateAdded: Date.now() - 86400000 * 5,
    lyrics: `[00:04.00]Floating on translucent liquid glass
[00:12.50]Subtle reflections under ambient lights
[00:22.00]Bass frequencies resonate in deep space
[00:34.20]High fidelity soundstage expanding wide
[00:48.00]Feel the warmth of analog harmonics
[01:02.50]Clear stereo separation breathing free
[01:18.00]Pure audio clarity in every spectrum band
[01:36.00]Echoes dissolving into frosted velvet`,
  },
  {
    id: 'track-2',
    title: 'Cyberpunk Neon Drive',
    artist: 'Vektor Pulse',
    album: 'Hyperdrive 2099',
    duration: 224,
    audioUrl: '',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    genre: 'Synthwave',
    folder: '/Music/Synthwave',
    isFavorite: false,
    playCount: 32,
    dateAdded: Date.now() - 86400000 * 3,
    lyrics: `[00:05.10]Racing through neon corridors at night
[00:15.00]Analog synthesizers roaring at maximum drive
[00:28.40]Sub-bass shaking the carbon chassis
[00:42.00]Laser horizons fading in the rear view
[00:58.20]Accelerate beyond the digital grid`,
  },
  {
    id: 'track-3',
    title: 'Midnight Velvet Bloom',
    artist: 'Aurora Solitude',
    album: 'Nocturnal Echoes',
    duration: 172,
    audioUrl: '',
    artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    genre: 'Lo-Fi Chill',
    folder: '/Music/LoFi',
    isFavorite: true,
    playCount: 77,
    dateAdded: Date.now() - 86400000 * 2,
    lyrics: `[00:06.00]Soft vinyl static in the evening breeze
[00:18.30]Gentle electric piano chords drifting away
[00:32.00]Raindrops whispering on glass windows
[00:46.50]Quiet moments suspended in time`,
  },
  {
    id: 'track-4',
    title: 'Solar Eclipse Reverie',
    artist: 'Cosmic Drift',
    album: 'Astral Horizons',
    duration: 256,
    audioUrl: '',
    artworkUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    genre: 'Space Ambient',
    folder: '/Music/Cosmic',
    isFavorite: false,
    playCount: 19,
    dateAdded: Date.now() - 86400000 * 1,
    lyrics: `[00:10.00]Starlight bending around celestial bodies
[00:26.00]Harmonic resonance across deep gravitational fields
[00:45.00]Entering the shadow of the twin moon`,
  },
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-favorites',
    title: 'Favorites',
    description: 'Auto-synced favorite tracks',
    songIds: ['track-1', 'track-3'],
    createdAt: Date.now() - 86400000 * 7,
    isSmart: true,
  },
  {
    id: 'pl-chill',
    title: 'Late Night Chill',
    description: 'Relaxing ambient and lo-fi melodies',
    songIds: ['track-1', 'track-3', 'track-4'],
    createdAt: Date.now() - 86400000 * 4,
    isSmart: false,
  },
];

export class StorageService {
  static getSongs(): Song[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SONGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return INITIAL_DEMO_SONGS;
  }

  static saveSongs(songs: Song[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_SONGS, JSON.stringify(songs));
    } catch {
      // Quota exceeded
    }
  }

  static getPlaylists(): Playlist[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PLAYLISTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return INITIAL_PLAYLISTS;
  }

  static savePlaylists(playlists: Playlist[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(playlists));
    } catch {}
  }

  static getLastPlaybackState(): { songId: string | null; position: number } {
    const songId = localStorage.getItem(STORAGE_KEY_LAST_SONG_ID);
    const position = parseFloat(localStorage.getItem(STORAGE_KEY_LAST_POSITION) || '0');
    return { songId, position: isNaN(position) ? 0 : position };
  }

  static saveLastPlaybackState(songId: string, position: number): void {
    try {
      localStorage.setItem(STORAGE_KEY_LAST_SONG_ID, songId);
      localStorage.setItem(STORAGE_KEY_LAST_POSITION, position.toString());
    } catch {}
  }
}
