'use client';

import Link from "next/link";
import SettingsItem from "@/components/SettingsItem";

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-5 py-2 text-sm font-semibold bg-background sticky top-0 z-10">
      {/* <span>9:41</span> */}
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-black rounded-sm"></div>
          <div className="w-1 h-3 bg-gray-300 rounded-sm"></div>
        </div>
        {/* <span className="ml-2">📶</span>
        <span>🔋</span> */}
      </div>
    </div>
  );
}

export default function Settings() {
  const handleLogout = () => {
    // Add logout logic here
    console.log('Logging out...');
    window.location.href = '/login';
  };

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
      <StatusBar />
      
      <div className="pb-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-6 px-6">
          <Link href="/home" className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5">
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-brand-text-titles">Settings</h1>
          <div className="w-9"></div> {/* Spacer for centered title */}
        </div>
        
        {/* Notifications Section */}
        <div className="mb-6">
          <SettingsItem
            id="notifications"
            title="Notifications"
            icon="🔔"
          />
        </div>
        
        {/* Account Settings Section */}
        <div className="mb-6">
          <div className="px-6 py-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Account Setting</h3>
          </div>
          <div className="bg-white">
            <SettingsItem
              id="edit-profile"
              title="Edit profile"
              icon="👤"
            />
            <SettingsItem
              id="change-language"
              title="Change language"
              icon="🌐"
            />
            <SettingsItem
              id="privacy"
              title="Privacy"
              icon="🔒"
            />
          </div>
        </div>
        
        {/* Legal Section */}
        <div className="mb-6">
          <div className="px-6 py-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Legal</h3>
          </div>
          <div className="bg-white">
            <SettingsItem
              id="terms"
              title="Terms and Condition"
              icon="📄"
            />
            <SettingsItem
              id="privacy-policy"
              title="Privacy policy"
              icon="🛡️"
            />
            <SettingsItem
              id="help"
              title="Help"
              icon="❓"
            />
          </div>
        </div>
        
        {/* Logout Section */}
        <div className="px-6 mt-8">
          <button 
            onClick={handleLogout}
            className="w-full py-4 text-center text-red-600 font-medium bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
          <div className="text-center mt-4">
            <span className="text-sm text-gray-400">Version 1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
