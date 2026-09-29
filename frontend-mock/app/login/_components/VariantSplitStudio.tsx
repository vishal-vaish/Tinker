"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Mail, Lock, Eye, EyeOff, Terminal, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/global/Logo";
import { LOGIN_STUDIO_TESTIMONIAL, LOGIN_TERMINAL_SNIPPET } from "@/lib/mock-data";

export function VariantSplitStudio() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 600);
  };

  const handleOAuthLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 400);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background text-foreground">
      {/* Left: Deep Ambient Studio Showcase (7 cols on lg) */}
      <div className="hidden lg:flex lg:col-span-7 relative p-12 flex-col justify-between overflow-hidden border-r border-border/80 bg-gradient-to-br from-card via-background to-card/90">
        {/* Multicolored Radial Glow & Engineering Grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[350px] bg-gradient-to-tr from-primary/20 via-violet-600/15 to-cyan-500/15 blur-[120px] rounded-full" />
          <div className="absolute bottom-10 right-10 w-[300px] h-[250px] bg-emerald-500/10 blur-[90px] rounded-full" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:28px_28px]" />
        </div>

        {/* Top Brand Link */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-mono font-bold text-foreground group">
            <Logo size={32} />
            <span className="tracking-tight text-lg font-extrabold bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
              TINKER
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border border-border/70 bg-card/60 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-muted-foreground">Private Sandbox Isolated</span>
          </div>
        </div>

        {/* Center: Live Terminal Simulation & Architecture Overview */}
        <div className="space-y-6 my-auto max-w-xl">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 border border-primary/25 text-primary">
              Enterprise Autonomy Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Build fullstack web apps in a private, isolated sandbox.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every workspace boots an isolated WebContainer microVM in a private sandbox. Zero external code exposure.
            </p>
          </div>

          {/* Interactive Shell Snippet */}
          <div className="rounded-2xl border border-border/80 bg-background/90 p-4 font-mono text-xs shadow-2xl backdrop-blur-xl space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-border/60 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-foreground font-semibold">tinker-auth.sh</span>
              </div>
              <span className="text-emerald-400">mTLS Verified</span>
            </div>

            <div className="space-y-1.5 pt-1 text-[11px] leading-relaxed">
              {LOGIN_TERMINAL_SNIPPET.map((line, idx) => (
                <div key={idx} className={idx === 0 ? "text-cyan-400 font-bold" : "text-foreground/80"}>
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Customer Quote */}
          <div className="p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-md space-y-2">
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              &quot;{LOGIN_STUDIO_TESTIMONIAL.quote}&quot;
            </p>
            <div className="text-[11px] font-mono text-foreground font-semibold">
              — {LOGIN_STUDIO_TESTIMONIAL.author}, <span className="text-primary">{LOGIN_STUDIO_TESTIMONIAL.role}</span>
            </div>
          </div>
        </div>

        {/* Bottom Platform Metrics & Trust Strip */}
        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border/60">
          {LOGIN_STUDIO_TESTIMONIAL.stats.map((s) => (
            <div key={s.label} className="space-y-0.5">
              <div className="text-[10px] text-muted-foreground font-mono uppercase">{s.label}</div>
              <div className="text-base font-extrabold text-foreground font-mono">{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Authentication Form (5 cols on lg) */}
      <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 relative bg-card/20">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between pb-6">
          <Link href="/" className="flex items-center gap-2 font-mono font-bold text-foreground">
            <Logo size={28} />
            <span className="tracking-tight text-base font-bold">TINKER</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-xs"
          >
            {mode === "signin" ? "Sign Up" : "Log In"}
          </Button>
        </div>

        {/* Form Container */}
        <div className="my-auto max-w-sm w-full mx-auto space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {mode === "signin" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === "signin"
                ? "Enter your credentials to access your autonomous workspaces."
                : "Get started with fullstack autonomous AI development today."}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-2.5">
            <Button
              variant="outline"
              className="w-full justify-center gap-2 font-normal h-10 border-border/80 hover:bg-muted/60"
              onClick={() => handleOAuthLogin("github")}
              disabled={isLoading}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Continue with GitHub</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-center gap-2 font-normal h-10 border-border/80 hover:bg-muted/60"
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </Button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-border" />
            <span className="flex-shrink mx-3 text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
              or credentials
            </span>
            <div className="flex-grow border-t border-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Work Email</label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-foreground">Password</label>
                <a href="#" className="text-primary hover:underline text-[11px]">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 text-xs pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-semibold gap-1.5 bg-primary text-primary-foreground shadow-md hover:opacity-95"
              disabled={isLoading}
            >
              <span>{isLoading ? "Authenticating..." : mode === "signin" ? "Sign In to Workspaces" : "Create Free Account"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>

          {/* Bottom Switcher */}
          <div className="text-center text-xs text-muted-foreground pt-1">
            <span>{mode === "signin" ? "Don't have an account? " : "Already have an account? "}</span>
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary hover:underline font-semibold"
            >
              {mode === "signin" ? "Create one free" : "Log in here"}
            </button>
          </div>
        </div>

        {/* Security Disclaimers */}
        <div className="text-[11px] text-muted-foreground text-center pt-8 border-t border-border/50">
          TLS 1.3 Encrypted · SOC2 Type II Certified · Zero-Log Privacy
        </div>
      </div>
    </div>
  );
}
