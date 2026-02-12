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

export default function ForgotPassword() {
  return (
    <div className="mobile-container">
      <StatusBar />
      
      <div className="px-6 pb-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-8">
          <Link href="/login" className="back-button">
            <span className="text-xl">‹</span>
          </Link>
          <div className="flex-1"></div>
        </div>
        
        {/* Forgot Password Form */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-title mb-2">Reset Password</h1>
            <p className="text-sub-style text-lg">Enter your email to reset your password</p>
          </div>

          <form className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-subtitle mb-3">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              className="green-button w-full mt-8 py-4 text-lg font-semibold"
            >
              Send Reset Link
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-8">
            <p className="text-sub-style">
              Remember your password?{' '}
              <Link href="/login" className="text-hyperlink font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}