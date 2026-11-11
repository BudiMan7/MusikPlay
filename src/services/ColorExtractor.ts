/**
 * Extract dominant vibrant color from an image URL using offscreen HTML5 canvas.
 */
export async function extractDominantColor(imageUrl: string): Promise<string | null> {
  if (!imageUrl) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        // Downscale to 40x40 for fast sampling
        canvas.width = 40;
        canvas.height = 40;
        ctx.drawImage(img, 0, 0, 40, 40);

        const imageData = ctx.getImageData(0, 0, 40, 40).data;
        let rSum = 0, gSum = 0, bSum = 0, count = 0;

        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          // Skip overly dark or overly bright pixels to find vibrant accent
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          if (brightness > 40 && brightness < 230) {
            rSum += r;
            gSum += g;
            bSum += b;
            count++;
          }
        }

        if (count === 0) return resolve(null);
        const avgR = Math.round(rSum / count);
        const avgG = Math.round(gSum / count);
        const avgB = Math.round(bSum / count);

        const hex = `#${((1 << 24) + (avgR << 16) + (avgG << 8) + avgB)
          .toString(16)
          .slice(1)}`;
        resolve(hex);
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
  });
}
