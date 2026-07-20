import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookMarked,
  CalendarClock,
  FileText,
  History,
  Mail,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ResponsibleAiNotice } from "@/components/responsible-ai";
import { store, type HistoryItem, type SavedPrompt } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Mate" },
      {
        name: "description",
        content: "Quick access to every AI tool: chat, email, research, summarizer, and planner.",
      },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    to: "/chat",
    icon: MessageSquare,
    title: "AI Chatbot",
    desc: "Your always-on workplace assistant.",
  },
  {
    to: "/research",
    icon: Sparkles,
    title: "Research Assistant",
    desc: "Deep-dive on any topic, structured output.",
  },
  {
    to: "/summarizer",
    icon: FileText,
    title: "Meeting Summarizer",
    desc: "Turn notes into actions, decisions, next steps.",
  },
  {
    to: "/email",
    icon: Mail,
    title: "Email Generator",
    desc: "Draft polished emails in any tone.",
  },
  {
    to: "/planner",
    icon: CalendarClock,
    title: "Task Planner",
    desc: "Prioritize a day or week that actually fits.",
  },
  {
    to: "/prompts",
    icon: BookMarked,
    title: "Prompt Library",
    desc: "Reusable prompts for common workflows.",
  },
] as const;

function Dashboard() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  useEffect(() => {
    setHistory(store.getHistory().slice(0, 5));
    setPrompts(store.getPrompts().filter((p) => p.favorite).slice(0, 4));
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">Welcome back</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              What can we get done today?
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              AI Workplace Mate brings together the tools professionals reach for every day —
              writing, research, meeting notes, and planning — into one calm workspace.
            </p>
          </div>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-medium text-white shadow-elegant transition hover:opacity-95"
          >
            Start chatting <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">AI Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{t.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Recent activity</h2>
            <Link to="/history" className="ml-auto text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing yet — your saved AI outputs will show up here.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {history.map((h) => (
                <li key={h.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{h.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {new Date(h.createdAt).toLocaleString()} · {h.tool}
                    </p>
                  </div>
                  <Link to="/history" className="text-xs text-primary hover:underline">
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <BookMarked className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Saved prompts</h2>
            <Link to="/prompts" className="ml-auto text-xs text-primary hover:underline">
              Browse library
            </Link>
          </div>
          {prompts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Favorite prompts in the library to pin them here.
            </p>
          ) : (
            <ul className="space-y-2">
              {prompts.map((p) => (
                <li
                  key={p.id}
                  className="rounded-lg border border-border/70 bg-background/40 p-3 text-sm"
                >
                  <p className="font-medium">{p.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ResponsibleAiNotice />
    </div>
  );
}
