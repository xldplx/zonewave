import { useDropzone } from "react-dropzone";
import { FaFileUpload } from "react-icons/fa";

export interface MediaDropzonesProps {
  musicFile: File | null;
  imageFile: File | null;
  onMusicDrop: (acc: File[]) => void;
  onImageDrop: (acc: File[]) => void;
}

export function MediaDropzones({ musicFile, imageFile, onMusicDrop, onImageDrop }: MediaDropzonesProps) {
  const { getRootProps: musicRootProps, getInputProps: musicInputProps, isDragActive: musicDrag } = useDropzone({ onDrop: onMusicDrop, accept: { 'audio/*': ['.mp3', '.wav', '.ogg'] }, maxFiles: 1 });
  const { getRootProps: imgRootProps, getInputProps: imgInputProps, isDragActive: imgDrag } = useDropzone({ onDrop: onImageDrop, accept: { 'image/*': ['.jpg', '.png', '.jpeg'] }, maxFiles: 1 });

  return (
    <div className="flex gap-[1rem] md:flex-row flex-col w-full justify-center relative z-20">
      <div {...musicRootProps()} className={`flex flex-col flex-1 justify-center items-center p-[2rem] md:p-[3rem] rounded-xl border border-dashed transition-all duration-300 cursor-pointer ${musicDrag ? 'border-white bg-zinc-900/80 scale-[1.02]' : 'border-zinc-700 bg-zinc-900/30 hover:border-zinc-500 hover:bg-zinc-900/50'}`}>
        <input {...musicInputProps()} />
        <FaFileUpload size={28} className={musicDrag ? 'text-white' : 'text-zinc-500'} />
        <h1 className="mt-4 text-sm font-bold truncate max-w-[200px]">{musicFile ? musicFile.name : "DRAG & DROP AUDIO"}</h1>
        <p className="text-[10px] text-zinc-500 mt-2 tracking-widest font-mono">.MP3 / .WAV</p>
      </div>

      <div {...imgRootProps()} className={`flex flex-col flex-1 justify-center items-center p-[2rem] md:p-[3rem] rounded-xl border border-dashed transition-all duration-300 cursor-pointer ${imgDrag ? 'border-white bg-zinc-900/80 scale-[1.02]' : 'border-zinc-700 bg-zinc-900/30 hover:border-zinc-500 hover:bg-zinc-900/50'}`}>
        <input {...imgInputProps()} />
        <FaFileUpload size={28} className={imgDrag ? 'text-white' : 'text-zinc-500'} />
        <h1 className="mt-4 text-sm font-bold truncate max-w-[200px]">{imageFile ? imageFile.name : "BACKGROUND ARTWORK"}</h1>
        <p className="text-[10px] text-zinc-500 mt-2 tracking-widest font-mono">.JPG / .PNG (OPTIONAL)</p>
      </div>
    </div>
  );
}
