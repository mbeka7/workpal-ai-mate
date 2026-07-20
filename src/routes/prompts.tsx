import { createFileRoute } from "@tanstack/react-router";
import { Copy, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { store, uid, type SavedPrompt } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prompts")({
  head: () => ({
    meta: [
      { title: "Prompt Library — AI Workplace Mate" },
      { name: "description", content: "Reusable AI prompts for common workflows." },
    ],
  }),
  component: PromptsPage,
});

const categories = ["All", "Emails", "Reports", "Research", "Meetings", "Brainstorming", "Productivity"];

function PromptsPage() {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [editing, setEditing] = useState<SavedPrompt | null>(null);

  useEffect(() => setPrompts(store.getPrompts()), []);

  const save = (list: SavedPrompt[]) => {
    setPrompts(list);
    store.savePrompts(list);
  };

  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (q.trim() && !`${p.title} ${p.content}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [prompts, q, cat]);

  const toggleFav = (id: string) =>
    save(prompts.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)));

  const del = (id: string) => {
    save(prompts.filter((p) => p.id !== id));
    toast.success("Deleted");
  };

  const copy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied");
  };

  const upsert = (p: SavedPrompt) => {
    const exists = prompts.some((x) => x.id === p.id);
    save(exists ? prompts.map((x) => (x.id === p.id ? p : x)) : [{ ...p, custom: true }, ...prompts]);
    setEditing(null);
    toast.success("Saved");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Prompt Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reusable prompts. Search, favorite, edit, and add your own.
          </p>
        </div>
        <Button
          className="ml-auto"
          onClick={() =>
            setEditing({ id: uid(), title: "", category: "Productivity", content: "", favorite: false, custom: true })
          }
        >
          <Plus className="mr-1 h-4 w-4" /> New prompt
        </Button>
      </header>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search prompts" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition",
                  cat === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground/70 hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {filtered.map((p) => (
          <article key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-foreground">
                  {p.category}
                </span>
                <h3 className="mt-1.5 truncate font-semibold">{p.title}</h3>
              </div>
              <button onClick={() => toggleFav(p.id)} aria-label="Favorite">
                <Star
                  className={cn("h-4 w-4", p.favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground")}
                />
              </button>
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.content}</p>
            <div className="mt-3 flex gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => copy(p.content)}>
                <Copy className="mr-1 h-3.5 w-3.5" /> Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(p)}>
                <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => del(p.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No prompts match your filters.</p>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-elegant"
          >
            <div className="mb-3 flex items-center">
              <h3 className="font-semibold">Edit prompt</h3>
              <button className="ml-auto text-muted-foreground" onClick={() => setEditing(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Category</Label>
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {categories.filter((c) => c !== "All").map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Prompt</Label>
                <Textarea
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  className="mt-1.5 min-h-[160px] font-mono text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={() => upsert(editing)} disabled={!editing.title.trim() || !editing.content.trim()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
