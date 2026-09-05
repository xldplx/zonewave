import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  analyserRef: React.RefObject<AnalyserNode | null>;
  isPlaying: boolean;
}

export function AudioVisualizer({ analyserRef, isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let bufferLength = 64;
    let dataArray = new Uint8Array(bufferLength);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const analyser = analyserRef.current;

      if (analyser && isPlaying) {
        if (analyser.frequencyBinCount !== bufferLength) {
          bufferLength = analyser.frequencyBinCount;
          dataArray = new Uint8Array(bufferLength);
        }
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Idle ambient baseline
        dataArray.fill(0);
      }

      const barCount = 48;
      const barWidth = Math.max(2, (width / barCount) - 2);
      const step = Math.floor(bufferLength / barCount) || 1;

      for (let i = 0; i < barCount; i++) {
        const rawValue = dataArray[i * step] || 0;
        const normalized = rawValue / 255;
        const barHeight = Math.max(2, normalized * (height - 4));
        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Monochrome intensity ramp
        if (normalized > 0.75) {
          ctx.fillStyle = "#ffffff";
        } else if (normalized > 0.4) {
          ctx.fillStyle = "#a1a1aa"; // zinc-400
        } else if (normalized > 0.1) {
          ctx.fillStyle = "#52525b"; // zinc-600
        } else {
          ctx.fillStyle = "#27272a"; // zinc-800
        }

        ctx.fillRect(x, y, barWidth, barHeight);
      }

      if (isPlaying) {
        animFrameIdRef.current = requestAnimationFrame(render);
      } else {
        // Render one clean baseline frame and stop
        animFrameIdRef.current = null;
      }
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [analyserRef, isPlaying]);

  return (
    <div className="w-full bg-black/90 px-4 py-2 rounded-lg border border-zinc-900 flex items-center justify-between gap-4 select-none">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-white animate-pulse" : "bg-zinc-700"}`} />
        <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-bold">
          {isPlaying ? "SPECTRUM" : "STANDBY"}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={360}
        height={28}
        className="w-full max-w-[360px] h-[28px]"
      />
    </div>
  );
}
