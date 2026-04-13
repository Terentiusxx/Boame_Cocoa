/**
 * EditProfileClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Profile editor — mirrors the Create Account form layout.
 * Separate first/last name fields, profile photo, all fields shown.
 * Only PUT and DELETE are client-side fetches (mutations).
 */
'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCamera, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { extractErrorMessage } from '@/lib/utils';
import { ROUTES, IMAGE_UPLOAD } from '@/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type InitialProfile = {
  first_name?: string;
  mid_name?: string;
  last_name?: string;
  email?: string;
  telephone?: string;
  role?: string;
  profile_image?: string;
} | null;

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditProfileClient({ initialProfile }: { initialProfile: InitialProfile }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Individual name fields — matching Create Account form structure
  const [firstName,  setFirstName]  = useState(initialProfile?.first_name  ?? '');
  const [midName,    setMidName]    = useState(initialProfile?.mid_name    ?? '');
  const [lastName,   setLastName]   = useState(initialProfile?.last_name   ?? '');
  const [email,      setEmail]      = useState(initialProfile?.email       ?? '');
  const [phone,      setPhone]      = useState(initialProfile?.telephone   ?? '');
  const [imageUrl,   setImageUrl]   = useState<string | null>(initialProfile?.profile_image ?? null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,setNewPassword] = useState('');
  const [showPass,   setShowPass]   = useState(false);

  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState(false);

  const hasProfileChanged =
    firstName !== (initialProfile?.first_name ?? '') ||
    midName   !== (initialProfile?.mid_name ?? '') ||
    lastName  !== (initialProfile?.last_name ?? '') ||
    email     !== (initialProfile?.email ?? '') ||
    phone     !== (initialProfile?.telephone ?? '') ||
    imageUrl  !== (initialProfile?.profile_image ?? null);

  const hasPasswordChanged =
    currentPassword !== '' || newPassword !== '';

  /** Convert selected image to base64 preview */
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > IMAGE_UPLOAD.MAX_SIZE) {
      setError(`Image too large.`);
      return;
    }

    setImageFile(file); // ✅ real file for backend
    setImageUrl(URL.createObjectURL(file)); // ✅ preview only
  };

  const handleSave = async () => {
  setError(null);
  setSuccess(false);
  setSaving(true);

    try {
      // ─────────────────────────────────────────
      // PROFILE UPDATE (FormData)
      // ─────────────────────────────────────────
      if (hasProfileChanged) {
        const formData = new FormData();

        formData.append('first_name', firstName.trim());
        formData.append('last_name', lastName.trim());
        formData.append('email', email.trim());

        if (midName) formData.append('mid_name', midName.trim());
        if (phone) formData.append('telephone', phone.trim());

        // ⚠️ Only if you're storing FILE (recommended)
        if (imageFile) {
          formData.append('profile_image', imageFile);
        }

        const res = await fetch('/api/users/me', {
          method: 'PUT',
          body: formData, // ✅ no headers
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          setError(extractErrorMessage(payload, 'Failed to update profile.'));
          return;
        }
      }

      // ─────────────────────────────────────────
      // PASSWORD UPDATE (JSON)
      // ─────────────────────────────────────────
      if (hasPasswordChanged) {
        const res2 = await fetch('/api/users/me/password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        });

        if (!res2.ok) {
          const payload = await res2.json().catch(() => null);
          setError(extractErrorMessage(payload, 'Failed to change password.'));
          return;
        }
      }

      // ─────────────────────────────────────────
      // SUCCESS
      // ─────────────────────────────────────────
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      setError(extractErrorMessage(err, 'Connection failed.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete your account? This cannot be undone.')) return;

    setError(null);
    setDeleting(true);

    try {
      const res = await fetch('/api/users/me', { method: 'DELETE' });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        setError(extractErrorMessage(payload, 'Failed to delete account.'));
        return;
      }
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
      router.replace(ROUTES.LOGIN);
    } catch (err) {
      setError(extractErrorMessage(err, 'Connection failed. Please try again.'));
    } finally {
      setDeleting(false);
    }
  };

  const disabled = saving || deleting;

  // Shared input style — matches sign-up form
  const inputCls =
    'w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 focus:bg-white text-sm disabled:opacity-60';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="pb-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 mb-2">
          <Link
            href={ROUTES.SETTINGS}
            aria-label="Back to settings"
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 transition"
          >
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-semibold text-brand-text-titles">Edit Profile</h1>
          <div className="w-9" />
        </div>

        {/* ── Profile Photo ───────────────────────────────────────────────── */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile photo"
              className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-green-400 to-green-700 group"
            >
              {imageUrl ? (
                <Image src={imageUrl} alt="Profile" fill className="object-cover" />
              ) : (
                <span className="flex items-center justify-center h-full text-white text-3xl font-bold">
                  {(firstName[0] ?? '').toUpperCase()}{(lastName[0] ?? '').toUpperCase()}
                </span>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <FiCamera size={22} className="text-white" />
              </div>
            </button>

            {/* Small camera badge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-buttons rounded-full flex items-center justify-center shadow border-2 border-white">
              <FiCamera size={13} className="text-white" />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={IMAGE_UPLOAD.ACCEPTED_FORMATS.join(',')}
              onChange={handleImageChange}
              className="hidden"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* ── Form ───────────────────────────────────────────────────────── */}
        <div className="px-6 space-y-4">

          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              <FiCheck size={16} className="shrink-0" />
              Profile updated successfully!
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── Personal Info Section ──────────────────────────────────────── */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Personal Info</p>
            </div>
            <div className="p-4 space-y-4">
              {/* First + Last name side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="first-name" className={labelCls}>First Name</label>
                  <input
                    id="first-name"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={disabled}
                    placeholder="First"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className={labelCls}>Last Name</label>
                  <input
                    id="last-name"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={disabled}
                    placeholder="Last"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Middle name — optional */}
              <div>
                <label htmlFor="mid-name" className={labelCls}>
                  Middle Name <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="mid-name"
                  type="text"
                  autoComplete="additional-name"
                  value={midName}
                  onChange={(e) => setMidName(e.target.value)}
                  disabled={disabled}
                  placeholder="Middle name"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* ── Contact Info Section ───────────────────────────────────────── */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="edit-email" className={labelCls}>Email Address</label>
                <input
                  id="edit-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={disabled}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="edit-phone" className={labelCls}>
                  Phone <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="edit-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={disabled}
                  placeholder="+233 24 000 0000"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* ── Security Section ───────────────────────────────────────────── */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Security</p>
            </div>
            <div className="p-4">
              <label htmlFor="current-password" className={labelCls}>
                Current Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={disabled}
                  placeholder="Enter current password"
                  className={`${inputCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <div className="p-4">
              <label htmlFor="new-password" className={labelCls}>
                New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={disabled}
                  placeholder="Enter new password"
                  className={`${inputCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* ── Save Button ────────────────────────────────────────────────── */}
          <button
            id="save-profile-btn"
            type="button"
            onClick={handleSave}
            disabled={disabled}
            className="w-full bg-brand-buttons text-white px-6 py-4 rounded-brand font-semibold text-base hover:opacity-90 transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>

          {/* ── Danger Zone ────────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4">
            <p className="text-sm font-semibold text-red-700 mb-1">Danger Zone</p>
            <p className="text-xs text-red-500 mb-3">Permanently deletes your account and all data. This cannot be undone.</p>
            <button
              id="delete-account-btn"
              type="button"
              onClick={handleDelete}
              disabled={disabled}
              className="w-full px-6 py-3 rounded-xl font-semibold text-sm border border-red-600 text-red-600 bg-white hover:bg-red-50 transition disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Delete My Account'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
