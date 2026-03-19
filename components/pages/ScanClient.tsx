'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-5 py-2 text-sm font-semibold bg-background sticky top-0 z-10 text-white">
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-white rounded-sm"></div>
          <div className="w-1 h-3 bg-white rounded-sm"></div>
          <div className="w-1 h-3 bg-white rounded-sm"></div>
          <div className="w-1 h-3 bg-white opacity-50 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
}

export default function ScanClient() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    getCameraPermission();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCameraPermission = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        setHasPermission(false);
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
    }
  };

  const takePicture = () => {
    if (isCapturing) return;

    setIsCapturing(true);

    try {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          context.drawImage(video, 0, 0);

          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          sessionStorage.setItem('scan_image', imageDataUrl);
        }
      }

      router.push('/processing');
    } catch (error) {
      console.error('Error taking picture:', error);
      router.push('/processing');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleBack = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    router.push('/home');
  };

  if (hasPermission === null) {
    return (
      <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile bg-black">
        <StatusBar />
        <div className="flex items-center justify-center h-full text-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Requesting camera permission...</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile bg-black">
        <StatusBar />
        <div className="flex flex-col items-center justify-center h-full text-white p-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📷</div>
            <h2 className="text-xl font-semibold mb-4">Camera Access Needed</h2>
            <p className="text-center mb-6 text-gray-300">
              We need access to your camera to scan cocoa plants and detect diseases.
            </p>
          </div>
          <div className="space-y-4 w-full max-w-sm">
            <button
              onClick={getCameraPermission}
              className="bg-brand-buttons text-white border-none px-6 py-4 rounded-brand text-base font-semibold cursor-pointer transition-all w-full text-center no-underline inline-block hover:opacity-90"
            >
              Enable Camera
            </button>
            <Link href="/home" className="block text-center text-white underline">
              Skip for now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile bg-black overflow-hidden">
      <StatusBar />

      <div className="relative flex-1 flex flex-col">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.play().catch(console.error);
            }
          }}
        />

        <button
          onClick={handleBack}
          className="absolute top-4 left-4 z-10 bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5 bg-black bg-opacity-50 text-white"
        >
          <span className="text-xl">‹</span>
        </button>

        <button
          onClick={handleBack}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center"
        >
          ✕
        </button>

        <div className="absolute top-16 left-0 right-0 z-10">
          <div className="bg-black bg-opacity-60 text-white text-center py-3 px-4 mx-4 rounded-lg">
            <p className="font-semibold">Aim Your Camera At The Cocoa</p>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-80 h-60 border-4 border-white border-opacity-80 rounded-2xl relative">
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
              <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="flex items-center justify-center">
            <button
              onClick={takePicture}
              disabled={isCapturing}
              className={`w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg transition-transform ${
                isCapturing ? 'scale-95 opacity-50' : 'hover:scale-105'
              }`}
            >
              <div
                className={`w-16 h-16 bg-white rounded-full border-2 border-gray-400 ${
                  isCapturing ? 'animate-pulse' : ''
                }`}
              >
                {isCapturing && <div className="w-full h-full bg-green-500 rounded-full animate-pulse"></div>}
              </div>
            </button>
          </div>
          {isCapturing && <p className="text-white text-center mt-4 text-sm">Processing...</p>}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
