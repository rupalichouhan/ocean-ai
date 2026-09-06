import React from 'react';
import {
  Compass,
  Waves,
  Shield,
  Zap,
  Code2
} from 'lucide-react';
import { BuddyMascot } from '../components/BuddyMascot';
import { GlassCard } from '../components/GlassCard';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 text-slate-900">
      {/* Header Card */}
      <GlassCard className="p-8 border-slate-200 shadow-sm text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
        <BuddyMascot state="idle" size="lg" className="flex-shrink-0" />
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-2">
            <Waves size={14} className="text-slate-600" />
            <span>Design & Architectural Philosophy</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            About Buddy Ocean AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            A serene, distraction-free conversational companion engineered to foster depth of thought, intellectual focus, and creative exploration.
          </p>
        </div>
      </GlassCard>

      {/* Core Tenets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
            <Waves size={18} />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Calm Ocean Aesthetic</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminates high-saturation marketing noise and cognitive friction. Clean off-white canvases with refined slate accents establish a tranquil mental headspace.
          </p>
        </GlassCard>

        <GlassCard className="p-6 border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
            <Zap size={18} />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Streaming Intelligence</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Direct Server-Sent Events (SSE) provide immediate real-time token rendering powered by Google Gemini and OpenAI with low latency and adaptive persona framing.
          </p>
        </GlassCard>

        <GlassCard className="p-6 border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
            <Shield size={18} />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Explicit Memory Vault</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Personalization is transparent and user-directed. You decide what memories are retained, modified, or silenced, avoiding opaque black-box profiling.
          </p>
        </GlassCard>

        <GlassCard className="p-6 border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
            <Compass size={18} />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Milestone Progression</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Descend from the Shallows to the Bioluminescent Trench through genuine exploration and learning, free from aggressive gamification hooks.
          </p>
        </GlassCard>
      </div>

      {/* Technical Architecture Overview */}
      <GlassCard className="p-6 border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Code2 size={16} className="text-slate-700" />
          <span>System & Technology Architecture</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-900 mb-1">Frontend Layer</div>
            <p className="text-[11px] text-slate-600">
              React 18 + Vite + Tailwind CSS + Lucide Icons + Recharts
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-900 mb-1">Backend Server</div>
            <p className="text-[11px] text-slate-600">
              Node.js Express + Server-Sent Events (SSE) + JSON Persistence
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-900 mb-1">AI Engine</div>
            <p className="text-[11px] text-slate-600">
              @google/genai TypeScript SDK + Server Proxy Routing
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

