import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ---------------------------------------------------------------------------
// Types & Persistent In-Memory / File Store
// ---------------------------------------------------------------------------
interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  favoriteTopics: string[];
  aiPreference: 'balanced' | 'concise' | 'detailed' | 'playful' | 'deep_thinking';
  language: string;
  defaultProvider: 'gemini' | 'openai';
  reducedMotion: boolean;
  memoriesEnabled: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  id: string;
  userId: string;
  title: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  provider?: 'gemini' | 'openai';
  model?: string;
  latencyMs?: number;
  createdAt: string;
}

interface SavedMemory {
  id: string;
  userId: string;
  content: string;
  category: 'preference' | 'interest' | 'project' | 'personal' | 'custom';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OceanAchievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface OceanProgress {
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

interface DailyAnalytics {
  day: string;
  conversationCount: number;
  messageCount: number;
  activeMinutes: number;
  providerMix: Record<string, number>;
  avgLatencyMs: number;
}

interface AppDataStore {
  users: Record<string, UserProfile>;
  conversations: Record<string, Conversation>;
  messages: Record<string, ChatMessage[]>;
  memories: Record<string, SavedMemory[]>;
  analytics: Record<string, DailyAnalytics[]>;
  oceanProgress: Record<string, OceanProgress>;
}

const DATA_FILE = path.join(process.cwd(), "buddy_data.json");

const defaultAchievements: OceanAchievement[] = [
  { id: "first_dive", title: "First Dive", description: "Start your very first conversation with Buddy", iconName: "Compass", unlocked: true, unlockedAt: new Date().toISOString() },
  { id: "ocean_curious", title: "Ocean Explorer", description: "Send 5 messages exploring ideas", iconName: "Waves", unlocked: false },
  { id: "deep_thinker", title: "Deep Thinker", description: "Engage in a deep thinking conversation", iconName: "Sparkles", unlocked: false },
  { id: "memory_keeper", title: "Memory Pearl", description: "Save your first personalization memory", iconName: "Bookmark", unlocked: false },
  { id: "coral_architect", title: "Coral Architect", description: "Reach Level 2 in ocean progression", iconName: "Shield", unlocked: false },
  { id: "bioluminescent", title: "Bioluminescent", description: "Reach the Midnight Zone with 500+ XP", iconName: "Moon", unlocked: false }
];

const STAGES = [
  { name: "Shallows", minXp: 0, depth: "0 - 50m" },
  { name: "Coral Garden", minXp: 100, depth: "50 - 200m" },
  { name: "Open Sea", minXp: 250, depth: "200 - 1,000m" },
  { name: "Deep Water", minXp: 500, depth: "1,000 - 3,000m" },
  { name: "Midnight Zone", minXp: 1000, depth: "3,000 - 6,000m" },
  { name: "Bioluminescent Trench", minXp: 2000, depth: "6,000m+" }
];

function calculateStageAndLevel(xp: number) {
  let level = Math.floor(xp / 100) + 1;
  let currentStage = STAGES[0].name;
  let nextStage = STAGES[1].name;
  let xpToNext = 100 - (xp % 100);
  const unlockedStages = [STAGES[0].name];

  for (let i = 0; i < STAGES.length; i++) {
    if (xp >= STAGES[i].minXp) {
      currentStage = STAGES[i].name;
      if (i < STAGES.length - 1) {
        nextStage = STAGES[i + 1].name;
        xpToNext = STAGES[i + 1].minXp - xp;
      } else {
        nextStage = "Master of the Abyss";
        xpToNext = 0;
      }
      if (!unlockedStages.includes(STAGES[i].name)) {
        unlockedStages.push(STAGES[i].name);
      }
    }
  }

  return { level, currentStage, nextStage, xpToNext, unlockedStages };
}

function loadInitialData(): AppDataStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Could not load data file, initializing fresh store", err);
  }

  const defaultUser: UserProfile = {
    id: "user_demo_1",
    email: "explorer@ocean.ai",
    displayName: "Ocean Explorer",
    favoriteTopics: ["Marine Biology", "Deep Sea Technology", "Philosophy", "Creative Writing"],
    aiPreference: "balanced",
    language: "en",
    defaultProvider: "gemini",
    reducedMotion: false,
    memoriesEnabled: true,
    onboardingCompleted: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  };

  const initialConvId = "conv_welcome";
  const initialConv: Conversation = {
    id: initialConvId,
    userId: defaultUser.id,
    title: "Welcome to the Ocean Depths",
    pinned: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  };

