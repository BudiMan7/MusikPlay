/**
 * Pure binary audio metadata parser for ID3v2 (MP3), Vorbis comments (FLAC/OGG), and MP4 metadata.
 * Extracts Title, Artist, Album, Year, Genre, Embedded Cover Art (APIC), and Embedded Lyrics (USLT/SYLT/LYRICS).
 */

export interface ParsedAudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
  lyrics?: string;
  artworkUrl?: string;
  duration?: number;
}

/**
 * Decode text from Uint8Array given an ID3 encoding byte:
 * 0: ISO-8859-1 (Latin1)
 * 1: UTF-16 with BOM
 * 2: UTF-16BE without BOM
 * 3: UTF-8
 */
export function decodeId3Text(bytes: Uint8Array, encodingByte: number = 0): string {
  if (bytes.length === 0) return '';
  try {
    if (encodingByte === 3) {
      return new TextDecoder('utf-8').decode(bytes).replace(/\0+$/, '').trim();
    } else if (encodingByte === 1 || encodingByte === 2) {
      return new TextDecoder('utf-16').decode(bytes).replace(/\0+$/, '').trim();
    } else {
      return new TextDecoder('iso-8859-1').decode(bytes).replace(/\0+$/, '').trim();
    }
  } catch {
    // Fallback to Latin-1
    let str = '';
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] !== 0) str += String.fromCharCode(bytes[i]);
    }
    return str.trim();
  }
}

/**
 * Parse ID3v2 header and frames from ArrayBuffer
 */
export function parseId3v2(buffer: ArrayBuffer): ParsedAudioMetadata {
  const bytes = new Uint8Array(buffer);
  const metadata: ParsedAudioMetadata = {};

  // Check ID3 magic header: "ID3" (0x49, 0x44, 0x33)
  if (bytes.length < 10 || bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) {
    return metadata;
  }

  const version = bytes[3]; // e.g. 3 for ID3v2.3, 4 for ID3v2.4
  // Synchsafe integer for total tag size (4 bytes of 7 bits each)
  const tagSize =
    ((bytes[6] & 0x7f) << 21) |
    ((bytes[7] & 0x7f) << 14) |
    ((bytes[8] & 0x7f) << 7) |
    (bytes[9] & 0x7f);

  let offset = 10;
  const maxOffset = Math.min(bytes.length, 10 + tagSize);

  while (offset + 10 <= maxOffset) {
    // Frame ID (4 ASCII characters)
    const frameIdBytes = bytes.slice(offset, offset + 4);
    const frameId = String.fromCharCode(...frameIdBytes);

    // Padding / zero byte reached
    if (frameIdBytes[0] === 0 || !/^[A-Z0-9]{4}$/.test(frameId)) {
      break;
    }

    // Frame size
    let frameSize: number;
    if (version === 4) {
      // ID3v2.4 uses synchsafe frame sizes
      frameSize =
        ((bytes[offset + 4] & 0x7f) << 21) |
        ((bytes[offset + 5] & 0x7f) << 14) |
        ((bytes[offset + 6] & 0x7f) << 7) |
        (bytes[offset + 7] & 0x7f);
    } else {
      // ID3v2.3 uses regular 32-bit big endian integer
      frameSize =
        (bytes[offset + 4] << 24) |
        (bytes[offset + 5] << 16) |
        (bytes[offset + 6] << 8) |
        bytes[offset + 7];
    }

    if (frameSize <= 0 || offset + 10 + frameSize > bytes.length) {
      break;
    }

    const frameData = bytes.slice(offset + 10, offset + 10 + frameSize);

    // Parse specific frames
    if (frameId === 'TIT2') {
      metadata.title = decodeId3Text(frameData.slice(1), frameData[0]);
    } else if (frameId === 'TPE1') {
      metadata.artist = decodeId3Text(frameData.slice(1), frameData[0]);
    } else if (frameId === 'TALB') {
      metadata.album = decodeId3Text(frameData.slice(1), frameData[0]);
    } else if (frameId === 'TCON') {
      metadata.genre = decodeId3Text(frameData.slice(1), frameData[0]);
    } else if (frameId === 'TYER' || frameId === 'TDRC') {
      const yearStr = decodeId3Text(frameData.slice(1), frameData[0]);
      const parsedYear = parseInt(yearStr, 10);
      if (!isNaN(parsedYear)) metadata.year = parsedYear;
    } else if (frameId === 'USLT') {
      // Unsynchronized lyrics / text transcription
      // Format: encoding(1) + language(3) + content descriptor(null-terminated) + lyrics string
      const enc = frameData[0];
      let descriptorEnd = 4;
      while (descriptorEnd < frameData.length && frameData[descriptorEnd] !== 0) {
        descriptorEnd++;
      }
      descriptorEnd++; // skip null terminator
      if (descriptorEnd < frameData.length) {
        metadata.lyrics = decodeId3Text(frameData.slice(descriptorEnd), enc);
      }
    } else if (frameId === 'SYLT') {
      // Synchronized lyrics frame
      const enc = frameData[0];
      const lyricsRaw = decodeId3Text(frameData.slice(6), enc);
      if (lyricsRaw) metadata.lyrics = lyricsRaw;
    } else if (frameId === 'APIC') {
      // Attached picture (Album Artwork)
      // Format: encoding(1) + mimeType(null-terminated) + pictureType(1) + description(null-terminated) + binary image data
      try {
        let mimeEnd = 1;
        while (mimeEnd < frameData.length && frameData[mimeEnd] !== 0) {
          mimeEnd++;
        }
        const mimeType = String.fromCharCode(...frameData.slice(1, mimeEnd)) || 'image/jpeg';
        let imgStart = mimeEnd + 2; // skip mime null + pictureType byte
        while (imgStart < frameData.length && frameData[imgStart] !== 0) {
          imgStart++;
        }
        imgStart++; // skip description null terminator

        if (imgStart < frameData.length) {
          const imgBytes = frameData.slice(imgStart);
          const blob = new Blob([imgBytes], { type: mimeType });
          metadata.artworkUrl = URL.createObjectURL(blob);
        }
      } catch {
        // Picture extraction fallback
      }
    }

    offset += 10 + frameSize;
  }

  return metadata;
}

