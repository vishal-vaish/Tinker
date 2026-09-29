"use client";

import Link from "next/link";
import { ArrowLeft, Terminal, Sparkles, Layers, EyeOff, LayoutGrid } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/global/Logo";
import { LOGIN_VARIANTS_METADATA, type LoginVariantTabItem } from "@/lib/mock-data";

export type LoginVariantId = "split-studio" | "aurora-glass" | "blueprint";

interface LoginTopTabBarProps {
  activeVariant: LoginVariantId;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export function LoginTopTabBar({
  activeVariant,
  isVisible,
  onToggleVisibility,
}: LoginTopTabBarProps) {
  const activeItem =
    LOGIN_VARIANTS_METADATA.find((item) => item.id === activeVariant) ||
    LOGIN_VARIANTS_METADATA[0];

  const renderIcon = (iconName: LoginVariantTabItem["icon"]) => {
    switch (iconName) {
      case "Terminal":
        return <Terminal className="w-3.5 h-3.5 text-cyan-400" />;
      case "Sparkles":
        return <Sparkles className="w-3.5 h-3.5 text-violet-400" />;
      case "Layers":
        return <Layers className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Terminal className="w-3.5 h-3.5" />;
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleVisibility}
          className="rounded-full bg-background/90 backdrop-blur-xl border border-primary/30 text-foreground shadow-2xl hover:border-primary gap-2 h-9 px-3.5 text-xs font-mono"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-primary" />
          <span>Switch Variant (Tabs)</span>
          <Badge
            variant="outline"
            className="text-[10px] bg-primary/10 text-primary border-primary/30 px-1.5 py-0 font-semibold"
          >
            {activeItem.name}
          </Badge>
        </Button>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/92 backdrop-blur-xl shadow-lg transition-all duration-200 select-none">
      {/* Top subtle highlight line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        {/* Left: Brand & Return to App */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to</span>
            <span className="font-semibold text-foreground">Tinker</span>
          </Link>
          <span className="h-4 w-px bg-border/80 hidden sm:block" />
          <div className="hidden md:flex items-center gap-2">
            <Logo size={20} />
            <span className="font-mono text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Design Explorer
            </span>
          </div>
        </div>

        {/* Center: Tabs Switcher */}
        <div className="flex items-center">
          <TabsList className="bg-muted/70 border border-border/80 p-1 rounded-full h-10 shadow-inner gap-1">
            {LOGIN_VARIANTS_METADATA.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-full px-3 sm:px-4 py-1.5 text-xs font-medium gap-2 data-active:bg-background data-active:text-foreground data-active:shadow-md cursor-pointer transition-all"
              >
                {renderIcon(tab.icon)}
                <span className="font-semibold">{tab.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium hidden sm:inline-block border ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
                <kbd className="hidden lg:inline-flex text-[9px] font-mono px-1 py-0.2 rounded bg-muted-foreground/15 text-muted-foreground border border-border/40">
                  {tab.shortcut}
                </kbd>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Right: Keyboard shortcut hint & Hide toolbar toggle */}
        <div className="flex items-center gap-2">
          <span className="hidden xl:inline-flex text-[11px] font-mono text-muted-foreground">
            Keys: <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px]">1</kbd>{" "}
            <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px]">2</kbd>{" "}
            <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px]">3</kbd>
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleVisibility}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2.5"
            title="Hide toolbar to inspect screen full-bleed (press H to restore)"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Hide Tabs</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
