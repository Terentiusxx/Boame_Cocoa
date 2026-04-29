'use client';

import Link from 'next/link';

import SettingsItem from '@/components/SettingsItem';
import ExpertNavbar from '@/components/expert/ExpertNavbar';
import { APP_VERSION, EXPERT_ROUTES } from '@/lib/constants';

export default function ExpertSettingsClient() {
  const handleLogout = async () => {
    await fetch('/api/expert-auth/logout', { method: 'POST' }).catch(() => null);
    window.location.href = EXPERT_ROUTES.LOGIN;
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <div className="pb-6">
        <div className="flex items-center justify-between py-4 mb-6 px-6">
          <Link
            href={EXPERT_ROUTES.DASHBOARD}
            className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
          >
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-brand-text-titles">Settings</h1>
          <div className="w-9"></div>
        </div>

        <div className="mb-6">
          <SettingsItem
            id="notifications"
            href={`${EXPERT_ROUTES.PROFILE}/notifications`}
            title="Notifications"
            icon="bell"
          />
        </div>

        <div className="mb-6">
          <div className="px-6 py-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Account Setting</h3>
          </div>
          <div className="bg-white">
            <SettingsItem
              id="edit-profile"
              href={EXPERT_ROUTES.EDIT_PROFILE}
              title="Edit profile"
              icon="user"
            />
            <SettingsItem
              id="change-language"
              href={`${EXPERT_ROUTES.PROFILE}/change-language`}
              title="Change language"
              icon="globe"
            />
            <SettingsItem
              id="privacy"
              href={`${EXPERT_ROUTES.PROFILE}/privacy`}
              title="Privacy"
              icon="lock"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="px-6 py-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Legal</h3>
          </div>
          <div className="bg-white">
            <SettingsItem
              id="terms"
              href={`${EXPERT_ROUTES.PROFILE}/terms`}
              title="Terms and Condition"
              icon="document"
            />
            <SettingsItem
              id="privacy-policy"
              href={`${EXPERT_ROUTES.PROFILE}/privacy-policy`}
              title="Privacy policy"
              icon="shield"
            />
            <SettingsItem
              id="help"
              href={`${EXPERT_ROUTES.PROFILE}/help`}
              title="Help"
              icon="help-circle"
            />
          </div>
        </div>

        <div className="px-6 mt-8">
          <button
            onClick={handleLogout}
            className="w-full py-4 text-center text-red-600 font-medium bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
          <div className="text-center mt-4">
            <span className="text-sm text-gray-400">Version {APP_VERSION}</span>
          </div>
        </div>
      </div>

      <ExpertNavbar />
    </div>
  );
}
