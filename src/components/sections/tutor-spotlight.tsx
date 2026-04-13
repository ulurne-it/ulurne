"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const TUTORS = [
  { name: "John Doe", school: "FUTA", subject: "Quantum Physics", rating: 4.9, initials: "JD" },
  { name: "Sarah Smith", school: "Unilag", subject: "UX Design", rating: 4.8, initials: "SS" },
  { name: "Isaac Newton", school: "UI", subject: "Calculus", rating: 5.0, initials: "IN" },
  { name: "Ada Lovelace", school: "OAU", subject: "Algorithms", rating: 4.9, initials: "AL" },
];

export function TutorSpotlight() {
  return (
    <section id="tutors" className="py-20 px-6 overflow-hidden">
      <SectionHeading
        badge="Elite Network"
        title="Learn from the top 1%."
        subtitle="Curated tutors from Africa's leading universities teaching what they mastered."
      />

      <div className="flex gap-8 overflow-x-auto no-scrollbar pb-10 px-4">
        {TUTORS.map((tutor, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            className="min-w-[280px] p-6 rounded-[2rem] bg-surface/50 border border-white/5 flex flex-col items-center text-center gap-4 transition-all hover:bg-surface hover:border-primary/20"
          >
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl font-black text-primary">
              {tutor.initials}
            </div>

            {/* Info */}
            <div>
              <h4 className="text-xl font-bold font-heading">{tutor.name}</h4>
              <p className="text-[10px] uppercase font-black tracking-widest text-[#00D4FF] mb-2">{tutor.school}</p>
              <p className="text-muted text-sm font-medium">{tutor.subject}</p>
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-1 text-accent">
              {[...Array(5)].map((_, star) => (
                <Star
                  key={star}
                  className={cn("w-3 h-3 fill-current", star >= Math.floor(tutor.rating) && "opacity-20")}
                />
              ))}
              <span className="text-xs font-bold ml-1 text-white">{tutor.rating}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
