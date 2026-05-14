import imageCompression from "browser-image-compression";

export const compressImage = async (file: File): Promise<File | Blob> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Erro na compressão:", error);
    return file;
  }
};
