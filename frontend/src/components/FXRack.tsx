import { useState } from "react";
import { FaMusic, FaExchangeAlt, FaWaveSquare } from "react-icons/fa";

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
}

const Card = ({ title, valueLabel, children, accentColor }: any) => (
  <div 
    className="bg-[#0b0b0f]/80 p-5 rounded-2xl border border-zinc-900 transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between"
    style={{ 
      borderColor: `rgba(${accentColor}, 0.08)`,
      '--color-primary': `rgb(${accentColor})`,
      '--color-primary-shadow': `rgba(${accentColor}, 0.4)`,
      '--color-primary-shadow-hover': `rgba(${accentColor}, 0.8)`
    } as any}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = `rgba(${accentColor}, 0.35)`;
      e.currentTarget.style.boxShadow = `0 10px 30px -10px rgba(${accentColor}, 0.15)`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = `rgba(${accentColor}, 0.08)`;
      e.currentTarget.style.boxShadow = `none`;
    }}
  >
     <div className="flex justify-between w-full mb-3 select-none">
        <h1 className="text-[10px] text-zinc-400 font-extrabold tracking-[0.15em] uppercase">{title}</h1>
        <span className="text-[10px] font-mono font-bold" style={{ color: `rgb(${accentColor})`, textShadow: `0 0 10px rgba(${accentColor}, 0.4)` }}>{valueLabel}</span>
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
  sidechainSyncDivision, setSidechainSyncDivision
}: FXRackProps) {
  
  const [activeTab, setActiveTab] = useState<'pitch' | 'space' | 'eq'>('pitch');
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

  // RGB colors corresponding to theme accents
  // purple (168, 85, 247) | cyan (6, 182, 212) | pink (236, 72, 153)
  const tabColorMap = {
    pitch: { rgb: "168, 85, 247", hex: "#a855f7" },
    space: { rgb: "6, 182, 212", hex: "#06b6d4" },
    eq: { rgb: "236, 72, 153", hex: "#ec4899" }
  };

  const currentTheme = tabColorMap[activeTab];

  return (
    <div 
      className="w-full flex flex-col gap-6 transition-all duration-500 mt-2"
      style={{ '--color-primary': currentTheme.hex } as any}
    >
      
      {/* Global BPM Sync Control Panel */}
      <div className="w-full bg-[#0b0b0f]/80 p-5 rounded-2xl border border-zinc-900 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-[10px] text-zinc-500 font-extrabold tracking-[0.15em] uppercase">BPM Sync Engine</h2>
            <span className="text-[9px] text-cyan-400 font-bold tracking-[0.1em] uppercase mt-0.5">Quantize LFOs & Delays</span>
          </div>
          <div 
            onClick={() => setBpmSyncEnabled(!bpmSyncEnabled)}
            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors flex-shrink-0 ${bpmSyncEnabled ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-zinc-800'}`}>
            <div className={`bg-black w-4 h-4 rounded-full transition-transform ${bpmSyncEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto flex-1 justify-end max-w-lg">
          <div className="flex flex-col flex-1 max-w-[200px]">
            <div className="flex justify-between font-mono text-[10px] text-zinc-400 mb-1">
              <span>MANUAL BPM</span>
              <span className="text-cyan-400 font-bold">{bpm} BPM</span>
            </div>
            <input 
              type="range" min="40" max="220" step="1" 
              value={bpm} 
              onChange={(e) => setBpm(parseInt(e.target.value))} 
              className="w-full relative top-[2px]" 
              style={{
                '--color-primary': '#06b6d4',
                '--color-primary-shadow': 'rgba(6, 182, 212, 0.4)',
                '--color-primary-shadow-hover': 'rgba(6, 182, 212, 0.8)'
              } as any}
            />
          </div>

          <button 
            onClick={handleTap} 
            className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-cyan-500/40 hover:bg-cyan-950/20 active:scale-95 transition-all text-cyan-400 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">
            TAP TEMPO
          </button>
        </div>
      </div>
      
      {/* Category Tabs */}
      <div className="flex gap-2 p-1.5 bg-zinc-950/80 rounded-2xl border border-zinc-900/60 max-w-2xl mx-auto w-full">
         <button 
           onClick={() => setActiveTab('pitch')}
           className={`flex-1 py-3 px-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-300 ${activeTab === 'pitch' ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30 border border-transparent'}`}>
            <FaMusic size={12} />
            <span>Pitch & Rhythm</span>
         </button>
         <button 
           onClick={() => setActiveTab('space')}
           className={`flex-1 py-3 px-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-300 ${activeTab === 'space' ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30 border border-transparent'}`}>
            <FaExchangeAlt size={12} />
            <span>Space & Wide</span>
         </button>
         <button 
           onClick={() => setActiveTab('eq')}
           className={`flex-1 py-3 px-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-300 ${activeTab === 'eq' ? 'bg-pink-600/10 text-pink-400 border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.1)]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30 border border-transparent'}`}>
            <FaWaveSquare size={12} />
            <span>EQ & Distortion</span>
         </button>
      </div>

      {/* Tab Contents */}
      <div className="w-full mt-2">
         {activeTab === 'pitch' && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-[fadeIn_0.3s_ease-out]">
               <Card title="Playback Speed" valueLabel={`${Math.round(rate * 100)}%`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0.5" max="2.0" step="0.01" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} />
               </Card>
               <Card title="Cassette Vibrato" valueLabel={`${Math.round(vibratoDepth * 100)}%`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0" max="1" step="0.01" value={vibratoDepth} onChange={(e) => setVibratoDepth(parseFloat(e.target.value))} />
               </Card>
               <Card title="Rhythmic Tremolo" valueLabel={`${Math.round(tremoloDepth * 100)}%`} accentColor={currentTheme.rgb}>
                  <div className="flex flex-col gap-2 mt-1">
                     {bpmSyncEnabled && (
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold mb-1">
                           <span>SYNC RATE</span>
                           <select 
                              value={tremoloSyncDivision} 
                              onChange={(e) => setTremoloSyncDivision(e.target.value)}
                              className="bg-zinc-900 text-white border border-zinc-800 rounded px-2 py-0.5 outline-none font-mono text-[10px]">
                              <option value="1/2">1/2 (Half)</option>
                              <option value="1/4">1/4 (Beat)</option>
                              <option value="1/8">1/8 (Eighth)</option>
                              <option value="1/16">1/16 (Sixteenth)</option>
                           </select>
                        </div>
                     )}
                     <input type="range" min="0" max="1" step="0.01" value={tremoloDepth} onChange={(e) => setTremoloDepth(parseFloat(e.target.value))} />
                  </div>
               </Card>
            </div>
         )}

         {activeTab === 'space' && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-[fadeIn_0.3s_ease-out]">
               <div className="lg:col-span-2">
                 <Card title="Concert Reverb" valueLabel={`${Math.round(reverbMode * 100)}%`} accentColor={currentTheme.rgb}>
                    <input type="range" min="0" max="1" step="0.01" value={reverbMode} onChange={(e) => setReverbMode(parseFloat(e.target.value))} />
                 </Card>
               </div>
               <div className="lg:col-span-2">
                 <Card title="Room Ambience" valueLabel={`${Math.round(ambienceLevel * 100)}%`} accentColor={currentTheme.rgb}>
                    <input type="range" min="0" max="1" step="0.01" value={ambienceLevel} onChange={(e) => setAmbienceLevel(parseFloat(e.target.value))} />
                 </Card>
               </div>
               
               <Card title="Tape Flanger" valueLabel={`${Math.round(flangerFactor * 100)}%`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0" max="1" step="0.01" value={flangerFactor} onChange={(e) => setFlangerFactor(parseFloat(e.target.value))} />
               </Card>
               <Card title="Ping-Pong Echo" valueLabel={`${Math.round(pingPongLevel * 100)}%`} accentColor={currentTheme.rgb}>
                  <div className="flex flex-col gap-2 mt-1">
                     {bpmSyncEnabled && (
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold mb-1">
                           <span>SYNC RATE</span>
                           <select 
                              value={delaySyncDivision} 
                              onChange={(e) => setDelaySyncDivision(e.target.value)}
                              className="bg-zinc-900 text-white border border-zinc-800 rounded px-2 py-0.5 outline-none font-mono text-[10px]">
                              <option value="1/4">1/4 (Beat)</option>
                              <option value="1/8">1/8 (Eighth)</option>
                              <option value="1/16">1/16 (Sixteenth)</option>
                              <option value="3/8">3/8 (Dotted 1/8)</option>
                           </select>
                        </div>
                     )}
                     <input type="range" min="0" max="1" step="0.01" value={pingPongLevel} onChange={(e) => setPingPongLevel(parseFloat(e.target.value))} />
                  </div>
               </Card>
               <Card title="Analog Tape Delay" valueLabel={`${Math.round(tapeDelayLevel * 100)}%`} accentColor={currentTheme.rgb}>
                  <div className="flex flex-col gap-2 mt-1">
                     {bpmSyncEnabled && (
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold mb-1">
                           <span>SYNC RATE</span>
                           <select 
                              value={delaySyncDivision} 
                              disabled
                              className="bg-zinc-900/50 text-zinc-500 border border-zinc-800 rounded px-2 py-0.5 outline-none font-mono text-[10px]">
                              <option value={delaySyncDivision}>{delaySyncDivision === '3/8' ? '3/8 (Dotted)' : delaySyncDivision + ' (Synced)'}</option>
                           </select>
                        </div>
                     )}
                     <input type="range" min="0" max="1" step="0.01" value={tapeDelayLevel} onChange={(e) => setTapeDelayLevel(parseFloat(e.target.value))} />
                  </div>
               </Card>
               <Card title="Aphex Phaser" valueLabel={`${Math.round(phaserFactor * 100)}%`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0" max="1" step="0.01" value={phaserFactor} onChange={(e) => setPhaserFactor(parseFloat(e.target.value))} />
               </Card>
               <div className="lg:col-span-2">
                 <Card title="Haas 3D Spatializer" valueLabel={`${Math.round(haasDelayFactor * 100)}%`} accentColor={currentTheme.rgb}>
                    <input type="range" min="0" max="1" step="0.01" value={haasDelayFactor} onChange={(e) => setHaasDelayFactor(parseFloat(e.target.value))} />
                 </Card>
               </div>
               
               <div className="bg-[#0b0b0f]/80 p-5 rounded-2xl border border-zinc-900 transition-colors hover:border-cyan-500/30 flex flex-col justify-center items-center gap-3">
                <h1 className="text-[10px] text-zinc-400 font-extrabold tracking-widest text-center select-none uppercase">8D PANNING</h1>
                <div 
                  onClick={() => setEnable8D(!enable8D)}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${enable8D ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-zinc-800'}`}>
                  <div className={`bg-black w-4 h-4 rounded-full transition-transform ${enable8D ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
               </div>
               
               <div className="bg-[#0b0b0f]/80 p-5 rounded-2xl border border-zinc-900 transition-colors hover:border-cyan-500/30 flex flex-col justify-center items-center gap-3">
                <h1 className="text-[10px] text-zinc-400 font-extrabold tracking-widest text-center select-none uppercase">SPATIAL CHORUS</h1>
                <div 
                  onClick={() => setChorusEnabled(!chorusEnabled)}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${chorusEnabled ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-zinc-800'}`}>
                  <div className={`bg-black w-4 h-4 rounded-full transition-transform ${chorusEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
         )}

         {activeTab === 'eq' && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-[fadeIn_0.3s_ease-out]">
               <Card title="Bass EQ Gain" valueLabel={`+${bassGain}dB`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0" max="24" step="1" value={bassGain} onChange={(e) => setBassGain(parseFloat(e.target.value))} />
               </Card>
               <Card title="Sub Bass Enhancer" valueLabel={`${Math.round(subBassFactor * 100)}%`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0" max="1" step="0.01" value={subBassFactor} onChange={(e) => setSubBassFactor(parseFloat(e.target.value))} />
               </Card>
               <Card title="Lowpass Muffle" valueLabel={`${Math.round(muffleFactor * 100)}%`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0" max="1" step="0.01" value={muffleFactor} onChange={(e) => setMuffleFactor(parseFloat(e.target.value))} />
               </Card>
               <Card title="Highpass Resonate" valueLabel={`${Math.round(highpassFactor * 100)}%`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0" max="1" step="0.01" value={highpassFactor} onChange={(e) => setHighpassFactor(parseFloat(e.target.value))} />
               </Card>
               <Card title="Master Overdrive" valueLabel={`${Math.round(overdriveFactor * 100)}%`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0" max="1" step="0.01" value={overdriveFactor} onChange={(e) => setOverdriveFactor(parseFloat(e.target.value))} />
               </Card>
               <Card title="8-Bit Crusher" valueLabel={`${Math.round(bitcrushFactor * 100)}%`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0" max="1" step="0.01" value={bitcrushFactor} onChange={(e) => setBitcrushFactor(parseFloat(e.target.value))} />
               </Card>
               <Card title="Ring Modulator" valueLabel={`${Math.round(ringModFactor * 100)}%`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0" max="1" step="0.01" value={ringModFactor} onChange={(e) => setRingModFactor(parseFloat(e.target.value))} />
               </Card>
               <Card title="Sidechain Pumper" valueLabel={`${Math.round(sidechainFactor * 100)}%`} accentColor={currentTheme.rgb}>
                  <div className="flex flex-col gap-2 mt-1">
                     {bpmSyncEnabled && (
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold mb-1">
                           <span>SYNC RATE</span>
                           <select 
                              value={sidechainSyncDivision} 
                              onChange={(e) => setSidechainSyncDivision(e.target.value)}
                              className="bg-zinc-900 text-white border border-zinc-800 rounded px-2 py-0.5 outline-none font-mono text-[10px]">
                              <option value="1/2">1/2 (Half)</option>
                              <option value="1/4">1/4 (Beat)</option>
                              <option value="1/8">1/8 (Eighth)</option>
                           </select>
                        </div>
                     )}
                     <input type="range" min="0" max="1" step="0.01" value={sidechainFactor} onChange={(e) => setSidechainFactor(parseFloat(e.target.value))} />
                  </div>
               </Card>
               <Card title="Auto-Wah Sweep" valueLabel={`${Math.round(autoWahFactor * 100)}%`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0" max="1" step="0.01" value={autoWahFactor} onChange={(e) => setAutoWahFactor(parseFloat(e.target.value))} />
               </Card>
               <Card title="Megaphone Radio" valueLabel={`${Math.round(megaphoneFactor * 100)}%`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0" max="1" step="0.01" value={megaphoneFactor} onChange={(e) => setMegaphoneFactor(parseFloat(e.target.value))} />
               </Card>
               <Card title="Fuzz Distortion" valueLabel={`${Math.round(fuzzFactor * 100)}%`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0" max="1" step="0.01" value={fuzzFactor} onChange={(e) => setFuzzFactor(parseFloat(e.target.value))} />
               </Card>
               <Card title="Lo-Fi Resampler" valueLabel={`${Math.round(lofiSampleRate * 100)}%`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0" max="1" step="0.01" value={lofiSampleRate} onChange={(e) => setLofiSampleRate(parseFloat(e.target.value))} />
               </Card>
               <Card title="Dynamic Punch" valueLabel={`${Math.round(dynamicPunch * 100)}%`} accentColor={currentTheme.rgb}>
                  <input type="range" min="0" max="1" step="0.01" value={dynamicPunch} onChange={(e) => setDynamicPunch(parseFloat(e.target.value))} />
               </Card>
               <div className="lg:col-span-3">
                  <Card title="Vinyl Crackle & Dust" valueLabel={`${Math.round(vinylCrackleLevel * 100)}%`} accentColor={currentTheme.rgb}>
                     <input type="range" min="0" max="1" step="0.01" value={vinylCrackleLevel} onChange={(e) => setVinylCrackleLevel(parseFloat(e.target.value))} />
                  </Card>
               </div>
            </div>
         )}
      </div>

    </div>
  );
}
