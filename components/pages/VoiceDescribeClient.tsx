'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import VoiceRecorder from '@/components/VoiceRecorder';
import { FiMic, FiMenu, FiBell, FiMessageCircle, FiX } from 'react-icons/fi';

export default function VoiceDescribeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanId = searchParams.get('scan_id');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [step, setStep] = useState<'initial' | 'recording'>('initial');

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

  const handleCancel = () => {
    router.replace('/home');
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-white flex flex-col relative shadow-mobile">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <button
          type="button"
          onClick={() => router.replace('/home')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-black/5 hover:opacity-80"
          aria-label="Exit"
        >
          {step === 'recording' ? <FiX size={16} /> : <FiMenu size={24} />}
        </button>
        <h1 className="text-center text-xl font-semibold text-gray-900">New Recording</h1>
        <div className="flex items-center gap-3">
          <Link href="/messages" className="text-gray-700 hover:opacity-80 transition-opacity" aria-label="Messages">
            <FiMessageCircle size={22} />
          </Link>
          <button className="text-gray-700 hover:opacity-80 transition-opacity" aria-label="Notifications">
            <FiBell size={24} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {step === 'initial' ? (
          /* Initial State */
          <div className="w-full flex flex-col items-center">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Describe Your Plant</h2>
              <p className="text-gray-600 text-base max-w-sm mx-auto leading-relaxed">
                Help us understand what you&apos;re seeing. Describe any symptoms, colors, or issues you&apos;ve noticed.
              </p>
            </div>

            {voiceError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 text-sm w-full max-w-sm border border-red-200">
                {voiceError}
              </div>
            )}

            <button
              onClick={() => setStep('recording')}
              disabled={isSubmitting}
              className="mb-12 px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            >
              Start Recording
            </button>

            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="text-blue-600 font-semibold hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              Skip for now
            </button>
          </div>
        ) : (
          /* Recording State */
          <div className="w-full h-full flex items-center justify-center">
            <VoiceRecorder
              onRecordingComplete={handleVoiceSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </div>

      {/* Bottom Navigation Placeholder */}
      <div className="h-20 border-t border-gray-100 flex items-center justify-around bg-gray-50">
        <button className="flex flex-col items-center gap-1 text-gray-700 hover:opacity-80">
          <FiMic size={24} />
          <span className="text-xs font-medium">Recording</span>
        </button>
      </div>
    </div>
  );
}