  const initialMessages: ChatMessage[] = [
    {
      id: "msg_1",
      conversationId: initialConvId,
      userId: defaultUser.id,
      role: "user",
      content: "Hello Buddy! What are you capable of?",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: "msg_2",
      conversationId: initialConvId,
      userId: defaultUser.id,
      role: "assistant",
      content: "Greetings, ocean voyager! I am **Buddy**, your personal AI companion wrapped in the calm, bioluminescent wonders of the deep sea.\n\nHere is how we can explore together:\n- **Deep Conversations**: Ask me about complex problems, coding, science, philosophy, or creative ideas.\n- **Adaptive Persona**: I tune my responses to your tone preferences, from concise insights to deep multi-layered reasoning.\n- **Explicit Memory**: You have complete control over what I remember in the Memory vault.\n- **Ocean Progression**: As we interact, you accumulate Ocean XP and dive deeper through realistic ocean zones.\n\nHow can I illuminate your thoughts today?",
      provider: "gemini",
      model: "gemini-3.7-flash",
      latencyMs: 620,
      createdAt: new Date(Date.now() - 2 * 86400000 + 1000).toISOString()
    }
  ];

  const initialMemories: SavedMemory[] = [
    {
      id: "mem_1",
      userId: defaultUser.id,
      content: "Prefers structured explanations with bullet points and elegant typography.",
      category: "preference",
      enabled: true,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: "mem_2",
      userId: defaultUser.id,
      content: "Fascinated by deep ocean exploration, submarine engineering, and artificial intelligence.",
      category: "interest",
      enabled: true,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ];

  const now = new Date();
  const timeseries: DailyAnalytics[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dayStr = d.toISOString().split("T")[0];
    timeseries.push({
      day: dayStr,
      conversationCount: i === 0 ? 2 : (i % 2 === 0 ? 1 : 2),
      messageCount: i === 0 ? 4 : (i % 3 === 0 ? 6 : 3),
      activeMinutes: i === 0 ? 15 : (i % 2 === 0 ? 12 : 25),
      providerMix: { gemini: i === 0 ? 4 : 3, openai: 0 },
      avgLatencyMs: 580 + (i * 20)
    });
  }

  const { level, currentStage, nextStage, xpToNext, unlockedStages } = calculateStageAndLevel(140);
  const initialOcean: OceanProgress = {
    userId: defaultUser.id,
    level,
    xp: 140,
    currentStage,
    nextStage,
    xpToNextLevel: xpToNext,
    unlockedStages,
    achievements: defaultAchievements,
    updatedAt: new Date().toISOString()
  };

  return {
    users: { [defaultUser.id]: defaultUser },
    conversations: { [initialConv.id]: initialConv },
    messages: { [initialConv.id]: initialMessages },
    memories: { [defaultUser.id]: initialMemories },
    analytics: { [defaultUser.id]: timeseries },
    oceanProgress: { [defaultUser.id]: initialOcean }
  };
}

const store: AppDataStore = loadInitialData();

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save store to file:", err);
  }
}

// ---------------------------------------------------------------------------
// Helper: Extract or Authenticate User
// ---------------------------------------------------------------------------
function getUserIdFromReq(req: express.Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token && store.users[token]) {
      return token;
    }
  }
  // Default to primary active user if present
  const firstUserId = Object.keys(store.users)[0];
  return firstUserId || "user_demo_1";
}

// ---------------------------------------------------------------------------
// Gemini AI Setup & Model Normalization
// ---------------------------------------------------------------------------
let aiClient: GoogleGenAI | null = null;

