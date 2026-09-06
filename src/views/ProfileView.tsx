import React, { useState } from 'react';
import {
  User,
  Check,
  Sliders,
  Layers,
  Save,
  Compass
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { UserProfile, AIResponseTone, AIProviderType } from '../types';
import * as api from '../services/api';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

const AVAILABLE_TOPICS = [
  'Deep Ocean Biology',
  'Submarine Engineering',
  'Artificial Intelligence',
  'Philosophy & Ethics',
  'Astrophysics',
  'Creative Writing',
  'Mindfulness & Focus',
  'Software Development',
  'Marine Ecology',
  'History of Navigation'
];

const TONE_OPTIONS: { id: AIResponseTone; title: string; desc: string }[] = [
  { id: 'balanced', title: 'Balanced & Warm', desc: 'Harmonious blend of helpful clarity and gentle companionship.' },
  { id: 'concise', title: 'Concise & Direct', desc: 'High-signal, compact answers with minimal filler.' },
  { id: 'detailed', title: 'Deep & Analytical', desc: 'Comprehensive multi-layered structure with detailed analysis.' },
  { id: 'playful', title: 'Playful & Expressive', desc: 'Friendly, witty, and rich in creative dialogue.' },
  { id: 'deep_thinking', title: 'Deep Thinker', desc: 'Rigorous exploration of counter-arguments and nuances.' }
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser
}) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [favoriteTopics, setFavoriteTopics] = useState<string[]>(user.favoriteTopics || []);
  const [aiPreference, setAiPreference] = useState<AIResponseTone>(user.aiPreference || 'balanced');
  const [defaultProvider, setDefaultProvider] = useState<AIProviderType>(user.defaultProvider || 'gemini');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTopic = (topic: string) => {
    if (favoriteTopics.includes(topic)) {
      setFavoriteTopics(favoriteTopics.filter((t) => t !== topic));
    } else {
      setFavoriteTopics([...favoriteTopics, topic]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const updated = await api.updateProfile({
        displayName: displayName.trim(),
        favoriteTopics,
        aiPreference,
        defaultProvider
      });
      onUpdateUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 text-slate-900">
      {/* Header Banner */}
      <GlassCard className="p-8 border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{displayName}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700 mt-2">
              <Compass size={11} />
              <span>Explorer Status: Active</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Main Profile Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {saveSuccess && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
            <Check size={16} />
            <span>Explorer profile updated successfully.</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        {/* Display Name Card */}
        <GlassCard className="p-6 border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <User size={16} className="text-slate-700" />
            <span>Identity Details</span>
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Explorer Display Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400 shadow-xs"
            />
          </div>
        </GlassCard>

        {/* Favorite Topics */}
        <GlassCard className="p-6 border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Layers size={16} className="text-slate-700" />
            <span>Curiosity & Domains of Interest</span>
          </h3>
          <p className="text-xs text-slate-500">
            Select domains you frequently explore. Buddy incorporates these into analogies and recommended topics.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {AVAILABLE_TOPICS.map((topic) => {
              const isSelected = favoriteTopics.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white border border-slate-900 shadow-xs font-semibold'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isSelected && <Check size={12} className="text-white" />}
                  <span>{topic}</span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* AI Tone Preference */}
        <GlassCard className="p-6 border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Sliders size={16} className="text-slate-700" />
            <span>Companion Response Tone</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {TONE_OPTIONS.map((opt) => {
              const isSelected = aiPreference === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setAiPreference(opt.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-50 border-slate-900 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900">{opt.title}</span>
                    {isSelected && <Check size={14} className="text-slate-900" />}
                  </div>
                  <span className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={15} />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

