/**
 * ScanClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Full-screen camera scanner page with clean, modern UI.
 * Uses the rear camera by default. Falls back to file upload.
 */
'use client';

import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiX, FiCamera, FiImage } from 'react-icons/fi';
import { SESSION_KEYS, ROUTES } from '@/lib/constants';

export default function ScanClient() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCapturing,   setIsCapturing]   = useState(false);
  const [flash,         setFlash]         = useState(false); // white flash animation on capture

  const streamRef          = useRef<MediaStream | null>(null);
  const captureInProgress  = useRef(false);
  const videoRef           = useRef<HTMLVideoElement>(null);
  const canvasRef          = useRef<HTMLCanvasElement>(null);
  const fileInputRef       = useRef<HTMLInputElement>(null);
  const router             = useRouter();

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) { videoRef.current.srcObject = null; }
  };

  useEffect(() => {
    void startCamera();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    if (!navigator.mediaDevices) { setHasPermission(false); return; }
    stopStream(); // release any previous stream before requesting a new one
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = ms;
      setHasPermission(true);
      if (videoRef.current) videoRef.current.srcObject = ms;
    } catch {
      setHasPermission(false);
    }
  };

  /** Save blob URL to sessionStorage (revoke any previous one first) */
  const storeImage = (value: string) => {
    const prev = sessionStorage.getItem(SESSION_KEYS.SCAN_IMAGE);
    if (prev?.startsWith('blob:')) { try { URL.revokeObjectURL(prev); } catch { /* ignore */ } }
    sessionStorage.removeItem(SESSION_KEYS.SCAN_IMAGE);
    sessionStorage.setItem(SESSION_KEYS.SCAN_IMAGE, value);
  };

  const takePicture = async () => {
    if (captureInProgress.current || !videoRef.current || !canvasRef.current) return;
    captureInProgress.current = true;
    setIsCapturing(true);
    setFlash(true); // trigger brief white flash

    try {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      const ctx    = canvas.getContext('2d');
      if (ctx) {
        canvas.width  = video.videoWidth  || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0);
        const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
        if (blob) storeImage(URL.createObjectURL(blob));
      }
      stopStream();
      router.push(ROUTES.PROCESSING);
    } catch {
      stopStream();
      router.push(ROUTES.PROCESSING);
    } finally {
      setIsCapturing(false);
      captureInProgress.current = false;
      setTimeout(() => setFlash(false), 200);
    }
  };

  const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || captureInProgress.current) return;
    captureInProgress.current = true;
    setIsCapturing(true);
    stopStream();
    storeImage(URL.createObjectURL(file));
    router.push(ROUTES.PROCESSING);
  };

  // ── Loading / Permission ────────────────────────────────────────────────────
  if (hasPermission === null) {
    return (
      <div className="max-w-mobile mx-auto min-h-screen bg-black flex items-center justify-center shadow-mobile">
        <div className="text-center text-white/70">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm">Opening camera…</p>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="max-w-mobile mx-auto min-h-screen bg-black flex flex-col items-center justify-center p-8 shadow-mobile">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-5">
            <FiCamera size={36} className="text-white/70" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Camera Access Needed</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Allow camera access in your browser settings to scan cocoa plants.
          </p>
        </div>

        <div className="w-full max-w-xs space-y-3">
          <button
            type="button"
            onClick={startCamera}
            className="w-full rounded-brand bg-brand-buttons py-4 text-white font-semibold text-base hover:opacity-90 transition"
          >
            Enable Camera
          </button>

          <label className="flex items-center justify-center gap-2 w-full rounded-brand border border-white/30 py-4 text-white font-semibold text-base hover:bg-white/10 transition cursor-pointer">
            <FiImage size={18} />
            Upload Image Instead
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />
          </label>

          <Link href={ROUTES.HOME} className="block text-center text-white/50 text-sm py-2 hover:text-white/80 transition">
            Skip for now
          </Link>
        </div>
      </div>
    );
  }

  // ── Camera View ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-black overflow-hidden flex flex-col relative shadow-mobile">

      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        onLoadedMetadata={() => void videoRef.current?.play()}
      />

      {/* Flash overlay on capture */}
      <div className={`absolute inset-0 bg-white z-30 pointer-events-none transition-opacity duration-150 ${flash ? 'opacity-70' : 'opacity-0'}`} />

      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pt-10 pb-4 bg-gradient-to-b from-black/60 to-transparent">
        <button
          type="button"
          onClick={() => { stopStream(); router.replace(ROUTES.HOME); }}
          aria-label="Close scanner"
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/60 transition"
        >
          <FiX size={20} />
        </button>

        <span className="text-white/90 text-sm font-semibold tracking-wide">SCAN</span>

        {/* Spacer to centre the title */}
        <div className="w-10" />
      </div>

      {/* Scanning frame with corner marks */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="relative w-72 h-56">
          {/* Dimming outside the frame */}
          <div className="absolute -inset-[60vw] bg-black/40 rounded-none" />

          {/* Corner brackets */}
          {(['tl','tr','bl','br'] as const).map((pos) => (
            <div
              key={pos}
              className={`absolute w-8 h-8 border-white border-[3px] rounded-sm
                ${pos === 'tl' ? 'top-0 left-0 border-r-0 border-b-0 rounded-tl-lg' : ''}
                ${pos === 'tr' ? 'top-0 right-0 border-l-0 border-b-0 rounded-tr-lg' : ''}
                ${pos === 'bl' ? 'bottom-0 left-0 border-r-0 border-t-0 rounded-bl-lg' : ''}
                ${pos === 'br' ? 'bottom-0 right-0 border-l-0 border-t-0 rounded-br-lg' : ''}
              `}
            />
          ))}

          {/* Scanning line animation */}
          <div className="absolute left-1 right-1 top-0 h-0.5 bg-brand-buttons/80 rounded-full animate-[scan_2s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Hint text */}
      <div className="absolute top-1/2 -translate-y-1/2 mt-44 left-0 right-0 text-center z-10 pointer-events-none">
        <p className="text-white/70 text-xs font-medium tracking-wide">Position cocoa within the frame</p>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-5 px-8 pb-12 pt-6 bg-gradient-to-t from-black/80 to-transparent">

        {/* Capture button */}
        <button
          type="button"
          onClick={takePicture}
          disabled={isCapturing}
          aria-label="Take photo"
          className={`w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center transition-all
            ${isCapturing ? 'scale-90 opacity-60' : 'hover:scale-105 active:scale-95'}`}
        >
          <div className={`w-16 h-16 rounded-full border-2 border-gray-300 transition-all
            ${isCapturing ? 'bg-primary-green animate-pulse' : 'bg-white'}`}
          />
        </button>

        {/* Upload link */}
        <label className="flex items-center gap-2 text-white/70 text-sm font-medium hover:text-white transition cursor-pointer">
          <FiImage size={16} />
          Upload from Gallery
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />
        </label>
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Scan line CSS animation — defined inline to avoid globals */}
      <style>{`
        @keyframes scan {
          0%   { top: 4px; opacity: 1; }
          50%  { top: calc(100% - 4px); opacity: 1; }
          100% { top: 4px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
