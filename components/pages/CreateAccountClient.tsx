/**
 * CreateAccountClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Registration form. Sends new user data to /api/users then
 * auto-logs in via /api/auth/login.
 *
 * The profile image is captured from the camera/file picker and
 * stored as a base64 data URL string, sent as a field in the POST body.
 * (Upload as an actual file if/when the backend supports it.)
 */
'use client';

import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff, FiCamera } from 'react-icons/fi';
import { ROUTES, VALIDATION, IMAGE_UPLOAD } from '@/lib/constants';
import { extractErrorMessage } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldErrors = {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  telephone?: string;
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(fields: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  telephone: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (fields.first_name.trim().length < VALIDATION.NAME.MIN_LENGTH) {
    errors.first_name = 'First name must be at least 2 characters.';
  }
  if (fields.last_name.trim().length < VALIDATION.NAME.MIN_LENGTH) {
    errors.last_name = 'Last name must be at least 2 characters.';
  }
  if (!VALIDATION.EMAIL.PATTERN.test(fields.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (fields.password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
    errors.password = `Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters.`;
  }

  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateAccountClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [firstName,  setFirstName]  = useState('');
  const [lastName,   setLastName]   = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [telephone,  setTelephone]  = useState('');
  const [imageUrl,   setImageUrl]   = useState<string | null>(null); // base64 preview + send value

  // UI state
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  /** Convert selected file to base64 and preview it */
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > IMAGE_UPLOAD.MAX_SIZE) {
      setError(`Image is too large. Maximum size is ${IMAGE_UPLOAD.MAX_SIZE / 1024 / 1024} MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const errors = validate({ first_name: firstName, last_name: lastName, email, password, telephone });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      // ── Step 1: Create the user account ──────────────────────────────────
      const createRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name:  lastName.trim(),
          email:      email.trim().toLowerCase(),
          password,
          telephone:  telephone.trim() || undefined,
          // Profile image sent as base64 string
          // TODO: Change to FormData with actual File when backend supports multipart upload
          ...(imageUrl ? { profile_image: imageUrl } : {}),
        }),
      });

      if (!createRes.ok) {
        const payload = await createRes.json().catch(() => null);
        setError(extractErrorMessage(payload, 'Failed to create account. Please try again.'));
        return;
      }

      // ── Step 2: Auto-login after signup ──────────────────────────────────
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (!loginRes.ok) {
        // Account was created but auto-login failed — let user log in manually
        router.replace(ROUTES.LOGIN);
        return;
      }

      router.replace(ROUTES.HOME);
    } catch (err) {
      setError(extractErrorMessage(err, 'Connection failed. Check your internet and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-6 flex flex-col min-h-screen">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="pt-14 pb-6 text-center">
          <h1 className="text-3xl font-bold text-brand-text-titles mb-2">Create Account</h1>
          <p className="text-brand-sub-text">Join Boame Cocoa today</p>
        </div>

        {/* ── Form ───────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4" noValidate>

          {/* Profile image picker */}
          <div className="flex justify-center mb-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Choose profile photo"
              className="relative w-20 h-20 rounded-full bg-gray-100 overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary-green transition group"
            >
              {imageUrl ? (
                <Image src={imageUrl} alt="Profile preview" fill className="object-cover" />
              ) : (
                <span className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-primary-green transition">
                  <FiCamera size={22} />
                  <span className="text-[10px] mt-1">Photo</span>
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={IMAGE_UPLOAD.ACCEPTED_FORMATS.join(',')}
              onChange={handleImageChange}
              className="hidden"
              aria-hidden="true"
            />
          </div>

          {/* Global error */}
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* First name + Last name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="first_name" className="text-sm font-medium text-gray-700">First Name</label>
              <input
                id="first_name"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ama"
                disabled={loading}
                className="w-full rounded-brand border border-gray-200 bg-white px-3 py-3 text-sm text-brand-input-text placeholder-gray-400 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/20"
              />
              {fieldErrors.first_name && (
                <p className="text-xs text-red-500">{fieldErrors.first_name}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="last_name" className="text-sm font-medium text-gray-700">Last Name</label>
              <input
                id="last_name"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Mensah"
                disabled={loading}
                className="w-full rounded-brand border border-gray-200 bg-white px-3 py-3 text-sm text-brand-input-text placeholder-gray-400 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/20"
              />
              {fieldErrors.last_name && (
                <p className="text-xs text-red-500">{fieldErrors.last_name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              className="w-full rounded-brand border border-gray-200 bg-white px-4 py-3 text-brand-input-text placeholder-gray-400 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/20"
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="telephone" className="text-sm font-medium text-gray-700">
              Phone <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="telephone"
              type="tel"
              autoComplete="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+233 24 000 0000"
              disabled={loading}
              className="w-full rounded-brand border border-gray-200 bg-white px-4 py-3 text-brand-input-text placeholder-gray-400 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/20"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                disabled={loading}
                className="w-full rounded-brand border border-gray-200 bg-white px-4 py-3 pr-12 text-brand-input-text placeholder-gray-400 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/20"
              />
              <button
                type="button"
                aria-label={showPass ? 'Hide password' : 'Show password'}
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            id="create-account-submit"
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-brand bg-brand-buttons py-4 text-base font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="py-8 text-center">
          <p className="text-sm text-brand-sub-text">
            Already have an account?{' '}
            <Link href={ROUTES.LOGIN} className="font-semibold text-brand-hyperlink hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
