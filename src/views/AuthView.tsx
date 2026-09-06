import React, { useState } from 'react';
import { Mail, User, ArrowRight, Sparkles, ChevronLeft, Lock } from 'lucide-react';
import { BuddyMascot } from '../components/BuddyMascot';
import { GlassCard } from '../components/GlassCard';
import { UserProfile } from '../types';
import * as api from '../services/api';

interface AuthViewProps {
  onSuccess: (user: UserProfile, token: string) => void;
  onBackToLanding: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onSuccess,
  onBackToLanding
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide a valid email address');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const res = await api.signup({
          email: email.trim(),
          displayName: displayName.trim() || undefined
        });
        api.setAuthToken(res.token);
        onSuccess(res.user, res.token);
      } else {
        const res = await api.login(email.trim());
        api.setAuthToken(res.token);
        onSuccess(res.user, res.token);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login('explorer@ocean.ai');
      api.setAuthToken(res.token);
      onSuccess(res.user, res.token);
    } catch (err: any) {
      setError(err?.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 text-slate-900">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          <span>Back to overview</span>
        </button>

        {/* Main Card */}
        <GlassCard className="p-8 border-slate-200 shadow-sm">
          <div className="text-center mb-6">
            <BuddyMascot state="idle" size="md" className="mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {mode === 'signup' ? 'Create Companion Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'signup'
                ? 'Create your personalized explorer profile'
                : 'Resume your explorations with Buddy'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 rounded-lg bg-slate-100 border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-5 animate-shake">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Explorer Display Name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Captain Nemo or Alex"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="explorer@ocean.ai"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Passphrase (Password)
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs active:scale-98 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative px-3 bg-white text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              or instant access
            </span>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <Sparkles size={13} className="text-slate-600" />
            <span>Launch Pre-configured Demo Profile</span>
          </button>
        </GlassCard>
      </div>
    </div>
  );
};

