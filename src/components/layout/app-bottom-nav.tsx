'use client';

import { Home, Search, Library, User, LogOut, LayoutGrid, Bell, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoutModal } from '@/components/auth/logout-modal';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Primary tabs — always visible in the bar
const primaryItems = [
  { name: 'Home', href: '/app', icon: Home },
  { name: 'Search', href: '/explore', icon: Search },
  { name: 'Library', href: '/library', icon: Library },
  { name: 'Profile', href: '/profile', icon: User },
];

// Secondary items — in the "More" drawer
const moreItems = [
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppBottomNav() {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure we're on the client before using createPortal
  useEffect(() => { setMounted(true); }, []);

  const drawer = (
    <AnimatePresence>
      {showMore && (
        <>
          {/* Backdrop — portalled to body, escapes all stacking contexts */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9998 }}
            onClick={() => setShowMore(false)}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 56,
              left: 0,
              right: 0,
              background: 'rgba(14,14,14,0.98)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px 24px 0 0',
              zIndex: 9999,
              padding: '24px 24px 32px',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Handle */}
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 99, margin: '0 auto 24px' }} />

            <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
              More Pages
            </p>

            <div>
              {moreItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 16px',
                      borderRadius: 16,
                      marginBottom: 4,
                      color: isActive ? 'var(--color-primary, #7c3aed)' : 'rgba(255,255,255,0.5)',
                      background: isActive ? 'rgba(124,58,237,0.1)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <item.icon style={{ width: 20, height: 20, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}

              {/* Logout */}
              <button
                onClick={() => { setShowMore(false); setShowLogoutModal(true); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '14px 16px',
                  borderRadius: 16,
                  width: '100%',
                  color: 'rgba(239,68,68,0.6)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginTop: 8,
                }}
              >
                <LogOut style={{ width: 20, height: 20, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Logout
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Portal the drawer/backdrop to document.body to escape stacking contexts */}
      {mounted && createPortal(drawer, document.body)}

      {/* Bottom Nav Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0a0a0a]/90 backdrop-blur-3xl border-t border-white/5 px-6 z-[100] flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        {primaryItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex items-center justify-center flex-1 h-full"
            >
              <div className={`transition-all duration-300 ${isActive ? 'scale-125 text-primary' : 'text-muted hover:text-white'}`}>
                <item.icon className="w-5 h-5" />
              </div>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full"
                />
              )}
            </Link>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={`relative flex items-center justify-center flex-1 h-full transition-all duration-300 ${showMore ? 'text-primary scale-125' : 'text-muted'}`}
        >
          {showMore ? <X className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
        </button>
      </nav>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
}
