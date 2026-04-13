/**
 * VoiceRecorder.tsx
 * ─────────────────────────────────────────────────────────────
 * AI assistant-style voice interface.
 * Single pulsing orb button — minimal text, maximum atmosphere.
 */
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { FiMic, FiSquare } from 'react-icons/fi';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isSubmitting?: boolean;
}

export default function VoiceRecorder({ onRecordingComplete, isSubmitting }: VoiceRecorderProps) {
  const [isRecording,   setIsRecording]   = useState(false);
  const [seconds,       setSeconds]       = useState(0);
  const [amplitude,     setAmplitude]     = useState(0); // 0–1 live volume level

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const analyserRef      = useRef<AnalyserNode | null>(null);
  const audioCtxRef      = useRef<AudioContext | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef         = useRef<number | null>(null);
  const submitRef        = useRef(true);

  const cleanup = useCallback((skipSubmit = false) => {
    if (skipSubmit) submitRef.current = false;

    if (frameRef.current)  { cancelAnimationFrame(frameRef.current); frameRef.current = null; }
    if (timerRef.current)  { clearInterval(timerRef.current); timerRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (audioCtxRef.current) { void audioCtxRef.current.close(); audioCtxRef.current = null; }

    analyserRef.current    = null;
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setSeconds(0);
    setAmplitude(0);
  }, []);

  useEffect(() => () => { cleanup(true); }, [cleanup]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx      = new AudioCtx();
      audioCtxRef.current   = ctx;
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

      // Volume animation loop
      const tick = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        setAmplitude(avg / 128); // normalise 0–1
        frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);

      // Timer
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    } catch {
      // Microphone denied or unavailable
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      try { mediaRecorderRef.current?.stop(); } catch { /* ignore race */ }
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Orb size pulses with live amplitude when recording
  const orbScale = isRecording ? 1 + amplitude * 0.35 : 1;

  return (
    <div className="flex flex-col items-center gap-8 w-full py-4">

      {/* ── Status label ──────────────────────────────────────────────── */}
      <div className="text-center h-8 flex items-center gap-2">
        {isRecording ? (
          <>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-lg font-semibold tabular-nums text-gray-900">{fmt(seconds)}</span>
          </>
        ) : (
          <span className="text-sm text-gray-400">Tap to speak</span>
        )}
      </div>

      {/* ── Orb button ────────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center">
        {/* Expanding pulse rings when recording */}
        {isRecording && (
          <>
            <div className="absolute w-40 h-40 rounded-full bg-primary-green/10 animate-ping" style={{ animationDuration: '1.5s' }} />
            <div className="absolute w-52 h-52 rounded-full bg-primary-green/5 animate-ping" style={{ animationDuration: '2s' }} />
          </>
        )}

        {/* Live amplitude ring */}
        <div
          className="absolute rounded-full bg-primary-green/20 transition-all duration-75"
          style={{
            width:  `${120 + amplitude * 60}px`,
            height: `${120 + amplitude * 60}px`,
          }}
        />

        {/* Main orb */}
        <button
          type="button"
          id="voice-record-btn"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isSubmitting}
          aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
          style={{ transform: `scale(${orbScale})`, transition: 'transform 0.08s ease-out' }}
          className={
            'relative z-10 w-28 h-28 rounded-full flex items-center justify-center shadow-xl focus-visible:outline-none focus-visible:ring-4 transition-colors duration-300 ' +
            (isRecording
              ? 'bg-gradient-to-br from-red-500 to-red-600 focus-visible:ring-red-300'
              : 'bg-gradient-to-br from-primary-green to-green-700 focus-visible:ring-primary-green/40') +
            (isSubmitting ? ' opacity-40 cursor-not-allowed' : '')
          }
        >
          {isRecording
            ? <FiSquare size={32} className="text-white" fill="white" />
            : <FiMic    size={36} className="text-white" />
          }
        </button>
      </div>

      {/* ── Instruction ───────────────────────────────────────────────── */}
      <p className="text-sm text-gray-400 text-center max-w-[200px] leading-relaxed">
        {isRecording
          ? 'Listening… tap to stop'
          : 'Describe what you see on your cocoa plant'}
      </p>
    </div>
  );
}
