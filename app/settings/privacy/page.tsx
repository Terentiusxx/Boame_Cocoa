'use client';

import Link from "next/link";
import { useState } from "react";

function StatusBar() {
  return (
    <div className="status-bar">
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

export default function PrivacySettings() {
  const [settings, setSettings] = useState({
    shareData: false,
    analytics: true,
    locationTracking: false,
    diagnosticData: true
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({...prev, [key]: !prev[key]}));
  };

  return (
    <div className="mobile-container">
      <StatusBar />
      
      <div className="pb-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-6 px-6">
          <Link href="/settings" className="back-button">
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-title">Privacy</h1>
          <div className="w-9"></div>
        </div>
        
        {/* Privacy Settings */}
        <div className="px-6">
          <div className="bg-white rounded-lg">
            {/* Data Sharing */}
            <div className="flex items-center justify-between py-4 px-4 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Share Scan Data</h3>
                <p className="text-sm text-gray-500">Help improve disease detection accuracy</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.shareData}
                  onChange={() => toggleSetting('shareData')}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            {/* Analytics */}
            <div className="flex items-center justify-between py-4 px-4 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Usage Analytics</h3>
                <p className="text-sm text-gray-500">Allow collection of app usage statistics</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.analytics}
                  onChange={() => toggleSetting('analytics')}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            {/* Location Tracking */}
            <div className="flex items-center justify-between py-4 px-4 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Location Tracking</h3>
                <p className="text-sm text-gray-500">Track location for regional disease patterns</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.locationTracking}
                  onChange={() => toggleSetting('locationTracking')}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            {/* Diagnostic Data */}
            <div className="flex items-center justify-between py-4 px-4">
              <div>
                <h3 className="font-medium text-gray-900">Diagnostic Data</h3>
                <p className="text-sm text-gray-500">Send crash reports and diagnostic info</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.diagnosticData}
                  onChange={() => toggleSetting('diagnosticData')}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
          
          {/* Data Management */}
          <div className="mt-8 space-y-4">
            <button className="w-full py-4 text-blue-600 font-medium bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
              Download My Data
            </button>
            <button className="w-full py-4 text-red-600 font-medium bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}