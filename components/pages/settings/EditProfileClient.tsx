'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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

type MeResponse = {
  data?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    telephone?: string;
  };
  first_name?: string;
  last_name?: string;
  email?: string;
  telephone?: string;
};

export default function EditProfileClient() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: 'Ghana',
  });

  const resolved = useMemo(() => {
    const parts = profile.name.trim().split(/\s+/).filter(Boolean);
    return {
      first_name: parts[0] ?? '',
      last_name: parts.slice(1).join(' ') || 'User',
    };
  }, [profile.name]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const res = await fetch('/api/users/me', { method: 'GET' });
      if (!res.ok) return;

      const payload = (await res.json().catch(() => null)) as MeResponse | null;
      const u = payload?.data ?? payload;
      if (!u || !mounted) return;

      setProfile((p) => ({
        ...p,
        name: [u.first_name, u.last_name].filter(Boolean).join(' '),
        email: u.email ?? '',
        phone: u.telephone ?? '',
      }));
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: resolved.first_name,
        last_name: resolved.last_name,
        email: profile.email,
        telephone: profile.phone,
      }),
    });

    if (!res.ok) {
      alert('Failed to update profile');
      return;
    }

    alert('Profile updated successfully!');
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <StatusBar />

      <div className="pb-6">
        <div className="flex items-center justify-between py-4 mb-6 px-6">
          <Link
            href="/settings"
            className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
          >
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-brand-text-titles">Edit Profile</h1>
          <div className="w-9"></div>
        </div>

        <div className="px-6">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
            <button className="text-green-600 font-medium">Change Photo</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleSave}
              className="w-full py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
