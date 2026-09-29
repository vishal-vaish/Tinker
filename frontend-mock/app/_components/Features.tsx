import { Terminal, Shield, Layers, Database, Crosshair, GitCompare, Sparkles, Check, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CORE_FEATURES } from "@/lib/mock-data";

export function Features() {
  const getFeatureTheme = (accent: string) => {
    switch (accent) {
      case "cyan":
        return {
          icon: <Terminal className="w-5 h-5 text-cyan-400" />,
          border: "hover:border-cyan-500/50",
          badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
          iconBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
          gradient: "from-cyan-500/10 via-transparent to-transparent",
        };
      case "violet":
        return {
          icon: <Shield className="w-5 h-5 text-violet-400" />,
          border: "hover:border-violet-500/50",
          badge: "bg-violet-500/10 text-violet-400 border-violet-500/30",
          iconBg: "bg-violet-500/10 border-violet-500/20 text-violet-400",
          gradient: "from-violet-500/10 via-transparent to-transparent",
        };
      case "emerald":
        return {
          icon: <Database className="w-5 h-5 text-emerald-400" />,
          border: "hover:border-emerald-500/50",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          gradient: "from-emerald-500/10 via-transparent to-transparent",
        };
      case "amber":
        return {
          icon: <Crosshair className="w-5 h-5 text-amber-400" />,
          border: "hover:border-amber-500/50",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
          gradient: "from-amber-500/10 via-transparent to-transparent",
        };
      case "indigo":
        return {
          icon: <Layers className="w-5 h-5 text-indigo-400" />,
          border: "hover:border-indigo-500/50",
          badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
          iconBg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
          gradient: "from-indigo-500/10 via-transparent to-transparent",
        };
      case "rose":
      default:
        return {
          icon: <GitCompare className="w-5 h-5 text-rose-400" />,
          border: "hover:border-rose-500/50",
          badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          iconBg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
          gradient: "from-rose-500/10 via-transparent to-transparent",
        };
    }
  };

  return (
    <section id="features" className="py-24 px-6 max-w-6xl mx-auto space-y-16">
      {/* Section Heading */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/35 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-sky-500/15 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)] text-cyan-300 text-xs font-mono font-medium">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Core Architecture Pillars</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Engineered for Full Local Autonomy
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Tinker eliminates cloud latency, vendor lock-in, and unpredictable telemetry with a modular runtime built for high-performance software engineering.
        </p>
      </div>

      {/* Colorful Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CORE_FEATURES.map((feature) => {
          const theme = getFeatureTheme(feature.accent);
          return (
            <Card
              key={feature.id}
              className={`relative p-6 flex flex-col justify-between space-y-6 transition-all duration-300 bg-card/70 backdrop-blur-md border border-border/80 ${theme.border} ${feature.bentoSpan || "lg:col-span-1"} group overflow-hidden`}
            >
              {/* Corner Ambient Gradient Glow */}
              <div className={`absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br ${theme.gradient} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl border ${theme.iconBg} shadow-xs`}>
                    {theme.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    {feature.highlightText && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${theme.badge}`}>
                        {feature.highlightText}
                      </span>
                    )}
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {feature.tag}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Feature Specific Visual Accent Strip */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Production Ready</span>
                </span>
                <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Details <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
