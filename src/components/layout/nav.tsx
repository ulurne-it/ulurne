'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, LogOut, User, Menu, X, ChevronRight, BookOpen, Users, Star } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { LogoutModal } from '@/components/auth/logout-modal';
import { usePathname } from 'next/navigation';

export function Nav() {
  const { user } = useAppSelector((state) => state.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const navLinks = [
    { name: 'Courses', href: '/#courses', icon: BookOpen },
    { name: 'Tutors', href: '/#tutors', icon: Users },
    { name: 'Features', href: '/#features', icon: Star },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-[60] border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer relative z-[70]">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-heading font-black tracking-tighter uppercase italic">ULurne</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[11px] font-black uppercase tracking-[0.2em] text-muted hover:text-primary transition-all hover:translate-y-[-1px]"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 relative z-[70]">
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 group hover:border-primary/30 transition-colors">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-black uppercase tracking-widest truncate max-w-[120px]">
                    {user.user_metadata.full_name || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-white/5 transition-all active:scale-95 group"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/login"
                  className="text-xs font-black uppercase tracking-[0.2em] text-muted hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  Join Now
                </Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-white active:scale-90 transition-all"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Moved outside for full height */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-[55] lg:hidden bg-[#0a0a0a] pt-32 px-6 flex flex-col"
          >
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-full h-full bg-primary/5 blur-[120px] pointer-events-none" />
            
            <div className="space-y-10 relative z-10 overflow-y-auto pb-20">
              <div className="grid gap-3">
                {navLinks.map((link, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={link.name}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all group active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                          <link.icon className="w-6 h-6" />
                        </div>
                        <span className="text-base font-black uppercase tracking-[0.1em]">{link.name}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted group-hover:text-white transition-all group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-4 pt-4">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-2xl shadow-lg">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-sm font-black uppercase tracking-widest truncate">
                          {user.user_metadata.full_name || 'Member'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate opacity-60">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full py-5 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <Link
                      href="/login"
                      className="w-full py-5 rounded-2xl bg-white/5 border border-white/5 font-black uppercase tracking-widest text-xs text-center active:scale-95 transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="w-full py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs text-center shadow-xl shadow-primary/20 active:scale-95 transition-all"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto py-8 text-center border-t border-white/5 bg-gradient-to-t from-[#0a0a0a] to-transparent">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                ULurne Academy &bull; Est. 2026
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
}
