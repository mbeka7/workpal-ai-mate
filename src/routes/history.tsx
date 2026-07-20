import { createFileRoute } from "@tanstack/react-router";
import { Copy, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/markdown";
import { store, type HistoryItem } from "@/lib/storage";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — AI Workplace Mate" },
      { name: "description", content: "Your saved AI outputs." },
    ],
  }),
  component: HistoryPage,
});

const toolLabels: Record<string, string> = {
  chat: "Chatbot",
  research: "Research",
  summarizer: "Summarizer",
  email: "Email",
  planner: "Planner",
};

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [open, setOpen] = useState<HistoryItem | null>(null);

  const reload = () => setItems(store.getHistory());
  useEffect(reload, []);

  const del = (id: string) => {
    store.deleteHistory(id);
    reload();
    toast.success("Deleted");
  };
  const clear = () => {
    store.clearHistory();
    reload();
    toast.success("History cleared");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="flex items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">History</h1>
          <p className="mt-1 text-sm text-muted-foreground">Everything you've saved from AI tools.</p>
        </div>
        <Button variant="ghost" className="ml-auto text-destructive hover:text-destructive" onClick={clear} disabled={!items.length}>
          <Trash2 className="mr-1 h-4 w-4" /> Clear all
        </Button>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No saved items yet. Use the Save button on any AI output to add it here.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((h) => (
            <li key={h.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-foreground">
                  {toolLabels[h.tool] ?? h.tool}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(h.createdAt).toLocaleString()}
                </span>
                <div className="ml-auto flex gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => setOpen(h)}>Open</Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(h.output);
                      toast.success("Copied");
                    }}
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => del(h.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 truncate font-medium">{h.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{h.output}</p>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-elegant"
          >
            <div className="mb-3 flex items-center">
              <h3 className="font-semibold">{open.title}</h3>
              <button className="ml-auto text-muted-foreground" onClick={() => setOpen(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              {toolLabels[open.tool] ?? open.tool} · {new Date(open.createdAt).toLocaleString()}
            </p>
            {open.prompt && (
              <details className="mb-3 rounded-lg border border-border bg-background/40 p-3 text-xs">
                <summary className="cursor-pointer font-medium">Original prompt</summary>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] text-muted-foreground">{open.prompt}</pre>
              </details>
            )}
            <div className="rounded-lg bg-background/40 p-3">
              <Markdown>{open.output}</Markdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
