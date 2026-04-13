"use client";

import { motion } from "framer-motion";
import { Play, Flame, Users, Award } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
      {/* Background blobs */}
      <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left: Copy */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Educational Revolution</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-heading font-black leading-[0.95] mb-8 tracking-tighter">
            Learn.<br />
            Scroll.<br />
            <span className="text-shimmer">Grow.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted font-medium mb-12 max-w-lg leading-relaxed">
            The world&apos;s first addictive short-form learning ecosystem. Master any skill in 120-second bite-sized steps.
          </p>

          <div className="flex flex-col sm:flex-row gap-5">
            <button className="px-10 py-5 rounded-2xl bg-linear-to-r from-primary to-secondary text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/40 hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-3">
              <Play className="w-4 h-4 fill-current" />
              Start Learning
            </button>
            <button className="px-10 py-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3">
              <Users className="w-4 h-4" />
              Become a Tutor
            </button>
          </div>
        </motion.div>

        {/* Right: Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative perspective-[1000px] hidden lg:flex justify-center"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-[320px] h-[640px] rounded-[3.5rem] border-[12px] border-white/5 bg-black shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Screen Content */}
            <div className="absolute inset-0 flex flex-col">
              <div className="h-[40%] bg-surface flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-black" />
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white fill-current" />
                </div>
              </div>
              <div className="flex-1 p-6 space-y-4">
                <div className="w-3/4 h-4 bg-white/10 rounded-full" />
                <div className="w-1/2 h-4 bg-white/5 rounded-full" />
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="aspect-square bg-white/5 rounded-3xl" />
                  <div className="aspect-square bg-white/5 rounded-3xl" />
                </div>
              </div>
            </div>

            {/* Floating Streak Badge */}
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-20 -right-20 p-4 rounded-2xl glass shadow-2xl z-20 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest italic">+12 Day Streak</span>
            </motion.div>

            {/* Floating Achievement Badge */}
            <motion.div
              animate={{ x: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute bottom-40 -left-20 p-4 rounded-2xl glass shadow-2xl z-20 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest italic">UI Design Mastered</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
