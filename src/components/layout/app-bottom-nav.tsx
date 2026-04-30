'use client';

import { Home, Search, Library, User, LogOut, LayoutGrid, Bell, Settings, X, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoutModal } from '@/components/auth/logout-modal';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNotifications } from '@/hooks/use-notifications';

const navItems = [
  { name: 'Home', href: '/app', icon: Home },
  { name: 'Search', href: '/explore', icon: Search },
  { name: 'Plus', href: '/create', icon: PlusCircle, isSpecial: true },
  { name: 'Library', href: '/library', icon: Library },
  { name: 'Profile', href: '/profile', icon: User },
];

const drawerItems = [
  { name: 'Notifications', href: '/notifications', icon: Bell, isNotification: true },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppBottomNav() {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { unreadCount } = useNotifications();

  useEffect(() => { setMounted(true); }, []);

  const drawer = (
    <AnimatePresence>
      {showMore && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowMore(false)}
          />

          <motion.div
            key="drawer"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-16 right-4 w-48 bg-[#12121a]/95 backdrop-blur-3xl border border-white/10 rounded-2xl z-[9999] p-2 shadow-2xl overflow-hidden origin-bottom-right"
          >
            {/* Subtle Gradient Glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
            
            <div className="flex flex-col gap-1">
              {drawerItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5 active:scale-95'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span className="font-heading font-black text-[10px] uppercase tracking-widest">{item.name}</span>
                    </div>
                    {item.isNotification && unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-black">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="h-px bg-white/5 my-1" />

              <button
                onClick={() => { setShowMore(false); setShowLogoutModal(true); }}
                className="flex items-center gap-3 p-3 rounded-xl text-red-500/60 hover:bg-red-500/5 active:scale-95 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-heading font-black text-[10px] uppercase tracking-widest">Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {mounted && createPortal(drawer, document.body)}

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100]">
        <nav className="flex items-center justify-around h-14 bg-[#0a0a0f]/90 backdrop-blur-2xl border-t border-white/5 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] relative px-4">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            if (item.isSpecial) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative z-10"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isActive ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-white/5 border border-white/10 active:bg-white/10'
                    }`}
                  >
                    <PlusCircle className="w-5 h-5 text-white" />
                  </motion.div>
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative flex flex-col items-center justify-center w-10 h-full transition-all duration-300 group"
              >
                <div className={`transition-all duration-300 ${isActive ? 'scale-110 text-primary' : 'text-muted-foreground group-hover:text-white'}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                {isActive && (
                  <motion.div
                    layoutId="active-dot"
                    className="absolute bottom-1.5 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </Link>
            );
          })}

          <button
            onClick={() => setShowMore(!showMore)}
            className={`relative flex items-center justify-center w-10 h-full transition-all duration-300 ${
              showMore ? 'text-primary scale-110' : 'text-muted-foreground hover:text-white'
            }`}
          >
            {showMore ? <X className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
            {!showMore && unreadCount > 0 && (
              <span className="absolute top-3 right-2 w-2 h-2 bg-red-500 rounded-full border border-black" />
            )}
          </button>
        </nav>
      </div>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
}
