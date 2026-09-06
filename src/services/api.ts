import {
  UserProfile,
  Conversation,
  ChatMessage,
  SavedMemory,
  OceanProgress,
  AnalyticsSummary,
  AIProviderType
} from '../types';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('buddy_auth_token', token);
  } else {
    localStorage.removeItem('buddy_auth_token');
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('buddy_auth_token');
  }
  return authToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errorJson = await res.json();
      errorMsg = errorJson.error || errorMsg;
    } catch {
      // Ignore JSON parse failure
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Auth & Session
// ---------------------------------------------------------------------------
export async function getSession(): Promise<{ user: UserProfile; token: string }> {
  return request<{ user: UserProfile; token: string }>('/api/auth/session');
}

export async function login(email: string): Promise<{ user: UserProfile; token: string }> {
  return request<{ user: UserProfile; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export async function signup(payload: {
  email: string;
  displayName?: string;
  favoriteTopics?: string[];
  aiPreference?: string;
}): Promise<{ user: UserProfile; token: string }> {
  return request<{ user: UserProfile; token: string }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function logout(): Promise<{ status: string }> {
  setAuthToken(null);
  return request<{ status: string }>('/api/auth/logout', { method: 'POST' });
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
export async function getProfile(): Promise<UserProfile> {
  return request<UserProfile>('/api/profile');
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  return request<UserProfile>('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------
export async function getConversations(searchQuery?: string): Promise<Conversation[]> {
  const queryParam = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
  return request<Conversation[]>(`/api/conversations${queryParam}`);
}

export async function createConversation(title?: string): Promise<Conversation> {
  return request<Conversation>('/api/conversations', {
    method: 'POST',
    body: JSON.stringify({ title })
  });
}

export async function getConversationDetails(
  id: string
): Promise<{ conversation: Conversation; messages: ChatMessage[] }> {
  return request<{ conversation: Conversation; messages: ChatMessage[] }>(`/api/conversations/${id}`);
}

export async function updateConversation(
  id: string,
  data: { title?: string; pinned?: boolean }
): Promise<Conversation> {
  return request<Conversation>(`/api/conversations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export async function deleteConversation(id: string): Promise<{ success: boolean; id: string }> {
  return request<{ success: boolean; id: string }>(`/api/conversations/${id}`, {
    method: 'DELETE'
  });
}

// ---------------------------------------------------------------------------
// Saved Memories
// ---------------------------------------------------------------------------
export async function getMemories(): Promise<SavedMemory[]> {
  return request<SavedMemory[]>('/api/memories');
}

export async function createMemory(payload: {
  content: string;
  category?: 'preference' | 'interest' | 'project' | 'personal' | 'custom';
}): Promise<SavedMemory> {
  return request<SavedMemory>('/api/memories', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateMemory(
  id: string,
  data: Partial<SavedMemory>
): Promise<SavedMemory> {
  return request<SavedMemory>(`/api/memories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteMemory(id: string): Promise<{ success: boolean; id: string }> {
  return request<{ success: boolean; id: string }>(`/api/memories/${id}`, {
    method: 'DELETE'
  });
}

// ---------------------------------------------------------------------------
// Analytics & Ocean Progress
// ---------------------------------------------------------------------------
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return request<AnalyticsSummary>('/api/analytics/summary');
}

export async function getOceanProgress(): Promise<OceanProgress> {
  return request<OceanProgress>('/api/ocean/progress');
}

export async function resetUserData(): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>('/api/data/reset', {
    method: 'POST'
  });
}

// ---------------------------------------------------------------------------
// Streaming Chat API Helper (SSE)
// ---------------------------------------------------------------------------
export interface StreamChatParams {
  conversationId?: string;
  prompt: string;
  provider?: AIProviderType;
  onStart?: (data: { conversationId: string; userMessageId: string; provider: string }) => void;
  onToken?: (token: string) => void;
  onEnd?: (data: { messageId: string; latencyMs: number; provider: string; model: string }) => void;
  onError?: (error: Error) => void;
}

export function streamChat(params: StreamChatParams): () => void {
  const controller = new AbortController();
  const token = getAuthToken();

  const run = async () => {
    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          conversationId: params.conversationId,
          prompt: params.prompt,
          provider: params.provider
        }),
        signal: controller.signal
      });

      if (!res.ok) {
        throw new Error(`Chat stream failed with status ${res.status}`);
      }

      if (!res.body) {
        throw new Error('No response stream returned');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const evt of events) {
          if (!evt.trim()) continue;
          const lines = evt.split('\n');
          let eventType = 'message';
          let eventData = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.substring(7).trim();
            } else if (line.startsWith('data: ')) {
              eventData = line.substring(6).trim();
            }
          }

          if (eventData) {
            try {
              const parsed = JSON.parse(eventData);
              if (eventType === 'message_start') {
                params.onStart?.(parsed);
              } else if (eventType === 'token') {
                params.onToken?.(parsed.text);
              } else if (eventType === 'message_end') {
                params.onEnd?.(parsed);
              } else if (eventType === 'error') {
                params.onError?.(new Error(parsed.message || 'Stream error'));
              }
            } catch {
              // Ignore non-JSON event data
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        params.onError?.(err);
      }
    }
  };

  run();

  return () => controller.abort();
}
