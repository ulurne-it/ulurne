"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const HIGHLIGHTS = [
  { title: "Precision Algorithm", desc: "Our AI maps your knowledge gaps and serves exact lessons to fill them." },
  { title: "Social Streaks", desc: "Compete with friends and maintain study streaks for real rewards." },
  { title: "One-Tap Tutor", desc: "Need help? One tap connects you to a live student mentor instantly." },
];

export function AppShowcase() {
  return (
    <section className="py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Left: Feature List */}
        <div>
          <SectionHeading
            badge="Interactive Demo"
            title="Swipe to learn something new."
            subtitle="Experience education that flows like a social feed. Just swipe up for the next module."
            centered={false}
          />

          <div className="space-y-8">
            {HIGHLIGHTS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6"
              >
                <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2 font-heading tracking-tight">{item.title}</h4>
                  <p className="text-muted text-sm font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Phone Mockup with Swipe Animation */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

          <motion.div
            initial={{ rotate: -5 }}
            whileInView={{ rotate: 0 }}
            className="relative w-[300px] h-[580px] rounded-[3.5rem] border-[10px] border-white/10 bg-black shadow-2xl overflow-hidden"
          >
            {/* Tabs */}
            <div className="absolute top-10 left-0 w-full px-6 flex justify-between items-center z-20">
              <span className="text-xs font-black uppercase tracking-widest text-[#00D4FF]">For You</span>
              <span className="text-xs font-black uppercase tracking-widest opacity-40">Following</span>
            </div>

            {/* Scrolling Reel Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
              <motion.div
                animate={{ y: [0, -400] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                className="space-y-4"
              >
                <div className="text-xs font-bold text-emerald-400">@DevCoach UI Design</div>
                <h3 className="text-lg font-black leading-tight">Mastering Auto-Layout in 60s...</h3>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10" />
                  <div className="w-8 h-8 rounded-full bg-white/10" />
                </div>
              </motion.div>
            </div>

            {/* Background Gradient */}
            <div className="absolute inset-0 bg-linear-to-b from-primary/20 via-surface to-black" />
          </motion.div>

          {/* Swipe Gesture Indicator */}
          <motion.div
            animate={{ y: [200, 50], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-40 right-40 w-12 h-12 rounded-full border-2 border-primary z-50 flex items-center justify-center"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
