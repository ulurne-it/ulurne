"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  badge: string;
  title: string;
  subtitle: string;
  centered?: boolean;
}

export function SectionHeading({ badge, title, subtitle, centered = true }: SectionHeadingProps) {
  return (
    <div className={cn("mb-16", centered ? "text-center" : "text-left")}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4"
      >
        <Zap className="w-3 h-3 fill-current" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{badge}</span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-4xl md:text-5xl font-heading font-bold mb-6"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-muted text-lg max-w-2xl font-medium leading-relaxed"
        style={{ margin: centered ? "0 auto" : "0" }}
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
