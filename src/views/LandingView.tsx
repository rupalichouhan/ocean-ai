import React from 'react';
import {
  Sparkles,
  Compass,
  Bookmark,
  BarChart3,
  Shield,
  ArrowRight,
  Zap,
  CheckCircle2,
  Waves
} from 'lucide-react';
import { BuddyMascot } from '../components/BuddyMascot';
import { GlassCard } from '../components/GlassCard';

interface LandingViewProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onGetStarted,
  onExploreDemo
}) => {
  return (
    <div className="min-h-screen flex flex-col justify-between px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-8 text-slate-900">
      {/* Navigation Header */}
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <BuddyMascot state="idle" size="sm" />
          <span className="font-semibold text-lg text-slate-900 tracking-tight">
            Buddy <span className="text-slate-500 font-normal">Ocean AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onExploreDemo}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Try Demo
          </button>
          <button
            onClick={onGetStarted}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs active:scale-98"
          >
            Dive In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="py-12 md:py-16 flex flex-col items-center text-center">
        {/* Mascot Display */}
        <div className="mb-6 relative">
          <BuddyMascot state="idle" size="hero" />
        </div>

        {/* Hero Headline */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-6">
          <Sparkles size={13} className="text-slate-600" />
          <span>A Calm, Deep-Sea Intelligence Companion</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight max-w-2xl leading-tight mb-4">
          Explore Ideas in the Depths of Thought
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed mb-8">
          Buddy is an AI companion designed for focus, creative reasoning, and articulate dialogue. Wrapped in a calm minimalist interface with explicit memory controls and ocean progression.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Begin Your Journey</span>
            <ArrowRight size={16} />
          </button>
          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm transition-all active:scale-98 shadow-xs"
          >
            Explore Interactive Demo
          </button>
        </div>

        {/* Core Pillars Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl mt-16 text-left">
          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-4">
              <Zap size={18} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1.5">Real-Time Fluid Intelligence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powered by Google Gemini and OpenAI with low-latency token streaming, markdown rendering, and code syntax blocks.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-4">
              <Bookmark size={18} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1.5">Explicit Memory Vault</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You own what Buddy remembers. View, toggle, edit, or delete stored preferences without hidden background tracking.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-4">
              <Compass size={18} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1.5">Ocean Progression</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unlock depth milestones from the sunny Shallows to the mysterious Bioluminescent Trench as you interact and learn.
            </p>
          </GlassCard>
        </div>

        {/* Safe Architecture Statement */}
        <div className="mt-12 p-5 rounded-xl bg-white border border-slate-200 max-w-2xl flex items-center gap-4 text-left shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
            <Shield size={18} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900">Zero-Distraction Privacy & Control</h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              No browser push notifications. No ad tracking. Full data export and one-click data reset available in Settings at any time.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <Waves size={14} className="text-slate-600" />
          <span>Buddy Ocean AI Companion • Crafted for Clarity & Depth</span>
        </div>
        <div className="flex items-center gap-6">
          <span>Server-Side Gemini AI</span>
          <span>Zero Telemetry Leaks</span>
        </div>
      </footer>
    </div>
  );
};

