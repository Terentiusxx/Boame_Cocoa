'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your sign-up logic here
    console.log('Sign up:', { name, email, password });
  };

  return (
    <div className="min-h-screen bg-background-light px-6 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-10"
      >
        <svg
          className="w-6 h-6 text-input-text"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-[40px] font-bold text-text-titles leading-tight mb-2">
          Create Account
        </h1>
        <p className="text-sub-text-style text-[17px]">
          Fill in the details to sign up
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div>
          <label
            htmlFor="name"
            className="block text-sub-titles font-medium mb-3 text-[17px]"
          >
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Baba Kieron"
            className="w-full px-5 py-4 bg-white rounded-2xl border-none outline-none text-input-text text-[17px] placeholder:text-sub-text-style"
            required
          />
        </div>

        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sub-titles font-medium mb-3 text-[17px]"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email here"
            className="w-full px-5 py-4 bg-white rounded-2xl border-none outline-none text-input-text text-[17px] placeholder:text-sub-text-style"
            required
          />
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="block text-sub-titles font-medium mb-3 text-[17px]"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password here"
              className="w-full px-5 py-4 bg-white rounded-2xl border-none outline-none text-input-text text-[17px] placeholder:text-sub-text-style"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-input-text"
            >
              {showPassword ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Sign Up Button */}
        <button
          type="submit"
          className="w-full bg-buttons text-white text-[19px] font-semibold py-5 rounded-full mt-16 hover:opacity-90 transition-opacity"
        >
          Sign Up
        </button>
      </form>

      {/* Sign In Link */}
      <div className="text-center mt-10">
        <span className="text-sub-text-style text-[16px]">
          Already Have An Account?{' '}
        </span>
        <Link
          href="/signin"
          className="text-hyperlink font-semibold text-[16px] hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
