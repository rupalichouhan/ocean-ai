import React from 'react';
import { Menu, Sparkles, Compass, Plus } from 'lucide-react';
import { UserProfile, OceanProgress, AIProviderType } from '../types';
import { ActiveTab } from './Sidebar';

interface TopBarProps {
  activeTab: ActiveTab;
  user: UserProfile | null;
  oceanProgress: OceanProgress | null;
  activeProvider: AIProviderType;
  onOpenMobileMenu: () => void;
  onNewChat: () => void;
  onSelectTab: (tab: ActiveTab) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  oceanProgress,
  activeProvider,
  onOpenMobileMenu,
  onNewChat,
  onSelectTab
}) => {
  const titleMap: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Command Center', subtitle: 'Calm companion briefing and recent activity' },
    chat: { title: 'Companion Chat', subtitle: 'Real-time conversational intelligence' },
    history: { title: 'Conversation Logs', subtitle: 'Search and revisit past explorations' },
    ocean: { title: 'Ocean Progression', subtitle: 'Depth milestones and exploration badges' },
    memory: { title: 'Memory Vault', subtitle: 'Explicit user-controlled personalization' },
    analytics: { title: 'Usage Insights', subtitle: 'Telemetry and companion interaction trends' },
    profile: { title: 'Explorer Profile', subtitle: 'Persona tuning and response preferences' },
    settings: { title: 'System Settings', subtitle: 'Provider selection, keys and data controls' },
    about: { title: 'About Buddy', subtitle: 'Architecture, design and philosophy' }
  };

  const currentInfo = titleMap[activeTab] || { title: 'Buddy', subtitle: 'Ocean AI Companion' };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors"
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight leading-none">
            {currentInfo.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block mt-1 leading-none">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Ocean Depth Badge + Provider Badge + New Chat */}
      <div className="flex items-center gap-2">
        {/* Ocean Progress Pill */}
        {oceanProgress && (
          <button
            onClick={() => onSelectTab('ocean')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs text-slate-700 font-medium transition-colors"
            title={`Level ${oceanProgress.level} - ${oceanProgress.currentStage}`}
          >
            <Compass size={14} className="text-slate-600" />
            <span className="hidden sm:inline font-semibold">{oceanProgress.currentStage}</span>
            <span className="text-[11px] text-slate-500">
              Lvl {oceanProgress.level}
            </span>
          </button>
        )}

        {/* AI Provider Status Pill */}
        <button
          onClick={() => onSelectTab('settings')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs text-slate-700 font-medium transition-colors"
          title={`Active Provider: ${activeProvider.toUpperCase()}`}
        >
          <Sparkles size={13} className="text-slate-600" />
          <span className="capitalize">{activeProvider}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </button>

        {/* Start New Dive Button */}
        {activeTab !== 'chat' && (
          <button
            onClick={onNewChat}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs active:scale-95"
          >
            <Plus size={14} />
            <span>New Dive</span>
          </button>
        )}
      </div>
    </header>
  );
};

