"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { VariantSplitStudio } from "./_components/VariantSplitStudio";
import { VariantAuroraGlass } from "./_components/VariantAuroraGlass";
import { VariantBlueprint } from "./_components/VariantBlueprint";
import { LoginTopTabBar, type LoginVariantId } from "./_components/LoginTopTabBar";

export type LoginVariant = LoginVariantId;

export default function LoginPage() {
  const [variant, setVariant] = useState<LoginVariantId>("aurora-glass");
  const [isBarVisible, setIsBarVisible] = useState(true);

  // Sync URL query params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("variant") as LoginVariantId;
      if (v === "split-studio" || v === "aurora-glass" || v === "blueprint") {
        setVariant(v);
      }
    }
  }, []);

  const handleSelectVariant = useCallback((newVariant: string) => {
    if (
      newVariant === "split-studio" ||
      newVariant === "aurora-glass" ||
      newVariant === "blueprint"
    ) {
      setVariant(newVariant as LoginVariantId);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("variant", newVariant);
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);

  // Keyboard shortcut listener (1: aurora-glass, 2: split-studio, 3: blueprint, H: toggle bar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "1") handleSelectVariant("aurora-glass");
      if (e.key === "2") handleSelectVariant("split-studio");
      if (e.key === "3") handleSelectVariant("blueprint");
      if (e.key === "h" || e.key === "H") setIsBarVisible((prev) => !prev);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSelectVariant]);

  return (
    <Tabs
      value={variant}
      onValueChange={handleSelectVariant}
      className="flex flex-col min-h-screen w-full gap-0 select-text"
    >
      {/* Pinned Top Tab Bar */}
      <LoginTopTabBar
        activeVariant={variant}
        isVisible={isBarVisible}
        onToggleVisibility={() => setIsBarVisible((prev) => !prev)}
      />

      {/* Variant Content Panels */}
      <TabsContent value="split-studio" className="flex-1 mt-0 outline-none">
        <VariantSplitStudio />
      </TabsContent>
      <TabsContent value="aurora-glass" className="flex-1 mt-0 outline-none">
        <VariantAuroraGlass />
      </TabsContent>
      <TabsContent value="blueprint" className="flex-1 mt-0 outline-none">
        <VariantBlueprint />
      </TabsContent>
    </Tabs>
  );
}
