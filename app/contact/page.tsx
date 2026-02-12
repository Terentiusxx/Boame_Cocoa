'use client';

import Link from 'next/link';

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

export default function Contact() {
  return (
    <div className="mobile-container">
      <StatusBar />
      
      <div className="px-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-6">
          <Link href="/results/unknown" className="back-button">
            <span className="text-xl">‹</span>
          </Link>
          <h1 className="text-xl font-semibold text-title">Contact Expert</h1>
          <div className="w-9"></div>
        </div>
        
        {/* Contact Form */}
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👨‍🌾</span>
            </div>
            <h2 className="text-xl font-semibold text-title mb-2">Get Expert Help</h2>
            <p className="text-sub-style">
              Our agricultural experts are here to help you identify and treat your cocoa diseases.
            </p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-subtitle mb-2">
                Your Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-subtitle mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-subtitle mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-subtitle mb-2">
                Describe the Issue
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Please describe what you're seeing on your cocoa plants..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="green-button w-full mt-6"
            >
              Send Message
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-sub-style">
              We typically respond within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}