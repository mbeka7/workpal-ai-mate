import { Copy, Download, RefreshCw, Save, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "./markdown";
import { store, uid, type ToolId } from "@/lib/storage";

type Props = {
  output: string;
  onChange: (v: string) => void;
  onRegenerate?: () => void;
  loading?: boolean;
  tool: ToolId;
  prompt: string;
  title: string;
};

export function AiOutputCard({ output, onChange, onRegenerate, loading, tool, prompt, title }: Props) {
  const [editing, setEditing] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };
  const download = () => {
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const save = () => {
    store.addHistory({
      id: uid(),
      tool,
      title,
      prompt,
      output,
      createdAt: Date.now(),
    });
    toast.success("Saved to history");
  };
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: output });
      } else {
        await navigator.clipboard.writeText(output);
        toast.success("Copied — paste to share");
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft md:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="ml-auto flex flex-wrap gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setEditing((v) => !v)}>
            {editing ? "Preview" : "Edit"}
          </Button>
          <Button variant="ghost" size="sm" onClick={copy}>
            <Copy className="mr-1 h-3.5 w-3.5" /> Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={download}>
            <Download className="mr-1 h-3.5 w-3.5" /> Download
          </Button>
          <Button variant="ghost" size="sm" onClick={share}>
            <Share2 className="mr-1 h-3.5 w-3.5" /> Share
          </Button>
          <Button variant="ghost" size="sm" onClick={save}>
            <Save className="mr-1 h-3.5 w-3.5" /> Save
          </Button>
          {onRegenerate && (
            <Button variant="ghost" size="sm" onClick={onRegenerate} disabled={loading}>
              <RefreshCw className={"mr-1 h-3.5 w-3.5 " + (loading ? "animate-spin" : "")} />
              Regenerate
            </Button>
          )}
        </div>
      </div>
      {editing ? (
        <Textarea
          value={output}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[280px] font-mono text-sm"
        />
      ) : (
        <div className="min-h-[120px] rounded-lg bg-background/40 p-3">
          {output ? (
            <Markdown>{output}</Markdown>
          ) : (
            <p className="text-sm text-muted-foreground">
              {loading ? "Generating…" : "Your AI output will appear here."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
