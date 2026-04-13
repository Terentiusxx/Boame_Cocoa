/**
 * ExpertRegisterClient.tsx
 * ─────────────────────────────────────────────────────────────
 * Multi-step expert registration form. 4 steps:
 *   1. Personal — first name, last name, email, phone, password
 *   2. Professional — specialization, org, bio, experience, licence
 *   3. Location — city, region, country
 *   4. Photo — optional profile photo (sent as image_file multipart)
 *
 * On submit, posts as multipart/form-data to /api/experts/register
 * which proxies to POST /experts/ — backend handles Cloudinary.
 */
'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiArrowRight, FiCamera, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import { EXPERT_ROUTES } from '@/lib/constants';
import { extractErrorMessage } from '@/lib/utils';

// ─── Types & Constants ────────────────────────────────────────────────────────

const STEPS = ['Personal', 'Professional', 'Location', 'Photo'] as const;
type Step = typeof STEPS[number];

const SPECIALIZATIONS = [
  'Plant Pathology', 'Cocoa Agronomy', 'Soil Science',
  'Integrated Pest Management', 'Agricultural Extension',
  'Post-Harvest Management', 'Other',
] as const;

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            i < current
              ? 'bg-primary-green text-white'
              : i === current
              ? 'bg-green-50 border-2 border-primary-green text-primary-green'
              : 'bg-gray-100 text-gray-400'
          }`}>
            {i < current ? <FiCheck size={14} /> : i + 1}
          </div>
          {i < total - 1 && <div className={`flex-1 h-0.5 w-6 ${i < current ? 'bg-primary-green' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputCls = 'w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 focus:bg-white text-sm disabled:opacity-60';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExpertRegisterClient() {
  const router      = useRouter();
  const fileRef     = useRef<HTMLInputElement>(null);
  const [step,      setStep]      = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl,  setPhotoUrl]  = useState<string | null>(null);
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // Form state — all fields
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
      // Append all text fields
      (Object.entries(form) as [string, string][]).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });
      // Append photo if chosen
      if (photoFile) fd.append('image_file', photoFile, photoFile.name);

      const res     = await fetch('/api/experts/register', { method: 'POST', body: fd });
      const payload = await res.json().catch(() => null) as Record<string, unknown> | null;

      if (!res.ok) {
        setError(extractErrorMessage(payload, 'Registration failed. Please try again.'));
        return;
      }

      // Auto-login happened server-side — navigate to dashboard
      router.replace(EXPERT_ROUTES.DASHBOARD);
    } catch (err) {
      setError(extractErrorMessage(err, 'Connection failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 px-8 pt-8 pb-6">
          <div className="flex items-center justify-between mb-4">
            {step > 0 ? (
              <button type="button" onClick={back}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
                <FiArrowLeft size={18} />
              </button>
            ) : (
              <Link href={EXPERT_ROUTES.LOGIN}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
                <FiArrowLeft size={18} />
              </Link>
            )}
            <p className="text-white/80 text-sm font-medium">Step {step + 1} of {STEPS.length}</p>
            <div className="w-9" />
          </div>
          <h1 className="text-xl font-bold text-white">{STEPS[step]}</h1>
          <p className="text-green-100 text-sm mt-0.5">
            {step === 0 && 'Your account details'}
            {step === 1 && 'Your expertise and credentials'}
            {step === 2 && 'Where you are based'}
            {step === 3 && 'Add a profile photo (optional)'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">

          <StepBar current={step} total={STEPS.length} />

          {error && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Step 0 — Personal */}
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-first" className={labelCls}>First Name <span className="text-red-400">*</span></label>
                  <input id="reg-first" type="text" autoComplete="given-name" value={form.first_name}
                    onChange={(e) => set('first_name', e.target.value)} required className={inputCls} placeholder="Kwame" />
                </div>
                <div>
                  <label htmlFor="reg-last" className={labelCls}>Last Name <span className="text-red-400">*</span></label>
                  <input id="reg-last" type="text" autoComplete="family-name" value={form.last_name}
                    onChange={(e) => set('last_name', e.target.value)} required className={inputCls} placeholder="Mensah" />
                </div>
              </div>
              <div>
                <label htmlFor="reg-email" className={labelCls}>Email <span className="text-red-400">*</span></label>
                <input id="reg-email" type="email" autoComplete="email" value={form.email}
                  onChange={(e) => set('email', e.target.value)} required className={inputCls} placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="reg-tel" className={labelCls}>Phone <span className="text-red-400">*</span></label>
                <input id="reg-tel" type="tel" autoComplete="tel" value={form.telephone}
                  onChange={(e) => set('telephone', e.target.value)} required className={inputCls} placeholder="+233 24 000 0000" />
              </div>
              <div>
                <label htmlFor="reg-pass" className={labelCls}>Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input id="reg-pass" type={showPass ? 'text' : 'password'} autoComplete="new-password" value={form.password}
                    onChange={(e) => set('password', e.target.value)} required className={`${inputCls} pr-12`} placeholder="Min. 6 characters" />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 1 — Professional */}
          {step === 1 && (
            <>
              <div>
                <label htmlFor="reg-spec" className={labelCls}>Specialization <span className="text-red-400">*</span></label>
                <select id="reg-spec" value={form.specialization} onChange={(e) => set('specialization', e.target.value)}
                  className={inputCls}>
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="reg-org" className={labelCls}>Organization <span className="text-red-400">*</span></label>
                <input id="reg-org" type="text" value={form.organization}
                  onChange={(e) => set('organization', e.target.value)} required className={inputCls} placeholder="e.g. CRIG, MoFA" />
              </div>
              <div>
                <label htmlFor="reg-bio" className={labelCls}>Bio <span className="text-red-400">*</span></label>
                <textarea id="reg-bio" value={form.bio} onChange={(e) => set('bio', e.target.value)}
                  required rows={3} placeholder="Describe your background and expertise..."
                  className={`${inputCls} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-exp" className={labelCls}>Years Exp. <span className="text-red-400">*</span></label>
                  <input id="reg-exp" type="number" min={0} max={60} value={form.years_experienced}
                    onChange={(e) => set('years_experienced', e.target.value)} required className={inputCls} placeholder="e.g. 10" />
                </div>
                <div>
                  <label htmlFor="reg-lic" className={labelCls}>Licence / ID <span className="text-red-400">*</span></label>
                  <input id="reg-lic" type="text" value={form.license_id}
                    onChange={(e) => set('license_id', e.target.value)} required className={inputCls} placeholder="GH-AGR-0001" />
                </div>
              </div>
            </>
          )}

          {/* Step 2 — Location */}
          {step === 2 && (
            <>
              <div>
                <label htmlFor="reg-city" className={labelCls}>City <span className="text-red-400">*</span></label>
                <input id="reg-city" type="text" value={form.city} onChange={(e) => set('city', e.target.value)}
                  required className={inputCls} placeholder="Accra" />
              </div>
              <div>
                <label htmlFor="reg-region" className={labelCls}>Region</label>
                <input id="reg-region" type="text" value={form.region} onChange={(e) => set('region', e.target.value)}
                  className={inputCls} placeholder="Greater Accra" />
              </div>
              <div>
                <label htmlFor="reg-country" className={labelCls}>Country <span className="text-red-400">*</span></label>
                <input id="reg-country" type="text" value={form.country} onChange={(e) => set('country', e.target.value)}
                  required className={inputCls} placeholder="Ghana" />
              </div>
            </>
          )}

          {/* Step 3 — Photo */}
          {step === 3 && (
            <div className="flex flex-col items-center gap-6 py-4">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="relative w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-emerald-700 group shadow-lg">
                {photoUrl
                  ? <Image src={photoUrl} alt="Preview" fill className="object-cover" />
                  : <div className="flex flex-col items-center justify-center h-full text-white gap-2">
                      <FiCamera size={28} />
                      <span className="text-xs">Add photo</span>
                    </div>
                }
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <FiCamera size={22} className="text-white" />
                </div>
              </button>

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">{form.first_name} {form.last_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{form.specialization || 'Expert'}</p>
              </div>

              <p className="text-xs text-gray-400 text-center max-w-[220px] leading-relaxed">
                Your photo will be visible to farmers on the platform. You can skip this and add it later.
              </p>
            </div>
          )}

          {/* Navigation buttons */}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 py-4 text-white font-semibold text-base hover:opacity-90 transition active:scale-95 mt-2">
              Continue <FiArrowRight size={18} />
            </button>
          ) : (
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 py-4 text-white font-semibold text-base hover:opacity-90 transition active:scale-95 disabled:opacity-60 mt-2">
              {loading ? 'Creating account…' : 'Create Expert Account'}
            </button>
          )}

          {step === 3 && !loading && (
            <button type="submit" className="w-full py-2 text-center text-sm text-gray-400 hover:text-gray-600 transition">
              Skip photo and finish
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
