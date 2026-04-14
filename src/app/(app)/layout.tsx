'use client';

import { useState, useEffect, useRef } from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppBottomNav } from '@/components/layout/app-bottom-nav';

const SIDEBAR_EXPANDED = 256; // px — w-64
const SIDEBAR_COLLAPSED = 80;  // px — w-20
const LG_BREAKPOINT = 1024;    // px — Tailwind lg

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Detect desktop breakpoint
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

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Fixed sidebar */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main content — offset driven purely by JS, no Tailwind class toggling */}
      <main
        ref={mainRef}
        style={{
          paddingLeft: `${offset}px`,
          transition: 'padding-left 300ms ease',
          minHeight: '100vh',
        }}
      >
        <div style={{ minHeight: '100vh', paddingBottom: isDesktop ? 0 : '6rem' }}>
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <AppBottomNav />
    </div>
  );
}
