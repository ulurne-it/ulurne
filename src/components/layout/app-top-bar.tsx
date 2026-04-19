'use client';

import { Bell, Search, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppSelector } from '@/store/hooks';

interface AppTopBarProps {
  offset?: number;
}

export function AppTopBar({ offset = 0 }: AppTopBarProps) {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header 
      className="fixed top-0 right-0 h-16 z-40 px-0 transition-all duration-300"
      style={{ left: `${offset}px` }}
    >
      <div className="h-full flex items-center justify-between bg-[#0a0a0f]/60 backdrop-blur-2xl border-b border-white/5 px-6 shadow-xl">
        {/* Left Section: Logo (Mobile only) or Search (Desktop) */}
        <div className="flex items-center gap-4">
          <Link href="/app" className="flex lg:hidden items-center gap-2">
            <div className="relative shrink-0 p-1 rounded-lg bg-linear-to-br from-primary/20 to-secondary/20 border border-white/10">
              <Image
                src="/logos/logo.png"
                alt="ULurne"
                width={24}
                height={24}
                priority
                className="object-contain"
              />
            </div>
            <span className="font-heading font-black text-xs tracking-tighter uppercase italic text-shimmer">
              ULurne
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl w-64 focus-within:w-80 focus-within:border-primary/50 transition-all">
            <Search className="w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search courses, tutors..." 
              className="bg-transparent border-none outline-none text-xs font-medium placeholder:text-muted/50 w-full"
            />
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2">
          <button className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <Search className="w-4 h-4 text-muted hover:text-white" />
          </button>
          
          <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors relative group">
            <Bell className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          </button>

          <div className="h-6 w-px bg-white/10 mx-2 hidden lg:block" />

          {/* User Profile */}
          <Link href="/profile" className="flex items-center gap-2.5 hover:bg-white/5 p-1 rounded-xl transition-all group">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary/20 group-hover:scale-105 transition-all">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-0.5">
                {user?.user_metadata.full_name?.split(' ')[0] || 'Member'}
              </p>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                <p className="text-[8px] text-muted-foreground font-medium leading-none opacity-60">
                   Lvl. 12
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
