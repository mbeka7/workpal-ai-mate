import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AiOutputCard } from "@/components/ai-output-card";
import { ResponsibleAiNotice } from "@/components/responsible-ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateAiText } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI Workplace Mate" },
      { name: "description", content: "Generate structured research briefs with AI." },
    ],
  }),
  component: ResearchPage,
});

const depths = ["Basic", "Standard", "Advanced"] as const;
const formats = ["Summary", "Bullet points", "Report", "Comparison"] as const;

function buildPrompt(topic: string, depth: string, format: string) {
  return `Role: Professional Research Assistant

Task: Research the following topic thoroughly and return a well-structured brief.

Topic: ${topic}
Depth: ${depth}
Output format: ${format}

Output Requirements (use markdown headings):
1. Executive Summary (3–5 sentences)
2. Key Findings (bullet list, evidence-oriented)
3. Important Statistics (only include if you are confident; otherwise say "no reliable statistic available")
4. Opportunities
5. Risks / Limitations
6. References (list source types e.g. "industry report", "academic paper"; do not fabricate URLs)

Rules:
- If information is uncertain or you are not sure, say so explicitly.
- Never fabricate names, quotes, statistics, URLs, or citations.
- Keep language professional and neutral.
- Adjust depth: Basic = high-level overview; Standard = balanced detail; Advanced = deeper analysis with nuances.
- For "Comparison" format, structure as a comparison table when applicable.`;
}

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<(typeof depths)[number]>("Standard");
  const [format, setFormat] = useState<(typeof formats)[number]>("Report");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateAiText);

  const run = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic first");
      return;
    }
    setLoading(true);
    try {
      const res = await generate({
        data: { prompt: buildPrompt(topic, depth, format) },
      });
      setOutput(res.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">AI Research Assistant</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter a topic and get a structured, editable research brief.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="space-y-4">
          <div>
            <Label htmlFor="topic">Research topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. impact of AI copilots on knowledge-worker productivity"
              className="mt-1.5"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Depth</Label>
              <div className="mt-1.5 flex gap-2">
                {depths.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDepth(d)}
                    className={
                      "rounded-full border px-3 py-1.5 text-xs transition " +
                      (depth === d
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground/70 hover:text-foreground")
                    }
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Format</Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {formats.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={
                      "rounded-full border px-3 py-1.5 text-xs transition " +
                      (format === f
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground/70 hover:text-foreground")
                    }
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={run} disabled={loading}>
              <Sparkles className="mr-1.5 h-4 w-4" />
              {loading ? "Researching…" : "Generate research"}
            </Button>
          </div>
        </div>
      </section>

      <AiOutputCard
        title={`Research: ${topic || "…"}`}
        tool="research"
        prompt={buildPrompt(topic, depth, format)}
        output={output}
        onChange={setOutput}
        onRegenerate={run}
        loading={loading}
      />

      <ResponsibleAiNotice />
    </div>
  );
}
