import { useState, useCallback } from "react";

export function useMediaManager() {
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const onMusicDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setMusicFile(file);
      const url = URL.createObjectURL(file);
      setMusicUrl(url);
    }
  }, []);

  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setImageFile(file);
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      const newUrl = URL.createObjectURL(file);
      setImageUrl(newUrl);
    }
  }, [imageUrl]);

  return {
    musicFile,
    imageFile,
    musicUrl,
    imageUrl,
    onMusicDrop,
    onImageDrop
  };
}
