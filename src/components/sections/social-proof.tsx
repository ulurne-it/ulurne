"use client";

import { motion } from "framer-motion";
import { Users, Play, GraduationCap } from "lucide-react";

const STATS = [
  { label: "Active Students", value: "50K+", icon: Users },
  { label: "Bite-sized Lessons", value: "10K+", icon: Play },
  { label: "Verified Tutors", value: "500+", icon: GraduationCap },
];

export function SocialProof() {
  return (
    <section className="py-20 border-y border-white/5 bg-surface/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        {STATS.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group hover:scale-110 transition-transform">
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-4xl font-heading font-black mb-1">{stat.value}</div>
              <div className="text-[10px] uppercase font-black tracking-[0.3em] text-muted">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
