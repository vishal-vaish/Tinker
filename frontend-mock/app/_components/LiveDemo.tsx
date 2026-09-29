"use client";

import { useState } from "react";
import { Terminal, Code2, GitCompare, RefreshCw, ExternalLink, Sparkles, Folder, FileCode, FileText, CheckCircle2, Crosshair, ArrowUpRight } from "lucide-react";
import { TERMINAL_DEMO_LOGS, DEMO_FILE_TREE } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export function LiveDemo() {
  const [activeTab, setActiveTab] = useState<"terminal" | "code" | "diff">("terminal");
  const [selectedFile, setSelectedFile] = useState("MetricCard.tsx");
  const [counter, setCounter] = useState(14820);
  const [inspectMode, setInspectMode] = useState(false);

  return (
    <section className="px-6 py-12 max-w-6xl mx-auto">
      {/* IDE Outer Shell with Multi-Color Ambient Glow */}
      <div className="relative rounded-2xl border border-border/80 bg-card/90 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Glow backlight behind IDE */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 via-primary/20 to-cyan-500/20 rounded-2xl blur-xl opacity-50 -z-10 pointer-events-none" />

        {/* IDE Top Window Chrome */}
        <div className="h-11 border-b border-border bg-card/95 px-4 flex items-center justify-between text-xs select-none">
          {/* Mac Window Controls & Path */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/90 shadow-xs inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/90 shadow-xs inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-xs inline-block" />
            </div>
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground ml-2">
              <span className="text-primary font-bold">tinker</span>
              <span>/</span>
              <span>workspaces</span>
              <span>/</span>
              <span className="text-foreground font-semibold">analytics-hub</span>
              <span>/</span>
              <span className="text-cyan-400">{selectedFile}</span>
            </div>
          </div>

          {/* Center Tabs: Terminal vs Code vs Diff */}
          <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border/60 text-[11px] font-mono">
            <button
              onClick={() => setActiveTab("terminal")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${activeTab === "terminal" ? "bg-card text-foreground font-bold shadow-xs border border-border/40" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Terminal className="w-3 h-3 text-cyan-400" />
              <span>Agent Logs</span>
            </button>

            <button
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${activeTab === "code" ? "bg-card text-foreground font-bold shadow-xs border border-border/40" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Code2 className="w-3 h-3 text-violet-400" />
              <span>Source</span>
            </button>

            <button
              onClick={() => setActiveTab("diff")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${activeTab === "diff" ? "bg-card text-foreground font-bold shadow-xs border border-border/40" : "text-muted-foreground hover:text-foreground"}`}
            >
              <GitCompare className="w-3 h-3 text-emerald-400" />
              <span>Diff (+48)</span>
            </button>
          </div>

          {/* Right Status Pill */}
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>WebContainer v1.4</span>
            </span>
          </div>
        </div>

        {/* IDE Split Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
          {/* Left Mini Explorer (Hidden on small screens, 2 cols on lg) */}
          <div className="hidden lg:block lg:col-span-2 border-r border-border bg-card/40 p-3 space-y-1 font-mono text-[11px] select-none">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-2 py-1 flex items-center justify-between">
              <span>Explorer</span>
              <span className="text-primary text-[10px]">Vite SPA</span>
            </div>

            <div className="space-y-0.5 pt-1">
              {DEMO_FILE_TREE.map((item) => (
                <div
                  key={item.name}
                  onClick={() => item.type === "file" && setSelectedFile(item.name)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition ${
                    selectedFile === item.name
                      ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  {item.type === "folder" ? (
                    <Folder className="w-3 h-3 text-amber-400/80" />
                  ) : item.extension === "tsx" ? (
                    <FileCode className="w-3 h-3 text-cyan-400" />
                  ) : item.extension === "css" ? (
                    <FileText className="w-3 h-3 text-pink-400" />
                  ) : item.extension === "sql" ? (
                    <FileText className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <FileText className="w-3 h-3 text-amber-300" />
                  )}
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Center Editor / Terminal View (5 cols on lg) */}
          <div className="lg:col-span-5 p-4 bg-background/95 font-mono text-xs overflow-y-auto border-b lg:border-b-0 lg:border-r border-border leading-relaxed">
            {activeTab === "terminal" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-2 border-b border-border/50">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>In-Browser Shell (Wasm Node.js 22)</span>
                  </span>
                  <span className="text-[10px] bg-muted/60 px-1.5 py-0.5 rounded font-mono">0.14s</span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {TERMINAL_DEMO_LOGS.map((log, idx) => {
                    let colorClass = "text-muted-foreground";
                    if (log.type === "cmd") colorClass = "text-foreground font-bold";
                    if (log.type === "info") colorClass = "text-cyan-300";
                    if (log.type === "pkg") colorClass = "text-amber-300";
                    if (log.type === "agent") colorClass = "text-violet-400 font-semibold";
                    if (log.type === "step") colorClass = "text-indigo-300";
                    if (log.type === "server") colorClass = "text-blue-400";
                    if (log.type === "success") colorClass = "text-emerald-400 font-bold";

                    return (
                      <div key={idx} className={`leading-normal ${colorClass}`}>
                        {log.text}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 text-primary font-bold pt-3 border-t border-border/40">
                  <span className="text-cyan-400">guest@webcontainer</span>
                  <span className="text-muted-foreground">:</span>
                  <span className="text-violet-400">~/analytics-hub</span>
                  <span className="text-foreground">$</span>
                  <span className="w-2 h-4 bg-primary inline-block animate-pulse" />
                </div>
              </div>
            )}

            {activeTab === "code" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-2 border-b border-border/50">
                  <span className="text-cyan-400 font-semibold">src/components/{selectedFile}</span>
                  <span className="text-emerald-400 text-[10px]">TypeScript Validated</span>
                </div>
                <pre className="text-[11px] leading-5 text-foreground/90 pt-2 font-mono overflow-x-auto">
                  <span className="text-violet-400">import</span> {"{ useState }"} <span className="text-violet-400">from</span> <span className="text-emerald-300">&quot;react&quot;</span>;{"\n"}
                  <span className="text-violet-400">import</span> {"{ TrendingUp, Users }"} <span className="text-violet-400">from</span> <span className="text-emerald-300">&quot;lucide-react&quot;</span>;{"\n\n"}
                  <span className="text-violet-400">export function</span> <span className="text-blue-400 font-bold">MetricCard</span>() {"{"}{"\n"}
                  {"  "}<span className="text-violet-400">const</span> [count, setCount] = <span className="text-blue-400">useState</span>({counter});{"\n\n"}
                  {"  "}<span className="text-violet-400">return</span> ({"\n"}
                  {"    "}&lt;<span className="text-pink-400">div</span> <span className="text-amber-300">className</span>=<span className="text-emerald-300">&quot;p-5 rounded-2xl bg-card border&quot;</span>&gt;{"\n"}
                  {"      "}&lt;<span className="text-pink-400">h4</span> <span className="text-amber-300">className</span>=<span className="text-emerald-300">&quot;text-xs text-muted-foreground&quot;</span>&gt;Active Sessions&lt;/<span className="text-pink-400">h4</span>&gt;{"\n"}
                  {"      "}&lt;<span className="text-pink-400">div</span> <span className="text-amber-300">className</span>=<span className="text-emerald-300">&quot;text-3xl font-extrabold font-mono&quot;</span>&gt;{"{count}"}&lt;/<span className="text-pink-400">div</span>&gt;{"\n"}
                  {"    "}&lt;/<span className="text-pink-400">div</span>&gt;{"\n"}
                  {"  "});{"\n"}
                  {"}"}
                </pre>
              </div>
            )}

            {activeTab === "diff" && (
              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between text-muted-foreground pb-2 border-b border-border/50">
                  <span className="text-foreground">ReAct AST Patch: MetricCard.tsx</span>
                  <span className="text-emerald-400 font-bold">+48 lines</span>
                </div>
                <div className="p-2 rounded bg-muted/40 text-muted-foreground text-[10px]">
                  @@ -12,4 +12,12 @@ Synthesizing visual container and sparkline
                </div>
                <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  + export function MetricCard() &#123;
                </div>
                <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  +   const [activeUsers, setActiveUsers] = useState(14820);
                </div>
                <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  +   return &lt;div className=&quot;shadow-md border-emerald-500/20&quot;&gt;
                </div>
                <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  +     &lt;SparklineChart data=&#123;[20, 45, 60, 95]&#125; /&gt;
                </div>
                <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  +   &lt;/div&gt;;
                </div>
                <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  + &#125;
                </div>
                <div className="pt-2 text-muted-foreground text-[10px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Validated by Autonomous ReAct Safety Engine</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Live WebContainer Preview (5 cols on lg) */}
          <div className="lg:col-span-5 p-5 bg-gradient-to-b from-card/60 to-background/90 flex flex-col justify-between space-y-4">
            {/* Preview Browser Address Bar */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-border">
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-muted/60 border border-border/60 flex-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] text-foreground font-medium">http://localhost:5173/overview</span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Agentation Inspector Toggle */}
                <button
                  onClick={() => setInspectMode(!inspectMode)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-medium transition cursor-pointer ${
                    inspectMode
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border/40"
                  }`}
                  title="Toggle Agentation DOM Inspector overlay"
                >
                  <Crosshair className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Agentation: {inspectMode ? "ON" : "OFF"}</span>
                </button>

                <div className="p-1 rounded bg-muted/40 text-muted-foreground">
                  <RefreshCw className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Rendered Live Component in Sandbox */}
            <div className="relative p-5 rounded-2xl bg-card border border-border shadow-lg space-y-4">
              {/* Agentation Inspection Box Overlay */}
              {inspectMode && (
                <div className="absolute inset-2 border-2 border-dashed border-amber-400/90 rounded-xl bg-amber-500/10 pointer-events-none flex flex-col justify-between p-2 z-20">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-mono text-[10px] font-bold">
                      &lt;MetricCard /&gt; .bg-card.rounded-2xl
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/80 text-amber-300 font-mono text-[10px]">
                      Agentation Active
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-amber-300 bg-black/90 p-1.5 rounded backdrop-blur-md">
                    Feedback sent: &quot;Add sparkline gradient and surge button&quot;
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Live Enterprise Metrics
                  </div>
                  <div className="text-xs text-muted-foreground">Real-time WebContainer state</div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
                  HMR: 42ms
                </Badge>
              </div>

              {/* Main Metric Value */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold font-mono tracking-tight text-foreground">
                  {counter.toLocaleString()}
                </span>
                <span className="flex items-center text-xs font-semibold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3.5 h-3.5 inline mr-0.5" />
                  +28.4%
                </span>
              </div>

              {/* Micro Visual Chart Sparkline */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-end gap-1.5 h-12 w-full pt-2">
                  {[35, 48, 62, 55, 78, 88, 72, 95, 110, counter % 100 + 40].map((val, i) => (
                    <div
                      key={i}
                      style={{ height: `${Math.min(100, Math.max(15, val))}%` }}
                      className={`flex-1 rounded-xs transition-all duration-300 ${
                        i === 9 ? "bg-primary animate-pulse" : "bg-primary/30 hover:bg-primary/60"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>00:00 UTC</span>
                  <span>Live Stream</span>
                  <span>14:30 UTC</span>
                </div>
              </div>

              {/* Interactive Simulation Action */}
              <div className="pt-2 flex items-center justify-between border-t border-border/50">
                <button
                  onClick={() => setCounter((prev) => prev + Math.floor(Math.random() * 45) + 12)}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Real-time Surge</span>
                </button>
                <span className="text-[10px] text-muted-foreground font-mono">Vite Hot Reload active</span>
              </div>
            </div>

            {/* Bottom Status Tag */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono px-1">
              <span>Local WebAssembly Node v22.12.0</span>
              <span className="text-primary font-semibold">Zero Cloud Bill</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
