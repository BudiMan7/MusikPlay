import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf: Buffer): number {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

interface ZipEntry {
  filename: string;
  data: Buffer;
}

function createZip(entries: ZipEntry[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const filenameBuf = Buffer.from(entry.filename.replace(/\\/g, '/'), 'utf8');
    const crc = crc32(entry.data);
    const deflated = zlib.deflateRawSync(entry.data);

    // Local file header
    const local = Buffer.alloc(30 + filenameBuf.length + deflated.length);
    local.writeUInt32LE(0x04034b50, 0); // signature
    local.writeUInt16LE(20, 4); // version needed to extract
    local.writeUInt16LE(0, 6); // general purpose bit flag
    local.writeUInt16LE(8, 8); // compression method (deflate)
    local.writeUInt16LE(0, 10); // file last mod time
    local.writeUInt16LE(0, 12); // file last mod date
    local.writeUInt32LE(crc, 14); // crc-32
    local.writeUInt32LE(deflated.length, 18); // compressed size
    local.writeUInt32LE(entry.data.length, 22); // uncompressed size
    local.writeUInt16LE(filenameBuf.length, 26); // file name length
    local.writeUInt16LE(0, 28); // extra field length
    filenameBuf.copy(local, 30);
    deflated.copy(local, 30 + filenameBuf.length);
    localHeaders.push(local);

    // Central directory header
    const central = Buffer.alloc(46 + filenameBuf.length);
    central.writeUInt32LE(0x02014b50, 0); // signature
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed to extract
    central.writeUInt16LE(0, 8); // general purpose bit flag
    central.writeUInt16LE(8, 10); // compression method
    central.writeUInt16LE(0, 12); // file mod time
    central.writeUInt16LE(0, 14); // file mod date
    central.writeUInt32LE(crc, 16); // crc-32
    central.writeUInt32LE(deflated.length, 20); // compressed size
    central.writeUInt32LE(entry.data.length, 24); // uncompressed size
    central.writeUInt16LE(filenameBuf.length, 28); // file name length
    central.writeUInt16LE(0, 30); // extra field length
    central.writeUInt16LE(0, 32); // comment length
    central.writeUInt16LE(0, 34); // disk number start
    central.writeUInt16LE(0, 36); // internal file attributes
    central.writeUInt32LE(0, 38); // external file attributes
    central.writeUInt32LE(offset, 42); // relative offset of local header
    filenameBuf.copy(central, 46);
    centralHeaders.push(central);

    offset += local.length;
  }

  const centralDirSize = centralHeaders.reduce((acc, h) => acc + h.length, 0);
  const centralDirOffset = offset;

  // End of central directory record
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // signature
  eocd.writeUInt16LE(0, 4); // disk number
  eocd.writeUInt16LE(0, 6); // disk number with start of central directory
  eocd.writeUInt16LE(entries.length, 8); // total entries on disk
  eocd.writeUInt16LE(entries.length, 10); // total entries
  eocd.writeUInt32LE(centralDirSize, 12); // size of central directory
  eocd.writeUInt32LE(centralDirOffset, 16); // offset of central directory
  eocd.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

function collectFiles(dir: string, baseDir: string): ZipEntry[] {
  let results: ZipEntry[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const relPath = path.relative(baseDir, fullPath);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(collectFiles(fullPath, baseDir));
    } else {
      results.push({
        filename: relPath,
        data: fs.readFileSync(fullPath),
      });
    }
  }
  return results;
}

const entries: ZipEntry[] = [
  ...collectFiles(path.resolve('app'), path.resolve('.')),
  ...collectFiles(path.resolve('gradle'), path.resolve('.')),
  { filename: 'build.gradle.kts', data: fs.readFileSync(path.resolve('build.gradle.kts')) },
  { filename: 'settings.gradle.kts', data: fs.readFileSync(path.resolve('settings.gradle.kts')) },
  { filename: 'gradlew', data: fs.readFileSync(path.resolve('gradlew')) },
];

const zipBuf = createZip(entries);
fs.writeFileSync(path.resolve('public/LiquidGlassMusic-AndroidProject.zip'), zipBuf);
console.log(`Successfully generated public/LiquidGlassMusic-AndroidProject.zip (${(zipBuf.length / 1024).toFixed(1)} KB)`);
