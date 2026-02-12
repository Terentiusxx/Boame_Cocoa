'use client';

import Link from "next/link";

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

export default function Notifications() {
  return (
    <div className="mobile-container">
      <StatusBar />
      
      <div className="pb-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-6 px-6">
          <Link href="/settings" className="back-button">
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-title">Notifications</h1>
          <div className="w-9"></div>
        </div>
        
        {/* Notification Settings */}
        <div className="px-6">
          <div className="bg-white rounded-lg">
            {/* Push Notifications */}
            <div className="flex items-center justify-between py-4 px-4 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Push Notifications</h3>
                <p className="text-sm text-gray-500">Receive notifications about scan results</p>
              </div>
              <label htmlFor="push-notifications" className="relative inline-flex items-center cursor-pointer">
                <input id="push-notifications" type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            {/* Disease Alerts */}
            <div className="flex items-center justify-between py-4 px-4 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Disease Alerts</h3>
                <p className="text-sm text-gray-500">Get alerts for high urgency diseases</p>
              </div>
              <label htmlFor="disease-alerts" className="relative inline-flex items-center cursor-pointer">
                <input id="disease-alerts" type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            {/* App Updates */}
            <div className="flex items-center justify-between py-4 px-4">
              <div>
                <h3 className="font-medium text-gray-900">App Updates</h3>
                <p className="text-sm text-gray-500">Notifications about new features</p>
              </div>
              <label htmlFor="app-updates" className="relative inline-flex items-center cursor-pointer">
                <input id="app-updates" type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}