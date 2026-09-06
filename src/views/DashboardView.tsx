import React, { useState } from 'react';
import {
  MessageSquare,
  Compass,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Bookmark,
  Waves,
  Zap,
  BarChart2,
  Clock
} from 'lucide-react';
import { BuddyMascot } from '../components/BuddyMascot';
import { GlassCard } from '../components/GlassCard';
import { MetricCard } from '../components/MetricCard';
import { UserProfile, OceanProgress, Conversation, AnalyticsSummary } from '../types';

interface DashboardViewProps {
  user: UserProfile;
  oceanProgress: OceanProgress | null;
  recentConversations: Conversation[];
  analytics: AnalyticsSummary | null;
  onStartChat: (initialPrompt?: string, conversationId?: string) => void;
  onNavigateTo: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  oceanProgress,
  recentConversations,
  analytics,
  onStartChat,
  onNavigateTo
}) => {
  const [promptInput, setPromptInput] = useState('');

  const quickPrompts = [
    { label: 'Explain hydrothermal vent ecosystems', category: 'Deep Sea' },
    { label: 'Architect a clean TypeScript & Express service', category: 'Engineering' },
    { label: 'What is the Fermi paradox in modern astrophysics?', category: 'Cosmology' },
    { label: 'Write a calm philosophical meditation on the ocean abyss', category: 'Creative' }
  ];

  const handleLaunchChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    onStartChat(promptInput.trim());
    setPromptInput('');
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 text-slate-900">
      {/* Hero Welcome Card */}
      <GlassCard className="p-8 md:p-10 relative overflow-hidden border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
              <Sparkles size={13} className="text-slate-600" />
              <span>{getTimeGreeting()}, {user.displayName}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              Ready to explore with Buddy?
            </h2>
            <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
              Buddy is synchronized with your preferences. Dive into a new exploration, review past memories, or ascend through ocean depth milestones.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center flex-shrink-0">
            <BuddyMascot state="idle" size="lg" />
            <span className="text-[11px] text-slate-500 font-medium mt-2">
              Buddy is Ready
            </span>
          </div>
        </div>

        {/* Quick Chat Composer inside Hero */}
        <form onSubmit={handleLaunchChat} className="mt-8 relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Ask Buddy anything, explore ideas, or dive into complex questions..."
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:bg-white rounded-xl pl-4 pr-24 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all shadow-xs"
            />
            <button
              type="submit"
              disabled={!promptInput.trim()}
              className="absolute right-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs active:scale-98 disabled:opacity-40 flex items-center gap-1.5"
            >
              <span>Explore</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-[11px] text-slate-500 uppercase font-semibold mr-1">
            Suggestions:
          </span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onStartChat(q.label)}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs text-slate-700 transition-all truncate max-w-xs"
            >
              {q.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Explorations"
          value={analytics?.totalConversations ?? recentConversations.length}
          subtitle="Saved conversations"
          icon={MessageSquare}
        />
        <MetricCard
          title="Messages Exchanged"
          value={analytics?.totalMessages ?? 12}
          subtitle="Companion turns"
          icon={Zap}
        />
        <MetricCard
          title="Ocean Depth Level"
          value={`Lvl ${oceanProgress?.level || 1}`}
          subtitle={oceanProgress?.currentStage || 'Shallows'}
          icon={Compass}
          trend={`${oceanProgress?.xp || 0} XP`}
          trendPositive={true}
        />
        <MetricCard
          title="Average Response"
          value={`${analytics?.avgLatencyMs || 580}ms`}
          subtitle="Low-latency stream"
          icon={Clock}
        />
      </div>

      {/* Two Column Section: Recent Chats + Ocean Progression Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Conversations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <MessageSquare size={16} className="text-slate-700" />
              <span>Recent Explorations</span>
            </h3>
            <button
              onClick={() => onNavigateTo('history')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentConversations.length === 0 ? (
              <GlassCard className="p-8 text-center text-slate-500">
                <p className="text-xs">No past conversations yet. Start your first exploration above!</p>
              </GlassCard>
            ) : (
              recentConversations.slice(0, 4).map((conv) => (
                <GlassCard
                  key={conv.id}
                  interactive
                  onClick={() => onStartChat(undefined, conv.id)}
                  className="p-4 flex items-center justify-between group hover:border-slate-300"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0 group-hover:bg-slate-200 transition-colors">
                      <MessageSquare size={15} />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-medium text-slate-900 group-hover:text-slate-700 truncate transition-colors">
                        {conv.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {conv.lastMessagePreview || 'Conversation saved'}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 flex-shrink-0 ml-4">
                    {new Date(conv.updatedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>

        {/* Ocean Progression Mini Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Compass size={16} className="text-slate-700" />
              <span>Current Depth</span>
            </h3>
            <button
              onClick={() => onNavigateTo('ocean')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <span>Ocean Map</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <GlassCard className="p-6 border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Zone {oceanProgress?.level || 1}
                </span>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {oceanProgress?.currentStage || 'Shallows'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-xs">
                {oceanProgress?.xp || 0} XP
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                <span>Progress to {oceanProgress?.nextStage || 'Next Stage'}</span>
                <span>{oceanProgress?.xpToNextLevel || 0} XP needed</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-slate-900 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(15, 100 - ((oceanProgress?.xpToNextLevel || 50) % 100))
                    )}%`
                  }}
                />
              </div>
            </div>

            {/* Achievements Summary */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Achievements Unlocked:</span>
              <span className="font-semibold text-slate-900">
                {oceanProgress?.achievements.filter((a) => a.unlocked).length || 1} /{' '}
                {oceanProgress?.achievements.length || 6}
              </span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

