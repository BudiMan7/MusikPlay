import { Song, Playlist } from '../types/music';

/**
 * Generate smart playlists dynamically from song library
 */
export function generateSmartPlaylists(songs: Song[]): Playlist[] {
  const favoritesSongIds = songs.filter((s) => s.isFavorite).map((s) => s.id);
  const mostPlayedSongIds = [...songs]
    .filter((s) => s.playCount > 0)
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 20)
    .map((s) => s.id);
  const recentlyAddedSongIds = [...songs]
    .sort((a, b) => b.dateAdded - a.dateAdded)
    .slice(0, 20)
    .map((s) => s.id);

  return [
    {
      id: 'smart-favorites',
      title: 'Favorites',
      description: 'Songs you marked with a heart',
      songIds: favoritesSongIds,
      createdAt: 0,
      isSmart: true,
    },
    {
      id: 'smart-most-played',
      title: 'Most Played',
      description: 'Your top heavy-rotation tracks',
      songIds: mostPlayedSongIds,
      createdAt: 0,
      isSmart: true,
    },
    {
      id: 'smart-recently-added',
      title: 'Recently Added',
      description: 'Freshly scanned and imported tracks',
      songIds: recentlyAddedSongIds,
      createdAt: 0,
      isSmart: true,
    },
  ];
}

/**
 * Add song to a custom playlist without duplicates
 */
export function addSongToPlaylist(playlist: Playlist, songId: string): Playlist {
  if (playlist.songIds.includes(songId)) {
    return playlist;
  }
  return {
    ...playlist,
    songIds: [...playlist.songIds, songId],
  };
}

/**
 * Remove song from a playlist
 */
export function removeSongFromPlaylist(playlist: Playlist, songId: string): Playlist {
  return {
    ...playlist,
    songIds: playlist.songIds.filter((id) => id !== songId),
  };
}

/**
 * Validate and clamp custom EQ preset gains array (must be 10 bands between -12dB and +12dB)
 */
export function validateAndClampPreset(gains: number[]): number[] {
  const target = new Array(10).fill(0);
  for (let i = 0; i < 10; i++) {
    const val = gains[i];
    if (typeof val === 'number' && !isNaN(val)) {
      target[i] = Math.max(-12, Math.min(12, val));
    }
  }
  return target;
}
