import { AlertTriangle } from "lucide-react";

export function ResponsibleAiNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-amber-900 dark:text-amber-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <p className={compact ? "leading-snug" : "leading-relaxed"}>
        <span className="font-semibold">Responsible AI Notice:</span> AI-generated content may
        contain inaccuracies or omissions. Always review and verify outputs before using them for
        professional, legal, financial, or business decisions.
      </p>
    </div>
  );
}
