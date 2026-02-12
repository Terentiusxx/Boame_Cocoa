'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation - you can enhance this later
    if (email && password) {
      router.push('/home');
    }
  };

  return (
    <div className="mobile-container">
      <StatusBar />
      
      <div className="px-6 pb-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-8">
          <Link href="/splash" className="back-button">
            <span className="text-xl">‹</span>
          </Link>
          <div className="flex-1"></div>
        </div>
        
        {/* Login Form */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-title mb-2">Login</h1>
            <p className="text-sub-style text-lg">Welcome Back!</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-subtitle mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-subtitle mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-100 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200 pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-left">
              <Link href="/forgot-password" className="text-hyperlink text-sm">
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="green-button w-full mt-8 py-4 text-lg font-semibold"
            >
              Sign In
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <p className="text-sub-style">
              Don&apos;t have an account?{' '}
              <Link href="/create-account" className="text-hyperlink font-semibold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}