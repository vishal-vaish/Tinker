"use client";

import { useState } from "react";
import { Terminal, ShieldCheck, Activity, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WorkspaceFooterBar() {
  const [terminalOpen, setTerminalOpen] = useState(false);

  return (
    <footer className="h-9 border-t border-border bg-card/60 backdrop-blur-md px-4 flex items-center justify-between text-[11px] text-muted-foreground select-none shrink-0">
      {/* Left: Terminal drawer trigger */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setTerminalOpen(!terminalOpen)}
          className="gap-1.5 font-mono text-[11px] hover:text-foreground cursor-pointer"
        >
          <Terminal className="size-3 text-primary" />
          <span>WebContainer Terminal</span>
        </Button>

        <span className="text-border">|</span>

        <div className="flex items-center gap-1.5 font-mono">
          <ShieldCheck className="size-3 text-emerald-400" />
          <span>PathJail: Locked</span>
        </div>
      </div>

      {/* Right: Telemetry Metrics */}
      <div className="flex items-center gap-4 font-mono text-[11px]">
        <div className="flex items-center gap-1.5">
          <Cpu className="size-3 text-muted-foreground" />
          <span>Memory: 384 MB</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Activity className="size-3 text-emerald-400" />
          <span>Ping: 18ms</span>
        </div>
      </div>
    </footer>
  );
}
