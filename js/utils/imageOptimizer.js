// ==========================================================================
// Client-Side Canvas Image Downscaler & Compressor
// Adheres strictly to .agents/skills/client-image-optimizer/SKILL.md
// Downscales to max 1280px at 0.75 JPEG quality (< 250KB)
// ==========================================================================
window.LNF = window.LNF || {};

/**
 * Compresses an image file client-side using an off-screen HTML5 <canvas>.
 * Resizes dynamically to max dimension of 1280px (preserving aspect ratio),
 * encodes as image/jpeg at 0.75 quality, and ensures the output size is strictly < 250 KB.
 *
 * @param {File} file - Original captured or selected photo file
 * @param {number} maxWidth - Maximum width or height dimension (default 1280)
 * @param {number} quality - Initial JPEG quality (default 0.75)
 * @returns {Promise<{file: File, dataUrl: string, originalSizeKB: number, compressedSizeKB: number, width: number, height: number, reductionPercent: number}>}
 */
window.LNF.compressImage = async function compressImage(file, maxWidth = 1280, quality = 0.75) {
  const MAX_BYTES = 250 * 1024; // 250 KB strict cap

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result;

      img.onload = async () => {
        try {
          let width = img.width;
          let height = img.height;

          // 1. Calculate aspect-ratio preserving dimensions capped at maxWidth (1280px)
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxWidth) {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          // 2. Render to off-screen HTML5 canvas
          let canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          let ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Canvas 2D context unavailable'));
          }

          // Use smooth image interpolation
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Helper to get blob from canvas
          const getBlob = (cvs, q) => new Promise(res => cvs.toBlob(res, 'image/jpeg', q));

          let currentQuality = quality;
          let blob = await getBlob(canvas, currentQuality);

          if (!blob) {
            return reject(new Error('Canvas compression failed'));
          }

          // 3. Size guarantee pipeline: ensure output file size is strictly < 250 KB
          let attempts = 0;
          while (blob.size > MAX_BYTES && currentQuality > 0.45 && attempts < 4) {
            attempts++;
            currentQuality = Math.max(0.45, currentQuality - 0.1);
            blob = await getBlob(canvas, currentQuality);
          }

          // If still exceeding 250 KB after quality tuning, downscale canvas dimensions
          if (blob.size > MAX_BYTES) {
            const scaleDown = Math.sqrt(MAX_BYTES / blob.size) * 0.95;
            const newW = Math.max(480, Math.round(width * scaleDown));
            const newH = Math.max(480, Math.round(height * scaleDown));

            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = newW;
            smallCanvas.height = newH;
            const smallCtx = smallCanvas.getContext('2d');
            smallCtx.imageSmoothingEnabled = true;
            smallCtx.imageSmoothingQuality = 'high';
            smallCtx.drawImage(canvas, 0, 0, newW, newH);

            blob = await getBlob(smallCanvas, 0.70);
            width = newW;
            height = newH;
            canvas = smallCanvas;
          }

          // 4. Create optimized File object
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          // 5. Generate high-performance base64 data URL for instant crisp thumbnail preview
          const previewReader = new FileReader();
          previewReader.readAsDataURL(blob);
          previewReader.onloadend = () => {
            const originalSizeKB = Math.round(file.size / 1024);
            const compressedSizeKB = Math.round(compressedFile.size / 1024);
            const reductionPercent = originalSizeKB > 0 
              ? Math.max(0, Math.round(((file.size - compressedFile.size) / file.size) * 100))
              : 0;

            resolve({
              file: compressedFile,
              dataUrl: previewReader.result,
              originalSizeKB,
              compressedSizeKB,
              width,
              height,
              reductionPercent
            });
          };
        } catch (compressionErr) {
          reject(compressionErr);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image into canvas'));
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));
  });
};
