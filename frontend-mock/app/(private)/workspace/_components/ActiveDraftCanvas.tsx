"use client";

import { useState } from "react";
import { Send, Sparkles, Terminal, Code2, Play, RefreshCw, CheckCircle2 } from "lucide-react";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ActiveDraftCanvas() {
  const { activeDraft } = useWorkspace();
  const [followupPrompt, setFollowupPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "console">("preview");

  if (!activeDraft) return null;

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Left Column: Chat Conversation Stream */}
      <div className="w-full md:w-96 border-r border-border flex flex-col h-full bg-card/20">
        <div className="p-3 border-b border-border flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            <span>AI Generation Thread</span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            {activeDraft.modelUsed}
          </Badge>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* User Prompt Message */}
          <div className="bg-muted/60 rounded-xl p-3 space-y-1">
            <div className="font-semibold text-muted-foreground text-[10px] uppercase font-mono">
              User Prompt
            </div>
            <p className="text-foreground leading-relaxed">
              {activeDraft.description || "Initialize architecture with isolated PostgreSQL sandboxes and WebContainer."}
            </p>
          </div>

          {/* AI Response Message */}
          <div className="border border-border/80 bg-card/60 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-primary text-[10px] uppercase font-mono flex items-center gap-1">
                <CheckCircle2 className="size-3 text-emerald-400" /> Tinker Agent
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">140ms</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              I have scaffolded the {activeDraft.framework.toUpperCase()} single-stack repository. All modules are validated against zero-drift rules.
            </p>
            <div className="rounded-lg bg-black/40 p-2 font-mono text-[11px] text-emerald-300 border border-emerald-500/20">
              ✓ WebContainer boot: OK<br />
              ✓ AST validation: 0 errors<br />
              ✓ Live preview: Ready
            </div>
          </div>
        </div>

        {/* Followup Input */}
        <div className="p-3 border-t border-border bg-card/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setFollowupPrompt("");
            }}
            className="relative"
          >
            <input
              type="text"
              value={followupPrompt}
              onChange={(e) => setFollowupPrompt(e.target.value)}
              placeholder="Ask Tinker to modify code, add forms..."
              className="w-full h-9 pl-3 pr-9 rounded-lg bg-muted/60 border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
            />
            <Button
              type="submit"
              size="icon-xs"
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
              disabled={!followupPrompt.trim()}
            >
              <Send className="size-3" />
            </Button>
          </form>
        </div>
      </div>

      {/* Right Column: WebContainer Live Code / Preview Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-black/40">
        {/* Canvas Toolbar */}
        <div className="h-10 border-b border-border bg-card/40 px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === "code" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setActiveTab("console")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === "console" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Console
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-xs" title="Reload WebContainer">
              <RefreshCw className="size-3 text-muted-foreground" />
            </Button>
            <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30">
              Live Sandbox
            </Badge>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="flex-1 p-4 flex items-center justify-center overflow-auto">
          {activeTab === "preview" ? (
            <div className="w-full h-full max-w-4xl bg-card rounded-xl border border-border shadow-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">{activeDraft.title}</h2>
                  <Badge variant="default" className="text-xs uppercase font-mono">
                    {activeDraft.framework}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Interactive preview environment running directly in your browser with zero remote cold starts.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg border border-border bg-muted/30">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Runtime</span>
                    <p className="text-xs font-medium text-foreground mt-0.5">Node.js WebContainer v20</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-muted/30">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Database</span>
                    <p className="text-xs font-medium text-foreground mt-0.5">Isolated PostgreSQL Schema</p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-8 border-t border-border text-[11px] text-muted-foreground font-mono">
                Running at sandbox://localhost:3000 • Hot Module Reload active
              </div>
            </div>
          ) : activeTab === "code" ? (
            <div className="w-full h-full rounded-xl border border-border bg-zinc-950 p-4 font-mono text-xs text-emerald-400 overflow-auto">
              <div className="text-muted-foreground mb-2">// {activeDraft.title} - app/page.tsx</div>
              <pre className="text-zinc-200">
                {`export default function Page() {\n  return (\n    <main className="p-8">\n      <h1 className="text-2xl font-bold">\n        ${activeDraft.title}\n      </h1>\n      <p className="text-muted-foreground">\n        ${activeDraft.description}\n      </p>\n    </main>\n  );\n}`}
              </pre>
            </div>
          ) : (
            <div className="w-full h-full rounded-xl border border-border bg-zinc-950 p-4 font-mono text-xs text-muted-foreground overflow-auto">
              <div className="text-emerald-400 mb-1">[webcontainer] Process spawned: pid 4102</div>
              <div>[webcontainer] ready in 142ms</div>
              <div className="text-zinc-300">[next-router] GET / 200 OK in 14ms</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
