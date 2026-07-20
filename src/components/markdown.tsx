import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose-chat text-sm text-foreground", className)}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
