'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { API_BASE } from '@/lib/apiBase';
import { setAuthSessionCookie } from '@/lib/authSession';
import { getErrorMessage } from '@/lib/formatters';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.search) {
      window.history.replaceState({}, '', '/signup');
    } else if (searchParams?.toString()) {
      router.replace('/signup');
    }
  }, [searchParams, router]);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(formData.password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setError('');

    // Validate
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          userType: 'MEMBER',
          acceptTerms: true,
        }),
      });

      const rawBody = await response.text();
      let data: any = null;
      try {
        data = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        data = { __raw: rawBody };
      }

      if (!response.ok) {
        const rawText = typeof data?.__raw === 'string' ? data.__raw : '';
        const looksLikeHtml =
          rawText.trim().startsWith('<!DOCTYPE html>') || rawText.includes('<html');
        if (looksLikeHtml) {
          throw new Error(
            'Registration service is unavailable. Please start the web app with the API proxy or set NEXT_PUBLIC_API_URL to the API server.',
          );
        }
        const message =
          data?.message || data?.error || data?.__raw || `Registration failed (${response.status})`;
        throw new Error(message);
      }

      if (!data?.data?.token || !data?.data?.user) {
        throw new Error('Registration succeeded but response was incomplete. Please try again.');
      }

      setToken(data.data.token);

      // Set auth-session cookie for middleware route protection
      setAuthSessionCookie();

      // Update auth store
      setUser({
        id: data.data.user.id,
        email: data.data.user.email,
        userType: data.data.user.userType.toLowerCase(),
        profile: data.data.user.profile,
      });

      // Redirect to welcome/onboarding
      setSuccess(true);
      router.push('/welcome');
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.assign('/welcome');
        }
      }, 500);
    } catch (err: unknown) {
      console.error('Registration error:', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError(
          'Unable to connect to server. Please check your internet connection or try again later.',
        );
      } else {
        setError(getErrorMessage(err, 'An unexpected error occurred during registration'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50/50 via-white to-purple-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-600/40 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/60 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-950/40 px-4 py-2 text-sm font-semibold text-teal-800 dark:text-teal-300 shadow-sm mb-4">
              <Sparkles className="h-4 w-4" />
              Start your journey
            </div>
            <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2 font-heading">
              Create Account
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Join Nexta today</p>
          </div>

          <div className="mb-6 rounded-2xl border border-teal-200/60 dark:border-teal-800/40 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800/60 dark:to-slate-800/40 p-4">
            <p className="text-sm font-semibold text-teal-700 dark:text-teal-300 mb-2">
              What you&apos;ll get
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <li>• A skills dashboard and learning pathways</li>
              <li>• Access to mentorship and community groups</li>
              <li>• Personalized opportunities and grants</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Account created. Redirecting…
              </p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    placeholder="First"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  placeholder="Last"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="inviteCode"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Invitation Code (Optional)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="inviteCode"
                  name="inviteCode"
                  type="text"
                  value={formData.inviteCode}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  placeholder="ENTER-CODE"
                />
              </div>
              <p className="mt-2 text-xs text-teal-700 dark:text-teal-400">
                Have an invite? Enter it here to fast-track your verification.
              </p>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* Password requirements */}
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <CheckCircle
                      className={`h-4 w-4 ${req.met ? 'text-green-500' : 'text-slate-300'}`}
                    />
                    <span
                      className={req.met ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 mt-1 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="text-teal-600 hover:text-teal-700 dark:text-teal-400"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-teal-600 hover:text-teal-700 dark:text-teal-400"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => void handleSubmit()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 disabled:opacity-50 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 shadow-lg shadow-teal-600/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
            <span className="px-4 text-sm text-slate-500">or</span>
            <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              href="/signin"
              className="text-teal-600 hover:text-teal-700 dark:text-teal-400 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
