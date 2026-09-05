export interface FXValues {
  rate?: number;
  vibratoDepth?: number;
  tremoloDepth?: number;
  reverbMode?: number;
  ambienceLevel?: number;
  enable8D?: boolean;
  chorusEnabled?: boolean;
  bassGain?: number;
  muffleFactor?: number;
  highpassFactor?: number;
  bitcrushFactor?: number;
  overdriveFactor?: number;
  flangerFactor?: number;
  pingPongLevel?: number;
  ringModFactor?: number;
  phaserFactor?: number;
  sidechainFactor?: number;
  vinylCrackleLevel?: number;
  subBassFactor?: number;
  autoWahFactor?: number;
  megaphoneFactor?: number;
  tapeDelayLevel?: number;
  fuzzFactor?: number;
  lofiSampleRate?: number;
  haasDelayFactor?: number;
  dynamicPunch?: number;
}

export interface Preset {
  id: string;
  name: string;
  badge: string;
  description: string;
  values: FXValues;
}

export const PRESETS: Preset[] = [
  {
    id: "slowed-reverb",
    name: "SLOWED + REVERB",
    badge: "0.8x",
    description: "Playback speed 0.8x, 15% reverb, and +2dB bass EQ gain",
    values: {
      rate: 0.8,
      reverbMode: 0.15,
      bassGain: 2
    }
  },
  {
    id: "nightcore-sped-up",
    name: "NIGHTCORE / SPED UP",
    badge: "1.2x",
    description: "Playback speed 1.2x",
    values: {
      rate: 1.2
    }
  }
];

