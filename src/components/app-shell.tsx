import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
  MessageSquare,
  FileText,
  Mail,
  CalendarClock,
  BookMarked,
  History,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "AI Chatbot", icon: MessageSquare },
  { to: "/research", label: "Research Assistant", icon: Sparkles },
  { to: "/summarizer", label: "Meeting Summarizer", icon: FileText },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/planner", label: "Task Planner", icon: CalendarClock },
  { to: "/prompts", label: "Prompt Library", icon: BookMarked },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="flex h-14 items-center gap-3 px-4 md:px-6">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-md border border-border/70 text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-white shadow-elegant">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">AI Workplace Mate</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Responsible AI — verify outputs
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground text-sm font-semibold">
              U
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-14 left-0 z-30 w-64 shrink-0 border-r border-sidebar-border bg-sidebar transition-transform md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <nav className="flex h-full flex-col gap-1 overflow-y-auto p-3">
            {nav.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
            <div className="mt-auto rounded-xl border border-sidebar-border bg-background/40 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Responsible AI</p>
              <p className="mt-1 leading-relaxed">
                Outputs may contain errors. Always review before using for business decisions.
              </p>
            </div>
          </nav>
        </aside>

        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 top-14 z-20 bg-black/30 md:hidden"
          />
        )}

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
