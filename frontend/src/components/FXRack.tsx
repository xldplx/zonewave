import { useState } from "react";
import { FaMusic, FaExchangeAlt, FaWaveSquare, FaSlidersH, FaCompactDisc } from "react-icons/fa";

export interface FXRackProps {
  rate: number; setRate: (v: number) => void;
  vibratoDepth: number; setVibratoDepth: (v: number) => void;
  tremoloDepth: number; setTremoloDepth: (v: number) => void;

  reverbMode: number; setReverbMode: (v: number) => void;
  ambienceLevel: number; setAmbienceLevel: (v: number) => void;
  enable8D: boolean; setEnable8D: (v: boolean) => void;
  chorusEnabled: boolean; setChorusEnabled: (v: boolean) => void;

  bassGain: number; setBassGain: (v: number) => void;
  muffleFactor: number; setMuffleFactor: (v: number) => void;
  highpassFactor: number; setHighpassFactor: (v: number) => void;
  bitcrushFactor: number; setBitcrushFactor: (v: number) => void;
  overdriveFactor: number; setOverdriveFactor: (v: number) => void;
  flangerFactor: number; setFlangerFactor: (v: number) => void;

  pingPongLevel: number; setPingPongLevel: (v: number) => void;
  ringModFactor: number; setRingModFactor: (v: number) => void;
  phaserFactor: number; setPhaserFactor: (v: number) => void;
  sidechainFactor: number; setSidechainFactor: (v: number) => void;
  vinylCrackleLevel: number; setVinylCrackleLevel: (v: number) => void;
  subBassFactor: number; setSubBassFactor: (v: number) => void;
  autoWahFactor: number; setAutoWahFactor: (v: number) => void;

  megaphoneFactor: number; setMegaphoneFactor: (v: number) => void;
  tapeDelayLevel: number; setTapeDelayLevel: (v: number) => void;
  fuzzFactor: number; setFuzzFactor: (v: number) => void;
  lofiSampleRate: number; setLofiSampleRate: (v: number) => void;
  haasDelayFactor: number; setHaasDelayFactor: (v: number) => void;
  dynamicPunch: number; setDynamicPunch: (v: number) => void;

  bpm: number; setBpm: (v: number) => void;
  bpmSyncEnabled: boolean; setBpmSyncEnabled: (v: boolean) => void;
  tremoloSyncDivision: string; setTremoloSyncDivision: (v: string) => void;
  delaySyncDivision: string; setDelaySyncDivision: (v: string) => void;
  sidechainSyncDivision: string; setSidechainSyncDivision: (v: string) => void;
  pitchSemitones: number; setPitchSemitones: (v: number) => void;
  preservePitch: boolean; setPreservePitch: (v: boolean) => void;
}

interface FXCardProps {
  title: string;
  valueLabel: string;
  isActive?: boolean;
  onReset?: () => void;
  children: React.ReactNode;
}

