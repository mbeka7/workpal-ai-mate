export type ToolId = "chat" | "research" | "summarizer" | "email" | "planner";

export type HistoryItem = {
  id: string;
  tool: ToolId;
  title: string;
  prompt: string;
  output: string;
  createdAt: number;
};

export type SavedPrompt = {
  id: string;
  title: string;
  category: string;
  content: string;
  favorite: boolean;
  custom?: boolean;
};

export type Settings = {
  theme: "light" | "dark";
  length: "concise" | "standard" | "detailed";
  tone: "formal" | "friendly" | "persuasive" | "neutral";
  language: string;
  notifications: boolean;
};

const KEYS = {
  history: "awm.history",
  prompts: "awm.prompts",
  settings: "awm.settings",
  chat: "awm.chat",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

export const store = {
  getHistory: () => read<HistoryItem[]>(KEYS.history, []),
  addHistory: (item: HistoryItem) => {
    const items = store.getHistory();
    write(KEYS.history, [item, ...items].slice(0, 200));
  },
  deleteHistory: (id: string) => {
    write(KEYS.history, store.getHistory().filter((h) => h.id !== id));
  },
  clearHistory: () => write(KEYS.history, []),

  getPrompts: (): SavedPrompt[] => {
    const stored = read<SavedPrompt[] | null>(KEYS.prompts, null);
    if (stored) return stored;
    return DEFAULT_PROMPTS;
  },
  savePrompts: (p: SavedPrompt[]) => write(KEYS.prompts, p),

  getSettings: (): Settings =>
    read<Settings>(KEYS.settings, {
      theme: "light",
      length: "standard",
      tone: "neutral",
      language: "English",
      notifications: true,
    }),
  saveSettings: (s: Settings) => write(KEYS.settings, s),

  getChatKey: () => KEYS.chat,
};

export const DEFAULT_PROMPTS: SavedPrompt[] = [
  {
    id: "p1",
    title: "Professional email — request update",
    category: "Emails",
    content:
      "Draft a professional email to [recipient] requesting a status update on [project]. Keep it under 120 words, courteous, and end with a clear ask and deadline.",
    favorite: true,
  },
  {
    id: "p2",
    title: "Decline a meeting politely",
    category: "Emails",
    content:
      "Write a polite email declining a meeting invitation from [name], propose an async alternative, and offer 2 time slots later this week.",
    favorite: false,
  },
  {
    id: "p3",
    title: "Weekly status report",
    category: "Reports",
    content:
      "Turn these notes into a weekly status report with: Highlights, In Progress, Blockers, Next Week, Metrics. Notes: [paste].",
    favorite: false,
  },
  {
    id: "p4",
    title: "Competitive research brief",
    category: "Research",
    content:
      "Research [company/product]. Provide: Overview, Positioning, Key Features, Pricing, Strengths, Weaknesses, Threats to us, Recommendations.",
    favorite: true,
  },
  {
    id: "p5",
    title: "Meeting agenda",
    category: "Meetings",
    content:
      "Create a 45-minute meeting agenda for [topic] with objectives, timed sections, discussion questions, and expected outcomes.",
    favorite: false,
  },
  {
    id: "p6",
    title: "Brainstorm product ideas",
    category: "Brainstorming",
    content:
      "Brainstorm 10 innovative ideas for [problem]. For each: idea, target user, why it's differentiated, and one risk.",
    favorite: false,
  },
  {
    id: "p7",
    title: "Prioritize my day",
    category: "Productivity",
    content:
      "Here is my task list: [paste]. Prioritize using the Eisenhower matrix, propose a 9am–6pm schedule, and flag anything to delegate or drop.",
    favorite: true,
  },
  {
    id: "p8",
    title: "Improve this writing",
    category: "Productivity",
    content:
      "Improve the following text for clarity, concision, and a professional tone. Preserve meaning. Return the revised version, then a short list of what changed.\n\n[paste]",
    favorite: false,
  },
];

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
