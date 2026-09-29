"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/global/Logo";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Frameworks", href: "#frameworks" },
    { label: "Reviews", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/75 backdrop-blur-xl select-none transition-colors">
      {/* Top Ambient Glow Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between relative">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-mono font-bold text-foreground group">
            <Logo size={32} />
            <span className="tracking-tight text-base font-extrabold bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
              TINKER
            </span>
          </Link>
        </div>

        {/* Center: Centered Floating Capsule Nav Links */}
        <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full border border-border/80 bg-card/60 backdrop-blur-md shadow-sm">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-medium text-muted-foreground hover:text-foreground h-9 px-3.5 rounded-full transition-colors"
            >
              Login
            </Button>
          </Link>

          <Link href="/login">
            <Button
              size="sm"
              className="h-9 px-4 rounded-full gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.35)] bg-gradient-to-r from-primary via-indigo-600 to-cyan-600 hover:opacity-95 text-white font-semibold text-xs transition-all duration-200"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <Link href="/login">
            <Button size="sm" className="h-8 px-3 rounded-full text-xs bg-primary text-white">
              Get Started
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground bg-muted/50 border border-border"
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-card/95 backdrop-blur-xl px-6 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="outline" className="w-full justify-center text-xs">
                Login
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Bottom Accent Beam */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent pointer-events-none" />
    </header>
  );
}