const FXCard = ({ title, valueLabel, isActive = false, onReset, children }: FXCardProps) => (
  <div 
    className={`bg-[#09090b] p-4 rounded-xl border transition-all flex flex-col justify-between ${
      isActive 
        ? "border-zinc-500 bg-zinc-950/90 shadow-[0_0_12px_rgba(255,255,255,0.06)]" 
        : "border-zinc-800/80 hover:border-zinc-700"
    }`}
  >
    <div className="flex justify-between items-center w-full mb-3 select-none">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" : "bg-zinc-700"}`} />
        <h3 className="text-[10px] text-zinc-300 font-bold tracking-[0.15em] uppercase font-mono">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-mono font-bold ${isActive ? "text-white" : "text-zinc-500"}`}>
          {valueLabel}
        </span>
        {onReset && (
          <button 
            onClick={onReset} 
            title="Reset to default"
            className="text-[9px] text-zinc-600 hover:text-zinc-300 font-mono px-1 py-0.5 rounded border border-zinc-800 hover:border-zinc-600 transition-colors"
          >
            0
          </button>
        )}
      </div>
    </div>
    {children}
  </div>
);

export function FXRack({
  rate, setRate,
  vibratoDepth, setVibratoDepth,
  tremoloDepth, setTremoloDepth,
  reverbMode, setReverbMode,
  ambienceLevel, setAmbienceLevel,
  enable8D, setEnable8D,
  chorusEnabled, setChorusEnabled,
  bassGain, setBassGain,
  muffleFactor, setMuffleFactor,
  highpassFactor, setHighpassFactor,
  bitcrushFactor, setBitcrushFactor,
  overdriveFactor, setOverdriveFactor,
  flangerFactor, setFlangerFactor,
  pingPongLevel, setPingPongLevel,
  ringModFactor, setRingModFactor,
  phaserFactor, setPhaserFactor,
  sidechainFactor, setSidechainFactor,
  vinylCrackleLevel, setVinylCrackleLevel,
  subBassFactor, setSubBassFactor,
  autoWahFactor, setAutoWahFactor,
  megaphoneFactor, setMegaphoneFactor,
  tapeDelayLevel, setTapeDelayLevel,
  fuzzFactor, setFuzzFactor,
  lofiSampleRate, setLofiSampleRate,
  haasDelayFactor, setHaasDelayFactor,
  dynamicPunch, setDynamicPunch,
  bpm, setBpm,
  bpmSyncEnabled, setBpmSyncEnabled,
  tremoloSyncDivision, setTremoloSyncDivision,
  delaySyncDivision, setDelaySyncDivision,
  sidechainSyncDivision, setSidechainSyncDivision,
  pitchSemitones, setPitchSemitones,
  preservePitch, setPreservePitch
}: FXRackProps) {
  
  const [activeTab, setActiveTab] = useState<'pitch' | 'space' | 'eq' | 'mod' | 'lofi'>('pitch');
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  const handleTap = () => {
    const now = performance.now();
    const newTimes = [...tapTimes, now].filter(t => now - t < 2000);
    setTapTimes(newTimes);
    if (newTimes.length > 1) {
      const intervals = [];
      for (let i = 1; i < newTimes.length; i++) {
        intervals.push(newTimes[i] - newTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 240) {
        setBpm(calculatedBpm);
      }
    }
  };

  const tabs = [
    { id: 'pitch' as const, label: 'Pitch & Time', icon: <FaMusic size={11} /> },
    { id: 'space' as const, label: 'Space & Wide', icon: <FaExchangeAlt size={11} /> },
    { id: 'eq' as const, label: 'Tone & EQ', icon: <FaWaveSquare size={11} /> },
    { id: 'mod' as const, label: 'Mod & Delays', icon: <FaSlidersH size={11} /> },
    { id: 'lofi' as const, label: 'Dynamics & Lo-Fi', icon: <FaCompactDisc size={11} /> },
  ];

  return (
    <div className="w-full flex flex-col gap-4 mt-2">
      
      {/* Tempo Sync */}
      <div className="w-full bg-[#09090b] p-4 rounded-xl border border-zinc-800/80 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase font-mono">Tempo Sync</h2>
            <span className="text-[9px] text-zinc-500 font-mono tracking-wider">Sync modulation and delays to BPM</span>
          </div>
          <button 
            onClick={() => setBpmSyncEnabled(!bpmSyncEnabled)}
            className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors flex-shrink-0 flex items-center ${
              bpmSyncEnabled ? 'bg-white' : 'bg-zinc-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full transition-transform ${
              bpmSyncEnabled ? 'translate-x-5 bg-black' : 'translate-x-0 bg-zinc-400'
            }`} />
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto flex-1 justify-end max-w-md">
          <div className="flex flex-col flex-1 max-w-[180px]">
            <div className="flex justify-between font-mono text-[10px] text-zinc-400 mb-1">
              <span>TEMPO</span>
              <span className="text-white font-bold">{bpm} BPM</span>
            </div>
            <input 
              type="range" min="40" max="220" step="1" 
              value={bpm} 
              onChange={(e) => setBpm(parseInt(e.target.value))} 
              className="w-full" 
            />
          </div>

          <button 
            onClick={handleTap} 
            className="px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-white hover:bg-zinc-800 active:scale-95 transition-all text-white rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest"
          >
            TAP TEMPO
          </button>
        </div>
      </div>
      
      {/* Category Navigation Tabs */}
      <div className="flex gap-1.5 p-1 bg-[#09090b] rounded-xl border border-zinc-800/80 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                isActive
                  ? "bg-white text-black font-black shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="w-full">
        {activeTab === 'pitch' && (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <FXCard 
              title="Playback Speed" 
              valueLabel={`${Math.round(rate * 100)}%`}
              isActive={rate !== 1.0}
              onReset={() => setRate(1.0)}
            >
              <div className="flex flex-col gap-2">
                <input type="range" min="0.5" max="2.0" step="0.01" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} />
                <button
                  onClick={() => setPreservePitch(!preservePitch)}
                  className={`mt-1 text-[9px] font-mono font-bold px-2 py-1 rounded border flex items-center justify-between transition-colors ${
                    preservePitch 
                      ? 'bg-white text-black border-white shadow-sm' 
                      : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <span>PRESERVE KEY</span>
                  <span>{preservePitch ? "LOCKED" : "VINYL"}</span>
                </button>
              </div>
            </FXCard>

            <FXCard 
              title="Pitch Shift" 
              valueLabel={pitchSemitones === 0 ? "0 st" : `${pitchSemitones > 0 ? "+" : ""}${pitchSemitones} st`}
              isActive={pitchSemitones !== 0}
              onReset={() => setPitchSemitones(0)}
            >
              <div className="flex flex-col gap-2">
                <input 
                  type="range" 
                  min="-12" 
                  max="12" 
                  step="0.5" 
                  value={pitchSemitones} 
                  onChange={(e) => setPitchSemitones(parseFloat(e.target.value))} 
                />
                <div className="flex justify-between text-[8px] font-mono text-zinc-600 px-0.5">
                  <span>-12 st</span>
                  <span>0</span>
                  <span>+12 st</span>
                </div>
              </div>
            </FXCard>

            <FXCard 
              title="Cassette Vibrato" 
              valueLabel={`${Math.round(vibratoDepth * 100)}%`}
              isActive={vibratoDepth > 0}
              onReset={() => setVibratoDepth(0)}
            >
              <input type="range" min="0" max="1" step="0.01" value={vibratoDepth} onChange={(e) => setVibratoDepth(parseFloat(e.target.value))} />
            </FXCard>

            <FXCard 
              title="Rhythmic Tremolo" 
              valueLabel={`${Math.round(tremoloDepth * 100)}%`}
              isActive={tremoloDepth > 0}
              onReset={() => setTremoloDepth(0)}
            >
              <div className="flex flex-col gap-2 mt-1">
                {bpmSyncEnabled && (
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold">
                    <span className="font-mono">SYNC RATE</span>
                    <select 
                      value={tremoloSyncDivision} 
                      onChange={(e) => setTremoloSyncDivision(e.target.value)}
                      className="bg-black text-white border border-zinc-800 rounded px-2 py-0.5 outline-none font-mono text-[10px]"
                    >
                      <option value="1/2">1/2 (Half)</option>
                      <option value="1/4">1/4 (Beat)</option>
                      <option value="1/8">1/8 (Eighth)</option>
                      <option value="1/16">1/16 (Sixteenth)</option>
                    </select>
                  </div>
                )}
                <input type="range" min="0" max="1" step="0.01" value={tremoloDepth} onChange={(e) => setTremoloDepth(parseFloat(e.target.value))} />
              </div>
            </FXCard>
          </div>
        )}

        {activeTab === 'space' && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2">
              <FXCard 
                title="Concert Reverb" 
                valueLabel={`${Math.round(reverbMode * 100)}%`}
                isActive={reverbMode > 0}
                onReset={() => setReverbMode(0)}
              >
                <input type="range" min="0" max="1" step="0.01" value={reverbMode} onChange={(e) => setReverbMode(parseFloat(e.target.value))} />
              </FXCard>
            </div>

            <div className="lg:col-span-2">
              <FXCard 
                title="Room Ambience" 
                valueLabel={`${Math.round(ambienceLevel * 100)}%`}
                isActive={ambienceLevel > 0}
                onReset={() => setAmbienceLevel(0)}
              >
                <input type="range" min="0" max="1" step="0.01" value={ambienceLevel} onChange={(e) => setAmbienceLevel(parseFloat(e.target.value))} />
              </FXCard>
            </div>
            
            <div className="lg:col-span-2">
              <FXCard 
                title="Haas 3D Spatializer" 
                valueLabel={`${Math.round(haasDelayFactor * 100)}%`}
                isActive={haasDelayFactor > 0}
                onReset={() => setHaasDelayFactor(0)}
              >
                <input type="range" min="0" max="1" step="0.01" value={haasDelayFactor} onChange={(e) => setHaasDelayFactor(parseFloat(e.target.value))} />
              </FXCard>
            </div>

            {/* 8D Panning Toggle Card */}
            <div className={`bg-[#09090b] p-4 rounded-xl border flex flex-col justify-center items-center gap-2.5 select-none transition-all ${
              enable8D ? "border-zinc-400 bg-zinc-950/90 shadow-[0_0_12px_rgba(255,255,255,0.06)]" : "border-zinc-800/80 hover:border-zinc-700"
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${enable8D ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" : "bg-zinc-700"}`} />
                <h3 className="text-[10px] text-zinc-300 font-bold tracking-widest uppercase font-mono">8D Binaural Panning</h3>
              </div>
              <button 
                onClick={() => setEnable8D(!enable8D)}
                className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors flex items-center ${
                  enable8D ? 'bg-white' : 'bg-zinc-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform ${
                  enable8D ? 'translate-x-5 bg-black' : 'translate-x-0 bg-zinc-400'
                }`} />
              </button>
            </div>
            
            {/* Spatial Chorus Toggle Card */}
            <div className={`bg-[#09090b] p-4 rounded-xl border flex flex-col justify-center items-center gap-2.5 select-none transition-all ${
              chorusEnabled ? "border-zinc-400 bg-zinc-950/90 shadow-[0_0_12px_rgba(255,255,255,0.06)]" : "border-zinc-800/80 hover:border-zinc-700"
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${chorusEnabled ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" : "bg-zinc-700"}`} />
                <h3 className="text-[10px] text-zinc-300 font-bold tracking-widest uppercase font-mono">Stereo Chorus</h3>
              </div>
              <button 
                onClick={() => setChorusEnabled(!chorusEnabled)}
                className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors flex items-center ${
                  chorusEnabled ? 'bg-white' : 'bg-zinc-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform ${
                  chorusEnabled ? 'translate-x-5 bg-black' : 'translate-x-0 bg-zinc-400'
                }`} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'eq' && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <FXCard 
              title="Bass EQ Gain" 
              valueLabel={`+${bassGain}dB`}
              isActive={bassGain > 0}
              onReset={() => setBassGain(0)}
            >
              <input type="range" min="0" max="24" step="1" value={bassGain} onChange={(e) => setBassGain(parseFloat(e.target.value))} />
            </FXCard>

            <FXCard 
              title="Sub Bass Enhancer" 
              valueLabel={`${Math.round(subBassFactor * 100)}%`}
              isActive={subBassFactor > 0}
              onReset={() => setSubBassFactor(0)}
            >
              <input type="range" min="0" max="1" step="0.01" value={subBassFactor} onChange={(e) => setSubBassFactor(parseFloat(e.target.value))} />
            </FXCard>

            <FXCard 
              title="Lowpass Muffle" 
              valueLabel={`${Math.round(muffleFactor * 100)}%`}
              isActive={muffleFactor > 0}
              onReset={() => setMuffleFactor(0)}
            >
              <input type="range" min="0" max="1" step="0.01" value={muffleFactor} onChange={(e) => setMuffleFactor(parseFloat(e.target.value))} />
            </FXCard>

            <FXCard 
              title="Highpass Resonator" 
              valueLabel={`${Math.round(highpassFactor * 100)}%`}
              isActive={highpassFactor > 0}
              onReset={() => setHighpassFactor(0)}
            >
              <input type="range" min="0" max="1" step="0.01" value={highpassFactor} onChange={(e) => setHighpassFactor(parseFloat(e.target.value))} />
            </FXCard>

            <FXCard 
              title="Auto-Wah Sweep" 
              valueLabel={`${Math.round(autoWahFactor * 100)}%`}
              isActive={autoWahFactor > 0}
              onReset={() => setAutoWahFactor(0)}
            >
              <input type="range" min="0" max="1" step="0.01" value={autoWahFactor} onChange={(e) => setAutoWahFactor(parseFloat(e.target.value))} />
            </FXCard>

            <FXCard 
              title="Megaphone / Radio" 
              valueLabel={`${Math.round(megaphoneFactor * 100)}%`}
              isActive={megaphoneFactor > 0}
              onReset={() => setMegaphoneFactor(0)}
            >
              <input type="range" min="0" max="1" step="0.01" value={megaphoneFactor} onChange={(e) => setMegaphoneFactor(parseFloat(e.target.value))} />
            </FXCard>
          </div>
        )}

        {activeTab === 'mod' && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <FXCard 
              title="Analog Tape Delay" 
              valueLabel={`${Math.round(tapeDelayLevel * 100)}%`}
              isActive={tapeDelayLevel > 0}
              onReset={() => setTapeDelayLevel(0)}
            >
              <div className="flex flex-col gap-2 mt-1">
                {bpmSyncEnabled && (
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold">
                    <span className="font-mono">SYNC RATE</span>
                    <span className="text-zinc-300 font-mono text-[10px] bg-black px-2 py-0.5 rounded border border-zinc-800">{delaySyncDivision}</span>
                  </div>
                )}
                <input type="range" min="0" max="1" step="0.01" value={tapeDelayLevel} onChange={(e) => setTapeDelayLevel(parseFloat(e.target.value))} />
              </div>
            </FXCard>

            <FXCard 
              title="Ping-Pong Echo" 
              valueLabel={`${Math.round(pingPongLevel * 100)}%`}
              isActive={pingPongLevel > 0}
              onReset={() => setPingPongLevel(0)}
            >
              <div className="flex flex-col gap-2 mt-1">
                {bpmSyncEnabled && (
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold">
                    <span className="font-mono">SYNC RATE</span>
                    <select 
                      value={delaySyncDivision} 
                      onChange={(e) => setDelaySyncDivision(e.target.value)}
                      className="bg-black text-white border border-zinc-800 rounded px-2 py-0.5 outline-none font-mono text-[10px]"
                    >
                      <option value="1/4">1/4 (Beat)</option>
                      <option value="1/8">1/8 (Eighth)</option>
                      <option value="1/16">1/16 (Sixteenth)</option>
                      <option value="3/8">3/8 (Dotted)</option>
                    </select>
                  </div>
                )}
                <input type="range" min="0" max="1" step="0.01" value={pingPongLevel} onChange={(e) => setPingPongLevel(parseFloat(e.target.value))} />
              </div>
            </FXCard>

            <FXCard 
              title="Aphex Phaser" 
              valueLabel={`${Math.round(phaserFactor * 100)}%`}
              isActive={phaserFactor > 0}
              onReset={() => setPhaserFactor(0)}
            >
              <input type="range" min="0" max="1" step="0.01" value={phaserFactor} onChange={(e) => setPhaserFactor(parseFloat(e.target.value))} />
            </FXCard>

            <FXCard 
              title="Tape Flanger" 
              valueLabel={`${Math.round(flangerFactor * 100)}%`}
              isActive={flangerFactor > 0}
              onReset={() => setFlangerFactor(0)}
            >
              <input type="range" min="0" max="1" step="0.01" value={flangerFactor} onChange={(e) => setFlangerFactor(parseFloat(e.target.value))} />
            </FXCard>

            <FXCard 
              title="Ring Modulator" 
              valueLabel={`${Math.round(ringModFactor * 100)}%`}
              isActive={ringModFactor > 0}
              onReset={() => setRingModFactor(0)}
            >
              <input type="range" min="0" max="1" step="0.01" value={ringModFactor} onChange={(e) => setRingModFactor(parseFloat(e.target.value))} />
            </FXCard>
          </div>
        )}

        {activeTab === 'lofi' && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <FXCard 
              title="Dynamic Punch Comp" 
              valueLabel={`${Math.round(dynamicPunch * 100)}%`}
              isActive={dynamicPunch > 0}
              onReset={() => setDynamicPunch(0)}
            >
              <input type="range" min="0" max="1" step="0.01" value={dynamicPunch} onChange={(e) => setDynamicPunch(parseFloat(e.target.value))} />
            </FXCard>

            <FXCard 
              title="Sidechain Pumper" 
              valueLabel={`${Math.round(sidechainFactor * 100)}%`}
              isActive={sidechainFactor > 0}
              onReset={() => setSidechainFactor(0)}
            >
              <div className="flex flex-col gap-2 mt-1">
                {bpmSyncEnabled && (
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold">
                    <span className="font-mono">PUMP RATE</span>
                    <select 
                      value={sidechainSyncDivision} 
                      onChange={(e) => setSidechainSyncDivision(e.target.value)}
                      className="bg-black text-white border border-zinc-800 rounded px-2 py-0.5 outline-none font-mono text-[10px]"
                    >
                      <option value="1/2">1/2 (Half)</option>
                      <option value="1/4">1/4 (Beat)</option>
                      <option value="1/8">1/8 (Eighth)</option>
                    </select>
                  </div>
                )}
                <input type="range" min="0" max="1" step="0.01" value={sidechainFactor} onChange={(e) => setSidechainFactor(parseFloat(e.target.value))} />
              </div>
            </FXCard>

            <FXCard 
              title="Master Overdrive" 
              valueLabel={`${Math.round(overdriveFactor * 100)}%`}
              isActive={overdriveFactor > 0}
              onReset={() => setOverdriveFactor(0)}
            >
              <input type="range" min="0" max="1" step="0.01" value={overdriveFactor} onChange={(e) => setOverdriveFactor(parseFloat(e.target.value))} />
            </FXCard>

            <FXCard 
              title="8-Bit Crusher" 
              valueLabel={`${Math.round(bitcrushFactor * 100)}%`}
              isActive={bitcrushFactor > 0}
              onReset={() => setBitcrushFactor(0)}
            >
              <input type="range" min="0" max="1" step="0.01" value={bitcrushFactor} onChange={(e) => setBitcrushFactor(parseFloat(e.target.value))} />
            </FXCard>

            <FXCard 
              title="Fuzz Distortion" 
              valueLabel={`${Math.round(fuzzFactor * 100)}%`}
              isActive={fuzzFactor > 0}
              onReset={() => setFuzzFactor(0)}
            >
              <input type="range" min="0" max="1" step="0.01" value={fuzzFactor} onChange={(e) => setFuzzFactor(parseFloat(e.target.value))} />
            </FXCard>

            <FXCard 
              title="Lo-Fi Resampler" 
              valueLabel={`${Math.round(lofiSampleRate * 100)}%`}
              isActive={lofiSampleRate > 0}
              onReset={() => setLofiSampleRate(0)}
            >
              <input type="range" min="0" max="1" step="0.01" value={lofiSampleRate} onChange={(e) => setLofiSampleRate(parseFloat(e.target.value))} />
            </FXCard>

            <div className="md:col-span-2 lg:col-span-3">
              <FXCard 
                title="Vinyl Crackle & Dust" 
                valueLabel={`${Math.round(vinylCrackleLevel * 100)}%`}
                isActive={vinylCrackleLevel > 0}
                onReset={() => setVinylCrackleLevel(0)}
              >
                <input type="range" min="0" max="1" step="0.01" value={vinylCrackleLevel} onChange={(e) => setVinylCrackleLevel(parseFloat(e.target.value))} />
              </FXCard>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
