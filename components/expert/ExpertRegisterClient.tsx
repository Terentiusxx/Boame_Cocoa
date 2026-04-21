/**
 * ExpertRegisterClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Multi-step expert registration form (4 steps):
 *   1. Personal — first name, last name, email, phone, password
 *   2. Professional — specialization, org, bio, experience, licence
 *   3. Location — city, region, country
 *   4. Documents & Photo — required license doc + optional profile photo
 *
 * On submit, posts as multipart/form-data to /api/experts/register.
 * Design matches the user-side screen pattern (max-w-mobile, brand tokens).
 */
'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiArrowRight, FiCamera, FiCheck, FiEye, FiEyeOff, FiFileText, FiUpload } from 'react-icons/fi';
import { EXPERT_ROUTES } from '@/lib/constants';
import { extractErrorMessage } from '@/lib/utils';

// ─── Types & Constants ────────────────────────────────────────────────────────

const STEPS = ['Personal', 'Professional', 'Location', 'Documents'] as const;
type Step = typeof STEPS[number];

const SPECIALIZATIONS = [
  'Plant Pathology', 'Cocoa Agronomy', 'Soil Science',
  'Integrated Pest Management', 'Agricultural Extension',
  'Post-Harvest Management', 'Other',
] as const;

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = 'w-full rounded-brand border border-gray-200 bg-white px-4 py-3 text-brand-input-text placeholder-gray-400 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 disabled:opacity-60 text-sm';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

