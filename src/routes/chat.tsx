import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, RefreshCw, Send, Trash2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/markdown";
import { ResponsibleAiNotice } from "@/components/responsible-ai";
import { store } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — AI Workplace Mate" },
      { name: "description", content: "Chat with your AI workplace assistant." },
    ],
  }),
  component: ChatPage,
});

const suggestions = [
  "Write a professional email declining a meeting",
  "Summarize this document: [paste your text]",
  "Brainstorm 5 project ideas for a customer onboarding revamp",
  "Improve this report intro: [paste]",
  "Create a 45-minute meeting agenda for a Q3 planning kickoff",
];

const STORAGE_KEY = "awm.chat.messages";

function ChatPage() {
  const [input, setInput] = useState("");
  const [initialMessages] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v ? JSON.parse(v) : [];
    } catch {
      return [];
    }
  });

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, setMessages, regenerate, error } = useChat({
    id: "workplace-mate",
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message || "Something went wrong"),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const busy = status === "submitted" || status === "streaming";

  const submit = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || busy) return;
    setInput("");
    await sendMessage({ text: value });
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const clear = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Chat cleared");
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-4xl flex-col gap-3">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight">AI Chatbot</h1>
        <span className="ml-auto text-xs text-muted-foreground">
          {messages.length} message{messages.length === 1 ? "" : "s"}
        </span>
        <Button size="sm" variant="ghost" onClick={clear} disabled={messages.length === 0}>
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-soft"
      >
        {messages.length === 0 ? (
          <div className="grid h-full place-items-center">
            <div className="max-w-md text-center">
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-white shadow-elegant">
                <Sparkles className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-semibold">Ask me anything workplace</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Drafting, summarizing, planning, brainstorming — pick a starter or type below.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground/80 transition hover:border-primary/50 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              const isUser = m.role === "user";
              return (
                <li key={m.id} className={cn("flex gap-3", isUser && "justify-end")}>
                  {!isUser && (
                    <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-brand text-white">
                      <Sparkles className="h-4 w-4" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "group max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background",
                    )}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{text}</p>
                    ) : (
                      <>
                        <Markdown>{text || "…"}</Markdown>
                        <div className="mt-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                          <button
                            onClick={async () => {
                              await navigator.clipboard.writeText(text);
                              toast.success("Copied");
                            }}
                            className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="mr-1 inline h-3 w-3" /> Copy
                          </button>
                          <button
                            onClick={() => regenerate()}
                            disabled={busy}
                            className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            <RefreshCw className="mr-1 inline h-3 w-3" /> Regenerate
                          </button>
                          <button
                            onClick={() => {
                              store.addHistory({
                                id: Math.random().toString(36).slice(2),
                                tool: "chat",
                                title: "Chat response",
                                prompt: messages.find((x) => x.id !== m.id)?.parts.map((p) => (p.type === "text" ? p.text : "")).join("") ?? "",
                                output: text,
                                createdAt: Date.now(),
                              });
                              toast.success("Saved to history");
                            }}
                            className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            Save
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
            {busy && (
              <li className="flex gap-3">
                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-brand text-white">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="flex items-center gap-1 rounded-2xl border border-border bg-background px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </li>
            )}
            {error && (
              <li className="text-xs text-destructive">Error: {error.message}</li>
            )}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-2 shadow-soft">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={2}
            placeholder="Ask AI Workplace Mate anything…"
            className="min-h-[52px] resize-none border-0 bg-transparent focus-visible:ring-0"
          />
          <Button
            onClick={() => submit()}
            disabled={busy || !input.trim()}
            className="h-10 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ResponsibleAiNotice compact />
    </div>
  );
}
