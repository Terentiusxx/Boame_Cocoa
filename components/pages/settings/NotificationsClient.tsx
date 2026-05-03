'use client';

import Link from 'next/link';



export default function NotificationsClient({ backHref = '/settings' }: { backHref?: string }) {
  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-background relative shadow-mobile">
       

      <div className="pb-6">
        <div className="flex items-center justify-between py-4 mb-6 px-6">
          <Link
            href={backHref}
            className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-full flex items-center justify-center w-9 h-9 hover:bg-black/5"
          >
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-brand-text-titles">Notifications</h1>
          <div className="w-9"></div>
        </div>

        <div className="px-6">
          <div className="bg-white rounded-lg">
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