function normalizeGeminiModel(rawModel?: string): string {
  if (!rawModel) return "gemini-3.7-flash";
  let cleaned = String(rawModel).trim();
  // Strip 'models/' or leading/trailing slashes and quotes
  cleaned = cleaned.replace(/^models\//i, "").replace(/^\/+/, "").replace(/^["']|["']$/g, "").trim();

  // Mapping aliases or deprecated names to valid standard modern Gemini SDK models
  const aliasMap: Record<string, string> = {
    "gemini flash": "gemini-flash-latest",
    "gemini-flash": "gemini-flash-latest",
    "gemini-flash-latest": "gemini-flash-latest",
    "gemini lite": "gemini-3.1-flash-lite",
    "flash lite": "gemini-3.1-flash-lite",
    "gemini-flash-lite": "gemini-3.1-flash-lite",
    "gemini pro": "gemini-3.1-pro-preview",
    "gemini-pro": "gemini-3.7-flash",
    "gemini-1.5-flash": "gemini-3.7-flash",
    "gemini-1.5-pro": "gemini-3.7-flash",
    "gemini-2.0-flash": "gemini-3.7-flash",
    "gemini-2.0-pro": "gemini-3.7-flash",
    "gemini-2.0-flash-thinking": "gemini-3.7-flash",
    "gemini-2.5-flash": "gemini-flash-latest",
    "gemini-3.6-flash": "gemini-3.6-flash",
    "gemini-3.7-flash": "gemini-3.7-flash",
    "gemini-3.1-flash-lite": "gemini-3.1-flash-lite",
    "gemini-3.1-pro-preview": "gemini-3.1-pro-preview"
  };

  if (aliasMap[cleaned.toLowerCase()]) {
    return aliasMap[cleaned.toLowerCase()];
  }

  if (cleaned.startsWith("gemini-")) {
    return cleaned;
  }

  return "gemini-3.7-flash";
}

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Resilient multi-tier streaming with automatic fallback for high-demand spikes (503 / 429 / fetch failed)
async function streamGeminiWithFallback(
  gemini: GoogleGenAI,
  primaryModel: string,
  contentsPayload: any[],
  systemPrompt: string,
  temperature: number,
  user: UserProfile,
  promptText: string,
  onToken: (chunk: string) => void
): Promise<{ modelUsed: string; fullText: string }> {
  // Ordered candidate models: prioritize ultra-fast lightweight models and the requested model
  const candidateModels = [
    "gemini-3.1-flash-lite",
    primaryModel,
    "gemini-flash-latest",
    "gemini-3.7-flash"
  ].filter((m, idx, arr) => Boolean(m) && arr.indexOf(m) === idx);

  let lastError: any = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    
    // Try streaming first, with 1 retry on transient network/load errors
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0 || i > 0) {
          const delay = attempt > 0 ? 500 * Math.pow(1.5, attempt) : 200;
          await new Promise((r) => setTimeout(r, delay));
        }

        let accumulated = "";
        const streamResponse = await gemini.models.generateContentStream({
          model,
          contents: contentsPayload,
          config: {
            systemInstruction: systemPrompt,
            temperature
          }
        });

        for await (const chunk of streamResponse) {
          const textChunk = chunk.text || "";
          if (textChunk) {
            accumulated += textChunk;
            onToken(textChunk);
          }
        }

        if (accumulated.trim().length > 0) {
          return { modelUsed: model, fullText: accumulated };
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || "");
        const isTransient =
          msg.includes("503") ||
          msg.includes("high demand") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("429") ||
          msg.includes("fetch failed") ||
          msg.includes("ECONN") ||
          msg.includes("ETIMEDOUT") ||
          msg.includes("network") ||
          msg.includes("socket") ||
          msg.includes("overloaded");

        console.warn(`Gemini model [${model}] attempt ${attempt + 1} failed:`, msg.slice(0, 120));

        // If not transient (e.g. 404 or 400), skip directly to next model
        if (!isTransient && attempt === 0) {
          break;
        }
      }
    }

    // Try standard non-streaming generateContent on the candidate model as secondary fallback
    try {
      await new Promise((r) => setTimeout(r, 200));
      const res = await gemini.models.generateContent({
        model,
        contents: contentsPayload,
        config: {
          systemInstruction: systemPrompt,
          temperature
        }
      });

      const responseText = res.text || "";
      if (responseText.trim().length > 0) {
        // Stream out the response text smoothly
        for (const word of responseText.split(" ")) {
          await new Promise((r) => setTimeout(r, 18));
          onToken(word + " ");
        }
        return { modelUsed: model, fullText: responseText };
      }
    } catch (nonStreamErr: any) {
      lastError = nonStreamErr;
      console.warn(`Gemini non-stream fallback on [${model}] failed:`, String(nonStreamErr?.message || "").slice(0, 120));
    }
  }

  // Graceful fallback companion response when upstream cloud services are in high-demand spike
  console.warn("All Gemini candidates temporarily unavailable, activating standby ocean companion mode.");
  const cleanPrompt = String(promptText || "").trim();
  const lower = cleanPrompt.toLowerCase();
  
  let fallbackText = "";
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    fallbackText = `Hello ${user.displayName || "there"}! 🌊 I'm Buddy, your ocean AI companion. I'm right here with you in calm standby mode while cloud AI services experience high demand. How can I assist your exploration today?`;
  } else if (lower.includes("who are you") || lower.includes("what can you do")) {
    fallbackText = `I am Buddy, an ocean-themed AI companion! I help you explore knowledge, brainstorm, organize memories, and dive through depth zones. I'm operating in standby mode while remote servers recover from peak traffic.`;
  } else {
    fallbackText = `I hear you on: "${cleanPrompt}".\n\nThe AI service is currently experiencing high demand spikes (503). I have safely kept our conversation active — please send your message again in a brief moment, or let me know if you'd like to explore something else!`;
  }

  for (const word of fallbackText.split(" ")) {
    await new Promise((r) => setTimeout(r, 20));
    onToken(word + " ");
  }
  return { modelUsed: "gemini-standby", fullText: fallbackText };
}

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

