import { Check, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SUPPORTED_FRAMEWORKS } from "@/lib/mock-data";

export function Frameworks() {
  return (
    <section id="frameworks" className="py-24 px-6 max-w-6xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/35 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-green-500/15 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)] text-emerald-300 text-xs font-mono font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Strict Single-Stack Isolation</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Zero Framework Sprawl. Pure Runtime Isolation.
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Every project is provisioned strictly within its own framework boundary. No hybrid dependencies, conflicting transpilation steps, or messy runtime pollution.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUPPORTED_FRAMEWORKS.map((fw) => (
          <Card
            key={fw.id}
            className="relative p-6 flex flex-col justify-between space-y-6 bg-card/70 backdrop-blur-md border border-border/80 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group"
          >
            {/* Top pill & speed badge */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border bg-gradient-to-r ${fw.accentColor}`}>
                  {fw.badge}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  {fw.runtimeSpeed}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-foreground text-lg tracking-tight group-hover:text-primary transition">
                  {fw.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  {fw.tagline}
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-1.5 pt-3 border-t border-border/60">
                {fw.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom PathJail Security Pill */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>PathJail Locked</span>
              </span>
              <span className="text-primary font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Ready <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
