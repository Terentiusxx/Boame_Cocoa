'use client';

import { useRef, useState } from 'react';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isSubmitting?: boolean;
}

export default function VoiceRecorder({ onRecordingComplete, isSubmitting }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        setRecordingTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {isRecording && (
        <div className="flex items-center gap-2 text-red-600">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold">Recording: {formatTime(recordingTime)}</span>
        </div>
      )}

      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isSubmitting}
        className={`px-6 py-3 rounded-brand font-semibold text-white border-none cursor-pointer transition-all ${
          isRecording
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-brand-buttons hover:opacity-90'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isSubmitting ? 'Submitting...' : isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
}
