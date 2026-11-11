import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterSongs,
  sortSongs,
  getNextQueueIndex,
  getPreviousQueueIndex,
  playSongNext,
  reorderQueue,
  getRelativeLuminance,
} from './libraryOps.ts';
import { Song } from '../types/music.ts';

const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Neon Skyline',
    artist: 'Cyber Pulse',
    album: 'Future Horizon',
    duration: 210,
    audioUrl: '',
    isFavorite: false,
    playCount: 10,
    dateAdded: 1000,
    genre: 'Synthwave',
    folder: '/Music/Synth',
  },
  {
    id: '2',
    title: 'Acoustic Rain',
    artist: 'Serenity',
    album: 'Peaceful Moments',
    duration: 180,
    audioUrl: '',
    isFavorite: true,
    playCount: 50,
    dateAdded: 2000,
    genre: 'Acoustic',
    folder: '/Music/Chill',
  },
  {
    id: '3',
    title: 'Midnight Bass',
    artist: 'Deep Groove',
    album: 'Club Dynamics',
    duration: 240,
    audioUrl: '',
    isFavorite: false,
    playCount: 25,
    dateAdded: 1500,
    genre: 'Electronic',
    folder: '/Music/Club',
  },
];

test('filterSongs searches case-insensitively across title, artist, album, and genre', () => {
  assert.equal(filterSongs(mockSongs, 'skyline').length, 1);
  assert.equal(filterSongs(mockSongs, 'serenity').length, 1);
  assert.equal(filterSongs(mockSongs, 'club').length, 1);
  assert.equal(filterSongs(mockSongs, 'electronic').length, 1);
  assert.equal(filterSongs(mockSongs, '').length, 3);
  assert.equal(filterSongs(mockSongs, 'nonexistent').length, 0);
});

test('sortSongs correctly sorts by title and duration', () => {
  const sortedTitleAsc = sortSongs(mockSongs, 'title', 'asc');
  assert.equal(sortedTitleAsc[0].title, 'Acoustic Rain');
  assert.equal(sortedTitleAsc[2].title, 'Neon Skyline');

  const sortedDurationDesc = sortSongs(mockSongs, 'duration', 'desc');
  assert.equal(sortedDurationDesc[0].duration, 240);
  assert.equal(sortedDurationDesc[2].duration, 180);
});

test('getNextQueueIndex handles repeat modes and boundary', () => {
  // normal next
  assert.equal(getNextQueueIndex(0, 3, 'off'), 1);
  // at end, repeat off
  assert.equal(getNextQueueIndex(2, 3, 'off'), -1);
  // at end, repeat all
  assert.equal(getNextQueueIndex(2, 3, 'all'), 0);
  // repeat one on track end
  assert.equal(getNextQueueIndex(1, 3, 'one', false), 1);
  // manual user next with repeat one should still advance
  assert.equal(getNextQueueIndex(1, 3, 'one', true), 2);
});

test('getPreviousQueueIndex handles 3s restart threshold', () => {
  // After 3 seconds, should restart current track
  const res1 = getPreviousQueueIndex(1, 3, 10.5);
  assert.equal(res1.shouldRestartCurrent, true);
  assert.equal(res1.index, 1);

  // Before 3 seconds, should go to previous track
  const res2 = getPreviousQueueIndex(1, 3, 1.2);
  assert.equal(res2.shouldRestartCurrent, false);
  assert.equal(res2.index, 0);

  // At start of queue before 3 seconds, wraps to end
  const res3 = getPreviousQueueIndex(0, 3, 0.5);
  assert.equal(res3.shouldRestartCurrent, false);
  assert.equal(res3.index, 2);
});

test('playSongNext inserts right after current track without duplicates', () => {
  const song4: Song = {
    id: '4',
    title: 'Bonus Song',
    artist: 'Artist',
    album: 'Album',
    duration: 100,
    audioUrl: '',
    isFavorite: false,
    playCount: 0,
    dateAdded: 3000,
  };
  const updated = playSongNext(mockSongs, 0, song4);
  assert.equal(updated.length, 4);
  assert.equal(updated[1].id, '4');
});

test('reorderQueue moves items accurately', () => {
  const reordered = reorderQueue(mockSongs, 0, 2);
  assert.equal(reordered[0].id, '2');
  assert.equal(reordered[1].id, '3');
  assert.equal(reordered[2].id, '1');
});

test('getRelativeLuminance measures white and black correctly', () => {
  assert.ok(getRelativeLuminance('#FFFFFF') > 0.95);
  assert.ok(getRelativeLuminance('#000000') < 0.05);
});