// 1. Health Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Buddy Ocean AI Companion",
    version: "1.0.0",
    time: new Date().toISOString(),
    providers: {
      gemini: !!process.env.GEMINI_API_KEY,
      openai: !!process.env.OPENAI_API_KEY
    }
  });
});

// 2. Auth Routes
app.get("/api/auth/session", (req, res) => {
  const userId = getUserIdFromReq(req);
  const user = store.users[userId];
  if (!user) {
    return res.status(401).json({ error: "Session not found", code: "AUTH_REQUIRED" });
  }
  res.json({ user, token: user.id });
});

app.post("/api/auth/login", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required", code: "VALIDATION_ERROR" });
  }
  let existingUser = Object.values(store.users).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!existingUser) {
    const newId = `user_${Date.now()}`;
    const namePart = email.split("@")[0];
    const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    existingUser = {
      id: newId,
      email,
      displayName: capitalized || "Ocean Voyager",
      favoriteTopics: ["Exploration", "Science", "Technology"],
      aiPreference: "balanced",
      language: "en",
      defaultProvider: "gemini",
      reducedMotion: false,
      memoriesEnabled: true,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.users[newId] = existingUser;

    const { level, currentStage, nextStage, xpToNext, unlockedStages } = calculateStageAndLevel(50);
    store.oceanProgress[newId] = {
      userId: newId,
      level,
      xp: 50,
      currentStage,
      nextStage,
      xpToNextLevel: xpToNext,
      unlockedStages,
      achievements: defaultAchievements,
      updatedAt: new Date().toISOString()
    };
    saveStore();
  }
  res.json({ user: existingUser, token: existingUser.id });
});

app.post("/api/auth/signup", (req, res) => {
  const { email, displayName, favoriteTopics, aiPreference } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required", code: "VALIDATION_ERROR" });
  }
  const newId = `user_${Date.now()}`;
  const newUser: UserProfile = {
    id: newId,
    email,
    displayName: displayName || "Ocean Navigator",
    favoriteTopics: Array.isArray(favoriteTopics) ? favoriteTopics : ["Exploration", "Curiosity"],
    aiPreference: aiPreference || "balanced",
    language: "en",
    defaultProvider: "gemini",
    reducedMotion: false,
    memoriesEnabled: true,
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  store.users[newId] = newUser;
  const { level, currentStage, nextStage, xpToNext, unlockedStages } = calculateStageAndLevel(50);
  store.oceanProgress[newId] = {
    userId: newId,
    level,
    xp: 50,
    currentStage,
    nextStage,
    xpToNextLevel: xpToNext,
    unlockedStages,
    achievements: defaultAchievements,
    updatedAt: new Date().toISOString()
  };
  saveStore();
  res.json({ user: newUser, token: newId });
});

app.post("/api/auth/logout", (req, res) => {
  res.json({ status: "logged_out" });
});

// 3. User Profile
app.get("/api/profile", (req, res) => {
  const userId = getUserIdFromReq(req);
  const user = store.users[userId];
  if (!user) {
    return res.status(404).json({ error: "Profile not found", code: "NOT_FOUND" });
  }
  res.json(user);
});

app.put("/api/profile", (req, res) => {
  const userId = getUserIdFromReq(req);
  const user = store.users[userId];
  if (!user) {
    return res.status(404).json({ error: "Profile not found", code: "NOT_FOUND" });
  }
  const { displayName, favoriteTopics, aiPreference, language, defaultProvider, reducedMotion, memoriesEnabled, onboardingCompleted } = req.body;

  if (displayName !== undefined) user.displayName = String(displayName).trim().slice(0, 60);
  if (Array.isArray(favoriteTopics)) user.favoriteTopics = favoriteTopics.slice(0, 10);
  if (aiPreference !== undefined) user.aiPreference = aiPreference;
  if (language !== undefined) user.language = String(language).slice(0, 10);
  if (defaultProvider !== undefined) user.defaultProvider = defaultProvider;
  if (reducedMotion !== undefined) user.reducedMotion = Boolean(reducedMotion);
  if (memoriesEnabled !== undefined) user.memoriesEnabled = Boolean(memoriesEnabled);
  if (onboardingCompleted !== undefined) user.onboardingCompleted = Boolean(onboardingCompleted);
  user.updatedAt = new Date().toISOString();

  saveStore();
  res.json(user);
});

// 4. Conversations
app.get("/api/conversations", (req, res) => {
  const userId = getUserIdFromReq(req);
  const query = String(req.query.q || "").toLowerCase().trim();

  const userConversations = Object.values(store.conversations)
    .filter((c) => c.userId === userId)
    .filter((c) => !query || c.title.toLowerCase().includes(query))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .map((c) => {
      const msgs = store.messages[c.id] || [];
      const lastMsg = msgs[msgs.length - 1];
      return {
        ...c,
        messageCount: msgs.length,
        lastMessagePreview: lastMsg ? lastMsg.content.slice(0, 80) : ""
      };
    });

  res.json(userConversations);
});

