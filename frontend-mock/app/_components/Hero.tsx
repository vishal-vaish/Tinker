"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Play, Cpu, Terminal, Database, CheckCircle2, Zap } from "lucide-react";
import { ShinyText } from "@/components/global/ShinyText";
import { PLATFORM_METRICS, HERO_CONFIG } from "@/lib/mock-data";

interface AnimatedMetricValueProps {
  value: string;
  duration?: number;
  delay?: number;
  restartKey?: number;
  className?: string;
}

function AnimatedMetricValue({
  value,
  duration = 1800,
  delay = 350,
  restartKey = 0,
  className = "",
}: AnimatedMetricValueProps) {
  const ref = useRef<HTMLSpanElement>(null);
  
  const parsed = useMemo(() => {
    const match = value.match(/^([^0-9.]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
    if (!match) return null;
    return {
      prefix: match[1],
      target: parseFloat(match[2]),
      decimals: match[2].includes(".") ? match[2].split(".")[1].length : 0,
      suffix: match[3],
    };
  }, [value]);

  const [displayNum, setDisplayNum] = useState<number>(0);

  useEffect(() => {
    if (!parsed) return;

    const targetVal = parsed.target;

    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplayNum(targetVal);
      return;
    }

    setDisplayNum(0);

    const actualDelay = restartKey > 0 ? 0 : delay;
    let intervalId: NodeJS.Timeout;

    const timerId = setTimeout(() => {
      const startTime = performance.now();

      intervalId = setInterval(() => {
        const now = performance.now();
        const progress = Math.min((now - startTime) / duration, 1);
        // easeOutCubic
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const current = easedProgress * targetVal;
        setDisplayNum(current);

        if (progress >= 1) {
          clearInterval(intervalId);
          setDisplayNum(targetVal);
        }
      }, 20);
    }, actualDelay);

    return () => {
      clearTimeout(timerId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [parsed, duration, delay, restartKey]);

  if (!parsed) {
    return <span className={`font-bold tracking-tight tabular-nums font-mono ${className}`}>{value}</span>;
  }

  const formattedNum = parsed.decimals > 0 ? displayNum.toFixed(parsed.decimals) : Math.round(displayNum).toString();

  return (
    <span
      ref={ref}
      className={`font-bold tracking-tight tabular-nums font-mono min-w-[2.2rem] inline-block text-left ${className}`}
    >
      {parsed.prefix}{formattedNum}{parsed.suffix}
    </span>
  );
}

const METRIC_BADGE_THEMES = {
  violet: {
    container: "border-white/15 bg-black/50 backdrop-blur-xl hover:border-violet-400/40 hover:bg-black/70 shadow-md",
    iconColor: "text-violet-400",
    valueText: "text-white font-bold",
    dot: "text-white/30",
    labelText: "text-white/80",
  },
  cyan: {
    container: "border-white/15 bg-black/50 backdrop-blur-xl hover:border-cyan-400/40 hover:bg-black/70 shadow-md",
    iconColor: "text-cyan-400",
    valueText: "text-white font-bold",
    dot: "text-white/30",
    labelText: "text-white/80",
  },
  emerald: {
    container: "border-white/15 bg-black/50 backdrop-blur-xl hover:border-emerald-400/40 hover:bg-black/70 shadow-md",
    iconColor: "text-emerald-400",
    valueText: "text-white font-bold",
    dot: "text-white/30",
    labelText: "text-white/80",
  },
  amber: {
    container: "border-white/15 bg-black/50 backdrop-blur-xl hover:border-amber-400/40 hover:bg-black/70 shadow-md",
    iconColor: "text-amber-400",
    valueText: "text-white font-bold",
    dot: "text-white/30",
    labelText: "text-white/80",
  },
};

function MetricPill({
  metric,
  icon,
}: {
  metric: (typeof PLATFORM_METRICS)[0];
  icon: React.ReactNode;
}) {
  const [hoverKey, setHoverKey] = useState(0);
  const theme = METRIC_BADGE_THEMES[metric.accent] || METRIC_BADGE_THEMES.violet;

  return (
    <div
      onMouseEnter={() => setHoverKey((k) => k + 1)}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono transition-all duration-200 cursor-default select-none group ${theme.container}`}
    >
      <span className={`shrink-0 flex items-center justify-center transition-colors ${theme.iconColor}`}>
        {icon}
      </span>
      <AnimatedMetricValue
        value={metric.value}
        restartKey={hoverKey}
        className={theme.valueText}
      />
      <span className={theme.dot}>•</span>
      <span className={`text-[11px] font-medium ${theme.labelText}`}>
        {metric.shortLabel || metric.label}
      </span>
    </div>
  );
}

export function Hero() {
  const metricIcons = {
    "< 180ms": <Cpu className="w-3.5 h-3.5" />,
    "140ms": <Terminal className="w-3.5 h-3.5" />,
    "100%": <Database className="w-3.5 h-3.5" />,
    "99.2%": <CheckCircle2 className="w-3.5 h-3.5" />,
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, []);

  return (
    <section className="relative w-full min-h-[100dvh] h-screen bg-[#000000] text-white overflow-hidden flex flex-col justify-between pt-24 pb-8 sm:pb-12 select-none">
      {/* Full-screen Looping Video Background loaded from local public directory */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
      >
        <source src={HERO_CONFIG.videoUrl} type="video/mp4" />
      </video>

      {/* Dark Contrast Backdrop Overlay */}
      <div className="absolute inset-0 bg-black/45 pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black pointer-events-none z-[1]" />

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col justify-between h-full">
        {/* Center Content Section */}
        <div className="my-auto py-4 sm:py-6 text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Release Pill with Live Beacon (Original Content) */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/40 bg-gradient-to-r from-primary/15 via-violet-500/10 to-cyan-500/15 backdrop-blur-md text-xs font-mono font-medium shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:border-primary/60 transition">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] inline-block" />
            <span className="text-white font-semibold">{HERO_CONFIG.badgeRelease}</span>
            <span className="text-white/40">•</span>
            <span className="text-cyan-300 hover:text-white transition flex items-center gap-1">
              {HERO_CONFIG.badgeEngine} <ArrowRight className="w-3 h-3 inline" />
            </span>
          </div>

          {/* Main Headline with Animated Shiny Gradient (Original Content) */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.9] font-sans font-medium text-white">
            <span className="block">{HERO_CONFIG.headingLine1}</span>
            <ShinyText
              className="block font-bold"
              baseColor="#64CEFB"
              shineColor="#ffffff"
              speed={3}
            >
              {HERO_CONFIG.headingLine2}
            </ShinyText>
          </h1>

          {/* Subtitle (Original Content) */}
          <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-sans">
            The autonomous AI software engineer powered by{" "}
            <span className="text-white font-medium">private neural execution</span>, sub-second
            in-browser <span className="text-white font-medium">WebContainers</span>, dedicated{" "}
            <span className="text-white font-medium">PostgreSQL sandboxes</span>, and{" "}
            <span className="text-white font-medium">Agentation</span> visual element feedback.
          </p>

          {/* Action CTAs: Black background, hover gray-900, rounded-full, animated arrow */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/login" className="group">
              <button className="px-6 md:px-8 py-3.5 md:py-4 rounded-full bg-black hover:bg-zinc-900 text-white border border-gray-700 shadow-2xl transition-all duration-200 inline-flex items-center gap-3 font-semibold text-sm md:text-base cursor-pointer">
                <span>{HERO_CONFIG.ctaPrimaryText}</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform duration-200" />
              </button>
            </Link>

            <a href="#how-it-works" className="group">
              <button className="px-5 md:px-7 py-3.5 md:py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 backdrop-blur-md transition-all duration-200 inline-flex items-center gap-2.5 font-medium text-sm md:text-base cursor-pointer">
                <Play className="w-3.5 h-3.5 fill-current text-white/90" />
                <span>{HERO_CONFIG.ctaSecondaryText}</span>
              </button>
            </a>
          </div>
        </div>

        {/* Bottom Section: Compact Platform Metric Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-4xl mx-auto w-full pt-2 pb-1">
          {PLATFORM_METRICS.map((metric) => (
            <MetricPill
              key={metric.label}
              metric={metric}
              icon={metricIcons[metric.value as keyof typeof metricIcons] || <Zap className="w-3.5 h-3.5" />}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