// ─── Step progress bar ────────────────────────────────────────────────────────

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all shrink-0 ${
            i < current
              ? 'bg-brand-buttons text-white'
              : i === current
              ? 'bg-green-50 border-2 border-brand-buttons text-brand-buttons'
              : 'bg-gray-100 text-gray-400'
          }`}>
            {i < current ? <FiCheck size={14} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`flex-1 h-0.5 ${i < current ? 'bg-brand-buttons' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExpertRegisterClient() {
  const router       = useRouter();
  const photoRef     = useRef<HTMLInputElement>(null);
  const licDocRef    = useRef<HTMLInputElement>(null);

  const [step,        setStep]        = useState(0);
  const [photoFile,   setPhotoFile]   = useState<File | null>(null);
  const [photoUrl,    setPhotoUrl]    = useState<string | null>(null);
  const [licDocFile,  setLicDocFile]  = useState<File | null>(null);
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', telephone: '', password: '',
    specialization: '', organization: '', bio: '', years_experienced: '',
    license_id: '', city: '', region: '', country: 'Ghana',
  });

  const set = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const handleLicDoc = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLicDocFile(file);
  };

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.first_name.trim())  return 'First name is required';
      if (!form.last_name.trim())   return 'Last name is required';
      if (!form.email.trim())       return 'Email is required';
      if (!form.telephone.trim())   return 'Phone number is required';
      if (form.password.length < 6) return 'Password must be at least 6 characters';
    }
    if (step === 1) {
      if (!form.specialization.trim()) return 'Specialization is required';
      if (!form.organization.trim())   return 'Organization is required';
      if (!form.bio.trim())            return 'Bio is required';
      if (!form.years_experienced)     return 'Years of experience is required';
      if (!form.license_id.trim())     return 'License / ID is required';
    }
    if (step === 2) {
      if (!form.city.trim())    return 'City is required';
      if (!form.country.trim()) return 'Country is required';
    }
    if (step === 3) {
      if (!licDocFile) return 'License document is required';
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => { setError(null); setStep((s) => Math.max(s - 1, 0)); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      (Object.entries(form) as [string, string][]).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });
      if (photoFile)  fd.append('image_file',        photoFile,  photoFile.name);
      if (licDocFile) fd.append('license_document',  licDocFile, licDocFile.name);

      const res     = await fetch('/api/experts/register', { method: 'POST', body: fd });
      const payload = await res.json().catch(() => null) as Record<string, unknown> | null;

      if (!res.ok) {
        setError(extractErrorMessage(payload, 'Registration failed. Please try again.'));
        return;
      }

      router.replace(EXPERT_ROUTES.DASHBOARD);
    } catch (err) {
      setError(extractErrorMessage(err, 'Connection failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="px-6 flex flex-col min-h-screen">

        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-12 pb-6">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              aria-label="Go back"
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
            >
              <FiArrowLeft size={18} />
            </button>
          ) : (
            <Link
              href={EXPERT_ROUTES.LOGIN}
              aria-label="Back to login"
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
            >
              <FiArrowLeft size={18} />
            </Link>
          )}

          {/* Centre placeholder keeps layout balanced */}
          <div />

          <p className="text-xs text-brand-sub-text font-medium">
            {step + 1} / {STEPS.length}
          </p>
        </div>

        {/* ── Heading ──────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-text-titles">{STEPS[step]}</h1>
          <p className="text-brand-sub-text text-sm mt-1">
            {step === 0 && 'Your account details'}
            {step === 1 && 'Your expertise and credentials'}
            {step === 2 && 'Where you are based'}
            {step === 3 && 'Upload your documents'}
          </p>
        </div>

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5" noValidate>

          <StepBar current={step} total={STEPS.length} />

          {/* Error */}
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── Step 0: Personal ─────────────────────────────────────── */}
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-first" className={labelCls}>First Name <span className="text-red-400">*</span></label>
                  <input id="reg-first" type="text" autoComplete="given-name" value={form.first_name}
                    onChange={(e) => set('first_name', e.target.value)} required className={inputCls} placeholder="Kwame" disabled={loading} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-last" className={labelCls}>Last Name <span className="text-red-400">*</span></label>
                  <input id="reg-last" type="text" autoComplete="family-name" value={form.last_name}
                    onChange={(e) => set('last_name', e.target.value)} required className={inputCls} placeholder="Mensah" disabled={loading} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-email" className={labelCls}>Email <span className="text-red-400">*</span></label>
                <input id="reg-email" type="email" autoComplete="email" value={form.email}
                  onChange={(e) => set('email', e.target.value)} required className={inputCls} placeholder="you@example.com" disabled={loading} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-tel" className={labelCls}>Phone <span className="text-red-400">*</span></label>
                <input id="reg-tel" type="tel" autoComplete="tel" value={form.telephone}
                  onChange={(e) => set('telephone', e.target.value)} required className={inputCls} placeholder="+233 24 000 0000" disabled={loading} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-pass" className={labelCls}>Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input id="reg-pass" type={showPass ? 'text' : 'password'} autoComplete="new-password" value={form.password}
                    onChange={(e) => set('password', e.target.value)} required className={`${inputCls} pr-12`} placeholder="Min. 6 characters" disabled={loading} />
                  <button type="button" onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Step 1: Professional ─────────────────────────────────── */}
          {step === 1 && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-spec" className={labelCls}>Specialization <span className="text-red-400">*</span></label>
                <select id="reg-spec" value={form.specialization} onChange={(e) => set('specialization', e.target.value)}
                  className={inputCls} disabled={loading}>
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-org" className={labelCls}>Organization <span className="text-red-400">*</span></label>
                <input id="reg-org" type="text" value={form.organization}
                  onChange={(e) => set('organization', e.target.value)} required className={inputCls} placeholder="e.g. CRIG, MoFA" disabled={loading} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-bio" className={labelCls}>Bio <span className="text-red-400">*</span></label>
                <textarea id="reg-bio" value={form.bio} onChange={(e) => set('bio', e.target.value)}
                  required rows={3} placeholder="Describe your background and expertise..."
                  className={`${inputCls} resize-none`} disabled={loading} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-exp" className={labelCls}>Years Exp. <span className="text-red-400">*</span></label>
                  <input id="reg-exp" type="number" min={0} max={60} value={form.years_experienced}
                    onChange={(e) => set('years_experienced', e.target.value)} required className={inputCls} placeholder="10" disabled={loading} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-lic" className={labelCls}>Licence / ID <span className="text-red-400">*</span></label>
                  <input id="reg-lic" type="text" value={form.license_id}
                    onChange={(e) => set('license_id', e.target.value)} required className={inputCls} placeholder="GH-AGR-0001" disabled={loading} />
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: Location ─────────────────────────────────────── */}
          {step === 2 && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-city" className={labelCls}>City <span className="text-red-400">*</span></label>
                <input id="reg-city" type="text" value={form.city} onChange={(e) => set('city', e.target.value)}
                  required className={inputCls} placeholder="Accra" disabled={loading} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-region" className={labelCls}>Region</label>
                <input id="reg-region" type="text" value={form.region} onChange={(e) => set('region', e.target.value)}
                  className={inputCls} placeholder="Greater Accra" disabled={loading} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-country" className={labelCls}>Country <span className="text-red-400">*</span></label>
                <input id="reg-country" type="text" value={form.country} onChange={(e) => set('country', e.target.value)}
                  required className={inputCls} placeholder="Ghana" disabled={loading} />
              </div>
            </>
          )}

          {/* ── Step 3: Documents & Photo ────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col gap-6">

              {/* License document — required */}
              <div className="flex flex-col gap-2">
                <label className={labelCls}>
                  License Document <span className="text-red-400">*</span>
                </label>
                <p className="text-xs text-brand-sub-text -mt-1">
                  Upload a PDF or image of your professional license or credential.
                </p>
                <button
                  type="button"
                  onClick={() => licDocRef.current?.click()}
                  className={`w-full rounded-brand border-2 border-dashed px-4 py-5 flex flex-col items-center gap-2 transition ${
                    licDocFile
                      ? 'border-primary-green bg-green-50'
                      : 'border-gray-200 bg-white hover:border-primary-green'
                  }`}
                >
                  {licDocFile ? (
                    <>
                      <FiFileText size={26} className="text-primary-green" />
                      <p className="text-sm font-medium text-primary-green text-center break-all">{licDocFile.name}</p>
                      <p className="text-xs text-brand-sub-text">Tap to change</p>
                    </>
                  ) : (
                    <>
                      <FiUpload size={26} className="text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">Tap to upload license</p>
                      <p className="text-xs text-brand-sub-text">PDF, JPG, PNG accepted</p>
                    </>
                  )}
                </button>
                <input ref={licDocRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleLicDoc} />
              </div>

              {/* Profile photo — optional */}
              <div className="flex flex-col gap-2">
                <label className={labelCls}>Profile Photo <span className="text-brand-sub-text font-normal">(optional)</span></label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => photoRef.current?.click()}
                    className="relative w-20 h-20 rounded-full overflow-hidden bg-brand-buttons group shadow-card shrink-0"
                  >
                    {photoUrl
                      ? <Image src={photoUrl} alt="Preview" fill className="object-cover" />
                      : <div className="flex flex-col items-center justify-center h-full text-white gap-1">
                          <FiCamera size={22} />
                          <span className="text-[10px]">Add photo</span>
                        </div>
                    }
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <FiCamera size={18} className="text-white" />
                    </div>
                  </button>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{form.first_name} {form.last_name}</p>
                    <p className="text-xs text-brand-sub-text mt-0.5">{form.specialization || 'Expert'}</p>
                    <p className="text-xs text-brand-sub-text mt-2 leading-relaxed">
                      Visible to farmers. You can add or update it later.
                    </p>
                  </div>
                </div>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </div>
            </div>
          )}

          {/* ── Navigation ────────────────────────────────────────────── */}
          <div className="mt-auto pb-10 pt-4 flex flex-col gap-3">
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next}
                className="w-full flex items-center justify-center gap-2 rounded-brand bg-brand-buttons py-4 text-white font-semibold text-base hover:opacity-90 transition active:scale-95">
                Continue <FiArrowRight size={18} />
              </button>
            ) : (
              <button type="submit" disabled={loading}
                className="w-full rounded-brand bg-brand-buttons py-4 text-white font-semibold text-base hover:opacity-90 transition active:scale-95 disabled:opacity-60">
                {loading ? 'Creating account…' : 'Create Expert Account'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
