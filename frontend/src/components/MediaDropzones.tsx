import { useDropzone } from "react-dropzone";
import { FaMusic, FaImage } from "react-icons/fa";

export interface MediaDropzonesProps {
  musicFile: File | null;
  imageFile: File | null;
  onMusicDrop: (acc: File[]) => void;
  onImageDrop: (acc: File[]) => void;
}

export function MediaDropzones({ musicFile, imageFile, onMusicDrop, onImageDrop }: MediaDropzonesProps) {
  const { getRootProps: musicRootProps, getInputProps: musicInputProps, isDragActive: musicDrag } = useDropzone({
    onDrop: onMusicDrop,
    accept: {
      'audio/*': [
        '.mp3',
        '.wav',
        '.ogg',
        '.flac',
        '.m4a',
        '.aac',
        '.opus',
        '.wma',
        '.aiff',
        '.aif',
        '.weba',
        '.webm'
      ]
    },
    maxFiles: 1
  });

  const { getRootProps: imgRootProps, getInputProps: imgInputProps, isDragActive: imgDrag } = useDropzone({
    onDrop: onImageDrop,
    accept: {
      'image/*': [
        '.jpg',
        '.jpeg',
        '.png',
        '.webp',
        '.avif',
        '.gif',
        '.bmp',
        '.tiff',
        '.tif',
        '.svg'
      ]
    },
    maxFiles: 1
  });

  return (
    <div className="flex gap-3 md:flex-row flex-col w-full justify-center select-none">
      {/* Audio Dropzone */}
      <div 
        {...musicRootProps()} 
        className={`flex flex-col flex-1 justify-center items-center p-6 md:p-8 rounded-xl border transition-all cursor-pointer ${
          musicDrag 
            ? 'border-white bg-zinc-950 scale-[1.01]' 
            : musicFile 
              ? 'border-zinc-700 bg-[#09090b]' 
              : 'border-zinc-800/80 bg-black hover:border-zinc-600 hover:bg-[#09090b]'
        }`}
      >
        <input {...musicInputProps()} />
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
          musicFile ? 'bg-white text-black border-white' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
        }`}>
          <FaMusic size={14} />
        </div>
        <h4 className="mt-3 text-xs font-mono font-bold tracking-wider truncate max-w-[260px] text-center text-white">
          {musicFile ? musicFile.name : "CHOOSE AUDIO TRACK"}
        </h4>
        <p className="text-[9px] text-zinc-500 mt-1 tracking-wider font-mono uppercase text-center">
          {musicFile 
            ? `${(musicFile.size / (1024 * 1024)).toFixed(2)} MB` 
            : "MP3, WAV, FLAC, AAC, OGG, M4A, OPUS, AIFF"}
        </p>
      </div>

      {/* Image Artwork Dropzone */}
      <div 
        {...imgRootProps()} 
        className={`flex flex-col flex-1 justify-center items-center p-6 md:p-8 rounded-xl border transition-all cursor-pointer ${
          imgDrag 
            ? 'border-white bg-zinc-950 scale-[1.01]' 
            : imageFile 
              ? 'border-zinc-700 bg-[#09090b]' 
              : 'border-zinc-800/80 bg-black hover:border-zinc-600 hover:bg-[#09090b]'
        }`}
      >
        <input {...imgInputProps()} />
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
          imageFile ? 'bg-white text-black border-white' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
        }`}>
          <FaImage size={14} />
        </div>
        <h4 className="mt-3 text-xs font-mono font-bold tracking-wider truncate max-w-[260px] text-center text-white">
          {imageFile ? imageFile.name : "BACKGROUND ARTWORK"}
        </h4>
        <p className="text-[9px] text-zinc-500 mt-1 tracking-wider font-mono uppercase text-center">
          {imageFile 
            ? "Ready for video export" 
            : "JPG, PNG, WEBP, AVIF, GIF, BMP, SVG"}
        </p>
      </div>
    </div>
  );
}
