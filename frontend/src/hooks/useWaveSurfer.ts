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
    // If no URL or refs, clean up
    if (!musicUrl || !waveformContainerRef.current || !audioRef.current) {
        return;
    }

    // Destroy existing instance
    if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
    }

    setIsPlaying(false);

    const regions = RegionsPlugin.create();
    regionsPluginRef.current = regions;

    const ws = WaveSurfer.create({
      container: waveformContainerRef.current,
      waveColor: '#52525B', 
      progressColor: '#FFFFFF',
      cursorColor: '#FFFFFF',
      height: 100,
      media: audioRef.current, // will be the fresh <audio> DOM node
      url: musicUrl, // explicitly load the url
      plugins: [regions]
    });

    ws.on('ready', (duration) => {
      durationRef.current = duration;
      setTrimStart(0);
      setTrimEnd(duration);
      ws.setTime(0);
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

    return () => {
      if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
          wavesurferRef.current = null;
      }
    };
  }, [musicUrl]); // Complete teardown and rebuild ensures perfectly clean state!

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
