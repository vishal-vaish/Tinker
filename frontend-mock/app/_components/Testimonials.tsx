import { Star, ShieldCheck, Quote, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TESTIMONIALS } from "@/lib/mock-data";

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-6 max-w-6xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/35 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-orange-500/15 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)] text-amber-300 text-xs font-mono font-medium">
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>Production Engineering Reviews</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Trusted by Systems Architects & Fullstack Engineers
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          See why modern software teams rely on Tinker for autonomous development without sacrificing on-premise security or runtime cleanliness.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t) => (
          <Card
            key={t.name}
            className="relative p-6 flex flex-col justify-between space-y-6 bg-card/70 backdrop-blur-md border border-border/80 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group"
          >
            <div className="space-y-4">
              {/* Star Rating & Category Pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {t.highlightBadge}
                </span>
              </div>

              {/* Quote Content */}
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed italic">
                &quot;{t.content}&quot;
              </p>
            </div>

            {/* Author Footer */}
            <div className="flex items-center gap-3 pt-4 border-t border-border/60">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/30 to-violet-500/30 border border-primary/40 text-primary font-mono font-bold flex items-center justify-center text-xs shadow-xs">
                {t.avatarText}
              </div>
              <div>
                <div className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <span>{t.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  {t.role} · <span className="text-foreground/80">{t.company}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
