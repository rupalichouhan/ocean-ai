import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Compass, Layers, Sliders } from 'lucide-react';
import { BuddyMascot } from '../components/BuddyMascot';
import { GlassCard } from '../components/GlassCard';
import { UserProfile, AIResponseTone } from '../types';
import * as api from '../services/api';

interface OnboardingViewProps {
  user: UserProfile;
  onFinish: (updatedUser: UserProfile) => void;
}

const AVAILABLE_TOPICS = [
  'Deep Ocean Biology',
  'Submarine Engineering',
  'Artificial Intelligence',
  'Philosophy & Ethics',
  'Astrophysics',
  'Creative Writing',
  'Mindfulness & Focus',
  'Software Development'
];

const TONE_OPTIONS: { id: AIResponseTone; title: string; desc: string }[] = [
  { id: 'balanced', title: 'Balanced & Warm', desc: 'Harmonious blend of helpful clarity and gentle companionship.' },
  { id: 'concise', title: 'Concise & Direct', desc: 'High-signal, compact answers with minimal filler.' },
  { id: 'detailed', title: 'Deep & Analytical', desc: 'Comprehensive multi-layered structure with detailed analysis.' },
  { id: 'playful', title: 'Playful & Expressive', desc: 'Friendly, witty, and rich in creative dialogue.' },
  { id: 'deep_thinking', title: 'Deep Thinker', desc: 'Rigorous exploration of counter-arguments and nuances.' }
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  user,
  onFinish
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [displayName, setDisplayName] = useState(user.displayName || 'Ocean Voyager');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    user.favoriteTopics.length > 0 ? user.favoriteTopics : ['Deep Ocean Biology', 'Artificial Intelligence']
  );
  const [selectedTone, setSelectedTone] = useState<AIResponseTone>(user.aiPreference || 'balanced');
  const [isSaving, setIsSaving] = useState(false);

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const updated = await api.updateProfile({
        displayName: displayName.trim(),
        favoriteTopics: selectedTopics,
        aiPreference: selectedTone,
        onboardingCompleted: true
      });
      onFinish(updated);
    } catch {
      onFinish({
        ...user,
        displayName,
        favoriteTopics: selectedTopics,
        aiPreference: selectedTone,
        onboardingCompleted: true
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 text-slate-900">
      <div className="w-full max-w-lg">
        {/* Step Progress Indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <BuddyMascot state="listening" size="sm" />
            <span className="text-xs font-semibold text-slate-800">
              Personalizing Buddy ({step}/3)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-slate-900'
                    : s < step
                    ? 'w-4 bg-slate-400'
                    : 'w-4 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card Content */}
        <GlassCard className="p-8 border-slate-200 shadow-sm">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mx-auto mb-3">
                  <Compass size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">What should Buddy call you?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose a preferred name for your conversations.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Captain Nemo, Sarah, or Alex"
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-xs"
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mx-auto mb-3">
                  <Layers size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Select topics of curiosity</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Buddy uses your favorite topics to offer relevant insights and tailored examples.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TOPICS.map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-slate-900 text-white border border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && <Check size={12} className="text-white" />}
                      <span>{topic}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-xs"
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mx-auto mb-3">
                  <Sliders size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Preferred AI Response Tone</h2>
                <p className="text-xs text-slate-500 mt-1">
                  You can change this tone anytime in your Profile or Settings.
                </p>
              </div>

              <div className="space-y-2">
                {TONE_OPTIONS.map((opt) => {
                  const isSelected = selectedTone === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedTone(opt.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-50 border-slate-900 text-slate-900 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{opt.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                      </div>
                      {isSelected && <Check size={15} className="text-slate-900" />}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleComplete}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  <span>{isSaving ? 'Configuring...' : 'Enter Dashboard'}</span>
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

