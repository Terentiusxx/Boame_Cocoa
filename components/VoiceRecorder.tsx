'use client';

import { useRef, useState, useEffect } from 'react';
import { FiMic } from 'react-icons/fi';
import { LuMessageCircle } from 'react-icons/lu';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isSubmitting?: boolean;
}

export default function VoiceRecorder({ onRecordingComplete, isSubmitting }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(12).fill(0));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const shouldSubmitRef = useRef(true);

  const stopRecorderSafely = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch {
      // Ignore stop race conditions during teardown.
    }
  };

  const releaseMediaResources = (skipSubmit = false) => {
    if (skipSubmit) {
      shouldSubmitRef.current = false;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    mediaRecorderRef.current = null;

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsRecording(false);
    setRecordingTime(0);
    setWaveformBars(Array(12).fill(0));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup audio context for visualization
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        if (!shouldSubmitRef.current) {
          shouldSubmitRef.current = true;
          releaseMediaResources();
          return;
        }

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        releaseMediaResources();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start animation loop for waveform
      const updateWaveform = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          const bars = Array(12).fill(0).map((_, i) => {
            const index = Math.floor((i / 12) * dataArray.length);
            return (dataArray[index] / 255) * 100;
          });
          setWaveformBars(bars);
        }
        animationRef.current = requestAnimationFrame(updateWaveform);
      };
      animationRef.current = requestAnimationFrame(updateWaveform);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      stopRecorderSafely();
    }
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        releaseMediaResources(true);
        stopRecorderSafely();
      } else {
        releaseMediaResources();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-8">
      {/* Waveform Visualization */}
      <div className="w-full h-24 flex items-center justify-center gap-1 mb-8 relative">
        {/* Gradient background for waveform */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(100, 100, 100, 0.3)" />
              <stop offset="50%" stopColor="rgba(100, 100, 100, 0.1)" />
              <stop offset="100%" stopColor="rgba(100, 100, 100, 0)" />
            </linearGradient>
          </defs>
          <path
            d="M 0 40 Q 20 20, 40 40 T 80 40 T 120 40 T 160 40 T 200 40 T 240 40 T 300 40 L 300 80 L 0 80 Z"
            fill="url(#waveGradient)"
          />
        </svg>
        
        {/* Animated bars */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 h-full">
          {waveformBars.map((height, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-gray-700 to-gray-500 rounded-full transition-all"
              style={{
                height: isRecording ? `${Math.max(4, height)}px` : '4px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Center Microphone Button with Ripples */}
      <div className="flex-1 flex items-center justify-center mb-12">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Ripple circles */}
          {isRecording && (
            <>
              <div
                className="absolute inset-0 border-2 border-blue-400 rounded-full opacity-0"
                style={{
                  animation: 'ripple 1.5s ease-out infinite',
                }}
              />
              <div
                className="absolute inset-0 border-2 border-blue-400 rounded-full opacity-0"
                style={{
                  animation: 'ripple 1.5s ease-out infinite 0.5s',
                }}
              />
            </>
          )}

          {/* Main button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isSubmitting}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 scale-100'
                : 'bg-gradient-to-br from-blue-600 to-blue-700 hover:shadow-xl scale-100 hover:scale-105'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <FiMic size={56} className="text-white" />
          </button>

          {/* Side action icons */}
          <button className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <LuMessageCircle size={24} className="text-gray-600" />
          </button>

        </div>
      </div>

      {/* Recording time and text */}
      <div className="flex flex-col items-center gap-2 mb-8">
        {isRecording && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">{formatTime(recordingTime)}</span>
          </div>
        )}
        <p className="text-lg font-semibold text-gray-900">
          {isRecording ? 'Recording...' : 'Start Recording'}
        </p>
      </div>

      <style>{`
        @keyframes ripple {
          from {
            transform: scale(1);
            opacity: 0.8;
          }
          to {
            transform: scale(1.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
