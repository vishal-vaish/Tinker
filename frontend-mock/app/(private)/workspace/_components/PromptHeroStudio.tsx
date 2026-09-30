"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Paperclip, Terminal, Layers, Database, Shield } from "lucide-react";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PromptHeroStudio() {
  const {
    createNewDraft,
    activeWorkspace,
    workspaceCreationAlert,
    dismissWorkspaceCreationAlert,
  } = useWorkspace();
  const { open } = useSidebar();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("Claude 3.7 Sonnet");
  const [framework, setFramework] = useState<"nextjs" | "vite" | "fastify" | "remix">("nextjs");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const starterTemplates = [
    {
      title: "Fullstack SaaS Dashboard",
      prompt: "Build a production Next.js 16 SaaS analytics dashboard with Shadcn UI, dark mode, and mock billing cards.",
      framework: "nextjs" as const,
      icon: Layers,
    },
    {
      title: "Fastify Edge Gateway",
      prompt: "Create an ultra-fast REST microservice in Fastify with JWT mTLS authentication and rate limiting.",
      framework: "fastify" as const,
      icon: Terminal,
    },
    {
      title: "Realtime Telemetry Canvas",
      prompt: "Build an interactive Vite React dashboard with WebGL chart widgets and isolated state machines.",
      framework: "vite" as const,
      icon: Database,
    },
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const title = prompt.trim().split(" ").slice(0, 5).join(" ");
      await createNewDraft(title, prompt, framework);
    } catch (err) {
      console.error("Error creating draft:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full relative">
      {!open && (
        <div className="fixed top-3 left-3 z-30 animate-in fade-in duration-200">
          <SidebarTrigger className="size-8 rounded-lg bg-card/90 backdrop-blur border border-border shadow-xs hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center" />
        </div>
      )}

      {/* Workspace Creation Confirmation Alert Banner */}
      {workspaceCreationAlert && (
        <div className="w-full mb-6 p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs font-medium text-foreground truncate">
              {workspaceCreationAlert}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissWorkspaceCreationAlert}
            className="text-xs text-muted-foreground hover:text-foreground h-7 px-2 cursor-pointer"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Title & Tagline */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary mb-2">
          <Sparkles className="size-3.5" />
          <span>
            {activeWorkspace ? `Studio: ${activeWorkspace.name}` : "Autonomous Neural Fullstack Studio"}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          What would you like to build?
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Type your requirements below. Tinker provisions an in-browser WebContainer, single-stack runtime, and PostgreSQL sandbox.
        </p>
      </div>

      {/* Main Composer Box (v0 / Bolt Style) */}
      <div className="w-full rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl p-3 sm:p-4 space-y-3 transition-all focus-within:border-primary/50">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ask Tinker to build a dashboard, API microservice, or fullstack web app..."
          rows={3}
          className="w-full bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground/60 leading-relaxed font-sans"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
          {/* Framework & Model Selectors */}
          <div className="flex items-center gap-2">
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value as any)}
              className="text-xs bg-muted/60 text-foreground border border-border rounded-lg px-2.5 py-1 outline-none cursor-pointer"
            >
              <option value="nextjs">Next.js 16 (React 19)</option>
              <option value="vite">Vite + React (SPA)</option>
              <option value="fastify">Fastify (Node.js API)</option>
              <option value="remix">Remix / React Router</option>
            </select>

            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="text-xs bg-muted/60 text-foreground border border-border rounded-lg px-2.5 py-1 outline-none cursor-pointer"
            >
              <option value="Claude 3.7 Sonnet">Claude 3.7 Sonnet</option>
              <option value="GPT-4o">GPT-4o</option>
              <option value="DeepSeek-R1">DeepSeek-R1</option>
            </select>
          </div>

          {/* Submit Action */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              title="Attach context file"
            >
              <Paperclip className="size-4" />
            </Button>

            <Button
              onClick={() => handleSubmit()}
              disabled={!prompt.trim() || isSubmitting}
              size="default"
              className="gap-2 cursor-pointer font-semibold shadow-xs"
            >
              <span>{isSubmitting ? "Spinning Sandbox..." : "Build"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Starter Template Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-6">
        {starterTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.title}
              type="button"
              onClick={() => {
                setPrompt(template.prompt);
                setFramework(template.framework);
              }}
              className="flex flex-col text-left p-3.5 rounded-xl border border-border/80 bg-card/40 hover:bg-card hover:border-primary/40 transition-all cursor-pointer group space-y-1.5"
            >
              <div className="flex items-center justify-between w-full">
                <Icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <Badge variant="outline" className="text-[9px] uppercase font-mono px-1 py-0 h-3.5">
                  {template.framework}
                </Badge>
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                {template.title}
              </span>
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                {template.prompt}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
