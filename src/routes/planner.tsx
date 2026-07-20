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

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Workplace Mate" },
      { name: "description", content: "Generate a prioritized daily or weekly schedule." },
    ],
  }),
  component: PlannerPage,
});

const ranges = ["Today", "This week"] as const;

function buildPrompt(tasks: string, range: string, hours: string, constraints: string) {
  return `Role: Executive productivity coach.

Create a realistic, prioritized ${range === "Today" ? "daily" : "weekly"} plan.

Available work hours: ${hours || "9am–6pm"}
Constraints / fixed commitments: ${constraints || "(none listed)"}

Tasks (raw list):
${tasks}

Deliver in markdown with these sections:
## Prioritization (Eisenhower)
Categorize each task as Do / Schedule / Delegate / Drop with a one-line reason.
## Schedule
${range === "Today"
      ? "A time-blocked schedule in a table (Time | Task | Focus level). Include short breaks and a buffer block."
      : "A day-by-day plan Mon–Fri. Use a table per day with Time | Task."}
## Focus Tips
3 short tips tailored to this workload.
## Watch-outs
Any overload or unrealistic expectations you noticed. Be honest — if it doesn't fit, say so and suggest what to cut.

Rules:
- Respect the work hours strictly.
- Never invent tasks not in the input.
- Group similar work; protect one deep-work block per day.`;
}

function PlannerPage() {
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState("9am–6pm");
  const [constraints, setConstraints] = useState("");
  const [range, setRange] = useState<(typeof ranges)[number]>("Today");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateAiText);

  const run = async () => {
    if (!tasks.trim()) {
      toast.error("Add at least one task");
      return;
    }
    setLoading(true);
    try {
      const res = await generate({
        data: { prompt: buildPrompt(tasks, range, hours, constraints) },
      });
      setOutput(res.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">AI Task Planner</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Turn a messy task list into a prioritized, time-blocked plan.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Plan range</Label>
            <div className="mt-1.5 flex gap-2">
              {ranges.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs transition " +
                    (range === r
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground/70 hover:text-foreground")
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Work hours</Label>
            <Input value={hours} onChange={(e) => setHours(e.target.value)} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label>Tasks (one per line)</Label>
            <Textarea
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder="- Review Q3 roadmap\n- Interview two candidates\n- Reply to customer escalation\n- Draft launch email"
              className="mt-1.5 min-h-[140px] font-mono text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Fixed commitments (optional)</Label>
            <Textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="- 10am standup (30 min)\n- 3pm 1:1 with manager"
              className="mt-1.5 min-h-[80px] font-mono text-sm"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={run} disabled={loading}>
            {loading ? "Planning…" : "Generate plan"}
          </Button>
        </div>
      </section>

      <AiOutputCard
        title={`${range === "Today" ? "Daily" : "Weekly"} plan`}
        tool="planner"
        prompt={buildPrompt(tasks, range, hours, constraints)}
        output={output}
        onChange={setOutput}
        onRegenerate={run}
        loading={loading}
      />

      <ResponsibleAiNotice />
    </div>
  );
}
