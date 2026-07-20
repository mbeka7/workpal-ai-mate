import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ResponsibleAiNotice } from "@/components/responsible-ai";
import { store, type Settings } from "@/lib/storage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Workplace Mate" },
      { name: "description", content: "Personalize your AI workspace." },
    ],
  }),
  component: SettingsPage,
});

const lengths = ["concise", "standard", "detailed"] as const;
const tones = ["formal", "friendly", "persuasive", "neutral"] as const;
const languages = ["English", "Spanish", "French", "German", "Portuguese", "Arabic", "Hindi", "Chinese"];

function SettingsPage() {
  const [s, setS] = useState<Settings | null>(null);

  useEffect(() => {
    const loaded = store.getSettings();
    setS(loaded);
    document.documentElement.classList.toggle("dark", loaded.theme === "dark");
  }, []);

  if (!s) return null;

  const update = (next: Settings) => {
    setS(next);
    store.saveSettings(next);
    document.documentElement.classList.toggle("dark", next.theme === "dark");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Personalize AI behavior and appearance.</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-3 text-sm font-semibold">Appearance</h2>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">Dark mode</p>
            <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
          </div>
          <Switch
            checked={s.theme === "dark"}
            onCheckedChange={(v) => update({ ...s, theme: v ? "dark" : "light" })}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-3 text-sm font-semibold">AI defaults</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Response length</Label>
            <div className="mt-1.5 flex gap-2">
              {lengths.map((l) => (
                <button
                  key={l}
                  onClick={() => update({ ...s, length: l })}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs capitalize transition " +
                    (s.length === l
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground/70 hover:text-foreground")
                  }
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Default tone</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {tones.map((t) => (
                <button
                  key={t}
                  onClick={() => update({ ...s, tone: t })}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs capitalize transition " +
                    (s.tone === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground/70 hover:text-foreground")
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label>Language</Label>
            <select
              value={s.language}
              onChange={(e) => update({ ...s, language: e.target.value })}
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:max-w-xs"
            >
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-3 text-sm font-semibold">Notifications</h2>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">In-app notifications</p>
            <p className="text-xs text-muted-foreground">Show toasts for saves, copies, and errors</p>
          </div>
          <Switch
            checked={s.notifications}
            onCheckedChange={(v) => update({ ...s, notifications: v })}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-2 text-sm font-semibold">Data</h2>
        <p className="text-xs text-muted-foreground">
          All history, saved prompts, and preferences are stored locally in this browser.
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              store.clearHistory();
              toast.success("History cleared");
            }}
          >
            Clear history
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("awm.prompts");
              toast.success("Prompt library reset");
            }}
          >
            Reset prompt library
          </Button>
        </div>
      </section>

      <ResponsibleAiNotice />
    </div>
  );
}
