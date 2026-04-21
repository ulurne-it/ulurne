'use client';

import { useState } from 'react';
import { UserSearch } from '@/components/sections/user-search';
import { SuggestedUsers } from '@/components/sections/suggested-users';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, BookOpen, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { id: 'members', name: 'Members', icon: Users, active: true },
  { id: 'videos', name: 'Videos', icon: Play, active: false },
  { id: 'courses', name: 'Courses', icon: BookOpen, active: false },
];

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('members');

  return (
    <div className="relative min-h-[calc(100vh-80px)] pb-20">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/5 blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 pt-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black font-heading uppercase italic tracking-tighter leading-none"
          >
            Explore <span className="text-primary italic">Academy</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground uppercase text-[10px] font-black tracking-[0.4em]"
          >
            Discover the future of social learning
          </motion.p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] w-fit mx-auto backdrop-blur-xl">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => cat.active && setActiveCategory(cat.id)}
              disabled={!cat.active}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${
                activeCategory === cat.id
                  ? 'text-white cursor-default'
                  : cat.active 
                    ? 'text-muted-foreground hover:text-white hover:bg-white/5 cursor-pointer' 
                    : 'text-white/10 cursor-not-allowed'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.name}
              {activeCategory === cat.id && (
                <motion.div
                  layoutId="active-cat-tab"
                  className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl -z-10 shadow-xl"
                />
              )}
            </button>
          ))}
        </div>

        {/* Search Implementation */}
        <div className="pt-4 space-y-24">
          {/* Main Search Area */}
          <section className="max-w-3xl mx-auto w-full">
            <UserSearch />
          </section>

          {/* Suggested Members Section (Integrated) */}
          <section className="max-w-4xl mx-auto w-full pt-12 border-t border-white/5">
            <div className="mb-10 text-center">
              <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-primary flex items-center justify-center gap-3">
                <Sparkles className="w-4 h-4" />
                Recommended for your network
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {activeCategory === 'members' && <SuggestedUsers />}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
