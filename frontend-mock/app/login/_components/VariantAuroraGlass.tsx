"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Mail, Lock, Eye, EyeOff, Sparkles, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/global/Logo";
import { LOGIN_AURORA_STATS } from "@/lib/mock-data";

export function VariantAuroraGlass() {
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
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground relative overflow-hidden">
      {/* Full-Screen Multi-Colored Fluid Aurora Mesh Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Top-left Cyan Flare */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[140px] opacity-70" />
        
        {/* Center Violet / Indigo Bloom */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-primary/30 via-violet-600/25 to-fuchsia-500/20 rounded-full blur-[150px] opacity-80" />
        
        {/* Bottom-right Emerald Flare */}
        <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] bg-emerald-500/15 rounded-full blur-[130px] opacity-60" />

        {/* Engineering dot matrix pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_80%,transparent_100%)]" />
      </div>

      {/* Top Header */}
      <header className="h-16 px-6 max-w-6xl w-full mx-auto flex items-center justify-between select-none">
        <Link href="/" className="flex items-center gap-2.5 font-mono font-bold text-foreground hover:opacity-90 transition">
          <Logo size={32} />
          <span className="tracking-tight text-base font-extrabold bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
            TINKER
          </span>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground hidden sm:inline">
            {mode === "signin" ? "Need an account?" : "Have an account?"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-xs h-8 px-3 rounded-full hover:bg-card/60"
          >
            {mode === "signin" ? "Sign Up" : "Log In"}
          </Button>
        </div>
      </header>

      {/* Center Floating Glassmorphic Card */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-md space-y-5">
          <Card className="border border-white/10 bg-card/60 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-3xl relative">
            {/* Top metallic shimmer rim */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <CardHeader className="space-y-2 text-center pt-8 pb-4">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-violet-500/20 border border-primary/30 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-2xl font-extrabold tracking-tight">
                {mode === "signin" ? "Access Tinker Studio" : "Start Building on Tinker"}
              </CardTitle>
              <CardDescription className="text-xs max-w-xs mx-auto">
                {mode === "signin"
                  ? "Local-first autonomous development in your browser."
                  : "Zero cloud cold starts. Instant WebContainer compilation."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 px-6 sm:px-8">
              {/* OAuth Providers */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full justify-center gap-2 font-normal h-10 border-border/80 bg-background/50 hover:bg-muted/70 rounded-xl"
                  onClick={() => handleOAuthLogin("github")}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-center gap-2 font-normal h-10 border-border/80 bg-background/50 hover:bg-muted/70 rounded-xl"
                  onClick={() => handleOAuthLogin("google")}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </Button>
              </div>

              {/* Separator */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-border/80" />
                <span className="flex-shrink mx-3 text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                  or email
                </span>
                <div className="flex-grow border-t border-border/80" />
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 text-xs bg-background/50 rounded-xl"
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
                      className="h-10 text-xs pr-9 bg-background/50 rounded-xl"
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
                  className="w-full h-11 font-semibold gap-2 bg-gradient-to-r from-primary via-indigo-600 to-cyan-600 text-white rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transition-all"
                  disabled={isLoading}
                >
                  <span>{isLoading ? "Authenticating..." : mode === "signin" ? "Sign In" : "Get Started"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>

            <CardFooter className="pb-6 pt-2 flex flex-col space-y-3 text-center border-t border-border/40">
              <a href="#" className="text-[11px] text-muted-foreground hover:text-foreground transition flex items-center justify-center gap-1 font-mono">
                <KeyRound className="w-3 h-3 text-primary" />
                <span>Sign in with Enterprise SAML SSO</span>
              </a>
            </CardFooter>
          </Card>

          {/* Trust Stat Strip */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 text-[11px] font-mono text-muted-foreground py-2 flex-wrap">
            {LOGIN_AURORA_STATS.map((stat, idx) => (
              <span key={stat} className="flex items-center gap-4 sm:gap-6">
                <span>{stat}</span>
                {idx < LOGIN_AURORA_STATS.length - 1 && <span className="text-muted-foreground/40">•</span>}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 px-6 text-center text-[11px] text-muted-foreground flex items-center justify-center border-t border-border/40 backdrop-blur-md">
        <span>Protected by on-device PathJail isolation · Zero telemetry</span>
      </footer>
    </div>
  );
}
