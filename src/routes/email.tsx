import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AiOutputCard } from "@/components/ai-output-card";
import { ResponsibleAiNotice } from "@/components/responsible-ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateAiText } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace Mate" },
      { name: "description", content: "Draft professional emails in any tone." },
    ],
  }),
  component: EmailPage,
});

const tones = ["Formal", "Friendly", "Persuasive", "Concise", "Apologetic"] as const;
const lengths = ["Short", "Medium", "Long"] as const;

function buildPrompt(opts: {
  recipient: string;
  subject: string;
  goal: string;
  points: string;
  tone: string;
  length: string;
  sender: string;
}) {
  return `Role: Professional communications assistant.

Draft an email with the following parameters:
- Recipient: ${opts.recipient || "(unspecified)"}
- Subject line: ${opts.subject || "(you decide, propose one)"}
- Sender: ${opts.sender || "(unspecified)"}
- Tone: ${opts.tone}
- Length: ${opts.length}

Goal of the email:
${opts.goal}

Key points to include:
${opts.points || "(use best judgment)"}

Output:
- Suggested subject line
- Full email body (greeting, paragraphs, sign-off)
- Do not include private information you don't have; use bracketed placeholders like [your name] if truly unknown.
- Match the requested tone precisely.
- End with a clear call to action if appropriate.`;
}

function EmailPage() {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [goal, setGoal] = useState("");
  const [points, setPoints] = useState("");
  const [sender, setSender] = useState("");
  const [tone, setTone] = useState<(typeof tones)[number]>("Formal");
  const [length, setLength] = useState<(typeof lengths)[number]>("Medium");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateAiText);

  const run = async () => {
    if (!goal.trim()) {
      toast.error("Describe the goal of the email");
      return;
    }
    setLoading(true);
    try {
      const res = await generate({
        data: { prompt: buildPrompt({ recipient, subject, goal, points, tone, length, sender }) },
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
        <h1 className="text-2xl font-semibold tracking-tight">Smart Email Generator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe your goal and get a polished draft in any tone.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Recipient</Label>
            <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Head of Sales" className="mt-1.5" />
          </div>
          <div>
            <Label>Your name / role</Label>
            <Input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="e.g. Sam, Product Manager" className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label>Subject (optional)</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Leave blank to let AI propose one" className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label>Goal of the email *</Label>
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Ask for a 20-minute call to align on Q3 launch timeline"
              className="mt-1.5 min-h-[80px]"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Key points to include (optional)</Label>
            <Textarea
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="- deadline shifted to Aug 15\n- need marketing sign-off\n- happy to send draft"
              className="mt-1.5 min-h-[80px] font-mono text-sm"
            />
          </div>
          <div>
            <Label>Tone</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {tones.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs transition " +
                    (tone === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground/70 hover:text-foreground")
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Length</Label>
            <div className="mt-1.5 flex gap-2">
              {lengths.map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs transition " +
                    (length === l
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground/70 hover:text-foreground")
                  }
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={run} disabled={loading}>
            {loading ? "Drafting…" : "Draft email"}
          </Button>
        </div>
      </section>

      <AiOutputCard
        title="Email draft"
        tool="email"
        prompt={buildPrompt({ recipient, subject, goal, points, tone, length, sender })}
        output={output}
        onChange={setOutput}
        onRegenerate={run}
        loading={loading}
      />

      <ResponsibleAiNotice />
    </div>
  );
}
