"use client";

import Link from "next/link";
import { Zap, ArrowRight, Play, Terminal, Cpu, Database, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_METRICS } from "@/lib/mock-data";

export function Hero() {

  const getMetricAccent = (accent: string) => {
    switch (accent) {
      case "violet":
        return {
          border: "hover:border-violet-500/50",
          glow: "group-hover:bg-violet-500/10",
          iconBg: "bg-violet-500/10 text-violet-400 border-violet-500/20",
          valColor: "text-violet-300",
        };
      case "cyan":
        return {
          border: "hover:border-cyan-500/50",
          glow: "group-hover:bg-cyan-500/10",
          iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
          valColor: "text-cyan-300",
        };
      case "emerald":
        return {
          border: "hover:border-emerald-500/50",
          glow: "group-hover:bg-emerald-500/10",
          iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          valColor: "text-emerald-300",
        };
      case "amber":
      default:
        return {
          border: "hover:border-amber-500/50",
          glow: "group-hover:bg-amber-500/10",
          iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          valColor: "text-amber-300",
        };
    }
  };

  const metricIcons = {
    "< 180ms": <Cpu className="w-3.5 h-3.5" />,
    "140ms": <Terminal className="w-3.5 h-3.5" />,
    "100%": <Database className="w-3.5 h-3.5" />,
    "99.2%": <CheckCircle2 className="w-3.5 h-3.5" />,
  };

  return (
    <section className="relative pt-24 pb-20 px-6 overflow-hidden text-center">
      {/* Background Multi-Layer Ambient Glow & Grid Pattern */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Subtle engineering grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
        
        {/* Upper Center Primary Radial */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-primary/20 via-violet-600/15 to-cyan-500/15 blur-[140px] rounded-full" />
        
        {/* Secondary Warm / Emerald Accent Flares */}
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[250px] bg-violet-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Release Pill with Live Beacon */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/40 bg-gradient-to-r from-primary/15 via-violet-500/10 to-cyan-500/15 backdrop-blur-md text-xs font-mono font-medium shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:border-primary/60 transition">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] inline-block" />
          <span className="text-foreground font-semibold">Tinker 1.0 General Availability</span>
          <span className="text-muted-foreground/60">•</span>
          <span className="text-primary hover:text-primary-foreground transition flex items-center gap-1">
            Local Autonomous Engine <ArrowRight className="w-3 h-3 inline" />
          </span>
        </div>

        {/* Main Headline with Colorful Shimmer */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08]">
          Build and run fullstack web apps at the{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            speed of thought
          </span>
          .
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The autonomous AI software engineer powered by <span className="text-foreground font-medium">local Ollama inference</span>, sub-second in-browser <span className="text-foreground font-medium">WebContainers</span>, dedicated <span className="text-foreground font-medium">PostgreSQL sandboxes</span>, and <span className="text-foreground font-medium">Agentation</span> visual element feedback.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link href="/login">
            <Button size="lg" className="gap-2 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 h-11">
              <span>Start Building Free</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <a href="#how-it-works">
            <Button variant="ghost" size="lg" className="gap-2 h-11 text-xs">
              <Play className="w-3.5 h-3.5 fill-current text-primary" />
              <span>See How It Works</span>
            </Button>
          </a>
        </div>

        {/* Platform Metrics Bento Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-10 max-w-4xl mx-auto">
          {PLATFORM_METRICS.map((metric) => {
            const styles = getMetricAccent(metric.accent);
            return (
              <div
                key={metric.label}
                className={`relative p-4 rounded-xl border border-border bg-card/60 backdrop-blur-md space-y-2 text-left transition-all duration-200 group ${styles.border}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-medium leading-none">
                    {metric.label}
                  </span>
                  <div className={`p-1.5 rounded-md border ${styles.iconBg}`}>
                    {metricIcons[metric.value as keyof typeof metricIcons] || <Zap className="w-3 h-3" />}
                  </div>
                </div>
                <div className={`text-2xl font-extrabold font-mono tracking-tight ${styles.valColor}`}>
                  {metric.value}
                </div>
                <div className="text-[10px] text-muted-foreground/80 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  <span>{metric.change}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
