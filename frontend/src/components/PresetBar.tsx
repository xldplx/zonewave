import { PRESETS } from "../constants/presets";
import type { Preset } from "../constants/presets";

interface PresetBarProps {
  activePresetId: string | null;
  onSelectPreset: (preset: Preset) => void;
}

export function PresetBar({ activePresetId, onSelectPreset }: PresetBarProps) {
  return (
    <div className="w-full flex flex-col gap-2 select-none">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-bold">
          Presets
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {PRESETS.map((p) => {
          const isActive = activePresetId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p)}
              title={p.description}
              className={`px-3 py-2 rounded-lg border text-left flex-shrink-0 transition-all flex items-center gap-2.5 ${
                isActive
                  ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.25)] font-black"
                  : "bg-zinc-950 text-zinc-300 border-zinc-800/80 hover:border-zinc-500 hover:bg-zinc-900 font-medium"
              }`}
            >
              <span
                className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded tracking-widest font-bold ${
                  isActive ? "bg-black text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                }`}
              >
                {p.badge}
              </span>
              <span className="text-[11px] tracking-wider uppercase whitespace-nowrap">
                {p.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
