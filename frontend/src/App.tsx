import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause, FaStop, FaDice, FaVolumeUp, FaSyncAlt } from "react-icons/fa";

// Hooks
import { useMediaManager } from "./hooks/useMediaManager";
import { useAudioGraph } from "./hooks/useAudioGraph";
import { useWaveSurfer } from "./hooks/useWaveSurfer";
import { useFFmpegExport } from "./hooks/useFFmpegExport";

// Components
import { FXRack } from "./components/FXRack";
import { MediaDropzones } from "./components/MediaDropzones";
import { ProcessingOverlay } from "./components/ProcessingOverlay";

export default function App() {
  // Time & Modulation
  const [rate, setRate] = useState(1.0);
  const [vibratoDepth, setVibratoDepth] = useState(0);
  const [tremoloDepth, setTremoloDepth] = useState(0);

  // Space & Environment
  const [reverbMode, setReverbMode] = useState(0);
  const [ambienceLevel, setAmbienceLevel] = useState(0);
  const [enable8D, setEnable8D] = useState(false);
  const [chorusEnabled, setChorusEnabled] = useState(false);

  // EQ & Destruction
  const [bassGain, setBassGain] = useState(0);
  const [muffleFactor, setMuffleFactor] = useState(0);
  const [highpassFactor, setHighpassFactor] = useState(0);
  const [bitcrushFactor, setBitcrushFactor] = useState(0);
  const [overdriveFactor, setOverdriveFactor] = useState(0);
  const [flangerFactor, setFlangerFactor] = useState(0);

  // System
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [isLooping, setIsLooping] = useState(true);

  // New FX
  const [pingPongLevel, setPingPongLevel] = useState(0);
  const [ringModFactor, setRingModFactor] = useState(0);
  const [phaserFactor, setPhaserFactor] = useState(0);
  const [sidechainFactor, setSidechainFactor] = useState(0);
  const [vinylCrackleLevel, setVinylCrackleLevel] = useState(0);
  const [subBassFactor, setSubBassFactor] = useState(0);
  const [autoWahFactor, setAutoWahFactor] = useState(0);
  const [megaphoneFactor, setMegaphoneFactor] = useState(0);
  const [tapeDelayLevel, setTapeDelayLevel] = useState(0);
  const [fuzzFactor, setFuzzFactor] = useState(0);
  const [lofiSampleRate, setLofiSampleRate] = useState(0);
  const [haasDelayFactor, setHaasDelayFactor] = useState(0);
  const [dynamicPunch, setDynamicPunch] = useState(0);

  // Video output state
  const [videoNoir, setVideoNoir] = useState(false);

  // File output state
  const [outputName, setOutputName] = useState("");

  const [isTapeStopping, setIsTapeStopping] = useState(false);
  const tapeStopAnimRef = useRef<number | null>(null);

  // Core references
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformContainerRef = useRef<HTMLDivElement>(null);

  // Modular hooks
  const { musicFile, imageFile, musicUrl, imageUrl, onMusicDrop, onImageDrop } = useMediaManager();
  
  const { initWebAudio, resumeContext } = useAudioGraph({
      audioRef, rate, vibratoDepth, tremoloDepth, reverbMode, ambienceLevel, enable8D, chorusEnabled, bassGain, muffleFactor, highpassFactor, bitcrushFactor, overdriveFactor, flangerFactor, masterVolume,
      pingPongLevel, ringModFactor, phaserFactor, sidechainFactor, vinylCrackleLevel, subBassFactor, autoWahFactor, megaphoneFactor, tapeDelayLevel, fuzzFactor, lofiSampleRate, haasDelayFactor, dynamicPunch
  });

  const { isPlaying, trimStart, trimEnd, currentTime, duration, togglePlayback, stopPlayback, updateTrimRegion } = useWaveSurfer({
      waveformContainerRef, audioRef, musicUrl, enableLoop: isLooping, initWebAudio
  });

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const hundredths = Math.floor((time % 1) * 100);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${hundredths.toString().padStart(2, "0")}`;
  };

  const { exportMedia, isExporting, progress, progressText } = useFFmpegExport({
      musicFile, imageFile, rate, vibratoDepth, tremoloDepth, reverbMode, ambienceLevel, enable8D, chorusEnabled, bassGain, muffleFactor, highpassFactor, bitcrushFactor, overdriveFactor, flangerFactor, trimStart, trimEnd,
      pingPongLevel, ringModFactor, phaserFactor, sidechainFactor, vinylCrackleLevel, subBassFactor, autoWahFactor, videoNoir, megaphoneFactor, tapeDelayLevel, fuzzFactor, lofiSampleRate, haasDelayFactor, dynamicPunch,
      onExportComplete: resumeContext
  });

  const lastMusicFileRef = useRef<File | null>(null);

  useEffect(() => {
    if (musicFile && musicFile !== lastMusicFileRef.current) {
        lastMusicFileRef.current = musicFile;
        setOutputName(musicFile.name.replace(/\.[^/.]+$/, "") + " (zonewave mix)");
        setIsTapeStopping(false);
        if (tapeStopAnimRef.current) cancelAnimationFrame(tapeStopAnimRef.current);
    }
  }, [musicFile]);

  const toggleTapeStop = () => {
    if (!audioRef.current) return;
    if (!isTapeStopping) {
      setIsTapeStopping(true);
      let currentRate = audioRef.current.playbackRate;
      const decay = () => {
          if (!audioRef.current) return;
          currentRate *= 0.85; 
          audioRef.current.playbackRate = currentRate;
          if (currentRate < 0.05) {
              audioRef.current.playbackRate = 0;
              stopPlayback();
          } else {
              tapeStopAnimRef.current = requestAnimationFrame(decay);
          }
      };
      tapeStopAnimRef.current = requestAnimationFrame(decay);
    } else {
      setIsTapeStopping(false);
      if (tapeStopAnimRef.current) cancelAnimationFrame(tapeStopAnimRef.current);
      audioRef.current.playbackRate = rate; 
      if (!isPlaying) togglePlayback();
    }
  };

  const randomizeFX = () => {
    setRate(parseFloat((0.8 + Math.random() * 0.4).toFixed(2))); 
    setVibratoDepth(Math.random() > 0.5 ? parseFloat((Math.random() * 0.8).toFixed(2)) : 0);
    setTremoloDepth(Math.random() > 0.7 ? parseFloat((Math.random() * 0.8).toFixed(2)) : 0);
    setReverbMode(parseFloat(Math.random().toFixed(2)));
    setAmbienceLevel(Math.random() > 0.4 ? parseFloat((Math.random() * 0.6).toFixed(2)) : 0);
    setBassGain(Math.floor(Math.random() * 15));
    setMuffleFactor(Math.random() > 0.6 ? parseFloat((Math.random() * 0.8).toFixed(2)) : 0);
    setHighpassFactor(Math.random() > 0.8 ? parseFloat(Math.random().toFixed(2)) : 0);
    setBitcrushFactor(Math.random() > 0.85 ? parseFloat(Math.random().toFixed(2)) : 0);
    setOverdriveFactor(Math.random() > 0.85 ? parseFloat((Math.random() * 0.5).toFixed(2)) : 0);
    setFlangerFactor(Math.random() > 0.7 ? parseFloat((Math.random() * 0.8).toFixed(2)) : 0);
    setEnable8D(Math.random() > 0.8);
    setChorusEnabled(Math.random() > 0.5);
    setPingPongLevel(Math.random() > 0.7 ? parseFloat(Math.random().toFixed(2)) : 0);
    setRingModFactor(Math.random() > 0.85 ? parseFloat(Math.random().toFixed(2)) : 0);
    setPhaserFactor(Math.random() > 0.7 ? parseFloat(Math.random().toFixed(2)) : 0);
    setSidechainFactor(Math.random() > 0.6 ? parseFloat((Math.random() * 0.8).toFixed(2)) : 0);
    setVinylCrackleLevel(Math.random() > 0.5 ? parseFloat((Math.random() * 0.6).toFixed(2)) : 0);
    setSubBassFactor(Math.random() > 0.6 ? parseFloat(Math.random().toFixed(2)) : 0);
    setAutoWahFactor(Math.random() > 0.7 ? parseFloat(Math.random().toFixed(2)) : 0);
    setMegaphoneFactor(Math.random() > 0.8 ? parseFloat(Math.random().toFixed(2)) : 0);
    setTapeDelayLevel(Math.random() > 0.6 ? parseFloat((Math.random() * 0.8).toFixed(2)) : 0);
    setFuzzFactor(Math.random() > 0.8 ? parseFloat(Math.random().toFixed(2)) : 0);
    setLofiSampleRate(Math.random() > 0.8 ? parseFloat(Math.random().toFixed(2)) : 0);
    setHaasDelayFactor(Math.random() > 0.6 ? parseFloat(Math.random().toFixed(2)) : 0);
    setDynamicPunch(Math.random() > 0.6 ? parseFloat(Math.random().toFixed(2)) : 0);
  };

  return (
    <section className={`min-h-screen py-10 flex flex-col gap-[2rem] ${musicUrl ? 'justify-start' : 'justify-center'} items-center bg-black text-white px-4 font-sans tracking-widest relative overflow-x-hidden`}>
      {imageUrl && (
        <div 
          className="fixed inset-0 opacity-[0.15] pointer-events-none bg-cover bg-center z-0 transition-opacity duration-1000" 
          style={{ backgroundImage: `url(${imageUrl})`, filter: 'blur(20px)' }}
        />
      )}
      
      <div className="flex flex-col justify-center items-center text-center mt-10 z-10 w-full select-none">
        <h1 className="text-[3.5rem] md:text-[4.5rem] tracking-[0.25em] font-extrabold uppercase bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.35)]">zonewave.</h1>
        <h1 className="text-[0.75rem] md:text-[0.9rem] uppercase tracking-[0.4em] font-bold text-cyan-400 text-glow-cyan mt-1">the ultimate audio aesthetic suite</h1>
      </div>

      <div className="flex flex-col gap-[2rem] items-center justify-center max-w-5xl w-full relative z-10">
        <MediaDropzones 
           musicFile={musicFile} imageFile={imageFile} 
           onMusicDrop={onMusicDrop} onImageDrop={onImageDrop} 
        />

        {/* Waveform Module */}
        <div className={`w-full transition-all duration-700 ${musicUrl ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none hidden'}`}>
           <div className="w-full bg-zinc-900/60 p-6 rounded-xl border border-zinc-800 backdrop-blur-md shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => { initWebAudio(); resumeContext(); togglePlayback(); }} className="bg-white text-black w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                       {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} className="translate-x-[2px]" />}
                    </button>
                    <button onClick={stopPlayback} className="bg-zinc-800 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors">
                       <FaStop size={14} />
                    </button>
                    <button 
                       onClick={toggleTapeStop} 
                       className={`px-3 h-10 rounded-full flex items-center tracking-widest text-[9px] justify-center transition-colors font-bold ${isTapeStopping ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                       TAPE STOP
                    </button>
                    <button onClick={() => setIsLooping(!isLooping)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isLooping ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                       <FaSyncAlt size={14} />
                    </button>
                     
                     <div className="font-mono text-[10px] md:text-xs tracking-widest bg-zinc-950 px-3.5 h-10 rounded-full border border-zinc-800 text-zinc-400 flex items-center gap-2 select-none shadow-[inset_0_0_8px_rgba(0,0,0,0.8)]">
                       <span className="text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{formatTime(currentTime / rate)}</span>
                       <span className="text-zinc-600 font-bold">/</span>
                       <span className="text-zinc-500">{formatTime(duration / rate)}</span>
                     </div>
                </div>

                <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-700 flex-1 min-w-[150px] max-w-[200px]">
                    <FaVolumeUp className="text-zinc-400" size={14} />
                    <input 
                       type="range" min="0" max="1" step="0.01" 
                       value={masterVolume} 
                       onChange={(e) => setMasterVolume(parseFloat(e.target.value))} 
                       className="w-full relative top-[1px]" 
                    />
                </div>

                <div className="flex flex-col items-end gap-1">
                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Trim Region</p>
                   <div className="flex items-center gap-2">
                       <input type="number" step="0.1" value={Number(trimStart.toFixed(2))} onChange={e => updateTrimRegion(parseFloat(e.target.value), trimEnd)} className="bg-zinc-800 text-white font-mono text-xs w-[80px] px-1 py-1 outline-none text-center rounded border border-zinc-700 hover:border-zinc-500 focus:border-white transition-colors" />
                       <span className="text-zinc-600">-</span> 
                       <input type="number" step="0.1" value={Number(trimEnd.toFixed(2))} onChange={e => updateTrimRegion(trimStart, parseFloat(e.target.value))} className="bg-zinc-800 text-white font-mono text-xs w-[80px] px-1 py-1 outline-none text-center rounded border border-zinc-700 hover:border-zinc-500 focus:border-white transition-colors" />
                   </div>
                </div>
              </div>
              
              <audio ref={audioRef} loop={isLooping} hidden />
              <div ref={waveformContainerRef} className="w-full relative z-0" />
           </div>
        </div>

        <div className={`w-full transition-all duration-700 delay-100 ${musicUrl ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none hidden'}`}>
           <FXRack 
              rate={rate} setRate={setRate}
              vibratoDepth={vibratoDepth} setVibratoDepth={setVibratoDepth}
              tremoloDepth={tremoloDepth} setTremoloDepth={setTremoloDepth}
              reverbMode={reverbMode} setReverbMode={setReverbMode}
              ambienceLevel={ambienceLevel} setAmbienceLevel={setAmbienceLevel}
              enable8D={enable8D} setEnable8D={setEnable8D}
              chorusEnabled={chorusEnabled} setChorusEnabled={setChorusEnabled}
              bassGain={bassGain} setBassGain={setBassGain}
              muffleFactor={muffleFactor} setMuffleFactor={setMuffleFactor}
              highpassFactor={highpassFactor} setHighpassFactor={setHighpassFactor}
              bitcrushFactor={bitcrushFactor} setBitcrushFactor={setBitcrushFactor}
              overdriveFactor={overdriveFactor} setOverdriveFactor={setOverdriveFactor}
              flangerFactor={flangerFactor} setFlangerFactor={setFlangerFactor}
              pingPongLevel={pingPongLevel} setPingPongLevel={setPingPongLevel}
              ringModFactor={ringModFactor} setRingModFactor={setRingModFactor}
              phaserFactor={phaserFactor} setPhaserFactor={setPhaserFactor}
              sidechainFactor={sidechainFactor} setSidechainFactor={setSidechainFactor}
              vinylCrackleLevel={vinylCrackleLevel} setVinylCrackleLevel={setVinylCrackleLevel}
              subBassFactor={subBassFactor} setSubBassFactor={setSubBassFactor}
              autoWahFactor={autoWahFactor} setAutoWahFactor={setAutoWahFactor}
              megaphoneFactor={megaphoneFactor} setMegaphoneFactor={setMegaphoneFactor}
              tapeDelayLevel={tapeDelayLevel} setTapeDelayLevel={setTapeDelayLevel}
              fuzzFactor={fuzzFactor} setFuzzFactor={setFuzzFactor}
              lofiSampleRate={lofiSampleRate} setLofiSampleRate={setLofiSampleRate}
              haasDelayFactor={haasDelayFactor} setHaasDelayFactor={setHaasDelayFactor}
              dynamicPunch={dynamicPunch} setDynamicPunch={setDynamicPunch}
           />
        </div>

        <ProcessingOverlay isExporting={isExporting} progress={progress} progressText={progressText} />

        {/* Export Suite */}
        <div className={`flex flex-col gap-6 w-full mt-4 transition-all duration-700 delay-200 ${musicUrl ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none hidden'}`}>
          
          <div className="flex justify-between items-end w-full px-2 gap-4">
            <div className="flex flex-col gap-1 flex-1 relative">
               <label className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Output Filename</label>
               <input type="text" value={outputName} onChange={e => setOutputName(e.target.value)} placeholder="Export Filename" className="bg-transparent border-b border-zinc-700 focus:border-white transition-colors outline-none font-mono text-xl text-white py-1 w-full pr-8" />
               {outputName && (
                  <button onClick={() => setOutputName("")} className="absolute right-0 bottom-2 text-zinc-500 hover:text-white transition-colors font-mono text-sm leading-none bg-zinc-800 rounded-full w-[22px] h-[22px] flex items-center justify-center pb-[2px]">×</button>
               )}
            </div>
            <button onClick={randomizeFX} className="bg-zinc-800 hover:bg-white hover:text-black transition-colors px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg mb-1 border border-zinc-700 border-b-2 flex-shrink-0">
                <FaDice size={16} /> <span className="hidden md:inline">RANDOMIZE VIBE</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-[1rem] justify-center w-full">
            <button 
              disabled={!musicFile || isExporting || !outputName}
              onClick={() => exportMedia('mp3', outputName)}
              className="flex-1 min-w-[200px] bg-zinc-800 p-[1.5rem] rounded-xl hover:bg-white hover:text-black transition-colors font-bold text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-zinc-300 shadow-xl">
              Export as Audio (.mp3)
            </button>
            <div className="flex-[2] min-w-[300px] flex gap-2">
              <button 
                disabled={!musicFile || !imageFile || isExporting || !outputName}
                onClick={() => exportMedia('mp4', outputName)}
                className="flex-[3] bg-white text-black p-[1.5rem] rounded-xl hover:bg-zinc-200 transition-colors font-bold text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                {imageFile ? "Export as Video (.mp4)" : "Add Artwork for Video"}
              </button>
              
              <button
                disabled={!imageFile || isExporting}
                onClick={() => setVideoNoir(!videoNoir)}
                className={`flex-1 rounded-xl font-bold text-[10px] uppercase transition-all whitespace-normal border border-zinc-700 flex flex-col items-center justify-center gap-1 ${videoNoir ? 'bg-zinc-300 text-black border-zinc-300' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>
                {videoNoir ? <span className="w-2 h-2 rounded-full bg-black block mb-1"></span> : <span className="w-2 h-2 rounded-full bg-zinc-700 block mb-1"></span>}
                Noir Filter
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}