"use client";

import { useWorkspace } from "@/providers/WorkspaceProvider";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft, Share2, Download, Terminal, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function WorkspaceDraftHeader() {
  const { activeWorkspace, activeDraft, selectDraft, role } = useWorkspace();
  const { open } = useSidebar();

  if (!activeDraft) return null;

  return (
    <header className="h-14 border-b border-border bg-card/60 backdrop-blur-md px-4 flex items-center justify-between shrink-0 select-none">
      {/* Left: Return trigger & Breadcrumbs */}
      <div className="flex items-center gap-2.5 min-w-0">
        {!open && (
          <SidebarTrigger className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0" />
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => selectDraft(null)}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
          title="Back to Prompt Studio"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="flex items-center gap-2 text-xs truncate">
          <span className="text-muted-foreground font-medium">
            {activeWorkspace?.name || "Workspace"}
          </span>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-foreground truncate">
            {activeDraft.title}
          </span>
          <Badge variant="secondary" className="text-[10px] font-mono uppercase px-1.5 py-0 h-4">
            {activeDraft.framework}
          </Badge>
        </div>
      </div>

      {/* Right: Runtime Status, Role Badge, and Actions */}
      <div className="flex items-center gap-3">
        {/* Sandbox Runtime Pulse */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full border border-border">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>WebContainer: Ready</span>
        </div>

        {/* Role Indicator */}
        <Badge
          variant="outline"
          className={`text-[10px] font-mono uppercase px-2 py-0.5 ${
            role === "admin"
              ? "border-violet-500/40 text-violet-400 bg-violet-500/10"
              : "border-cyan-500/40 text-cyan-400 bg-cyan-500/10"
          }`}
        >
          {role} mode
        </Badge>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="default" className="gap-2 cursor-pointer font-medium">
            <Share2 className="size-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button size="default" className="gap-2 cursor-pointer font-semibold shadow-xs">
            <Download className="size-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
