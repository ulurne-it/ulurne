"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    desc: "For casual learners",
    perks: ["Daily Video Feed", "Public Quizzes", "3 Downloads/mo"],
    current: false,
  },
  {
    name: "Pro",
    price: "$12",
    desc: "For dedicated students",
    perks: ["Infinite Feed Access", "Exclusive Courses", "Unlimited Downloads", "Priority Peer Chat"],
    current: true,
  },
  {
    name: "Tutor",
    price: "Free*",
    desc: "For high achievers",
    perks: ["Course Creator Tools", "Earning Dashboard", "Profile Verification", "Zero Platform Fees"],
    current: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          badge="Plans"
          title="Built for every student."
          subtitle="Unlock your potential with plans that scale with your hunger for knowledge."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TIERS.map((tier, i) => (
            <motion.div
              key={i}
              className={cn(
                "p-10 rounded-[2.5rem] border flex flex-col justify-between relative overflow-hidden h-[500px]",
                tier.current
                  ? "bg-primary text-white border-transparent scale-105 shadow-2xl z-10"
                  : "bg-surface/50 text-foreground border-white/5"
              )}
            >
              {tier.current && (
                <div className="absolute top-6 right-6 px-3 py-1 bg-white/20 rounded-full text-[8px] font-black uppercase tracking-widest">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-black uppercase tracking-widest mb-2 italic">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-black font-heading tracking-tighter">{tier.price}</span>
                  <span className={cn("text-xs font-bold", tier.current ? "opacity-60" : "text-muted")}>/month</span>
                </div>
                <p className={cn("text-sm font-medium mb-10", tier.current ? "opacity-80" : "text-muted")}>
                  {tier.desc}
                </p>

                <ul className="space-y-4">
                  {tier.perks.map((perk, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-bold">
                      <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", tier.current ? "bg-white/20" : "bg-primary/20")}>
                        <Check className={cn("w-2 h-2", tier.current ? "text-white" : "text-primary")} />
                      </div>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={cn(
                  "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                  tier.current
                    ? "bg-white text-primary hover:bg-white/90 shadow-xl"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                )}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
