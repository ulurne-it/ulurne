"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const QUESTIONS = [
  {
    q: "Is ULurne free to use for students?",
    a: "Yes! Our core video learning feed is 100% free. We believe education should be accessible to every student with a smartphone.",
  },
  {
    q: "How do I become a tutor and earn money?",
    a: "Top students with proven academic performance can apply. Once verified, you can upload lessons and earn through course sales and tips.",
  },
  {
    q: "Can I use ULurne without an internet connection?",
    a: "With ULurne Pro, you can download modules and watch them offline, perfect for saving data or learning on the go.",
  },
  {
    q: "What universities do you support?",
    a: "We are currently launching across major Nigerian universities (FUTA, Unilag, UI, OAU) with plans to expand across Africa rapidly.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="py-32 px-6 bg-surface/10">
      <div className="max-w-4xl mx-auto">
        <SectionHeading
          badge="Support"
          title="Frequently Asked."
          subtitle="Everything you need to know about the ULurne ecosystem."
        />

        <div className="space-y-4">
          {QUESTIONS.map((item, i) => (
            <div key={i} className="rounded-3xl border border-white/5 bg-surface/50 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full px-8 py-6 flex items-center justify-between text-left transition-colors hover:bg-surface"
              >
                <span className="font-bold font-heading text-lg">{item.q}</span>
                <ChevronDown className={cn("w-5 h-5 transition-transform shrink-0 ml-4", open === i && "rotate-180 text-primary")} />
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-8 pb-6 text-muted font-medium leading-relaxed"
                  >
                    {item.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
