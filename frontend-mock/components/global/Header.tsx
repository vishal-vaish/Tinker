"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/global/Logo";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  interface NavLinkItem {
    label: string;
    href: string;
    hasArrow?: boolean;
  }

  const navLinks: NavLinkItem[] = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Frameworks", href: "#frameworks" },
    { label: "Reviews", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 select-none ${
        isScrolled
          ? "bg-black/85 backdrop-blur-xl border-b border-gray-800/80 shadow-lg"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between relative">
        {/* Left: Brand Identity */}
        <Link href="/" className="flex items-center gap-2.5 font-mono font-bold text-foreground group">
          <Logo size={32} />
          <span className="tracking-tight text-base font-extrabold bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-white">
            TINKER
          </span>
        </Link>

        {/* Center: Rounded Pill Container with gray-700 Border */}
        <nav className="hidden lg:flex items-center gap-1 px-4 py-1.5 rounded-full border border-gray-700 bg-black/40 backdrop-blur-md shadow-inner">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-3.5 py-1 text-sm font-medium text-white/80 hover:text-white transition-colors duration-150 flex items-center gap-1.5"
            >
              <span>{link.label}</span>
              {link.hasArrow && (
                <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 h-9 px-4 rounded-full transition-colors cursor-pointer"
            >
              Login
            </Button>
          </Link>

          <Link href="/login">
            <Button
              size="sm"
              className="h-9 px-4 rounded-full gap-1.5 bg-white text-black hover:bg-white/90 font-medium text-xs transition-all duration-200 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle (Visible on screens smaller than lg) */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full text-white/80 hover:text-white bg-black/40 border border-gray-700 transition cursor-pointer"
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-gray-800 bg-black/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition flex items-center justify-between cursor-pointer"
              >
                <span>{link.label}</span>
                {link.hasArrow && <ArrowRight className="w-3.5 h-3.5 text-white/80" />}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-gray-800/80 flex items-center gap-3">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
              <Button variant="outline" className="w-full text-sm rounded-full border-gray-700 text-white hover:bg-white/10 cursor-pointer">
                Login
              </Button>
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
              <Button className="w-full text-sm rounded-full bg-white text-black hover:bg-white/90 font-medium cursor-pointer">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
