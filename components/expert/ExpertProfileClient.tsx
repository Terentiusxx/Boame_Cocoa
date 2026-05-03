/**
 * ExpertProfileClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Expert's own profile editor. Photo upload goes to backend as
 * multipart/form-data image_file — backend sends to Cloudinary.
 *
 * Server fetches (in app/expert/profile/edit-profile/page.tsx):
 *   GET /experts/profile/me → initialProfile prop
 *
 * Client mutations:
 *   PUT /api/experts/me (multipart — includes image_file for backend → Cloudinary)
 *
 * Design matches the user-side settings/profile pattern.
 */
'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCamera, FiCheck, FiStar } from 'react-icons/fi';
import { extractErrorMessage } from '@/lib/utils';
import { EXPERT_ROUTES } from '@/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type ExpertProfile = {
  expert_id: number; first_name: string; mid_name?: string; last_name: string;
  email: string; telephone?: string; specialization?: string; organization?: string;
  bio?: string; years_experienced?: number; license_id?: string; is_verified?: boolean;
  rating?: number; image_url?: string; city?: string; region?: string; country?: string;
} | null;

const SPECIALIZATIONS = [
  'Plant Pathology', 'Cocoa Agronomy', 'Soil Science',
  'Integrated Pest Management', 'Agricultural Extension',
  'Post-Harvest Management', 'Other',
] as const;

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = 'w-full rounded-brand border border-gray-200 bg-white px-4 py-3 text-brand-input-text placeholder-gray-400 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 disabled:opacity-60 text-sm';

