'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import VoiceRecorder from '@/components/VoiceRecorder';

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-5 py-2 text-sm font-semibold bg-background sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-gray-300 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
}

export default function VoiceDescribeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanId = searchParams.get('scan_id');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const handleVoiceSubmit = async (audioBlob: Blob) => {
    setIsSubmitting(true);
    setVoiceError(null);

    try {
      const form = new FormData();
      form.append('file', audioBlob, 'description.webm');

      const response = await fetch('/api/ai/voice-diagnose', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setVoiceError(result?.message || 'Failed to process voice description');
        setIsSubmitting(false);
        return;
      }

      // Mark voice step as completed
      const nonce = sessionStorage.getItem('scan_nonce');
      if (nonce) {
        sessionStorage.setItem(`voice_completed_${nonce}`, '1');
      }

      // Continue to results after voice submission
      if (scanId) {
        router.push(`/results/${scanId}`);
      } else {
        router.push('/results/unknown');
      }
    } catch (error) {
      setVoiceError(error instanceof Error ? error.message : 'Failed to process voice');
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Mark voice step as completed (skipped)
    const nonce = sessionStorage.getItem('scan_nonce');
    if (nonce) {
      sessionStorage.setItem(`voice_completed_${nonce}`, '1');
    }

    if (scanId) {
      router.push(`/results/${scanId}`);
    } else {
      router.push('/results/unknown');
    }
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <StatusBar />

      <div className="flex flex-col items-center justify-center h-full px-6 py-8">
        <div className="mb-8">
          <div className="text-4xl mb-4">🎤</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Describe Your Plant</h2>
          <p className="text-gray-600 text-center max-w-xs">
            Help us understand what you&apos;re seeing. Describe any symptoms, colors, or issues you&apos;ve noticed.
          </p>
        </div>

        {voiceError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm w-full max-w-sm">
            {voiceError}
          </div>
        )}

        <div className="w-full max-w-sm bg-gray-50 p-6 rounded-lg mb-6">
          <VoiceRecorder
            onRecordingComplete={handleVoiceSubmit}
            isSubmitting={isSubmitting}
          />

          <p className="text-xs text-gray-600 mt-4 text-center">
            Take 15-30 seconds to describe what you see.
          </p>
        </div>

        <button
          onClick={handleSkip}
          disabled={isSubmitting}
          className="text-brand-hyperlink underline font-semibold cursor-pointer hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Skip for now
        </button>

        <div className="mt-8 text-xs text-gray-500 text-center max-w-xs">
          Optional: Your description helps us refine the diagnosis and provide better recommendations.
        </div>
      </div>
    </div>
  );
}
