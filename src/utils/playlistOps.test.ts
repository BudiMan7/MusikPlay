import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateSmartPlaylists,
  addSongToPlaylist,
  removeSongFromPlaylist,
  validateAndClampPreset,
} from './playlistOps.ts';
import { Song, Playlist } from '../types/music.ts';

const testSongs: Song[] = [
  {
    id: 's1',
    title: 'Track A',
    artist: 'Artist 1',
    album: 'Album 1',
    duration: 180,
    audioUrl: '',
    isFavorite: true,
    playCount: 15,
    dateAdded: 1000,
  },
  {
    id: 's2',
    title: 'Track B',
    artist: 'Artist 2',
    album: 'Album 2',
    duration: 200,
    audioUrl: '',
    isFavorite: false,
    playCount: 50,
    dateAdded: 3000,
  },
  {
    id: 's3',
    title: 'Track C',
    artist: 'Artist 3',
    album: 'Album 3',
    duration: 220,
    audioUrl: '',
    isFavorite: true,
    playCount: 5,
    dateAdded: 2000,
  },
];

test('generateSmartPlaylists creates Favorites, Most Played, and Recently Added lists', () => {
  const smart = generateSmartPlaylists(testSongs);
  assert.equal(smart.length, 3);

  const favs = smart.find((p) => p.id === 'smart-favorites');
  assert.ok(favs);
  assert.deepEqual(favs!.songIds, ['s1', 's3']);

  const mostPlayed = smart.find((p) => p.id === 'smart-most-played');
  assert.ok(mostPlayed);
  assert.equal(mostPlayed!.songIds[0], 's2'); // 50 plays

  const recent = smart.find((p) => p.id === 'smart-recently-added');
  assert.ok(recent);
  assert.equal(recent!.songIds[0], 's2'); // dateAdded 3000
});

test('addSongToPlaylist prevents duplicate entries', () => {
  const pl: Playlist = {
    id: 'custom-1',
    title: 'My Mix',
    songIds: ['s1'],
    createdAt: 100,
  };

  const added = addSongToPlaylist(pl, 's2');
  assert.equal(added.songIds.length, 2);
  assert.equal(added.songIds[1], 's2');

  const duplicate = addSongToPlaylist(added, 's2');
  assert.equal(duplicate.songIds.length, 2);
});

test('removeSongFromPlaylist removes track cleanly', () => {
  const pl: Playlist = {
    id: 'custom-1',
    title: 'My Mix',
    songIds: ['s1', 's2', 's3'],
    createdAt: 100,
  };

  const removed = removeSongFromPlaylist(pl, 's2');
  assert.deepEqual(removed.songIds, ['s1', 's3']);
});

test('validateAndClampPreset enforces 10 bands and [-12, 12] limits', () => {
  const input = [15, -20, 4.5, NaN, 0];
  const clamped = validateAndClampPreset(input);
  assert.equal(clamped.length, 10);
  assert.equal(clamped[0], 12);
  assert.equal(clamped[1], -12);
  assert.equal(clamped[2], 4.5);
  assert.equal(clamped[3], 0);
  assert.equal(clamped[4], 0);
  assert.equal(clamped[9], 0);
});
