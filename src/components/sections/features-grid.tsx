"use client";

import { motion } from "framer-motion";
import { Clock, Zap, Award, GraduationCap, Download, Shield, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const FEATURES = [
  { title: "120-Second Lessons", desc: "Max density learning for the TikTok generation.", icon: Clock, span: "col-span-1 md:col-span-2", bg: "from-indigo-500/10" },
  { title: "AI-Powered Feed", desc: "Personalized algorithm that actually makes you smarter.", icon: Zap, span: "col-span-1", bg: "from-purple-500/10" },
  { title: "Earn While You Learn", desc: "Top students get paid to tutor others in real-time.", icon: Award, span: "col-span-1", bg: "from-emerald-500/10" },
  { title: "Expert Tutors", desc: "Courses from 500+ top university performers.", icon: GraduationCap, span: "col-span-1 md:col-span-2", bg: "from-orange-500/10" },
  { title: "Offline Mode", desc: "Download lessons to learn without internet data.", icon: Download, span: "col-span-1", bg: "from-blue-500/10" },
  { title: "Verified Certificates", desc: "Shareable blockchain-verified skill badges.", icon: Shield, span: "col-span-1", bg: "from-pink-500/10" },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-32 px-6 bg-surface/20">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          badge="Features"
          title="Not your typical LMS."
          subtitle="Everything we build is designed to minimize friction and maximize dopamine for growth."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, scale: 1.02 }}
              className={cn(
                "p-8 rounded-[2.5rem] bg-surface/40 border border-white/5 relative overflow-hidden flex flex-col justify-between group h-full",
                feat.span
              )}
            >
              <div className={cn("absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity", feat.bg)} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  <feat.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-heading tracking-tight">{feat.title}</h3>
                <p className="text-muted leading-relaxed font-medium">{feat.desc}</p>
              </div>
              <div className="relative z-10 pt-10">
                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-primary flex items-center gap-2 transition-colors">
                  Discover More <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