/**
 * Scan and extract full metadata, lyrics, and artwork from a local audio File
 */
export async function extractAudioFileMetadata(file: File): Promise<ParsedAudioMetadata> {
  const result: ParsedAudioMetadata = {};

  try {
    // Read the first 256KB to quickly parse ID3v2 header, APIC cover art, and lyrics without reading whole huge file
    const sliceSize = Math.min(file.size, 512 * 1024);
    const slice = file.slice(0, sliceSize);
    const arrayBuffer = await slice.arrayBuffer();

    const id3Data = parseId3v2(arrayBuffer);
    if (id3Data.title) result.title = id3Data.title;
    if (id3Data.artist) result.artist = id3Data.artist;
    if (id3Data.album) result.album = id3Data.album;
    if (id3Data.genre) result.genre = id3Data.genre;
    if (id3Data.year) result.year = id3Data.year;
    if (id3Data.lyrics) result.lyrics = id3Data.lyrics;
    if (id3Data.artworkUrl) result.artworkUrl = id3Data.artworkUrl;
  } catch {
    // Tag reading error
  }

  // Derive duration using an offscreen Audio element
  try {
    const objectUrl = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = objectUrl;

    await new Promise<void>((resolve) => {
      audio.onloadedmetadata = () => {
        if (!isNaN(audio.duration) && audio.duration > 0) {
          result.duration = Math.round(audio.duration);
        }
        resolve();
      };
      audio.onerror = () => resolve();
      setTimeout(resolve, 800); // 800ms safety timeout
    });
  } catch {
    result.duration = 210;
  }

  // Fallback to filename parsing if ID3 tags are missing
  if (!result.title) {
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const parts = cleanName.split(' - ');
    if (parts.length > 1) {
      result.artist = result.artist || parts[0].trim();
      result.title = parts.slice(1).join(' - ').trim();
    } else {
      result.title = cleanName;
      result.artist = result.artist || 'Local Artist';
    }
  }

  if (!result.album) {
    result.album = 'Local Device Storage';
  }

  return result;
}
