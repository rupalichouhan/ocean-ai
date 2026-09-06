import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  Shield,
  Download,
  Trash2,
  Check,
  Sliders
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { UserProfile, AIProviderType } from '../types';
import * as api from '../services/api';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  onResetData
}) => {
  const [defaultProvider, setDefaultProvider] = useState<AIProviderType>(user.defaultProvider || 'gemini');
  const [memoriesEnabled, setMemoriesEnabled] = useState(user.memoriesEnabled !== false);
  const [reducedMotion, setReducedMotion] = useState(user.reducedMotion || false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await api.updateProfile({
        defaultProvider,
        memoriesEnabled,
        reducedMotion
      });
      onUpdateUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const token = api.getAuthToken();
      const res = await fetch('/api/export-data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buddy_ocean_data_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const handleConfirmReset = async () => {
    try {
      await api.resetUserData();
      setShowResetModal(false);
      onResetData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 text-slate-900">
      {/* Header Banner */}
      <GlassCard className="p-8 border-slate-200 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-2">
          <Settings size={14} className="text-slate-600" />
          <span>System & Privacy Configuration</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Settings & Data Controls
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
          Manage AI providers, personal data boundaries, visual rendering styles, and local backups.
        </p>
      </GlassCard>

      {saveSuccess && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
          <Check size={16} />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* AI Provider Config */}
      <GlassCard className="p-6 border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Sparkles size={16} className="text-slate-700" />
          <span>Default Intelligence Provider</span>
        </h3>
        <p className="text-xs text-slate-500">
          Buddy executes all requests server-side. You can choose which AI model family serves as your default companion.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div
            onClick={() => setDefaultProvider('gemini')}
            className={`p-4 rounded-lg cursor-pointer border transition-all ${
              defaultProvider === 'gemini'
                ? 'bg-slate-50 border-slate-900 text-slate-900 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-900">Google Gemini 3.7</span>
              {defaultProvider === 'gemini' && <Check size={15} className="text-slate-900" />}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Primary model alias via @google/genai with low-latency streaming and high context retention.
            </p>
          </div>

          <div
            onClick={() => setDefaultProvider('openai')}
            className={`p-4 rounded-lg cursor-pointer border transition-all ${
              defaultProvider === 'openai'
                ? 'bg-slate-50 border-slate-900 text-slate-900 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-900">OpenAI GPT-4o</span>
              {defaultProvider === 'openai' && <Check size={15} className="text-slate-900" />}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Alternate high-reasoning model available as fallback through unified server provider router.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Visual & Atmosphere Preferences */}
      <GlassCard className="p-6 border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Sliders size={16} className="text-slate-700" />
          <span>Atmosphere & Motion</span>
        </h3>

        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-800">Global Personalization & Memory</div>
              <div className="text-[11px] text-slate-500">Allow Buddy to incorporate your active Saved Memories into system prompts</div>
            </div>
            <button
              type="button"
              onClick={() => setMemoriesEnabled(!memoriesEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                memoriesEnabled ? 'bg-slate-900 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              <div className="text-xs font-medium text-slate-800">Reduced Ambient Motion</div>
              <div className="text-[11px] text-slate-500">Diminish background water currents and floating particulate density</div>
            </div>
            <button
              type="button"
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                reducedMotion ? 'bg-slate-900 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs active:scale-95 disabled:opacity-40"
          >
            {isSaving ? 'Saving...' : 'Apply Preferences'}
          </button>
        </div>
      </GlassCard>

      {/* Data Sovereignty & Portability */}
      <GlassCard className="p-6 border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Shield size={16} className="text-slate-700" />
          <span>Data Sovereignty & Portability</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          You have 100% control over your data. Export your entire conversation history, ocean progression metrics, and saved memories in standardized JSON format, or reset everything to zero.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <Download size={14} />
            <span>Export Complete Data Archive (.json)</span>
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            className="px-4 py-2 rounded-lg border border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <Trash2 size={14} />
            <span>Reset & Purge All Records</span>
          </button>
        </div>
      </GlassCard>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetModal}
        title="Reset All Explorer Data"
        message="This action will permanently delete all your conversation turns, custom memories, and ocean achievements. This cannot be undone."
        confirmLabel="Reset Everything"
        isDestructive={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
};

