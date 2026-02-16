/**
 * Compress a data URL image (resize + JPEG) to reduce PDF size and stay under upload limits.
 * Used for certificate logos and signatures before generating the template PDF.
 */
const DEFAULT_MAX_PX = 300;
const DEFAULT_QUALITY = 0.82;

export function compressDataUrlImage(
  dataUrl: string,
  maxPx: number = DEFAULT_MAX_PX,
  quality: number = DEFAULT_QUALITY
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width > height) {
            height = Math.round((height * maxPx) / width);
            width = maxPx;
          } else {
            width = Math.round((width * maxPx) / height);
            height = maxPx;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const out = canvas.toDataURL('image/jpeg', quality);
        resolve(out);
      } catch (e) {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/** Compress multiple data URLs; returns same count of strings (unchanged if not valid image). */
export async function compressDataUrls(
  dataUrls: (string | undefined | null)[],
  maxPx: number = DEFAULT_MAX_PX,
  quality: number = DEFAULT_QUALITY
): Promise<(string | undefined)[]> {
  const results = await Promise.all(
    dataUrls.map((url) =>
      url && (url.startsWith('data:image/') || url.startsWith('data:application/'))
        ? compressDataUrlImage(url, maxPx, quality)
        : Promise.resolve(undefined)
    )
  );
  return results;
}
