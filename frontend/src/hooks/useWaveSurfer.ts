import { useState, useRef, useEffect } from "react";
import type { RefObject } from "react";
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';

export function useWaveSurfer({
  waveformContainerRef,
  audioRef,
  musicUrl,
  enableLoop,
  initWebAudio
}: {
  waveformContainerRef: RefObject<HTMLDivElement | null>;
  audioRef: RefObject<HTMLAudioElement | null>;
  musicUrl: string | null;
  enableLoop: boolean;
  initWebAudio: () => void;
}) {
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<RegionsPlugin | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  
  const durationRef = useRef(0);
  const enableLoopRef = useRef(enableLoop);

  useEffect(() => {
    enableLoopRef.current = enableLoop;
  }, [enableLoop]);

  useEffect(() => {
    if (!wavesurferRef.current && waveformContainerRef.current && audioRef.current) {
      const regions = RegionsPlugin.create();
      regionsPluginRef.current = regions;

      const ws = WaveSurfer.create({
        container: waveformContainerRef.current,
        waveColor: '#52525B', 
        progressColor: '#FFFFFF',
        cursorColor: '#FFFFFF',
        height: 100,
        media: audioRef.current,
        plugins: [regions]
      });

      ws.on('ready', (duration) => {
        durationRef.current = duration;
        setTrimStart(0);
        setTrimEnd(duration);
        regions.clearRegions();
        regions.addRegion({
          start: 0,
          end: duration,
          color: 'rgba(255, 255, 255, 0.1)',
          drag: true,
          resize: true
        });
      });

      ws.on('play', () => setIsPlaying(true));
      ws.on('pause', () => setIsPlaying(false));

      regions.on('region-updated', (region) => {
        setTrimStart(region.start);
        setTrimEnd(region.end);
      });

      regions.on('region-out', (region) => {
         if (enableLoopRef.current) {
            ws.setTime(region.start);
         } else {
            ws.pause();
         }
      });

      wavesurferRef.current = ws;
    }

    return () => {
      // Cleanup happens only once component completely dismounts, 
      // preventing flicker in React strict mode if wrapped properly.
    };
  }, []); // Only init once statically

  useEffect(() => {
    if (wavesurferRef.current && musicUrl) {
      wavesurferRef.current.pause(); 
      wavesurferRef.current.load(musicUrl);
    }
  }, [musicUrl]);

  const togglePlayback = () => {
    if (!wavesurferRef.current || !musicUrl) return;
    initWebAudio();
    if (isPlaying) {
      wavesurferRef.current.pause();
    } else {
      wavesurferRef.current.play();
    }
  };

  const stopPlayback = () => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.pause();
    wavesurferRef.current.setTime(0);
  };

  const updateTrimRegion = (start: number, end: number) => {
    let s = Math.max(0, start);
    let e = Math.min(durationRef.current, end);
    if (s > e) s = e - 0.1;

    setTrimStart(s);
    setTrimEnd(e);
    if (regionsPluginRef.current) {
        const regions = regionsPluginRef.current.getRegions();
        if (regions.length > 0) {
           regions[0].setOptions({ start: s, end: e });
        }
    }
  };

  return { wavesurferRef, isPlaying, trimStart, trimEnd, togglePlayback, stopPlayback, updateTrimRegion };
}
