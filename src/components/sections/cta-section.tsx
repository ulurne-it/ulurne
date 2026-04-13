"use client";

import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-32 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="max-w-7xl mx-auto rounded-[4rem] bg-linear-to-br from-primary to-secondary p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20"
      >
        {/* Glow blob */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-[100px] rounded-full" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-heading font-black mb-8 leading-tight">
            Ready to Master Your Future?
          </h2>
          <p className="text-lg md:text-xl font-medium mb-12 opacity-80 leading-relaxed">
            Join 50,000+ students already growing with ULurne. Experience education that feels like play.
          </p>

          <form className="flex flex-col md:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your student email"
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-8 py-5 text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all font-bold"
            />
            <button
              type="submit"
              className="bg-white text-primary px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-2xl"
            >
              Get Early Access
            </button>
          </form>

          <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic">
            Coming to iOS and Android Summer 2026
          </p>
        </div>
      </motion.div>
    </section>
  );
}
