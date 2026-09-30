import { HeroHeader } from "./_components/HeroHeader";
import { HeroFooter } from "./_components/HeroFooter";
import { Hero } from "./_components/Hero";
import { LiveDemo } from "./_components/LiveDemo";
import { HowItWorks } from "./_components/HowItWorks";
import { Features } from "./_components/Features";
import { Frameworks } from "./_components/Frameworks";
import { Testimonials } from "./_components/Testimonials";
import { Faq } from "./_components/Faq";
import { CtaBanner } from "./_components/CtaBanner";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Production SaaS Global Header */}
      <HeroHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Live Interactive Product IDE Demo */}
        <LiveDemo />

        {/* Structured 3-Step Autonomous Lifecycle */}
        <HowItWorks />

        {/* Core Architecture Features Bento Grid */}
        <Features />

        {/* Strict Single-Stack Isolation Showcase */}
        <Frameworks />

        {/* Social Proof & Testimonials */}
        <Testimonials />

        {/* Developer Technical FAQ */}
        <Faq />

        {/* Call to Action Banner */}
        <CtaBanner />
      </main>

      {/* Production Global Footer */}
      <HeroFooter />
    </div>
  );
}
