import { HOW_IT_WORKS_STEPS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export function HowItWorks() {
  const getStepStyles = (accent: string) => {
    switch (accent) {
      case "violet":
        return {
          stepBadge: "bg-violet-500/10 text-violet-400 border-violet-500/30",
          cardBorder: "hover:border-violet-500/40",
          glow: "from-violet-500/10 to-transparent",
          codeHeader: "text-violet-300",
        };
      case "cyan":
        return {
          stepBadge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
          cardBorder: "hover:border-cyan-500/40",
          glow: "from-cyan-500/10 to-transparent",
          codeHeader: "text-cyan-300",
        };
      case "emerald":
      default:
        return {
          stepBadge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          cardBorder: "hover:border-emerald-500/40",
          glow: "from-emerald-500/10 to-transparent",
          codeHeader: "text-emerald-300",
        };
    }
  };

  return (
    <section id="how-it-works" className="py-24 px-6 max-w-6xl mx-auto space-y-16">
      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/35 bg-gradient-to-r from-violet-500/15 via-purple-500/10 to-indigo-500/15 backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.2)] text-violet-300 text-xs font-mono font-medium">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Autonomous Execution Lifecycle</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          How Tinker Works in 3 Autonomous Steps
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          From natural language prompt to a verified, single-stack web application running directly in your browser with zero remote servers.
        </p>
      </div>

      {/* 3 Steps Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {HOW_IT_WORKS_STEPS.map((stepItem, index) => {
          const styles = getStepStyles(stepItem.accent);
          return (
            <Card
              key={stepItem.step}
              className={`relative p-6 flex flex-col justify-between space-y-6 transition-all duration-300 bg-card/70 backdrop-blur-md border border-border ${styles.cardBorder} group`}
            >
              {/* Subtle Step Ambient Gradient */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${styles.glow} rounded-tr-xl pointer-events-none -z-10`} />

              <div className="space-y-4">
                {/* Step Number Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${styles.stepBadge}`}>
                    Step {stepItem.step}
                  </span>
                  {index < 2 && (
                    <ArrowRight className="hidden lg:block w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition -mr-3" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-foreground tracking-tight">
                    {stepItem.title}
                  </h3>
                  <div className="text-xs font-medium text-primary font-mono">
                    {stepItem.subtitle}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {stepItem.description}
                </p>

                {/* Key Points */}
                <div className="space-y-2 pt-2">
                  {stepItem.details.map((point) => (
                    <div key={point} className="flex items-center gap-2 text-xs text-foreground/80 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="p-3.5 rounded-xl bg-background/90 border border-border/70 font-mono text-[11px] space-y-1 shadow-inner overflow-x-auto">
                <div className="text-[10px] text-muted-foreground font-semibold flex items-center justify-between pb-1.5 border-b border-border/40">
                  <span className={styles.codeHeader}>execution-contract.ts</span>
                  <span className="text-[9px] text-emerald-400">Validated</span>
                </div>
                <pre className="text-foreground/80 leading-relaxed pt-1">
                  <code>{stepItem.codeSnippet}</code>
                </pre>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
