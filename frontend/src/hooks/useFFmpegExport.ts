import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export function useFFmpegExport({
  musicFile,
  imageFile,
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
  trimStart,
  trimEnd,
  pingPongLevel,
  ringModFactor,
  phaserFactor,
  sidechainFactor,
  vinylCrackleLevel,
  subBassFactor,
  autoWahFactor,
  videoNoir,
  megaphoneFactor,
  tapeDelayLevel,
  fuzzFactor,
  lofiSampleRate,
  onExportComplete
}: {
  musicFile: File | null;
  imageFile: File | null;
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
  trimStart: number;
  trimEnd: number;
  pingPongLevel: number;
  ringModFactor: number;
  phaserFactor: number;
  sidechainFactor: number;
  vinylCrackleLevel: number;
  subBassFactor: number;
  autoWahFactor: number;
  videoNoir: boolean;
  megaphoneFactor: number;
  tapeDelayLevel: number;
  fuzzFactor: number;
  lofiSampleRate: number;
  onExportComplete?: () => void;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const ffmpegLogRef = useRef<string>("");

  const loadFfmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;
    
    ffmpeg.on("progress", ({ progress }) => {
        let p = progress * 100;
        if (p > 99) p = 99; 
        if (p < 0) p = 0;
        setProgress(p);
    });
    ffmpeg.on("log", ({ message }) => {
        setProgressText(message);
        if (message.toLowerCase().includes('error') || message.toLowerCase().includes('fail') || message.toLowerCase().includes('invalid')) {
            ffmpegLogRef.current += message + "\n";
        }
    });

    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    return ffmpeg;
  };

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportMedia = async (type: 'mp3' | 'mp4', outputName: string) => {
    if (!musicFile) return;
    setIsExporting(true);
    setProgress(0);
    setProgressText("Initializing FFmpeg Toolkit...");

    try {
      const ffmpeg = await loadFfmpeg();
      const audioName = "input.mp3";
      await ffmpeg.writeFile(audioName, await fetchFile(musicFile));
      
      const duration = trimEnd - trimStart;
      let renderDuration = duration / rate;

      const rateInt = Math.round(44100 * rate);
      let audioFilter = `asetrate=${rateInt},aresample=44100`;

      // Chain logic natively
      if (vibratoDepth > 0) {
         audioFilter += `,vibrato=f=4.0:d=${(vibratoDepth * 0.5).toFixed(2)}`;
      }
      
      if (muffleFactor > 0) {
        audioFilter += `,lowpass=f=${(15000 - (muffleFactor * 14000)).toFixed(0)}`;
      }

      if (highpassFactor > 0) {
        audioFilter += `,highpass=f=${(20 + (highpassFactor * 3000)).toFixed(0)}`;
      }

      if (bitcrushFactor > 0) {
        // Drop down to 4-bits progressively. Using acrusher.
        const bits = Math.max(4, 16 - bitcrushFactor * 12);
        audioFilter += `,acrusher=level_in=1:level_out=1:bits=${bits.toFixed(0)}:mode=log`;
      }

      if (overdriveFactor > 0) {
        // Simple lavfi volume clipping creates hyper-distortion safely matched to MP4 max dB.
        audioFilter += `,volume=${(1 + overdriveFactor * 8).toFixed(2)}`;
      }

      if (flangerFactor > 0) {
        audioFilter += `,flanger=delay=3:depth=${(flangerFactor * 5).toFixed(1)}:regen=50:width=80:speed=0.5:shape=sine:phase=25:interp=linear`;
      }

      if (lofiSampleRate > 0) {
        audioFilter += `,lowpass=f=${(20000 - (lofiSampleRate * 18000)).toFixed(0)}`;
      }

      if (fuzzFactor > 0) {
        // Severe distortion via volume clipping and compression
        audioFilter += `,volume=${(6 + fuzzFactor * 10).toFixed(2)},acompressor=threshold=-20dB:ratio=10,volume=0.3`;
      }

      if (megaphoneFactor > 0) {
         // Radio EQ pass
         audioFilter += `,highpass=f=500,lowpass=f=3000,volume=1.5`;
      }

      if (tremoloDepth > 0) {
         audioFilter += `,tremolo=f=10.0:d=${tremoloDepth.toFixed(2)}`; 
      }
      
      if (bassGain > 0) audioFilter += `,bass=g=${bassGain.toFixed(1)}:f=110:w=0.6`;

      if (subBassFactor > 0) audioFilter += `,bass=g=${(subBassFactor * 10).toFixed(2)}:f=80:w=0.5,acompressor=threshold=-20dB:ratio=4`;

      if (pingPongLevel > 0) audioFilter += `,aecho=1.0:${(0.3 + (pingPongLevel*0.4)).toFixed(2)}:330|660:0.5|0.3`;
      
      if (tapeDelayLevel > 0) audioFilter += `,aecho=1.0:${tapeDelayLevel.toFixed(2)}:400:0.5`;

      if (ringModFactor > 0) audioFilter += `,tremolo=f=50.0:d=${ringModFactor.toFixed(2)}`;

      if (phaserFactor > 0) audioFilter += `,aphaser=in_gain=1:out_gain=1:delay=2:decay=0.5:speed=0.5:type=t`;

      if (sidechainFactor > 0) audioFilter += `,tremolo=f=2.0:d=${sidechainFactor.toFixed(2)}`;
      
      if (chorusEnabled) {
         audioFilter += `,chorus=0.5:0.9:50|60:0.4|0.32:0.25|0.4:2|2.3`;
      }

      if (autoWahFactor > 0) {
         // Approximate Web Audio Auto-wah with a resonant sweeping phaser
         audioFilter += `,aphaser=in_gain=0.6:out_gain=1.2:delay=3:decay=0.4:speed=3.5:type=t`;
      }

      if (enable8D) audioFilter += `,apulsator=hz=0.1`;

      if (reverbMode > 0) {
        const d1 = (0.5 * reverbMode).toFixed(2);
        const d2 = (0.4 * reverbMode).toFixed(2);
        const d3 = (0.3 * reverbMode).toFixed(2);
        
        audioFilter += `,apad=pad_dur=4`;
        renderDuration += 4;
        
        audioFilter += `,aecho=1.0:0.7:313|503|701:${d1}|${d2}|${d3}`;
      }

      // Generate the ambient background if needed
      let filterComplex = "";
      const audioInput = type === 'mp4' ? '[1:a]' : '[0:a]';

      if (ambienceLevel > 0 || vinylCrackleLevel > 0) {
          filterComplex += `${audioInput}${audioFilter}[aud];`;
          let mixInputs = 1;
          
          if (ambienceLevel > 0) {
              filterComplex += `anoisesrc=d=${renderDuration.toFixed(3)}:c=brown:a=${ambienceLevel * 0.3}[noiseamb];`;
              mixInputs++;
          }
          if (vinylCrackleLevel > 0) {
              // White noise highpassed sounds like crackle
              filterComplex += `anoisesrc=d=${renderDuration.toFixed(3)}:c=white:a=${vinylCrackleLevel * 0.08},highpass=f=6000[noisecrackle];`;
              mixInputs++;
          }
          
          filterComplex += `[aud]`;
          if (ambienceLevel > 0) filterComplex += `[noiseamb]`;
          if (vinylCrackleLevel > 0) filterComplex += `[noisecrackle]`;
          
          filterComplex += `amix=inputs=${mixInputs}:duration=first:dropout_transition=0.5[mixout];`;
      } else {
          filterComplex = `${audioInput}${audioFilter}[mixout];`;
      }

      if (type === 'mp3') {
        setProgressText("Rendering Audio Mix...");
        ffmpegLogRef.current = ""; 

        const cleanFilterComplex = filterComplex.endsWith(';') ? filterComplex.slice(0, -1) : filterComplex;

        const ret = await ffmpeg.exec([
          '-ss', trimStart.toFixed(3),
          '-t', duration.toFixed(3),
          '-i', audioName,
          '-filter_complex', cleanFilterComplex,
          '-map', '[mixout]',
          '-t', renderDuration.toFixed(3),
          'output.mp3'
        ]);

        if (ret !== 0) {
          throw new Error(`FFmpeg exited with code ${ret}.\n\nDetailed Log:\n${ffmpegLogRef.current}`);
        }
        
        const data = await ffmpeg.readFile('output.mp3');
        const url = URL.createObjectURL(new Blob([data as any], { type: 'audio/mp3' }));
        downloadFile(url, `${outputName || 'zonewave'}-processed.mp3`);
      } else if (type === 'mp4') {
        const imageExt = imageFile ? imageFile.name.split('.').pop() : 'jpg';
        const imageName = `bg.${imageExt}`;
        if (imageFile) {
          await ffmpeg.writeFile(imageName, await fetchFile(imageFile));
        } else throw new Error("Background image required for MP4 export");

        setProgressText("Rendering Cinematic Suite... (Static mode for maximum speed)");
        
        ffmpegLogRef.current = ""; 

        const noirFilter = videoNoir ? ",colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3" : "";

        filterComplex += 
             `[mixout]asplit=1[aud_out];` + 
             `[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black${noirFilter},format=yuv420p[vout]`;

        const ret = await ffmpeg.exec([
          '-loop', '1',
          '-framerate', '2',
          '-i', imageName,
          '-ss', trimStart.toFixed(3),
          '-t', duration.toFixed(3),
          '-i', audioName,
          '-filter_complex', filterComplex,
          '-map', '[vout]',
          '-map', '[aud_out]',
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-pix_fmt', 'yuv420p',
          '-t', renderDuration.toFixed(3),
          'output.mp4'
        ]);

        if (ret !== 0) {
          throw new Error(`FFmpeg exited with code ${ret}.\n\nDetailed Log:\n${ffmpegLogRef.current}`);
        }

        const data = await ffmpeg.readFile('output.mp4');
        const url = URL.createObjectURL(new Blob([data as any], { type: 'video/mp4' }));
        downloadFile(url, `${outputName || 'zonewave'}-cinematic.mp4`);
      }
    } catch (e) {
      console.error(e);
      const errMsg = (e as any)?.message || JSON.stringify(e) || "Unknown Error";
      alert("Error processing your media! \n\n" + errMsg);
    } finally {
      setIsExporting(false);
      setProgress(100);
      // Resume the AudioContext — FFmpeg's WASM workload can leave it suspended.
      onExportComplete?.();
    }
  };

  return { exportMedia, isExporting, progress, progressText };
}
