"use client";

import { Sparkles, Layers, Terminal } from "lucide-react";

export type LoginVariant = "split-studio" | "aurora-glass" | "blueprint";

interface VariantSwitcherProps {
  currentVariant: LoginVariant;
  onSelect: (variant: LoginVariant) => void;
}

export function VariantSwitcher({ currentVariant, onSelect }: VariantSwitcherProps) {
  const variants: { id: LoginVariant; label: string; icon: React.ReactNode }[] = [
    {
      id: "split-studio",
      label: "Variant 1: Split Studio (Recommended)",
      icon: <Terminal className="w-3.5 h-3.5 text-cyan-400" />,
    },
    {
      id: "aurora-glass",
      label: "Variant 2: Aurora Glass",
      icon: <Sparkles className="w-3.5 h-3.5 text-violet-400" />,
    },
    {
      id: "blueprint",
      label: "Variant 3: Blueprint Grid",
      icon: <Layers className="w-3.5 h-3.5 text-emerald-400" />,
    },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-1.5 p-1.5 rounded-full border border-border/80 bg-background/90 backdrop-blur-xl shadow-2xl text-xs font-mono">
        <span className="px-2.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider hidden sm:inline">
          Variant:
        </span>
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-150 cursor-pointer ${
              currentVariant === v.id
                ? "bg-primary text-primary-foreground font-semibold shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {v.icon}
            <span className="text-[11px]">{v.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
