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

function makePng(width: number, height: number, isMaskable: boolean = false): Buffer {
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = isMaskable ? width * 0.38 : width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep cosmic dark background (#090A10)
      let r = 9;
      let g = 10;
      let b = 16;
      let a = 255;

      // Outer glow and gradient disc
      if (dist <= radius) {
        // Gradient from vibrant indigo #625BCE to bright accent #D9D7FF
        const t = Math.min(1, Math.max(0, (y - (cy - radius)) / (radius * 2)));
        // Interpolate between indigo #6366F1 (99, 102, 241) and violet #8B5CF6 (139, 92, 246)
        r = Math.round(99 + (139 - 99) * t);
        g = Math.round(102 + (92 - 102) * t);
        b = Math.round(241 + (246 - 241) * t);

        // Glass highlight reflection on top half
        if (dy < 0 && Math.abs(dx) < radius * 0.7) {
          const highlight = (1 - Math.abs(dy) / radius) * 60;
          r = Math.min(255, r + highlight);
          g = Math.min(255, g + highlight);
          b = Math.min(255, b + highlight);
        }

        // Inner waveform / music note stylized icon
        const inCenter = Math.abs(dx) < radius * 0.45 && Math.abs(dy) < radius * 0.45;
        if (inCenter) {
          // 4 vertical audio bars
          const barWidth = radius * 0.08;
          const barSpacing = radius * 0.12;
          const bars = [
            { x: -1.5 * barSpacing, h: radius * 0.22 },
            { x: -0.5 * barSpacing, h: radius * 0.38 },
            { x: 0.5 * barSpacing, h: radius * 0.32 },
            { x: 1.5 * barSpacing, h: radius * 0.20 },
          ];

          for (const bar of bars) {
            if (Math.abs(dx - bar.x) < barWidth / 2 && Math.abs(dy) < bar.h) {
              r = 255;
              g = 255;
              b = 255;
              a = 255;
            }
          }
        }
      } else if (!isMaskable && dist <= radius + 4) {
        // Soft border rim
        const alpha = Math.max(0, 1 - (dist - radius) / 4);
        r = Math.round(140 * alpha + 9 * (1 - alpha));
        g = Math.round(130 * alpha + 10 * (1 - alpha));
        b = Math.round(255 * alpha + 16 * (1 - alpha));
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type: string, data: Buffer): Buffer {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Generate PNGs
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), makePng(192, 192, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), makePng(512, 512, false));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), makePng(512, 512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), makePng(180, 180, false));

// 2. Generate SVG
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090A10"/>
      <stop offset="100%" stop-color="#191B25"/>
    </linearGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6"/>
      <stop offset="50%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#4F46E5"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="24" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="180" fill="url(#glass)" filter="url(#glow)" opacity="0.95"/>
  <circle cx="256" cy="256" r="179" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <path d="M 120 180 C 180 120, 332 120, 392 180 C 340 160, 172 160, 120 180 Z" fill="rgba(255,255,255,0.35)"/>
  <!-- Audio spectrum bars in center -->
  <rect x="176" y="210" width="24" height="92" rx="12" fill="#FFFFFF"/>
  <rect x="218" y="160" width="24" height="192" rx="12" fill="#FFFFFF"/>
  <rect x="260" y="185" width="24" height="142" rx="12" fill="#FFFFFF"/>
  <rect x="302" y="225" width="24" height="62" rx="12" fill="#FFFFFF"/>
  <circle cx="256" cy="256" r="14" fill="#D9D7FF"/>
</svg>`;
fs.writeFileSync(path.join(outDir, 'icon.svg'), svg);

console.log('Successfully generated PWA icon assets in /public');
