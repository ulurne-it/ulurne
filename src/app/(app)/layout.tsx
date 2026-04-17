'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppBottomNav } from '@/components/layout/app-bottom-nav';
import { AppTopBar } from '@/components/layout/app-top-bar';

const SIDEBAR_EXPANDED = 256;
const SIDEBAR_COLLAPSED = 80;
const LG_BREAKPOINT = 1024;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Track desktop breakpoint
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const offset = isDesktop
    ? (isSidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED)
    : 0;

  // Show spinner while checking session or during redirect
  if (loading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white overflow-hidden">
      {/* Top Bar — now overlays the content for an immersive feel */}
      <AppTopBar offset={offset} />

      {/* Fixed sidebar */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main content — immersive by default */}
      <main
        style={{
          paddingLeft: `${offset}px`,
          transition: 'padding-left 300ms ease',
          height: '100vh',
        }}
        className="relative"
      >
        <div className="h-full">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <AppBottomNav />
    </div>
  );
}