app.post("/api/conversations", (req, res) => {
  const userId = getUserIdFromReq(req);
  const { title } = req.body;
  const convId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newConv: Conversation = {
    id: convId,
    userId,
    title: (title && String(title).trim().slice(0, 100)) || "New Exploration",
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.conversations[convId] = newConv;
  store.messages[convId] = [];

  // Update daily analytics
  recordAnalyticsEvent(userId, 1, 0, 0, "gemini");

  saveStore();
  res.json(newConv);
});

app.get("/api/conversations/:id", (req, res) => {
  const userId = getUserIdFromReq(req);
  const convId = req.params.id;
  const conv = store.conversations[convId];
  if (!conv || conv.userId !== userId) {
    return res.status(404).json({ error: "Conversation not found", code: "NOT_FOUND" });
  }
  const messages = store.messages[convId] || [];
  res.json({ conversation: conv, messages });
});

app.patch("/api/conversations/:id", (req, res) => {
  const userId = getUserIdFromReq(req);
  const convId = req.params.id;
  const conv = store.conversations[convId];
  if (!conv || conv.userId !== userId) {
    return res.status(404).json({ error: "Conversation not found", code: "NOT_FOUND" });
  }
  const { title, pinned } = req.body;
  if (title !== undefined) conv.title = String(title).trim().slice(0, 100);
  if (pinned !== undefined) conv.pinned = Boolean(pinned);
  conv.updatedAt = new Date().toISOString();

  saveStore();
  res.json(conv);
});

app.delete("/api/conversations/:id", (req, res) => {
  const userId = getUserIdFromReq(req);
  const convId = req.params.id;
  const conv = store.conversations[convId];
  if (!conv || conv.userId !== userId) {
    return res.status(404).json({ error: "Conversation not found", code: "NOT_FOUND" });
  }
  delete store.conversations[convId];
  delete store.messages[convId];
  saveStore();
  res.json({ success: true, id: convId });
});

// 5. Explicit Saved Memory
app.get("/api/memories", (req, res) => {
  const userId = getUserIdFromReq(req);
  const memories = store.memories[userId] || [];
  res.json(memories);
});

app.post("/api/memories", (req, res) => {
  const userId = getUserIdFromReq(req);
  const { content, category } = req.body;
  if (!content || !String(content).trim()) {
    return res.status(400).json({ error: "Memory content cannot be empty", code: "VALIDATION_ERROR" });
  }
  const newMemory: SavedMemory = {
    id: `mem_${Date.now()}`,
    userId,
    content: String(content).trim().slice(0, 300),
    category: category || "preference",
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!store.memories[userId]) store.memories[userId] = [];
  store.memories[userId].unshift(newMemory);

  // Award XP and unlock achievement
  awardOceanXp(userId, 25, "memory_keeper");

  saveStore();
  res.json(newMemory);
});

app.put("/api/memories/:id", (req, res) => {
  const userId = getUserIdFromReq(req);
  const memId = req.params.id;
  const list = store.memories[userId] || [];
  const memory = list.find((m) => m.id === memId);
  if (!memory) {
    return res.status(404).json({ error: "Memory not found", code: "NOT_FOUND" });
  }
  const { content, category, enabled } = req.body;
  if (content !== undefined) memory.content = String(content).trim().slice(0, 300);
  if (category !== undefined) memory.category = category;
  if (enabled !== undefined) memory.enabled = Boolean(enabled);
  memory.updatedAt = new Date().toISOString();

  saveStore();
  res.json(memory);
});

app.delete("/api/memories/:id", (req, res) => {
  const userId = getUserIdFromReq(req);
  const memId = req.params.id;
  if (store.memories[userId]) {
    store.memories[userId] = store.memories[userId].filter((m) => m.id !== memId);
    saveStore();
  }
  res.json({ success: true, id: memId });
});

// 6. Ocean Progression
app.get("/api/ocean/progress", (req, res) => {
  const userId = getUserIdFromReq(req);
  let progress = store.oceanProgress[userId];
  if (!progress) {
    const { level, currentStage, nextStage, xpToNext, unlockedStages } = calculateStageAndLevel(50);
    progress = {
      userId,
      level,
      xp: 50,
      currentStage,
      nextStage,
      xpToNextLevel: xpToNext,
      unlockedStages,
      achievements: defaultAchievements,
      updatedAt: new Date().toISOString()
    };
    store.oceanProgress[userId] = progress;
    saveStore();
  }
  res.json(progress);
});

function awardOceanXp(userId: string, xpAmount: number, achievementIdToUnlock?: string) {
  let progress = store.oceanProgress[userId];
  if (!progress) {
    const { level, currentStage, nextStage, xpToNext, unlockedStages } = calculateStageAndLevel(xpAmount);
    progress = {
      userId,
      level,
      xp: xpAmount,
      currentStage,
      nextStage,
      xpToNextLevel: xpToNext,
      unlockedStages,
      achievements: defaultAchievements,
      updatedAt: new Date().toISOString()
    };
    store.oceanProgress[userId] = progress;
  } else {
    progress.xp += xpAmount;
    const calc = calculateStageAndLevel(progress.xp);
    progress.level = calc.level;
    progress.currentStage = calc.currentStage;
    progress.nextStage = calc.nextStage;
    progress.xpToNextLevel = calc.xpToNext;
    progress.unlockedStages = calc.unlockedStages;
    progress.updatedAt = new Date().toISOString();

    if (calc.level >= 2) {
      const coralAch = progress.achievements.find((a) => a.id === "coral_architect");
      if (coralAch && !coralAch.unlocked) {
        coralAch.unlocked = true;
        coralAch.unlockedAt = new Date().toISOString();
      }
    }
    if (progress.xp >= 500) {
      const bioAch = progress.achievements.find((a) => a.id === "bioluminescent");
      if (bioAch && !bioAch.unlocked) {
        bioAch.unlocked = true;
        bioAch.unlockedAt = new Date().toISOString();
      }
    }
  }

  if (achievementIdToUnlock) {
    const target = progress.achievements.find((a) => a.id === achievementIdToUnlock);
    if (target && !target.unlocked) {
      target.unlocked = true;
      target.unlockedAt = new Date().toISOString();
    }
  }
}

// 7. Analytics
function recordAnalyticsEvent(userId: string, newConvs = 0, newMsgs = 0, latencyMs = 0, provider = "gemini") {
  if (!store.analytics[userId]) {
    store.analytics[userId] = [];
  }
  const today = new Date().toISOString().split("T")[0];
  let todayEntry = store.analytics[userId].find((e) => e.day === today);

  if (!todayEntry) {
    todayEntry = {
      day: today,
      conversationCount: newConvs,
      messageCount: newMsgs,
      activeMinutes: 5,
      providerMix: { [provider]: newMsgs > 0 ? 1 : 0 },
      avgLatencyMs: latencyMs || 600
    };
    store.analytics[userId].push(todayEntry);
  } else {
    todayEntry.conversationCount += newConvs;
    todayEntry.messageCount += newMsgs;
    todayEntry.activeMinutes += 2;
    todayEntry.providerMix[provider] = (todayEntry.providerMix[provider] || 0) + (newMsgs > 0 ? 1 : 0);
    if (latencyMs > 0) {
      todayEntry.avgLatencyMs = Math.round((todayEntry.avgLatencyMs + latencyMs) / 2);
    }
  }
}

app.get("/api/analytics/summary", (req, res) => {
  const userId = getUserIdFromReq(req);
  const userConvs = Object.values(store.conversations).filter((c) => c.userId === userId);
  let totalMessages = 0;
  let totalLatency = 0;
  let latencyCount = 0;
  const providerCounts: Record<string, number> = { gemini: 0, openai: 0 };

  userConvs.forEach((c) => {
    const msgs = store.messages[c.id] || [];
    totalMessages += msgs.length;
    msgs.forEach((m) => {
      if (m.provider) {
        providerCounts[m.provider] = (providerCounts[m.provider] || 0) + 1;
      }
      if (m.latencyMs) {
        totalLatency += m.latencyMs;
        latencyCount++;
      }
    });
  });

  const dailyList = store.analytics[userId] || [];
  const uniqueDays = new Set(dailyList.map((d) => d.day)).size;

  const totalProviderUses = Object.values(providerCounts).reduce((a, b) => a + b, 0) || 1;
  const providerDistribution = Object.entries(providerCounts).map(([name, count]) => ({
    name: name === "gemini" ? "Google Gemini" : "OpenAI",
    count,
    percentage: Math.round((count / totalProviderUses) * 100)
  }));

  const avgLatencyMs = latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 580;

  res.json({
    totalConversations: userConvs.length,
    totalMessages,
    activeChatDays: Math.max(uniqueDays, 1),
    avgLatencyMs,
    providerDistribution,
    timeseries: dailyList.slice(-14),
    recentActivity: dailyList.slice(-7).map((d) => ({ day: d.day, messages: d.messageCount }))
  });
});

// 8. Data Reset / Privacy Controls
app.post("/api/data/reset", (req, res) => {
  const userId = getUserIdFromReq(req);
  const userConvs = Object.values(store.conversations).filter((c) => c.userId === userId);
  userConvs.forEach((c) => {
    delete store.conversations[c.id];
    delete store.messages[c.id];
  });
  store.memories[userId] = [];
  store.analytics[userId] = [];
  const { level, currentStage, nextStage, xpToNext, unlockedStages } = calculateStageAndLevel(0);
  store.oceanProgress[userId] = {
    userId,
    level,
    xp: 0,
    currentStage,
    nextStage,
    xpToNextLevel: xpToNext,
    unlockedStages,
    achievements: defaultAchievements.map((a) => ({ ...a, unlocked: a.id === "first_dive" })),
    updatedAt: new Date().toISOString()
  };

  saveStore();
  res.json({ success: true, message: "User data safely reset" });
});

// ---------------------------------------------------------------------------
// 9. AI Chat & SSE Streaming Implementation
// ---------------------------------------------------------------------------
function buildSystemPrompt(user: UserProfile, memories: SavedMemory[]): string {
  const toneMap: Record<string, string> = {
    balanced: "Maintain a calm, warm, articulate, and intelligent balance of helpful explanation and friendly companionship.",
    concise: "Keep responses crisp, high-signal, direct, and concise without filler.",
    detailed: "Provide comprehensive, deeply structured explanations with clear headings, nuanced analysis, and examples.",
    playful: "Be delightfully friendly, witty, engaging, with gentle ocean metaphors when natural.",
    deep_thinking: "Engage in rigorous multi-perspective critical thinking, exploring depths and counter-arguments."
  };

  const selectedTone = toneMap[user.aiPreference] || toneMap.balanced;
  const memoryBlock = user.memoriesEnabled && memories.length > 0
    ? `\n\nUSER'S SAVED MEMORIES (Incorporate gracefully where relevant):\n` +
      memories.filter((m) => m.enabled).map((m) => `- [${m.category.toUpperCase()}]: ${m.content}`).join("\n")
    : "";

  return `You are Buddy, a friendly, calm, deeply intelligent AI companion wrapped in the serene, luminous wonder of the ocean depths.
Your core traits:
1. Companion First: Warm, attentive, authentic, and empathetic, while maintaining professional accuracy and intellectual depth.
2. Tone & Style: ${selectedTone}
3. Formatting: Use elegant markdown, clean bullet points, code blocks with syntax tags, and structured formatting for complex concepts.
4. Transparency: If you do not know something, be honest. Do not claim physical embodiment or consciousness.
5. User Profile Context:
   - User Name: ${user.displayName}
   - Favorite Topics: ${user.favoriteTopics.join(", ")}
   - Preferred Language: ${user.language}${memoryBlock}

Provide thoughtful, articulate, high-craft assistance on any subject the user brings.`;
}

app.post("/api/chat/stream", async (req, res) => {
  const userId = getUserIdFromReq(req);
  const user = store.users[userId] || {
    id: userId,
    email: "explorer@ocean.ai",
    displayName: "Ocean Explorer",
    favoriteTopics: [],
    aiPreference: "balanced",
    language: "en",
    defaultProvider: "gemini",
    reducedMotion: false,
    memoriesEnabled: true,
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const { conversationId, prompt, provider = user.defaultProvider || "gemini" } = req.body;

  if (!prompt || !String(prompt).trim()) {
    return res.status(400).json({ error: "Prompt is required", code: "VALIDATION_ERROR" });
  }

  let activeConvId = conversationId;
  if (!activeConvId || !store.conversations[activeConvId]) {
    activeConvId = `conv_${Date.now()}`;
    const generatedTitle = prompt.trim().slice(0, 40) + (prompt.length > 40 ? "..." : "");
    store.conversations[activeConvId] = {
      id: activeConvId,
      userId,
      title: generatedTitle,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.messages[activeConvId] = [];
    recordAnalyticsEvent(userId, 1, 0, 0, provider);
  }

  // Persist User Message
  const userMsgId = `msg_${Date.now()}_u`;
  const userMsg: ChatMessage = {
    id: userMsgId,
    conversationId: activeConvId,
    userId,
    role: "user",
    content: String(prompt).trim(),
    createdAt: new Date().toISOString()
  };

  if (!store.messages[activeConvId]) store.messages[activeConvId] = [];
  store.messages[activeConvId].push(userMsg);
  store.conversations[activeConvId].updatedAt = new Date().toISOString();

  // Setup SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no"
  });

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent("message_start", {
    conversationId: activeConvId,
    userMessageId: userMsgId,
    provider
  });

  const startTime = Date.now();
  let fullAssistantText = "";
  let modelUsed = "gemini-3.7-flash";

  try {
    const userMemories = store.memories[userId] || [];
    const systemPrompt = buildSystemPrompt(user, userMemories);
    const gemini = getGeminiClient();

    if (provider === "gemini" && gemini) {
      const requestedModel = normalizeGeminiModel(process.env.GEMINI_MODEL);
      const recentHistory = (store.messages[activeConvId] || []).slice(-10);

      // Convert history for Gemini
      const contentsPayload = recentHistory
        .filter((m) => m.content && m.content.trim())
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content.trim() }]
        }));

      if (contentsPayload.length === 0) {
        contentsPayload.push({
          role: "user",
          parts: [{ text: String(prompt).trim() }]
        });
      }

      const streamResult = await streamGeminiWithFallback(
        gemini,
        requestedModel,
        contentsPayload,
        systemPrompt,
        user.aiPreference === "playful" ? 0.9 : 0.7,
        user,
        prompt,
        (tokenText) => {
          fullAssistantText += tokenText;
          sendEvent("token", { text: tokenText });
        }
      );

      modelUsed = streamResult.modelUsed;
      fullAssistantText = streamResult.fullText;
    } else if (provider === "openai" && process.env.OPENAI_API_KEY) {
      modelUsed = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: modelUsed,
          messages: [
            { role: "system", content: systemPrompt },
            ...(store.messages[activeConvId] || []).slice(-8).map((m) => ({
              role: m.role,
              content: m.content
            }))
          ],
          stream: true
        })
      });

      if (!openAiRes.ok || !openAiRes.body) {
        throw new Error(`OpenAI API returned status ${openAiRes.status}`);
      }

      const reader = openAiRes.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunkStr = decoder.decode(value);
          const lines = chunkStr.split("\n").filter((l) => l.trim().startsWith("data: "));
          for (const line of lines) {
            const jsonText = line.replace("data: ", "").trim();
            if (jsonText === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonText);
              const delta = parsed.choices?.[0]?.delta?.content || "";
              if (delta) {
                fullAssistantText += delta;
                sendEvent("token", { text: delta });
              }
            } catch (e) {
              // Ignore line parse error
            }
          }
        }
      }
    } else {
      // Fallback graceful ocean companion response when keys are waiting or offline
      modelUsed = "ocean-companion-local";
      const fallbackResponse = `Thank you for reaching out with: "${prompt}".\n\nI am operating in calm companion mode. We can explore any inquiry, discuss thoughts, or configure your Gemini API key in Settings to unlock deep multi-modal intelligence!\n\nWhat topic should we explore next?`;
      
      for (const word of fallbackResponse.split(" ")) {
        await new Promise((r) => setTimeout(r, 35));
        fullAssistantText += word + " ";
        sendEvent("token", { text: word + " " });
      }
    }

    const latencyMs = Date.now() - startTime;
    const assistantMsgId = `msg_${Date.now()}_a`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      conversationId: activeConvId,
      userId,
      role: "assistant",
      content: fullAssistantText.trim(),
      provider,
      model: modelUsed,
      latencyMs,
      createdAt: new Date().toISOString()
    };

    store.messages[activeConvId].push(assistantMsg);
    store.conversations[activeConvId].updatedAt = new Date().toISOString();

    // Award ocean progression XP & record analytics
    awardOceanXp(userId, 15, "ocean_curious");
    recordAnalyticsEvent(userId, 0, 2, latencyMs, provider);
    saveStore();

    sendEvent("message_end", {
      messageId: assistantMsgId,
      latencyMs,
      provider,
      model: modelUsed
    });
    sendEvent("done", {});
  } catch (err: any) {
    console.error("Chat generation error:", err);
    let userFriendlyMessage = "An error occurred during response generation. Please retry.";
    const rawMsg = String(err?.message || "");

    if (rawMsg.includes("503") || rawMsg.includes("high demand") || rawMsg.includes("UNAVAILABLE")) {
      userFriendlyMessage = "The AI service is currently experiencing high demand. Please try again in a few moments.";
    } else if (rawMsg.includes("429") || rawMsg.includes("quota") || rawMsg.includes("ResourceExhausted")) {
      userFriendlyMessage = "Rate limit reached. Please wait a moment before sending another message.";
    } else if (rawMsg.length > 0 && !rawMsg.startsWith("{") && !rawMsg.includes("ApiError:")) {
      userFriendlyMessage = rawMsg;
    }

    sendEvent("error", {
      message: userFriendlyMessage,
      code: "PROVIDER_ERROR"
    });
  } finally {
    res.end();
  }
});

// ---------------------------------------------------------------------------
// 10. Vite Middleware & Production Serving
// ---------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Buddy Ocean AI Companion running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
