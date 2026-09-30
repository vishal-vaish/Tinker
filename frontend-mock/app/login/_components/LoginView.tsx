"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/global/Logo";
import { LoginForm } from "@/components/forms/LoginForm";
import { SignUpForm } from "@/components/forms/SignUpForm";

export function LoginView() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background text-foreground relative overflow-hidden select-none p-6">
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

      {/* Main Centered Authentication Container */}
      <div className="w-full max-w-md relative my-auto">
        {/* Glassmorphic Card */}
        <Card className="border border-white/10 bg-card/60 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-3xl relative">
          {/* Top metallic shimmer rim */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <CardHeader className="space-y-2 text-center pt-8 pb-4">
            <div className="mx-auto flex items-center justify-center mb-1">
              <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition">
                <Logo size={42} />
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
              {mode === "signin"
                ? "Enter your credentials to access your workspace"
                : "Start building fullstack applications in minutes"}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-6">
            {mode === "signin" ? (
              <LoginForm onSwitchToSignUp={() => setMode("signup")} />
            ) : (
              <SignUpForm onSwitchToSignIn={() => setMode("signin")} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Clean Legal & Security Footer */}
      <footer className="w-full text-center text-[11px] text-muted-foreground/75 py-4 mt-auto">
        <span>
          Secured with enterprise-grade encryption ·{" "}
          <a href="#" className="hover:text-foreground underline underline-offset-2 transition-colors">
            Terms of Service
          </a>{" "}
          ·{" "}
          <a href="#" className="hover:text-foreground underline underline-offset-2 transition-colors">
            Privacy Policy
          </a>
        </span>
      </footer>
    </div>
  );
}
