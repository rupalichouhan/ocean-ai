import React, { useState, useEffect, useCallback } from 'react';
import { OceanBackground } from './components/OceanBackground';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';

// Views
import { LandingView } from './views/LandingView';
import { AuthView } from './views/AuthView';
import { OnboardingView } from './views/OnboardingView';
import { DashboardView } from './views/DashboardView';
import { ChatView } from './views/ChatView';
import { HistoryView } from './views/HistoryView';
import { OceanView } from './views/OceanView';
import { MemoryView } from './views/MemoryView';
import { AnalyticsView } from './views/AnalyticsView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';

// Types & API
import {
  UserProfile,
  OceanProgress,
  Conversation,
  SavedMemory,
  AnalyticsSummary,
  AIProviderType
} from './types';
import * as api from './services/api';

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authViewMode, setAuthViewMode] = useState<'landing' | 'auth'>('landing');

  // App Navigation & UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App Data state
  const [oceanProgress, setOceanProgress] = useState<OceanProgress | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>(undefined);
  const [memories, setMemories] = useState<SavedMemory[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // Initial Auth verification
  useEffect(() => {
    api.getSession()
      .then((res) => {
        setUser(res.user);
        setAuthChecked(true);
      })
      .catch(() => {
        setUser(null);
        setAuthChecked(true);
      });
  }, []);

  // Fetch contextual app state when user is logged in
  const refreshAppData = useCallback(async () => {
    if (!user) return;
    try {
      const [oceanRes, convsRes, memsRes, analyticsRes] = await Promise.allSettled([
        api.getOceanProgress(),
        api.getConversations(),
        api.getMemories(),
        api.getAnalyticsSummary()
      ]);

      if (oceanRes.status === 'fulfilled') {
        setOceanProgress(oceanRes.value);
      }
      if (convsRes.status === 'fulfilled') {
        setConversations(convsRes.value);
      }
      if (memsRes.status === 'fulfilled') {
        setMemories(memsRes.value);
      }
      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value);
      }
    } catch (err) {
      console.error('Error refreshing app data:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshAppData();
    }
  }, [user, refreshAppData]);

  // Auth Callbacks
  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setAuthViewMode('landing');
    if (authenticatedUser.onboardingCompleted) {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setActiveConversation(null);
    setAuthViewMode('landing');
  };

  const handleStartChat = (prompt?: string, conversationId?: string) => {
    if (conversationId) {
      const existing = conversations.find((c) => c.id === conversationId);
      setActiveConversation(existing || null);
    } else {
      setActiveConversation(null);
    }
    setInitialPrompt(prompt);
    setActiveTab('chat');
  };

  const handleNewChat = () => {
    setActiveConversation(null);
    setInitialPrompt(undefined);
    setActiveTab('chat');
  };

  const handleSelectConversation = (id: string) => {
    const target = conversations.find((c) => c.id === id);
    if (target) {
      setActiveConversation(target);
      setInitialPrompt(undefined);
      setActiveTab('chat');
    }
  };

  const handleToggleGlobalMemory = async (enabled: boolean) => {
    if (!user) return;
    try {
      const updated = await api.updateProfile({ memoriesEnabled: enabled });
      setUser(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Loading Screen while auth is verifying
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
        <OceanBackground reducedMotion={false} />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shadow-xs">
            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-xs font-semibold text-slate-600 tracking-wider uppercase">
            Loading Workspace...
          </span>
        </div>
      </div>
    );
  }

  // Not Logged In Flows
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative overflow-hidden">
        <OceanBackground reducedMotion={false} />
        <div className="relative z-10">
          {authViewMode === 'landing' ? (
            <LandingView
              onGetStarted={() => setAuthViewMode('auth')}
              onExploreDemo={async () => {
                try {
                  const res = await api.login('explorer@ocean.ai');
                  api.setAuthToken(res.token);
                  handleAuthSuccess(res.user);
                } catch (err) {
                  setAuthViewMode('auth');
                }
              }}
            />
          ) : (
            <AuthView
              onSuccess={handleAuthSuccess}
              onBackToLanding={() => setAuthViewMode('landing')}
            />
          )}
        </div>
      </div>
    );
  }

  // Logged In, but hasn't completed Onboarding
  if (!user.onboardingCompleted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative overflow-hidden">
        <OceanBackground reducedMotion={user.reducedMotion} />
        <div className="relative z-10">
          <OnboardingView
            user={user}
            onFinish={(updated) => {
              setUser(updated);
              setActiveTab('dashboard');
              refreshAppData();
            }}
          />
        </div>
      </div>
    );
  }

  // Main Logged In App Layout
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex relative overflow-hidden">
      {/* Ambient Subtle Background Pattern */}
      <OceanBackground reducedMotion={user.reducedMotion} />

      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onNewChat={handleNewChat}
        user={user}
        oceanProgress={oceanProgress}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10">
        <TopBar
          activeTab={activeTab}
          user={user}
          oceanProgress={oceanProgress}
          activeProvider={user.defaultProvider || 'gemini'}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNewChat={handleNewChat}
          onSelectTab={setActiveTab}
        />

        <main className="flex-1 p-4 md:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              user={user}
              oceanProgress={oceanProgress}
              recentConversations={conversations}
              analytics={analytics}
              onStartChat={handleStartChat}
              onNavigateTo={setActiveTab}
            />
          )}

          {activeTab === 'chat' && (
            <ChatView
              user={user}
              activeConversation={activeConversation}
              initialPrompt={initialPrompt}
              onConversationCreated={(conv) => {
                setActiveConversation(conv);
                refreshAppData();
              }}
              onConversationUpdated={() => {
                refreshAppData();
              }}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              conversations={conversations}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
              onRefresh={refreshAppData}
            />
          )}

          {activeTab === 'ocean' && (
            <OceanView oceanProgress={oceanProgress} />
          )}

          {activeTab === 'memory' && (
            <MemoryView
              memories={memories}
              memoriesEnabled={user.memoriesEnabled !== false}
              onToggleGlobalMemory={handleToggleGlobalMemory}
              onRefresh={refreshAppData}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView analytics={analytics} />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              user={user}
              onUpdateUser={(updated) => {
                setUser(updated);
                refreshAppData();
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              user={user}
              onUpdateUser={(updated) => {
                setUser(updated);
                refreshAppData();
              }}
              onResetData={async () => {
                handleLogout();
              }}
            />
          )}

          {activeTab === 'about' && <AboutView />}
        </main>
      </div>
    </div>
  );
}
