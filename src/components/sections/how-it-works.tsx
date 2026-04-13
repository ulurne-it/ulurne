"use client";

import { motion } from "framer-motion";
import { Smartphone, MessageCircle, Award } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const STEPS = [
  { title: "Watch", desc: "Short 60-120s vertical videos that explain complex concepts simply.", icon: Smartphone },
  { title: "Engage", desc: "Answer real-time quizzes and join discussions with other learners.", icon: MessageCircle },
  { title: "Master", desc: "Gain certifications and unlock career-ready skills while gaming your growth.", icon: Award },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          badge="Mechanism"
          title="Education engineered for focus."
          subtitle="We borrow psychology from TikTok and Pinduoduo to make learning as addictive as gaming."
        />

        <div className="relative">
          {/* Horizontal Timeline Line */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 hidden lg:block -translate-y-1/2" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative z-10">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-3xl bg-surface border border-white/10 flex items-center justify-center mb-8 shadow-2xl group-hover:bg-primary transition-colors duration-500 group-hover:scale-110">
                  <step.icon className="w-8 h-8 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-heading">{step.title}</h3>
                <p className="text-muted leading-relaxed font-medium">{step.desc}</p>
                <div className="mt-8 text-6xl font-black text-white/5 select-none">{i + 1}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
