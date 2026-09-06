export type AIProviderType = 'gemini' | 'openai';

export type AIResponseTone = 'balanced' | 'concise' | 'detailed' | 'playful' | 'deep_thinking';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  favoriteTopics: string[];
  aiPreference: AIResponseTone;
  language: string;
  defaultProvider: AIProviderType;
  reducedMotion: boolean;
  memoriesEnabled: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessagePreview?: string;
  messageCount?: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  provider?: AIProviderType;
  model?: string;
  latencyMs?: number;
  createdAt: string;
}

export interface SavedMemory {
  id: string;
  userId: string;
  content: string;
  category: 'preference' | 'interest' | 'project' | 'personal' | 'custom';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OceanAchievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface OceanStageInfo {
  id: string;
  name: string;
  depth: string;
  minXp: number;
  description: string;
  themeColor: string;
}

export interface OceanProgress {
  userId: string;
  level: number;
  xp: number;
  currentStage: string;
  nextStage: string;
  xpToNextLevel: number;
  unlockedStages: string[];
  achievements: OceanAchievement[];
  updatedAt: string;
}

export interface DailyAnalytics {
  day: string; // YYYY-MM-DD
  conversationCount: number;
  messageCount: number;
  activeMinutes: number;
  providerMix: Record<string, number>;
  avgLatencyMs: number;
}

export interface AnalyticsSummary {
  totalConversations: number;
  totalMessages: number;
  activeChatDays: number;
  avgLatencyMs: number;
  providerDistribution: { name: string; count: number; percentage: number }[];
  timeseries: DailyAnalytics[];
  recentActivity: { day: string; messages: number }[];
}

export type MascotState = 'idle' | 'listening' | 'thinking' | 'streaming' | 'success' | 'error';
