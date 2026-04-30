'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppBottomNav } from '@/components/layout/app-bottom-nav';
import { AppTopBar } from '@/components/layout/app-top-bar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const SIDEBAR_EXPANDED = 256;
const SIDEBAR_COLLAPSED = 80;
const LG_BREAKPOINT = 1024;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // 1. Guard: Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 2. Security Guard: Absolute MFA Enforcement
  useEffect(() => {
    async function checkMfa() {
      if (!user || loading) return;

      try {
         const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
         const { data: factors } = await supabase.auth.mfa.listFactors();
         const hasVerifiedFactor = factors?.all?.some(f => f.status === 'verified');
         
         const { data: settings } = await supabase
           .from('user_settings')
           .select('two_factor_enabled')
           .eq('user_id', user.id)
           .maybeSingle();

         const forceMfa = hasVerifiedFactor || settings?.two_factor_enabled === true;

         // IF forced AND not verified in THIS session, KICK THEM OUT
         if (forceMfa && aalData?.currentLevel !== 'aal2') {
           console.log('MFA GUARD: Access Blocked - Redirecting to Security Vault');
           router.push('/login?mfa=true');
           toast.info('Security Protocol: Verification Required');
         }
      } catch (err) {
         console.error('MFA Guard Error:', err);
      }
    }

    if (user && !loading) {
      checkMfa();
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
    <div className={`min-h-screen bg-background text-white ${pathname.startsWith('/app') ? 'h-screen overflow-hidden' : ''}`}>
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
        }}
        className="relative"
      >
        <div className={`h-full ${pathname.startsWith('/app') ? 'pt-0' : 'pt-16'}`}>
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <AppBottomNav />
    </div>
  );
}
