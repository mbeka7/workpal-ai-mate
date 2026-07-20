import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AiOutputCard } from "@/components/ai-output-card";
import { ResponsibleAiNotice } from "@/components/responsible-ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateAiText } from "@/lib/ai.functions";

export const Route = createFileRoute("/summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Workplace Mate" },
      { name: "description", content: "Turn messy meeting notes into clean summaries and action items." },
    ],
  }),
  component: SummarizerPage,
});

function buildPrompt(notes: string) {
  return `Role: Executive assistant summarizing meeting notes.

Meeting notes:
"""${notes}"""

Produce a professional summary with these markdown sections:
## Executive Summary
2–4 sentences.
## Action Items
- Bullet list. Format: **Owner** — action — *due date if mentioned*.
## Decisions Made
## Risks / Open Questions
## Next Steps
## Assigned Responsibilities
Bullet list of who owns what going forward.

Rules:
- Only include information present in the notes; do not invent owners, dates, or decisions.
- If a section has no relevant content, write "None mentioned".`;
}

function SummarizerPage() {
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateAiText);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    const text = await file.text();
    setNotes(text);
    toast.success(`Loaded ${file.name}`);
  };

  const run = async () => {
    if (!notes.trim()) {
      toast.error("Paste some meeting notes first");
      return;
    }
    setLoading(true);
    try {
      const res = await generate({ data: { prompt: buildPrompt(notes) } });
      setOutput(res.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to summarize");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Meeting Notes Summarizer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste your notes or upload a .txt / .md file. Get action items, decisions, and next steps.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Meeting notes</span>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.markdown,text/plain"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-1 h-3.5 w-3.5" /> Upload .txt / .md
          </Button>
        </div>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your raw meeting notes here…"
          className="min-h-[220px] font-mono text-sm"
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={run} disabled={loading}>
            {loading ? "Summarizing…" : "Summarize"}
          </Button>
        </div>
      </section>

      <AiOutputCard
        title="Meeting Summary"
        tool="summarizer"
        prompt={buildPrompt(notes)}
        output={output}
        onChange={setOutput}
        onRegenerate={run}
        loading={loading}
      />

      <ResponsibleAiNotice />
    </div>
  );
}
