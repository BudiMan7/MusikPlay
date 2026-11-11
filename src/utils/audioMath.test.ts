import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatFrequencyLabel,
  clampGain,
  dbToLinear,
  formatTime,
  parseLrc,
  getActiveLyricIndex,
  EQ_PRESETS,
  DEFAULT_EQ_FREQUENCIES,
} from './audioMath.ts';

test('formatFrequencyLabel formats Hz and kHz correctly', () => {
  assert.equal(formatFrequencyLabel(32), '32Hz');
  assert.equal(formatFrequencyLabel(500), '500Hz');
  assert.equal(formatFrequencyLabel(1000), '1kHz');
  assert.equal(formatFrequencyLabel(2500), '2.5kHz');
  assert.equal(formatFrequencyLabel(16000), '16kHz');
});

test('clampGain restricts gain within specified dB limits', () => {
  assert.equal(clampGain(5, -12, 12), 5);
  assert.equal(clampGain(15, -12, 12), 12);
  assert.equal(clampGain(-20, -12, 12), -12);
  assert.equal(clampGain(NaN, -12, 12), 0);
});

test('dbToLinear calculates linear amplitude accurately', () => {
  assert.equal(dbToLinear(0), 1);
  assert.ok(Math.abs(dbToLinear(6) - 1.995) < 0.01);
  assert.ok(Math.abs(dbToLinear(-6) - 0.501) < 0.01);
});

test('formatTime converts seconds to mm:ss and hh:mm:ss', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(45), '0:45');
  assert.equal(formatTime(75), '1:15');
  assert.equal(formatTime(3665), '1:01:05');
  assert.equal(formatTime(-10), '0:00');
});

test('parseLrc correctly parses timestamps and sorted lines', () => {
  const lrcSample = `
    [00:04.20]Intro melody playing
    [00:12.80]First line of the verse
    [00:25.00]Chorus starts here
  `;
  const result = parseLrc(lrcSample);
  assert.equal(result.length, 3);
  assert.equal(result[0].text, 'Intro melody playing');
  assert.ok(Math.abs(result[0].time - 4.2) < 0.001);
  assert.equal(result[1].text, 'First line of the verse');
  assert.ok(Math.abs(result[1].time - 12.8) < 0.001);
  assert.equal(result[2].text, 'Chorus starts here');
  assert.equal(result[2].time, 25.0);
});

test('getActiveLyricIndex identifies current lyric row accurately', () => {
  const lyrics = [
    { time: 5.0, text: 'Line 1' },
    { time: 10.0, text: 'Line 2' },
    { time: 18.0, text: 'Line 3' },
  ];
  assert.equal(getActiveLyricIndex(lyrics, 2.0), -1);
  assert.equal(getActiveLyricIndex(lyrics, 5.0), 0);
  assert.equal(getActiveLyricIndex(lyrics, 7.5), 0);
  assert.equal(getActiveLyricIndex(lyrics, 10.0), 1);
  assert.equal(getActiveLyricIndex(lyrics, 15.0), 1);
  assert.equal(getActiveLyricIndex(lyrics, 22.0), 2);
});

test('EQ presets match 10 frequency bands', () => {
  assert.equal(DEFAULT_EQ_FREQUENCIES.length, 10);
  for (const [presetName, gains] of Object.entries(EQ_PRESETS)) {
    assert.equal(gains.length, 10, `Preset ${presetName} must have 10 band gains`);
  }
});
