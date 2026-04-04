interface ProcessingOverlayProps {
  isExporting: boolean;
  progress: number;
  progressText: string;
}

export function ProcessingOverlay({ isExporting, progress, progressText }: ProcessingOverlayProps) {
  if (!isExporting) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-8 backdrop-blur-lg">
      <div className="w-16 h-16 border-4 border-zinc-700 border-t-white rounded-full animate-spin mb-8" />
      <h2 className="text-2xl mb-4 font-bold tracking-widest">RENDERING MEDIA</h2>
      <div className="w-full max-w-sm bg-zinc-800 rounded-full h-2 mb-2 overflow-hidden shadow-[0_0_10px_rgba(255,255,255,0.2)] relative">
        <div className="bg-white h-2 rounded-full transition-all duration-300 absolute left-0 top-0 bottom-0" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
      <p className="text-zinc-300 font-mono text-sm tracking-widest">{progress >= 99 ? 'FINALIZING...' : `${Math.round(progress)}%`}</p>
      <p className="text-zinc-500 font-mono text-[10px] mt-4 text-center max-w-sm truncate uppercase">{progressText}</p>
    </div>
  );
}
