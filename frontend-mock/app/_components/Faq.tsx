"use client";

import { FAQS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export function Faq() {
  return (
    <section id="faq" className="py-24 px-6 max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/35 bg-gradient-to-r from-indigo-500/15 via-primary/10 to-blue-500/15 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.2)] text-indigo-300 text-xs font-mono font-medium">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Everything you need to know about Tinker&apos;s autonomous execution engine, WebContainer sandboxing, and Agentation integration.
        </p>
      </div>

      {/* Accordion List */}
      <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-lg">
        <Accordion className="w-full">
          {FAQS.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/60 py-2">
              <AccordionTrigger className="text-sm sm:text-base font-semibold text-foreground hover:text-primary transition text-left py-3">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
