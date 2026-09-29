"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Mail, Lock, Eye, EyeOff, Terminal, Cpu, Database, Binary } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/global/Logo";

export function VariantBlueprint() {
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
    <div className="min-h-screen flex flex-col justify-between bg-[#070a11] text-foreground relative selection:bg-cyan-500/20 font-mono">
      {/* Background Architectural Blueprint Grid & Circuit Traces */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Engineering Isometric Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Subtle Diagonal Technical Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#06b6d405_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Ambient Top Glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Top Header */}
      <header className="h-16 px-6 max-w-6xl w-full mx-auto flex items-center justify-between border-b border-cyan-900/30">
        <Link href="/" className="flex items-center gap-2.5 font-mono font-bold text-foreground">
          <Logo size={28} />
          <span className="tracking-tight text-base font-bold text-white">TINKER</span>
          <span className="text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
            BLUEPRINT ARCHITECTURE
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-cyan-400/60 text-[11px] hidden sm:inline">SYS:ONLINE</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-xs h-8 text-cyan-300 hover:text-white hover:bg-cyan-950/40 border border-cyan-900/40"
          >
            {mode === "signin" ? "CREATE ACCESS" : "SIGN IN"}
          </Button>
        </div>
      </header>

      {/* Center Dual-Panel Technical Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl rounded-2xl border border-cyan-500/30 bg-[#0b101c]/90 shadow-[0_0_40px_rgba(6,182,212,0.1)] overflow-hidden grid grid-cols-1 md:grid-cols-12 backdrop-blur-xl">
          {/* Left Panel: Telemetry & Spec Summary (5 cols on md) */}
          <div className="md:col-span-5 p-6 border-b md:border-b-0 md:border-r border-cyan-900/40 bg-cyan-950/20 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 text-xs">
                <Terminal className="w-4 h-4" />
                <span className="font-bold">SYSTEM INTEGRITY</span>
              </div>

              <div className="space-y-3 text-[11px]">
                <div className="p-3 rounded-lg bg-black/40 border border-cyan-900/40 space-y-1">
                  <div className="text-muted-foreground flex items-center justify-between">
                    <span>MICROVM ENCLAVE</span>
                    <span className="text-emerald-400">ACTIVE</span>
                  </div>
                  <div className="text-white font-bold">Wasm Node v22.12.0</div>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-cyan-900/40 space-y-1">
                  <div className="text-muted-foreground flex items-center justify-between">
                    <span>PATHJAIL SANDBOX</span>
                    <span className="text-cyan-400">LOCKED</span>
                  </div>
                  <div className="text-white font-bold">PostgreSQL v16.3 Isolated</div>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-cyan-900/40 space-y-1">
                  <div className="text-muted-foreground flex items-center justify-between">
                    <span>LOCAL INFERENCE</span>
                    <span className="text-violet-400">READY</span>
                  </div>
                  <div className="text-white font-bold">Ollama Gemma 4 / Qwen</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-cyan-900/40 space-y-1 text-[10px] text-cyan-400/80">
              <div className="flex items-center justify-between">
                <span>SESSION HASH:</span>
                <span className="text-white">0x7A4C...9F12</span>
              </div>
              <div className="flex items-center justify-between">
                <span>TLS PROTOCOL:</span>
                <span className="text-white">TLS_AES_256_GCM</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Technical Login Form (7 cols on md) */}
          <div className="md:col-span-7 p-6 sm:p-8 space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white">
                {mode === "signin" ? "[AUTHENTICATE SESSION]" : "[INITIALIZE USER]"}
              </h2>
              <p className="text-xs text-muted-foreground font-sans">
                {mode === "signin"
                  ? "Enter access credentials to mount local project repositories."
                  : "Provision single-stack isolated workspace account."}
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="outline"
                className="w-full justify-center gap-2 text-xs h-9 border-cyan-900/50 bg-black/30 hover:bg-cyan-950/30 text-white"
                onClick={() => handleOAuthLogin("github")}
                disabled={isLoading}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GITHUB</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-center gap-2 text-xs h-9 border-cyan-900/50 bg-black/30 hover:bg-cyan-950/30 text-white"
                onClick={() => handleOAuthLogin("google")}
                disabled={isLoading}
              >
                <span>GOOGLE</span>
              </Button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-cyan-900/40" />
              <span className="flex-shrink mx-2 text-[10px] text-cyan-400/60 uppercase">OR EMAIL KEY</span>
              <div className="flex-grow border-t border-cyan-900/40" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] text-cyan-400">USER_EMAIL</label>
                <Input
                  type="email"
                  placeholder="engineer@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-9 text-xs bg-black/40 border-cyan-900/50 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-cyan-400">AUTH_PASSWORD</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-9 text-xs pr-9 bg-black/40 border-cyan-900/50 text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-400/60 hover:text-cyan-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-bold gap-2 bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all font-mono"
                disabled={isLoading}
              >
                <span>{isLoading ? "VERIFYING..." : mode === "signin" ? "EXECUTE AUTHENTICATION" : "REGISTER WORKSPACE"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 px-6 text-center text-[10px] text-cyan-400/60 flex items-center justify-center border-t border-cyan-900/30">
        PATHJAIL ENCLAVE · SHA-256 SIGNED · RUNTIME REPRODUCIBILITY GUARANTEE
      </footer>
    </div>
  );
}
