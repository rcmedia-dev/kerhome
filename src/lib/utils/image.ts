import imageCompression from "browser-image-compression";

type CompressOptions = {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
};

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} demorou mais de ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function fileFromBlob(blob: Blob, originalName: string, fallbackType: string): File {
  const type = blob.type || fallbackType || "image/jpeg";
  const ext = type.includes("png")
    ? "png"
    : type.includes("webp")
      ? "webp"
      : "jpg";
  const base = originalName.replace(/\.[^.]+$/, "") || "avatar";
  return new File([blob], `${base}.${ext}`, { type, lastModified: Date.now() });
}

/** Resize + JPEG via canvas — rápido, sem web worker (fiável no Next). */
async function compressViaCanvas(
  file: File,
  maxDim: number,
  quality: number
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) return file;
  return fileFromBlob(blob, file.name, "image/jpeg");
}

export const compressImage = async (
  file: File,
  options: CompressOptions = {}
): Promise<File | Blob> => {
  const opts = {
    maxSizeMB: options.maxSizeMB ?? 1,
    maxWidthOrHeight: options.maxWidthOrHeight ?? 1920,
    useWebWorker: false,
    initialQuality: 0.85,
  };
  try {
    return await withTimeout(imageCompression(file, opts), 12000, "compressImage");
  } catch (error) {
    console.error("Erro na compressão:", error);
    try {
      return await compressViaCanvas(
        file,
        opts.maxWidthOrHeight,
        opts.initialQuality
      );
    } catch {
      return file;
    }
  }
};

/** Avatar: max ~400KB, 512px — canvas + fallback, nunca fica preso. */
export const compressAvatar = async (file: File): Promise<File> => {
  try {
    // Canvas first: deterministic and fast for avatars
    return await withTimeout(compressViaCanvas(file, 512, 0.82), 8000, "compressAvatar(canvas)");
  } catch (canvasError) {
    console.warn("Canvas fallback:", canvasError);
    try {
      const compressed: File | Blob = await withTimeout(
        imageCompression(file, {
          maxSizeMB: 0.4,
          maxWidthOrHeight: 512,
          useWebWorker: false,
          initialQuality: 0.8,
        }),
        8000,
        "compressAvatar(lib)"
      );
      if (compressed instanceof File) return compressed;
      return fileFromBlob(compressed as Blob, file.name, file.type);
    } catch (error) {
      console.error("Erro na compressão de avatar:", error);
      return file;
    }
  }
};
