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
}

const Card = ({ title, valueLabel, children }: any) => (
  <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 transition-colors hover:border-zinc-600">
     <div className="flex justify-between w-full mb-4">
        <h1 className="text-xs text-zinc-300 font-bold tracking-widest">{title}</h1>
        <span className="text-xs text-zinc-500 font-mono">{valueLabel}</span>
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
  subBassFactor, setSubBassFactor
}: FXRackProps) {
  
  return (
    <div className="w-full flex flex-col gap-8 transition-all duration-700 delay-100 mt-2">
      
      {/* Category: Pitch & Rhythm */}
      <div className="flex flex-col gap-3">
         <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest px-2 font-bold mb-1">Pitch & Rhythm</h2>
         <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card title="SPEED" valueLabel={`${rate.toFixed(2)}x`}>
               <input type="range" min="0.5" max="1.5" step="0.01" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} />
            </Card>
            <Card title="VIBRATO" valueLabel={`${Math.round(vibratoDepth * 100)}%`}>
               <input type="range" min="0" max="1" step="0.01" value={vibratoDepth} onChange={(e) => setVibratoDepth(parseFloat(e.target.value))} />
            </Card>
            <Card title="TREMOLO" valueLabel={`${Math.round(tremoloDepth * 100)}%`}>
               <input type="range" min="0" max="1" step="0.01" value={tremoloDepth} onChange={(e) => setTremoloDepth(parseFloat(e.target.value))} />
            </Card>
         </div>
      </div>

      {/* Category: Space & Modulation */}
      <div className="flex flex-col gap-3">
         <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest px-2 font-bold mb-1">Space & Modulation</h2>
         <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <Card title="REVERB" valueLabel={`${Math.round(reverbMode * 100)}%`}>
                 <input type="range" min="0" max="1" step="0.01" value={reverbMode} onChange={(e) => setReverbMode(parseFloat(e.target.value))} />
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card title="ROOM AMBIENCE" valueLabel={`${Math.round(ambienceLevel * 100)}%`}>
                 <input type="range" min="0" max="1" step="0.01" value={ambienceLevel} onChange={(e) => setAmbienceLevel(parseFloat(e.target.value))} />
              </Card>
            </div>
            
            <Card title="FLANGER" valueLabel={`${Math.round(flangerFactor * 100)}%`}>
               <input type="range" min="0" max="1" step="0.01" value={flangerFactor} onChange={(e) => setFlangerFactor(parseFloat(e.target.value))} />
            </Card>
            <Card title="PING-PONG" valueLabel={`${Math.round(pingPongLevel * 100)}%`}>
               <input type="range" min="0" max="1" step="0.01" value={pingPongLevel} onChange={(e) => setPingPongLevel(parseFloat(e.target.value))} />
            </Card>
            <Card title="PHASER" valueLabel={`${Math.round(phaserFactor * 100)}%`}>
               <input type="range" min="0" max="1" step="0.01" value={phaserFactor} onChange={(e) => setPhaserFactor(parseFloat(e.target.value))} />
            </Card>
            <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 transition-colors hover:border-zinc-600 flex flex-col justify-center items-center gap-3">
             <h1 className="text-xs text-zinc-300 font-bold tracking-widest text-center">8D PANNING</h1>
             <div 
               onClick={() => setEnable8D(!enable8D)}
               className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${enable8D ? 'bg-white' : 'bg-zinc-700'}`}>
               <div className={`bg-black w-4 h-4 rounded-full transition-transform ${enable8D ? 'translate-x-6' : 'translate-x-0'}`} />
             </div>
            </div>
            
            <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 transition-colors hover:border-zinc-600 flex flex-col justify-center items-center gap-3">
             <h1 className="text-xs text-zinc-300 font-bold tracking-widest text-center">SPATIAL CHORUS</h1>
             <div 
               onClick={() => setChorusEnabled(!chorusEnabled)}
               className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${chorusEnabled ? 'bg-white' : 'bg-zinc-700'}`}>
               <div className={`bg-black w-4 h-4 rounded-full transition-transform ${chorusEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
             </div>
           </div>
         </div>
      </div>

      {/* Category: EQ & Distortion */}
      <div className="flex flex-col gap-3">
         <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest px-2 font-bold mb-1">EQ & Distortion</h2>
         <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card title="BASS EQ" valueLabel={`+${bassGain}dB`}>
               <input type="range" min="0" max="24" step="1" value={bassGain} onChange={(e) => setBassGain(parseFloat(e.target.value))} />
            </Card>
            <Card title="SUB BASS" valueLabel={`${Math.round(subBassFactor * 100)}%`}>
               <input type="range" min="0" max="1" step="0.01" value={subBassFactor} onChange={(e) => setSubBassFactor(parseFloat(e.target.value))} />
            </Card>
            <Card title="LOWPASS" valueLabel={`${Math.round(muffleFactor * 100)}%`}>
               <input type="range" min="0" max="1" step="0.01" value={muffleFactor} onChange={(e) => setMuffleFactor(parseFloat(e.target.value))} />
            </Card>
            <Card title="HIGHPASS" valueLabel={`${Math.round(highpassFactor * 100)}%`}>
               <input type="range" min="0" max="1" step="0.01" value={highpassFactor} onChange={(e) => setHighpassFactor(parseFloat(e.target.value))} />
            </Card>

            <Card title="OVERDRIVE" valueLabel={`${Math.round(overdriveFactor * 100)}%`}>
               <input type="range" min="0" max="1" step="0.01" value={overdriveFactor} onChange={(e) => setOverdriveFactor(parseFloat(e.target.value))} />
            </Card>
            <Card title="BITCRUSHER" valueLabel={`${Math.round(bitcrushFactor * 100)}%`}>
               <input type="range" min="0" max="1" step="0.01" value={bitcrushFactor} onChange={(e) => setBitcrushFactor(parseFloat(e.target.value))} />
            </Card>
            <Card title="RING MOD" valueLabel={`${Math.round(ringModFactor * 100)}%`}>
               <input type="range" min="0" max="1" step="0.01" value={ringModFactor} onChange={(e) => setRingModFactor(parseFloat(e.target.value))} />
            </Card>
            <Card title="SIDECHAIN" valueLabel={`${Math.round(sidechainFactor * 100)}%`}>
               <input type="range" min="0" max="1" step="0.01" value={sidechainFactor} onChange={(e) => setSidechainFactor(parseFloat(e.target.value))} />
            </Card>
            <div className="lg:col-span-4">
               <Card title="VINYL CRACKLE" valueLabel={`${Math.round(vinylCrackleLevel * 100)}%`}>
                  <input type="range" min="0" max="1" step="0.01" value={vinylCrackleLevel} onChange={(e) => setVinylCrackleLevel(parseFloat(e.target.value))} />
               </Card>
            </div>
         </div>
      </div>

    </div>
  );
}
