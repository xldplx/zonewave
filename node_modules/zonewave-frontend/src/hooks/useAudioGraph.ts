import { useState, useRef, useEffect } from "react";
import type { RefObject } from "react";

export function useAudioGraph({
  audioRef,
  rate,
  vibratoDepth,
  tremoloDepth,
  reverbMode,
  ambienceLevel,
  enable8D,
  chorusEnabled,
  bassGain,
  muffleFactor,
  highpassFactor,
  bitcrushFactor,
  overdriveFactor,
  flangerFactor,
  masterVolume,
  pingPongLevel,
  ringModFactor,
  phaserFactor,
  sidechainFactor,
  vinylCrackleLevel,
  subBassFactor
}: {
  audioRef: RefObject<HTMLAudioElement | null>;
  rate: number;
  vibratoDepth: number;
  tremoloDepth: number;
  reverbMode: number;
  ambienceLevel: number;
  enable8D: boolean;
  chorusEnabled: boolean;
  bassGain: number;
  muffleFactor: number;
  highpassFactor: number;
  bitcrushFactor: number;
  overdriveFactor: number;
  flangerFactor: number;
  masterVolume: number;
  pingPongLevel: number;
  ringModFactor: number;
  phaserFactor: number;
  sidechainFactor: number;
  vinylCrackleLevel: number;
  subBassFactor: number;
}) {
  const [ctxInitialized, setCtxInitialized] = useState(false);
  
  // Natively cached nodes
  const biquadRef = useRef<BiquadFilterNode | null>(null);
  const muffleRef = useRef<BiquadFilterNode | null>(null);
  const highpassRef = useRef<BiquadFilterNode | null>(null);
  
  const bitcrushRef = useRef<WaveShaperNode | null>(null);
  const vibratoLfoGainRef = useRef<GainNode | null>(null);
  const tremoloLfoGainRef = useRef<GainNode | null>(null);
  const tremoloGainRef = useRef<GainNode | null>(null);

  const chorusLfoRef = useRef<GainNode | null>(null);
  const chorusWetGainRef = useRef<GainNode | null>(null);
  
  const pannerLfoGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null); 
  const wetGainRef = useRef<GainNode | null>(null); 
  
  const ambientGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const overdriveRef = useRef<WaveShaperNode | null>(null);
  
  const flangerWetRef = useRef<GainNode | null>(null);
  const flangerLfoRef = useRef<GainNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  // New FX Refs
  const pingPongWetRef = useRef<GainNode | null>(null);
  const ringModWetRef = useRef<GainNode | null>(null);
  const phaserLfoRef = useRef<GainNode | null>(null);
  const phaserWetRef = useRef<GainNode | null>(null);
  const sidechainLfoGainRef = useRef<GainNode | null>(null);
  const vinylGainRef = useRef<GainNode | null>(null);
  const subBassGainRef = useRef<GainNode | null>(null);

  // Bitcrusher generator
  const makeDistortionCurve = (amount: number) => {
    const k = amount * 100; // 0 to 1 scaling
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = i * 2 / n_samples - 1;
      // Step quantization based on amount
      const step = Math.max(1, 100 - k);
      const steppedX = Math.round(x * step) / step;
      curve[i] = (3 + k) * steppedX * 20 * deg / (Math.PI + k * Math.abs(steppedX));
    }
    return curve;
  };

  const makeOverdriveCurve = (amount: number) => {
    const k = amount * 100; // 0 to 1 scaling equivalent
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = i * 2 / n_samples - 1;
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  const initWebAudio = () => {
    if (!audioRef.current || ctxRef.current) return;
    
    const ctx = new window.AudioContext();
    ctxRef.current = ctx;

    const source = ctx.createMediaElementSource(audioRef.current);

    // 1. Vibrato (Tape Flutter) -> DelayNode modulated by LFO
    const vibratoDelay = ctx.createDelay();
    vibratoDelay.delayTime.value = 0.05;
    const vibratoLfo = ctx.createOscillator();
    vibratoLfo.frequency.value = 4.0; // 4Hz cassette flutter
    const vibratoLfoGain = ctx.createGain();
    vibratoLfoGain.gain.value = vibratoDepth * 0.005; 
    vibratoLfo.connect(vibratoLfoGain);
    vibratoLfoGain.connect(vibratoDelay.delayTime);
    vibratoLfo.start();
    vibratoLfoGainRef.current = vibratoLfoGain;

    // 2. EQ Nodes
    const biquad = ctx.createBiquadFilter();
    biquad.type = 'lowshelf';
    biquad.frequency.value = 110;
    biquad.gain.value = bassGain;
    biquadRef.current = biquad;

    const muffle = ctx.createBiquadFilter();
    muffle.type = 'lowpass';
    muffle.frequency.value = 15000 - (muffleFactor * 14000); 
    muffleRef.current = muffle;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 20 + (highpassFactor * 3000); 
    highpassRef.current = highpass;

    // 3. Bitcrusher
    const bitcrush = ctx.createWaveShaper();
    bitcrush.curve = bitcrushFactor > 0 ? makeDistortionCurve(bitcrushFactor) : null;
    bitcrush.oversample = 'none';
    bitcrushRef.current = bitcrush;

    // Overdrive
    const overdrive = ctx.createWaveShaper();
    overdrive.curve = overdriveFactor > 0 ? makeOverdriveCurve(overdriveFactor) : null;
    overdriveRef.current = overdrive;

    // 4. Tremolo (Stutter)
    const tremoloGain = ctx.createGain();
    tremoloGain.gain.value = 1.0; 
    const tremoloLfo = ctx.createOscillator();
    tremoloLfo.type = 'square'; // Aggressive stutter
    tremoloLfo.frequency.value = 10.0; // 10Hz
    const tremoloLfoGain = ctx.createGain();
    tremoloLfoGain.gain.value = tremoloDepth; // Push LFO to modulate 0 to 1
    tremoloLfo.connect(tremoloLfoGain);
    tremoloLfoGain.connect(tremoloGain.gain);
    tremoloLfo.start();
    tremoloGainRef.current = tremoloGain;
    tremoloLfoGainRef.current = tremoloLfoGain;

    // 5. Chorus Stereowidener (now correctly separated and phased)
    const chorusDelayR = ctx.createDelay();
    chorusDelayR.delayTime.value = 0.04;
    const chorusDelayL = ctx.createDelay();
    chorusDelayL.delayTime.value = 0.02;

    const chorusLfo = ctx.createOscillator();
    chorusLfo.frequency.value = 1.2;
    const chorusLfoGain = ctx.createGain();
    chorusLfoGain.gain.value = chorusEnabled ? 0.003 : 0;
    chorusLfo.connect(chorusLfoGain);
    chorusLfoGain.connect(chorusDelayR.delayTime);
    chorusLfoGain.connect(chorusDelayL.delayTime);
    chorusLfo.start();

    const preChorusGain = ctx.createGain();
    const chorusWetGain = ctx.createGain();
    preChorusGain.gain.value = chorusEnabled ? 0.5 : 1;
    chorusWetGain.gain.value = chorusEnabled ? 0.5 : 0;

    const merger = ctx.createChannelMerger(2);
    chorusDelayL.connect(merger, 0, 0); // L
    chorusDelayR.connect(merger, 0, 1); // R
    merger.connect(chorusWetGain);

    chorusLfoRef.current = chorusLfoGain;
    chorusWetGainRef.current = chorusWetGain;

    // 6. Tape Flanger
    const flangerDelay = ctx.createDelay(1.0);
    flangerDelay.delayTime.value = 0.003;
    const flangerLfo = ctx.createOscillator();
    flangerLfo.type = 'sine';
    flangerLfo.frequency.value = 0.5;
    const flangerLfoGain = ctx.createGain();
    flangerLfoGain.gain.value = flangerFactor * 0.002;
    flangerLfo.connect(flangerLfoGain);
    flangerLfoGain.connect(flangerDelay.delayTime);
    flangerLfo.start();

    const flangerWet = ctx.createGain();
    flangerWet.gain.value = flangerFactor > 0 ? 0.6 : 0;
    const preFlangerDry = ctx.createGain();
    preFlangerDry.gain.value = 1.0;

    flangerWetRef.current = flangerWet;
    flangerLfoRef.current = flangerLfoGain;

    // 7. 8D Panner
    const panner = ctx.createStereoPanner();
    const pannerLfo = ctx.createOscillator();
    pannerLfo.frequency.value = 0.1;
    const pannerLfoGain = ctx.createGain();
    pannerLfoGain.gain.value = enable8D ? 1 : 0;
    pannerLfo.connect(pannerLfoGain);
    pannerLfoGain.connect(panner.pan);
    pannerLfo.start();
    pannerLfoGainRef.current = pannerLfoGain;

    // 7. Concert Hall Reverb
    const convolver = ctx.createConvolver();
    const length = ctx.sampleRate * 3.0;
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    let prevL = 0; let prevR = 0;
    for (let i = 0; i < length; i++) {
        const factor = Math.pow(1 - i / length, 4); 
        prevL = prevL + 0.1 * ((Math.random() * 2 - 1) - prevL);
        prevR = prevR + 0.1 * ((Math.random() * 2 - 1) - prevR);
        impulse.getChannelData(0)[i] = prevL * factor;
        impulse.getChannelData(1)[i] = prevR * factor;
    }
    convolver.buffer = impulse;

    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    dryGain.gain.value = 1 - reverbMode;
    wetGain.gain.value = reverbMode;
    dryGainRef.current = dryGain;
    wetGainRef.current = wetGain;
    
    // 8. Vinyl Brown Noise Generator
    const noiseBufferSize = ctx.sampleRate * 2; 
    const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < noiseBufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate gain
    }
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    const ambientGain = ctx.createGain();
    ambientGain.gain.value = ambienceLevel;
    
    // 9. Vinyl Crackle Dust
    const vinylBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const vOut = vinylBuffer.getChannelData(0);
    for (let i = 0; i < vinylBuffer.length; i++) {
       vOut[i] = Math.random() > 0.995 ? (Math.random() * 2 - 1) * 0.8 : 0;
    }
    const vinylNode = ctx.createBufferSource();
    vinylNode.buffer = vinylBuffer;
    vinylNode.loop = true;
    const vinylFilter = ctx.createBiquadFilter();
    vinylFilter.type = 'highpass';
    vinylFilter.frequency.value = 6000;
    const vinylGain = ctx.createGain();
    vinylGain.gain.value = vinylCrackleLevel;
    vinylNode.connect(vinylFilter);
    vinylFilter.connect(vinylGain);
    vinylNode.start();
    vinylGainRef.current = vinylGain;

    // 10. Ping-Pong Delay
    const pingPongIn = ctx.createGain();
    const delayL = ctx.createDelay(); delayL.delayTime.value = 0.33;
    const delayR = ctx.createDelay(); delayR.delayTime.value = 0.33;
    const feedbackL = ctx.createGain(); feedbackL.gain.value = 0.4;
    const feedbackR = ctx.createGain(); feedbackR.gain.value = 0.4;
    const panL = ctx.createStereoPanner(); panL.pan.value = -0.8;
    const panR = ctx.createStereoPanner(); panR.pan.value = 0.8;
    pingPongIn.connect(delayL);
    delayL.connect(panL); delayL.connect(feedbackL); feedbackL.connect(delayR);
    delayR.connect(panR); delayR.connect(feedbackR); feedbackR.connect(delayL);
    const pingPongWet = ctx.createGain();
    pingPongWet.gain.value = pingPongLevel;
    panL.connect(pingPongWet); panR.connect(pingPongWet);
    pingPongWetRef.current = pingPongWet;

    // 11. Ring Modulator
    const ringModOsc = ctx.createOscillator();
    ringModOsc.type = 'sine';
    ringModOsc.frequency.value = 50; 
    const ringModGain = ctx.createGain(); 
    const ringModWet = ctx.createGain();
    ringModWet.gain.value = ringModFactor;
    ringModOsc.connect(ringModGain.gain);
    ringModOsc.start();
    ringModWetRef.current = ringModWet;

    // 12. Phaser
    const ap1 = ctx.createBiquadFilter(); ap1.type = 'allpass'; ap1.frequency.value = 1000;
    const ap2 = ctx.createBiquadFilter(); ap2.type = 'allpass'; ap2.frequency.value = 1000;
    const phaserLfo = ctx.createOscillator(); phaserLfo.frequency.value = 0.5;
    const phaserLfoGain = ctx.createGain(); phaserLfoGain.gain.value = phaserFactor * 800;
    phaserLfo.connect(phaserLfoGain);
    phaserLfoGain.connect(ap1.frequency); phaserLfoGain.connect(ap2.frequency);
    phaserLfo.start();
    const phaserWet = ctx.createGain(); phaserWet.gain.value = phaserFactor > 0 ? 0.8 : 0;
    phaserLfoRef.current = phaserLfoGain;
    phaserWetRef.current = phaserWet;

    // 13. Sidechain
    const sidechainGain = ctx.createGain(); sidechainGain.gain.value = 1;
    const sidechainLfo = ctx.createOscillator(); 
    sidechainLfo.type = 'sawtooth';
    sidechainLfo.frequency.value = 2.0; 
    const sidechainLfoGain = ctx.createGain(); 
    sidechainLfoGain.gain.value = sidechainFactor; 
    sidechainLfo.connect(sidechainLfoGain);
    sidechainLfoGain.connect(sidechainGain.gain);
    sidechainLfo.start();
    sidechainLfoGainRef.current = sidechainLfoGain;

    // 14. Sub Bass Enhancer
    const subBassFilter = ctx.createBiquadFilter();
    subBassFilter.type = 'lowpass'; subBassFilter.frequency.value = 80;
    const subBassGain = ctx.createGain();
    subBassGain.gain.value = subBassFactor * 2.0;
    const subBassComp = ctx.createDynamicsCompressor();
    subBassComp.threshold.value = -20;
    subBassComp.ratio.value = 4;
    subBassFilter.connect(subBassComp);
    subBassComp.connect(subBassGain);
    subBassGainRef.current = subBassGain;
    
    // Master Volume Control Layer
    const masterGain = ctx.createGain();
    masterGain.gain.value = masterVolume;
    masterGainRef.current = masterGain;

    noiseNode.connect(ambientGain);
    ambientGain.connect(masterGain);
    vinylGain.connect(masterGain);
    masterGain.connect(ctx.destination);
    noiseNode.start();
    ambientGainRef.current = ambientGain;

    // MAIN ROUTING
    // Parallel Sub-Bass processing
    source.connect(subBassFilter);
    subBassGain.connect(masterGain);

    source.connect(vibratoDelay);
    vibratoDelay.connect(biquad);
    biquad.connect(muffle);
    muffle.connect(highpass);
    highpass.connect(bitcrush);
    bitcrush.connect(overdrive);
    
    // Add Ring Mod
    overdrive.connect(ringModGain);
    ringModGain.connect(ringModWet);

    const postRingModDry = ctx.createGain(); postRingModDry.gain.value = 1;
    overdrive.connect(postRingModDry);
    
    postRingModDry.connect(preFlangerDry);
    ringModWet.connect(preFlangerDry);
    postRingModDry.connect(flangerDelay);
    ringModWet.connect(flangerDelay);
    flangerDelay.connect(flangerWet);
    
    preFlangerDry.connect(ap1);
    flangerWet.connect(ap1);
    ap1.connect(ap2);
    ap2.connect(phaserWet);

    const postPhaserDry = ctx.createGain(); postPhaserDry.gain.value = 1;
    preFlangerDry.connect(postPhaserDry);
    flangerWet.connect(postPhaserDry);

    postPhaserDry.connect(sidechainGain);
    phaserWet.connect(sidechainGain);

    sidechainGain.connect(tremoloGain);

    // Chorus split
    tremoloGain.connect(preChorusGain);
    tremoloGain.connect(chorusDelayL);
    tremoloGain.connect(chorusDelayR);

    // Recombine
    preChorusGain.connect(panner);
    chorusWetGain.connect(panner);

    // Ping-pong delay tap
    panner.connect(pingPongIn);
    pingPongWet.connect(dryGain);
    pingPongWet.connect(convolver);

    // Reverb split
    panner.connect(dryGain);
    dryGain.connect(masterGain);

    panner.connect(convolver);
    convolver.connect(wetGain);
    wetGain.connect(masterGain);

    setCtxInitialized(true);
  };

  const resumeContext = () => {
     if (ctxRef.current && ctxRef.current.state === 'suspended') {
         ctxRef.current.resume();
     }
  };

  // State Effect Updaters
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      if ('preservesPitch' in audioRef.current) (audioRef.current as any).preservesPitch = false;
    }
  }, [rate, audioRef]);

  useEffect(() => {
    if (vibratoLfoGainRef.current) vibratoLfoGainRef.current.gain.value = vibratoDepth * 0.005;
  }, [vibratoDepth]);

  useEffect(() => {
    if (tremoloLfoGainRef.current) tremoloLfoGainRef.current.gain.value = tremoloDepth;
  }, [tremoloDepth]);

  useEffect(() => {
    if (ambientGainRef.current) ambientGainRef.current.gain.value = ambienceLevel;
  }, [ambienceLevel]);

  useEffect(() => {
    if (biquadRef.current) biquadRef.current.gain.value = bassGain;
  }, [bassGain]);

  useEffect(() => {
    if (muffleRef.current) muffleRef.current.frequency.value = 15000 - (muffleFactor * 14000);
  }, [muffleFactor]);

  useEffect(() => {
    if (highpassRef.current) highpassRef.current.frequency.value = 20 + (highpassFactor * 3000);
  }, [highpassFactor]);

  useEffect(() => {
    if (bitcrushRef.current) {
      bitcrushRef.current.curve = bitcrushFactor > 0 ? makeDistortionCurve(bitcrushFactor) : null;
    }
  }, [bitcrushFactor]);

  useEffect(() => {
    if (overdriveRef.current) {
      overdriveRef.current.curve = overdriveFactor > 0 ? makeOverdriveCurve(overdriveFactor) : null;
    }
  }, [overdriveFactor]);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = masterVolume;
    }
  }, [masterVolume]);

  useEffect(() => {
    if (flangerLfoRef.current && flangerWetRef.current) {
      flangerLfoRef.current.gain.value = flangerFactor * 0.002;
      flangerWetRef.current.gain.value = flangerFactor > 0 ? 0.6 : 0;
    }
  }, [flangerFactor]);

  useEffect(() => {
    if (chorusLfoRef.current && chorusWetGainRef.current) {
       chorusLfoRef.current.gain.value = chorusEnabled ? 0.003 : 0;
       chorusWetGainRef.current.gain.value = chorusEnabled ? 0.5 : 0;
    }
  }, [chorusEnabled]);

  useEffect(() => {
    if (pannerLfoGainRef.current) pannerLfoGainRef.current.gain.value = enable8D ? 1 : 0;
  }, [enable8D]);

  useEffect(() => {
    if (dryGainRef.current && wetGainRef.current) {
      dryGainRef.current.gain.value = 1 - Math.min(0.95, reverbMode * 1.5);
      wetGainRef.current.gain.value = reverbMode;
    }
  }, [reverbMode]);

  useEffect(() => {
    if (pingPongWetRef.current) pingPongWetRef.current.gain.value = pingPongLevel;
  }, [pingPongLevel]);

  useEffect(() => {
    if (ringModWetRef.current) ringModWetRef.current.gain.value = ringModFactor;
  }, [ringModFactor]);

  useEffect(() => {
    if (phaserLfoRef.current && phaserWetRef.current) {
       phaserLfoRef.current.gain.value = phaserFactor * 800;
       phaserWetRef.current.gain.value = phaserFactor > 0 ? 0.8 : 0;
    }
  }, [phaserFactor]);

  useEffect(() => {
    if (sidechainLfoGainRef.current) sidechainLfoGainRef.current.gain.value = sidechainFactor;
  }, [sidechainFactor]);

  useEffect(() => {
    if (vinylGainRef.current) vinylGainRef.current.gain.value = vinylCrackleLevel;
  }, [vinylCrackleLevel]);

  useEffect(() => {
    if (subBassGainRef.current) subBassGainRef.current.gain.value = subBassFactor * 2.0;
  }, [subBassFactor]);

  return { initWebAudio, ctxInitialized, resumeContext };
}
