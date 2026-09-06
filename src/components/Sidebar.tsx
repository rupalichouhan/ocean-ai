import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  History,
  Compass,
  Bookmark,
  BarChart3,
  User,
  Settings,
  Info,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { BuddyMascot } from './BuddyMascot';
import { UserProfile, OceanProgress } from '../types';

export type ActiveTab =
  | 'dashboard'
  | 'chat'
  | 'history'
  | 'ocean'
  | 'memory'
  | 'analytics'
  | 'profile'
  | 'settings'
  | 'about';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onNewChat: () => void;
  user: UserProfile | null;
  oceanProgress: OceanProgress | null;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onNewChat,
  user,
  oceanProgress,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Companion Chat', icon: MessageSquare },
    { id: 'history', label: 'History', icon: History },
    { id: 'ocean', label: 'Ocean Map', icon: Compass },
    { id: 'memory', label: 'Memory Vault', icon: Bookmark },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ] as const;

  const secondaryNavItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About Buddy', icon: Info }
  ] as const;

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen flex flex-col justify-between transition-all duration-200 ease-in-out border-r border-slate-200 bg-white ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-3 text-left group overflow-hidden"
            >
              <BuddyMascot state="idle" size="sm" />
              {!isCollapsed && (
                <div>
                  <div className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                    Buddy
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      Ocean AI
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">
                    {oceanProgress?.currentStage || 'Shallows'}
                  </div>
                </div>
              )}
            </button>

            {/* Collapse Toggle (Desktop only) */}
            <button
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Quick New Chat Button */}
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs active:scale-98 ${
              isCollapsed ? 'w-10 h-10 p-0 mx-auto' : 'w-full'
            }`}
            title="Start New Exploration"
          >
            <Plus size={16} />
            {!isCollapsed && <span>New Dive</span>}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-2 overflow-y-auto space-y-6">
          {/* Main Items */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Experience
              </div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 border-l-2 border-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon size={16} className={isActive ? 'text-slate-900' : 'text-slate-500'} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Secondary Items */}
          <div className="space-y-1 pt-2 border-t border-slate-200">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Preferences
              </div>
            )}
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 border-l-2 border-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon size={16} className={isActive ? 'text-slate-900' : 'text-slate-500'} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Footer Card & Logout */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70">
          {user && (
            <div className={`flex items-center justify-between ${isCollapsed ? 'flex-col gap-2' : ''}`}>
              <button
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2.5 text-left overflow-hidden group"
                title="View Profile"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-xs">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                {!isCollapsed && (
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-slate-700 truncate">
                      {user.displayName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium truncate">
                      Level {oceanProgress?.level || 1} • {oceanProgress?.xp || 0} XP
                    </div>
                  </div>
                )}
              </button>

              <button
                onClick={onLogout}
                aria-label="Log out"
                title="Log out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

