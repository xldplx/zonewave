import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { FaPlay, FaPause, FaStop, FaDice, FaVolumeUp, FaSyncAlt } from "react-icons/fa";

// Hooks
import { useMediaManager } from "./hooks/useMediaManager";
import { useAudioGraph } from "./hooks/useAudioGraph";
import { useWaveSurfer } from "./hooks/useWaveSurfer";
import { useFFmpegExport } from "./hooks/useFFmpegExport";

// Components & Constants
import { FXRack } from "./components/FXRack";
import { MediaDropzones } from "./components/MediaDropzones";
import { ProcessingOverlay } from "./components/ProcessingOverlay";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { PresetBar } from "./components/PresetBar";
import type { Preset } from "./constants/presets";

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

  // BPM Sync State
  const [bpm, setBpm] = useState(120);
  const [bpmSyncEnabled, setBpmSyncEnabled] = useState(false);
  const [tremoloSyncDivision, setTremoloSyncDivision] = useState("1/4");
  const [delaySyncDivision, setDelaySyncDivision] = useState("1/4");
  const [sidechainSyncDivision, setSidechainSyncDivision] = useState("1/4");

  // Video output state
  const [videoNoir, setVideoNoir] = useState(false);
  const [outputName, setOutputName] = useState("");
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Pitch & A/B Bypass states
  const [isBypassed, setIsBypassed] = useState(false);
  const [pitchSemitones, setPitchSemitones] = useState(0);
  const [preservePitch, setPreservePitch] = useState(false);

  const [isTapeStopping, setIsTapeStopping] = useState(false);
  const tapeStopAnimRef = useRef<number | null>(null);

  // Core references
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformContainerRef = useRef<HTMLDivElement>(null);

  // Modular hooks
  const { musicFile, imageFile, musicUrl, imageUrl, onMusicDrop, onImageDrop } = useMediaManager();
  
  const { initWebAudio, resumeContext, analyserRef } = useAudioGraph({
    audioRef, rate, vibratoDepth, tremoloDepth, reverbMode, ambienceLevel, enable8D, chorusEnabled, bassGain, muffleFactor, highpassFactor, bitcrushFactor, overdriveFactor, flangerFactor, masterVolume,
    pingPongLevel, ringModFactor, phaserFactor, sidechainFactor, vinylCrackleLevel, subBassFactor, autoWahFactor, megaphoneFactor, tapeDelayLevel, fuzzFactor, lofiSampleRate, haasDelayFactor, dynamicPunch,
    bpm, bpmSyncEnabled, tremoloSyncDivision, delaySyncDivision, sidechainSyncDivision,
    isBypassed, pitchSemitones, preservePitch
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
    bpm, bpmSyncEnabled, tremoloSyncDivision, delaySyncDivision, sidechainSyncDivision,
    pitchSemitones, preservePitch,
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

  const toggleTapeStop = useCallback(() => {
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
  }, [isTapeStopping, isPlaying, rate, stopPlayback, togglePlayback]);

  // Preset Applicator
  const applyPreset = (preset: Preset) => {
    setActivePresetId(preset.id);
    const v = preset.values;
    setRate(v.rate ?? 1.0);
    setVibratoDepth(v.vibratoDepth ?? 0);
    setTremoloDepth(v.tremoloDepth ?? 0);
    setReverbMode(v.reverbMode ?? 0);
    setAmbienceLevel(v.ambienceLevel ?? 0);
    setEnable8D(v.enable8D ?? false);
    setChorusEnabled(v.chorusEnabled ?? false);
    setBassGain(v.bassGain ?? 0);
    setMuffleFactor(v.muffleFactor ?? 0);
    setHighpassFactor(v.highpassFactor ?? 0);
    setBitcrushFactor(v.bitcrushFactor ?? 0);
    setOverdriveFactor(v.overdriveFactor ?? 0);
    setFlangerFactor(v.flangerFactor ?? 0);
    setPingPongLevel(v.pingPongLevel ?? 0);
    setRingModFactor(v.ringModFactor ?? 0);
    setPhaserFactor(v.phaserFactor ?? 0);
    setSidechainFactor(v.sidechainFactor ?? 0);
    setVinylCrackleLevel(v.vinylCrackleLevel ?? 0);
    setSubBassFactor(v.subBassFactor ?? 0);
    setAutoWahFactor(v.autoWahFactor ?? 0);
    setMegaphoneFactor(v.megaphoneFactor ?? 0);
    setTapeDelayLevel(v.tapeDelayLevel ?? 0);
    setFuzzFactor(v.fuzzFactor ?? 0);
    setLofiSampleRate(v.lofiSampleRate ?? 0);
    setHaasDelayFactor(v.haasDelayFactor ?? 0);
    setDynamicPunch(v.dynamicPunch ?? 0);
    setPitchSemitones(0);
    setPreservePitch(false);
    setIsBypassed(false);
  };

  const randomizeFX = useCallback(() => {
    setActivePresetId(null);
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
  }, []);

  // Calculate active FX count for telemetry
  const activeFxCount = useMemo(() => {
    let count = 0;
    if (rate !== 1.0) count++;
    if (vibratoDepth > 0) count++;
    if (tremoloDepth > 0) count++;
    if (reverbMode > 0) count++;
    if (ambienceLevel > 0) count++;
    if (enable8D) count++;
    if (chorusEnabled) count++;
    if (bassGain > 0) count++;
    if (muffleFactor > 0) count++;
    if (highpassFactor > 0) count++;
    if (bitcrushFactor > 0) count++;
    if (overdriveFactor > 0) count++;
    if (flangerFactor > 0) count++;
    if (pingPongLevel > 0) count++;
    if (ringModFactor > 0) count++;
    if (phaserFactor > 0) count++;
    if (sidechainFactor > 0) count++;
    if (vinylCrackleLevel > 0) count++;
    if (subBassFactor > 0) count++;
    if (autoWahFactor > 0) count++;
    if (megaphoneFactor > 0) count++;
    if (tapeDelayLevel > 0) count++;
    if (fuzzFactor > 0) count++;
    if (lofiSampleRate > 0) count++;
    if (haasDelayFactor > 0) count++;
    if (dynamicPunch > 0) count++;
    if (pitchSemitones !== 0) count++;
    if (preservePitch) count++;
    return count;
  }, [
    rate, vibratoDepth, tremoloDepth, reverbMode, ambienceLevel, enable8D, chorusEnabled,
    bassGain, muffleFactor, highpassFactor, bitcrushFactor, overdriveFactor, flangerFactor,
    pingPongLevel, ringModFactor, phaserFactor, sidechainFactor, vinylCrackleLevel,
    subBassFactor, autoWahFactor, megaphoneFactor, tapeDelayLevel, fuzzFactor,
    lofiSampleRate, haasDelayFactor, dynamicPunch, pitchSemitones, preservePitch
  ]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in text inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        initWebAudio();
        resumeContext();
        togglePlayback();
      } else if (e.key === 'r' || e.key === 'R') {
        randomizeFX();
      } else if (e.key === 'l' || e.key === 'L') {
        setIsLooping((prev) => !prev);
      } else if (e.key === 't' || e.key === 'T') {
        toggleTapeStop();
      } else if (e.key === 'b' || e.key === 'B') {
        setIsBypassed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initWebAudio, resumeContext, togglePlayback, randomizeFX, toggleTapeStop]);

  return (
    <main className={`min-h-screen flex flex-col items-center bg-black text-white px-4 font-sans selection:bg-white selection:text-black relative ${!musicUrl ? 'justify-center py-12' : 'justify-start py-8'}`}>
      {/* Background artwork blur overlay if uploaded */}
      {imageUrl && (
        <div 
          className="fixed inset-0 opacity-10 pointer-events-none bg-cover bg-center z-0 transition-opacity duration-1000" 
          style={{ backgroundImage: `url(${imageUrl})`, filter: 'blur(30px)' }}
        />
      )}

      {!musicUrl ? (
        <div className="flex flex-col items-center justify-center w-full max-w-3xl text-center z-10">
          <h1 className="text-4xl md:text-6xl tracking-[0.25em] font-black uppercase text-white font-mono">
            ZONEWAVE
          </h1>
          <p className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase mt-2 mb-8">
            Audio remix studio
          </p>

          <div className="w-full">
            <MediaDropzones 
              musicFile={musicFile} 
              imageFile={imageFile} 
              onMusicDrop={onMusicDrop} 
              onImageDrop={onImageDrop} 
            />
          </div>
        </div>
      ) : (
        <>
          {/* Workstation Header */}
          <header className="flex items-center justify-between w-full max-w-5xl select-none border-b border-zinc-900 pb-4 mb-6 z-10">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl tracking-[0.2em] font-black uppercase text-white font-mono">
                ZONEWAVE
              </h1>
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase hidden sm:inline">
                remix studio
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
              <span className="bg-zinc-950 px-2.5 py-1 rounded border border-zinc-900">
                Active FX: <strong className="text-white">{activeFxCount}</strong>
              </span>
              {bpmSyncEnabled && (
                <span className="bg-zinc-950 px-2.5 py-1 rounded border border-zinc-900 text-zinc-300">
                  {bpm} BPM
                </span>
              )}
            </div>
          </header>

          {/* Main Workstation Container */}
          <div className="flex flex-col gap-5 items-center justify-center max-w-5xl w-full relative z-10">
            
            {/* Media Upload Dropzones */}
            <MediaDropzones 
              musicFile={musicFile} 
              imageFile={imageFile} 
              onMusicDrop={onMusicDrop} 
              onImageDrop={onImageDrop} 
            />

            {/* Waveform & Hardware Transport Module */}
            <div className="w-full bg-[#09090b] p-5 rounded-xl border border-zinc-800/80 shadow-2xl flex flex-col gap-4 transition-all">
            
            {/* Real-time Spectrum Visualizer */}
            <AudioVisualizer analyserRef={analyserRef} isPlaying={isPlaying} />

            {/* Transport Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={() => { initWebAudio(); resumeContext(); togglePlayback(); }} 
                  title="Play / Pause (Space)"
                  className="bg-white text-black w-11 h-11 rounded-lg flex items-center justify-center hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                >
                  {isPlaying ? <FaPause size={15} /> : <FaPlay size={15} className="translate-x-[1px]" />}
                </button>

                <button 
                  onClick={stopPlayback} 
                  title="Stop"
                  className="bg-zinc-900 text-zinc-400 hover:text-white w-9 h-9 rounded-lg flex items-center justify-center border border-zinc-800 hover:border-zinc-600 transition-colors"
                >
                  <FaStop size={12} />
                </button>

                <button 
                  onClick={toggleTapeStop} 
                  title="Tape Stop Effect (T)"
                  className={`px-3 h-9 rounded-lg flex items-center tracking-widest text-[9px] font-mono font-bold justify-center transition-all border ${
                    isTapeStopping 
                      ? 'bg-white text-black border-white animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.4)]' 
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  TAPE STOP
                </button>

                <button 
                  onClick={() => setIsLooping(!isLooping)} 
                  title="Toggle Loop (L)"
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors border ${
                    isLooping 
                      ? 'bg-zinc-200 text-black border-zinc-200' 
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white'
                  }`}
                >
                  <FaSyncAlt size={12} />
                </button>

                {/* A/B Bypass Button */}
                <button 
                  onClick={() => setIsBypassed(!isBypassed)} 
                  title="A/B Bypass (B) - Toggle between raw track and processed mix"
                  className={`px-3 h-9 rounded-lg flex items-center tracking-widest text-[9px] font-mono font-bold justify-center transition-all border ${
                    isBypassed 
                      ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.35)]' 
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  {isBypassed ? "BYPASS ON" : "BYPASS (B)"}
                </button>

                {bpmSyncEnabled && (
                  <div 
                    className={`w-3 h-3 rounded-full border border-white flex-shrink-0 transition-all ${isPlaying ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-transparent'}`}
                    style={{ animationDuration: `${60 / bpm}s` }}
                    title={`BPM Metronome: ${bpm}`}
                  />
                )}
                
                {/* Time Clock Display */}
                <div className="font-mono text-[11px] tracking-widest bg-black px-3.5 h-9 rounded-lg border border-zinc-800 text-zinc-400 flex items-center gap-2 select-none">
                  <span className="text-white font-bold">{formatTime(currentTime / rate)}</span>
                  <span className="text-zinc-600 font-bold">/</span>
                  <span className="text-zinc-500">{formatTime(duration / rate)}</span>
                </div>
              </div>

              {/* Master Volume */}
              <div className="flex items-center gap-2.5 bg-black px-3 py-1.5 rounded-lg border border-zinc-800 min-w-[140px] max-w-[180px]">
                <FaVolumeUp className="text-zinc-500" size={12} />
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={masterVolume} 
                  onChange={(e) => setMasterVolume(parseFloat(e.target.value))} 
                  className="w-full" 
                />
              </div>

              {/* Trim Region Input Controls */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase">TRIM</span>
                <input 
                  type="number" step="0.1" 
                  value={Number(trimStart.toFixed(2))} 
                  onChange={e => updateTrimRegion(parseFloat(e.target.value), trimEnd)} 
                  className="bg-black text-white font-mono text-[10px] w-[65px] px-1 py-1 outline-none text-center rounded border border-zinc-800 hover:border-zinc-600 focus:border-white transition-colors" 
                />
                <span className="text-zinc-600 text-xs font-mono">-</span> 
                <input 
                  type="number" step="0.1" 
                  value={Number(trimEnd.toFixed(2))} 
                  onChange={e => updateTrimRegion(trimStart, parseFloat(e.target.value))} 
                  className="bg-black text-white font-mono text-[10px] w-[65px] px-1 py-1 outline-none text-center rounded border border-zinc-800 hover:border-zinc-600 focus:border-white transition-colors" 
                />
              </div>
            </div>
            
            {/* WaveSurfer waveform visualizer element */}
            <audio ref={audioRef} loop={isLooping} hidden />
            <div ref={waveformContainerRef} className="w-full rounded bg-black/50 p-1 border border-zinc-900" />
          </div>

          {/* Preset Selector Bar */}
          <PresetBar 
            activePresetId={activePresetId} 
            onSelectPreset={applyPreset} 
          />

          {/* Modular FX Rack */}
          <FXRack 
            rate={rate} setRate={(v) => { setActivePresetId(null); setRate(v); }}
            vibratoDepth={vibratoDepth} setVibratoDepth={(v) => { setActivePresetId(null); setVibratoDepth(v); }}
            tremoloDepth={tremoloDepth} setTremoloDepth={(v) => { setActivePresetId(null); setTremoloDepth(v); }}
            reverbMode={reverbMode} setReverbMode={(v) => { setActivePresetId(null); setReverbMode(v); }}
            ambienceLevel={ambienceLevel} setAmbienceLevel={(v) => { setActivePresetId(null); setAmbienceLevel(v); }}
            enable8D={enable8D} setEnable8D={(v) => { setActivePresetId(null); setEnable8D(v); }}
            chorusEnabled={chorusEnabled} setChorusEnabled={(v) => { setActivePresetId(null); setChorusEnabled(v); }}
            bassGain={bassGain} setBassGain={(v) => { setActivePresetId(null); setBassGain(v); }}
            muffleFactor={muffleFactor} setMuffleFactor={(v) => { setActivePresetId(null); setMuffleFactor(v); }}
            highpassFactor={highpassFactor} setHighpassFactor={(v) => { setActivePresetId(null); setHighpassFactor(v); }}
            bitcrushFactor={bitcrushFactor} setBitcrushFactor={(v) => { setActivePresetId(null); setBitcrushFactor(v); }}
            overdriveFactor={overdriveFactor} setOverdriveFactor={(v) => { setActivePresetId(null); setOverdriveFactor(v); }}
            flangerFactor={flangerFactor} setFlangerFactor={(v) => { setActivePresetId(null); setFlangerFactor(v); }}
            pingPongLevel={pingPongLevel} setPingPongLevel={(v) => { setActivePresetId(null); setPingPongLevel(v); }}
            ringModFactor={ringModFactor} setRingModFactor={(v) => { setActivePresetId(null); setRingModFactor(v); }}
            phaserFactor={phaserFactor} setPhaserFactor={(v) => { setActivePresetId(null); setPhaserFactor(v); }}
            sidechainFactor={sidechainFactor} setSidechainFactor={(v) => { setActivePresetId(null); setSidechainFactor(v); }}
            vinylCrackleLevel={vinylCrackleLevel} setVinylCrackleLevel={(v) => { setActivePresetId(null); setVinylCrackleLevel(v); }}
            subBassFactor={subBassFactor} setSubBassFactor={(v) => { setActivePresetId(null); setSubBassFactor(v); }}
            autoWahFactor={autoWahFactor} setAutoWahFactor={(v) => { setActivePresetId(null); setAutoWahFactor(v); }}
            megaphoneFactor={megaphoneFactor} setMegaphoneFactor={(v) => { setActivePresetId(null); setMegaphoneFactor(v); }}
            tapeDelayLevel={tapeDelayLevel} setTapeDelayLevel={(v) => { setActivePresetId(null); setTapeDelayLevel(v); }}
            fuzzFactor={fuzzFactor} setFuzzFactor={(v) => { setActivePresetId(null); setFuzzFactor(v); }}
            lofiSampleRate={lofiSampleRate} setLofiSampleRate={(v) => { setActivePresetId(null); setLofiSampleRate(v); }}
            haasDelayFactor={haasDelayFactor} setHaasDelayFactor={(v) => { setActivePresetId(null); setHaasDelayFactor(v); }}
            dynamicPunch={dynamicPunch} setDynamicPunch={(v) => { setActivePresetId(null); setDynamicPunch(v); }}
            bpm={bpm} setBpm={setBpm}
            bpmSyncEnabled={bpmSyncEnabled} setBpmSyncEnabled={setBpmSyncEnabled}
            tremoloSyncDivision={tremoloSyncDivision} setTremoloSyncDivision={setTremoloSyncDivision}
            delaySyncDivision={delaySyncDivision} setDelaySyncDivision={setDelaySyncDivision}
            sidechainSyncDivision={sidechainSyncDivision} setSidechainSyncDivision={setSidechainSyncDivision}
            pitchSemitones={pitchSemitones} setPitchSemitones={(v) => { setActivePresetId(null); setPitchSemitones(v); }}
            preservePitch={preservePitch} setPreservePitch={(v) => { setActivePresetId(null); setPreservePitch(v); }}
          />

          {/* Processing Spinner Overlay */}
          <ProcessingOverlay isExporting={isExporting} progress={progress} progressText={progressText} />

          {/* Export Section */}
          <div className="flex flex-col gap-4 w-full mt-2 select-none bg-[#09090b] p-5 rounded-xl border border-zinc-800/80 shadow-xl">
            <div className="flex justify-between items-end w-full gap-4">
              <div className="flex flex-col gap-1 flex-1 relative">
                <label className="text-[9px] font-mono text-zinc-400 font-bold tracking-[0.2em] uppercase">
                  Output Filename
                </label>
                <input 
                  type="text" 
                  value={outputName} 
                  onChange={e => setOutputName(e.target.value)} 
                  placeholder="Filename without extension" 
                  className="bg-black border border-zinc-800 focus:border-white px-3 py-2 rounded-lg transition-colors outline-none font-mono text-sm text-white w-full pr-8" 
                />
                {outputName && (
                  <button 
                    onClick={() => setOutputName("")} 
                    className="absolute right-2 bottom-2 text-zinc-500 hover:text-white transition-colors font-mono text-xs bg-zinc-900 rounded px-1.5 py-0.5"
                  >
                    ×
                  </button>
                )}
              </div>
              
              <button 
                onClick={randomizeFX} 
                title="Randomize Parameters (R)"
                className="bg-zinc-900 hover:bg-white hover:text-black transition-all px-4 py-2.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 border border-zinc-700 hover:border-white flex-shrink-0"
              >
                <FaDice size={14} /> 
                <span className="hidden md:inline uppercase tracking-wider">RANDOMIZE FX</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-3 justify-center w-full mt-2">
              <button 
                disabled={!musicFile || isExporting || !outputName}
                onClick={() => exportMedia('mp3', outputName)}
                className="flex-1 min-w-[150px] bg-zinc-900 border border-zinc-700 p-4 rounded-xl hover:bg-white hover:text-black transition-all font-mono font-bold text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
              >
                Export MP3 (.mp3)
              </button>

              <button 
                disabled={!musicFile || isExporting || !outputName}
                onClick={() => exportMedia('wav', outputName)}
                className="flex-1 min-w-[150px] bg-zinc-900 border border-zinc-700 p-4 rounded-xl hover:bg-white hover:text-black transition-all font-mono font-bold text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
              >
                Export WAV (.wav)
              </button>

              <div className="flex-[2] min-w-[280px] flex gap-2">
                <button 
                  disabled={!musicFile || !imageFile || isExporting || !outputName}
                  onClick={() => exportMedia('mp4', outputName)}
                  className="flex-[3] bg-white text-black border border-white p-4 rounded-xl hover:bg-zinc-200 transition-all font-mono font-bold text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                >
                  {imageFile ? "Export Video (.mp4)" : "Upload Artwork for Video"}
                </button>
                
                <button
                  disabled={!imageFile || isExporting}
                  onClick={() => setVideoNoir(!videoNoir)}
                  className={`flex-1 rounded-xl font-mono font-bold text-[9px] uppercase tracking-wider transition-all border flex flex-col items-center justify-center gap-1 ${
                    videoNoir 
                      ? 'bg-zinc-200 text-black border-zinc-200 font-black' 
                      : 'bg-black text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${videoNoir ? 'bg-black' : 'bg-zinc-700'}`} />
                  NOIR B&W
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )}
  </main>
);
}