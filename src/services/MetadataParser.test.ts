import test from 'node:test';
import assert from 'node:assert/strict';
import { parseId3v2, decodeId3Text } from './MetadataParser.ts';

test('decodeId3Text decodes Latin-1 and UTF-8 strings accurately', () => {
  const latinBytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
  assert.equal(decodeId3Text(latinBytes, 0), 'Hello');

  const utf8Bytes = new Uint8Array([0x4c, 0x69, 0x71, 0x75, 0x69, 0x64]); // "Liquid"
  assert.equal(decodeId3Text(utf8Bytes, 3), 'Liquid');
});

test('parseId3v2 parses synthetic ID3v2.3 tag containing Title, Artist, Album, and Lyrics', () => {
  // Construct a valid ID3v2.3 buffer
  // Header: 'ID3', version 3, revision 0, flags 0, synchsafe size 100 bytes
  const header = [0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x64];

  // Frame helper: 4 chars ID + 4 bytes size + 2 flags (0,0) + 1 byte encoding + text
  function makeFrame(id: string, text: string) {
    const idBytes = id.split('').map((c) => c.charCodeAt(0));
    const textBytes = text.split('').map((c) => c.charCodeAt(0));
    const frameSize = 1 + textBytes.length; // 1 encoding byte + text
    return [
      ...idBytes,
      (frameSize >> 24) & 0xff,
      (frameSize >> 16) & 0xff,
      (frameSize >> 8) & 0xff,
      frameSize & 0xff,
      0x00,
      0x00, // flags
      0x00, // encoding: ISO-8859-1
      ...textBytes,
    ];
  }

  // USLT Frame helper: encoding(0) + lang('eng') + desc('') + null + lyrics
  function makeLyricsFrame(lyricsText: string) {
    const idBytes = 'USLT'.split('').map((c) => c.charCodeAt(0));
    const lang = 'eng'.split('').map((c) => c.charCodeAt(0));
    const textBytes = lyricsText.split('').map((c) => c.charCodeAt(0));
    const payload = [0x00, ...lang, 0x00, ...textBytes];
    const frameSize = payload.length;
    return [
      ...idBytes,
      (frameSize >> 24) & 0xff,
      (frameSize >> 16) & 0xff,
      (frameSize >> 8) & 0xff,
      frameSize & 0xff,
      0x00,
      0x00,
      ...payload,
    ];
  }

  const tit2 = makeFrame('TIT2', 'Aetherial Journey');
  const tpe1 = makeFrame('TPE1', 'Liquid Artist');
  const talb = makeFrame('TALB', 'Glass Harmonics');
  const uslt = makeLyricsFrame('[00:04.00]Embedded lyrics line 1\n[00:10.00]Embedded lyrics line 2');

  const fullData = [...header, ...tit2, ...tpe1, ...talb, ...uslt];
  const buffer = new Uint8Array(fullData).buffer;

  const result = parseId3v2(buffer);
  assert.equal(result.title, 'Aetherial Journey');
  assert.equal(result.artist, 'Liquid Artist');
  assert.equal(result.album, 'Glass Harmonics');
  assert.ok(result.lyrics?.includes('Embedded lyrics line 1'));
});

test('parseId3v2 returns empty object for non-ID3 buffer', () => {
  const dummyBuffer = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]).buffer;
  const result = parseId3v2(dummyBuffer);
  assert.deepEqual(result, {});
});
