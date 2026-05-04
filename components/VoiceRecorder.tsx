/**
 * VoiceRecorder.tsx
 * ─────────────────────────────────────────────────────────────
 * Tap-and-hold mic button with animated waveform bars.
 * Hold → recording, release → submits audio.
 */
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { FiMic } from 'react-icons/fi';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onError?: (message: string) => void;
  isSubmitting?: boolean;
}

// ─── Waveform bars ────────────────────────────────────────────────────────────

const BASE_HEIGHTS = [0.35, 0.6, 0.8, 0.55, 0.9, 0.45, 0.7, 0.5];

function WaveformSide({
  isRecording,
  amplitude,
  mirror,
}: {
  isRecording: boolean;
  amplitude: number;
  mirror?: boolean;
}) {
  const bars = mirror ? [...BASE_HEIGHTS].reverse() : BASE_HEIGHTS;
  return (
    <div className={`flex items-center gap-[3px] ${mirror ? '' : ''}`}>
      {bars.map((base, i) => {
        const h = isRecording
          ? Math.max(6, Math.min(40, (base + amplitude * 0.8) * 36))
          : base * 14;
        return (
          <div
            key={i}
            className="w-[3px] rounded-full bg-primary-green transition-all duration-75"
            style={{ height: `${h}px`, opacity: isRecording ? 0.85 : 0.35 }}
          />
        );
      })}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VoiceRecorder({ onRecordingComplete, onError, isSubmitting }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [amplitude,   setAmplitude]   = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const analyserRef      = useRef<AnalyserNode | null>(null);
  const audioCtxRef      = useRef<AudioContext | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const frameRef         = useRef<number | null>(null);
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const submitRef        = useRef(true);

  const cleanup = useCallback((skipSubmit = false) => {
    if (skipSubmit) submitRef.current = false;
    if (frameRef.current)    { cancelAnimationFrame(frameRef.current); frameRef.current = null; }
    if (timerRef.current)    { clearInterval(timerRef.current); timerRef.current = null; }
    if (streamRef.current)   { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (audioCtxRef.current) { void audioCtxRef.current.close(); audioCtxRef.current = null; }
    analyserRef.current      = null;
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setAmplitude(0);
  }, []);

  useEffect(() => () => { cleanup(true); }, [cleanup]);

  const startRecording = async () => {
    if (isSubmitting || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx      = new AudioCtx();
      audioCtxRef.current = ctx;
      const source   = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;
      source.connect(analyser);

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      submitRef.current = true;

      mr.ondataavailable = (e) => { chunksRef.current.push(e.data); };
      mr.onstop = () => {
        if (!submitRef.current) { submitRef.current = true; return; }
        onRecordingComplete(new Blob(chunksRef.current, { type: 'audio/webm' }));
        cleanup();
      };

      mr.start();
      setIsRecording(true);

      const tick = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        setAmplitude(avg / 128);
        frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('notallowed')) {
        onError?.('Microphone access was denied. Please allow microphone permission in your browser settings.');
      } else if (msg.toLowerCase().includes('notfound') || msg.toLowerCase().includes('devices')) {
        onError?.('No microphone found. Please connect a microphone and try again.');
      } else {
        onError?.('Could not start recording. Please check your microphone and try again.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      try { mediaRecorderRef.current?.stop(); } catch { /* ignore race */ }
    }
  };

  return (
    <div className="flex items-center justify-center gap-5 w-full">

      {/* Left waveform */}
      <WaveformSide isRecording={isRecording} amplitude={amplitude} mirror />

      {/* Mic button */}
      <button
        type="button"
        aria-label={isRecording ? 'Release to stop recording' : 'Hold to record voice'}
        disabled={isSubmitting}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); void startRecording(); }}
        onPointerUp={stopRecording}
        onPointerLeave={stopRecording}
        onPointerCancel={stopRecording}
        className={[
          'relative w-20 h-20 rounded-full flex items-center justify-center',
          'shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all duration-150 select-none touch-none',
          isRecording
            ? 'bg-primary-green scale-110'
            : 'bg-white',
          isSubmitting ? 'opacity-40 cursor-not-allowed' : 'active:scale-95',
        ].join(' ')}
      >
        <FiMic
          size={30}
          className={isRecording ? 'text-white' : 'text-brand-buttons'}
        />
        {/* Pulse ring when recording */}
        {isRecording && (
          <span className="absolute inset-0 rounded-full bg-primary-green/30 animate-ping" />
        )}
      </button>

      {/* Right waveform */}
      <WaveformSide isRecording={isRecording} amplitude={amplitude} />
    </div>
  );
}