// ─── Helper sub-components ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50">
        <p className="text-xs font-semibold text-brand-sub-text uppercase tracking-wider">{title}</p>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExpertProfileClient({
  initialProfile,
  expertId,
}: {
  initialProfile: ExpertProfile;
  expertId: number;
}) {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(initialProfile?.first_name  ?? '');
  const [lastName,  setLastName]  = useState(initialProfile?.last_name   ?? '');
  const [email,     setEmail]     = useState(initialProfile?.email       ?? '');
  const [phone,     setPhone]     = useState(initialProfile?.telephone   ?? '');
  const [spec,      setSpec]      = useState(initialProfile?.specialization ?? '');
  const [org,       setOrg]       = useState(initialProfile?.organization ?? '');
  const [bio,       setBio]       = useState(initialProfile?.bio         ?? '');
  const [years,     setYears]     = useState(String(initialProfile?.years_experienced ?? ''));
  const [licenseId, setLicenseId] = useState(initialProfile?.license_id ?? '');
  const [city,      setCity]      = useState(initialProfile?.city        ?? '');
  const [region,    setRegion]    = useState(initialProfile?.region      ?? '');
  const [country,   setCountry]   = useState(initialProfile?.country     ?? '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl,  setPhotoUrl]  = useState<string | null>(initialProfile?.image_url ?? null);

  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const fd = new FormData();
      if (firstName)  fd.append('first_name',        firstName);
      if (lastName)   fd.append('last_name',         lastName);
      if (email)      fd.append('email',             email);
      if (phone)      fd.append('telephone',         phone);
      if (spec)       fd.append('specialization',    spec);
      if (org)        fd.append('organization',      org);
      if (bio)        fd.append('bio',               bio);
      if (years)      fd.append('years_experienced', years);
      if (licenseId)  fd.append('license_id',        licenseId);
      if (city)       fd.append('city',              city);
      if (region)     fd.append('region',            region);
      if (country)    fd.append('country',           country);
      if (photoFile)  fd.append('image_file',        photoFile, photoFile.name);

      const res = await fetch('/api/experts/me', { method: 'PUT', body: fd });

      if (!res.ok) {
        const payload = await res.json().catch(() => null) as Record<string, unknown> | null;
        setError(extractErrorMessage(payload, 'Failed to update profile.'));
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(extractErrorMessage(err, 'Connection failed. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile pb-10">

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button
          type="button"
          onClick={() => router.replace(EXPERT_ROUTES.PROFILE)}
          aria-label="Go back"
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
        >
          <FiArrowLeft size={18} />
        </button>

        <h1 className="text-base font-bold text-brand-text-titles">Edit Profile</h1>

        <div className="w-9" />
      </div>

      {/* ── Avatar hero ──────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 pb-8 px-5">
        <div className="relative">
          {/* Photo button */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden bg-brand-buttons group shadow-card"
          >
            {photoUrl ? (
              <Image src={photoUrl} alt="Profile" fill className="object-cover" />
            ) : (
              <span className="flex items-center justify-center h-full text-white text-3xl font-bold">
                {initials}
              </span>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <FiCamera size={22} className="text-white" />
            </div>
          </button>

          {/* Camera badge */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow border-2 border-brand-buttons">
            <FiCamera size={13} className="text-brand-buttons" />
          </div>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

        <div className="text-center">
          <p className="font-semibold text-brand-text-titles">{firstName} {lastName}</p>
          {spec && <p className="text-sm text-brand-sub-text mt-0.5">{spec}</p>}

          <div className="flex items-center justify-center gap-3 mt-1.5">
            {initialProfile?.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-[11px] font-semibold text-primary-green">
                <FiCheck size={10} /> Verified
              </span>
            )}
            {initialProfile?.rating != null && (
              <div className="flex items-center gap-1 text-brand-sub-text">
                <FiStar size={12} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold">{Number(initialProfile.rating).toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Form sections ────────────────────────────────────────────── */}
      <div className="px-5 space-y-4">

        {/* Status messages */}
        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            <FiCheck size={16} className="shrink-0" /> Profile updated!
          </div>
        )}
        {error && (
          <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Personal */}
        <Section title="Personal">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" id="ep-first">
              <input id="ep-first" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} placeholder="Kwame" disabled={saving} />
            </Field>
            <Field label="Last Name" id="ep-last">
              <input id="ep-last" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} placeholder="Mensah" disabled={saving} />
            </Field>
          </div>
          <Field label="Email" id="ep-email">
            <input id="ep-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} disabled={saving} />
          </Field>
          <Field label="Phone" id="ep-phone">
            <input id="ep-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+233 24 000 0000" disabled={saving} />
          </Field>
        </Section>

        {/* Professional */}
        <Section title="Professional">
          <Field label="Specialization" id="ep-spec">
            <select id="ep-spec" value={spec} onChange={(e) => setSpec(e.target.value)} className={inputCls} disabled={saving}>
              <option value="">Select…</option>
              {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Organization" id="ep-org">
            <input id="ep-org" type="text" value={org} onChange={(e) => setOrg(e.target.value)} className={inputCls} disabled={saving} />
          </Field>
          <Field label="Bio" id="ep-bio">
            <textarea id="ep-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className={`${inputCls} resize-none`} disabled={saving} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Years Exp." id="ep-years">
              <input id="ep-years" type="number" min={0} value={years} onChange={(e) => setYears(e.target.value)} className={inputCls} disabled={saving} />
            </Field>
            <Field label="Licence ID" id="ep-lic">
              <input id="ep-lic" type="text" value={licenseId} onChange={(e) => setLicenseId(e.target.value)} className={inputCls} disabled={saving} />
            </Field>
          </div>
        </Section>

        {/* Location */}
        <Section title="Location">
          <Field label="City" id="ep-city">
            <input id="ep-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} disabled={saving} />
          </Field>
          <Field label="Region" id="ep-region">
            <input id="ep-region" type="text" value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls} disabled={saving} />
          </Field>
          <Field label="Country" id="ep-country">
            <input id="ep-country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} disabled={saving} />
          </Field>
        </Section>

        {/* Save */}
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="w-full rounded-brand bg-brand-buttons py-4 text-white font-semibold text-base hover:opacity-90 transition active:scale-95 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
