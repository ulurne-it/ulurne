'use client';

import { useState } from 'react';
import { Home, Compass, Library, User, Settings, LogOut, Bell, PanelLeftClose, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoutModal } from '@/components/auth/logout-modal';

const sidebarItems = [
  { name: 'Feed', href: '/app', icon: Home },
  { name: 'Explore', href: '/explore', icon: Compass },
  { name: 'Library', href: '/library', icon: Library },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Profile', href: '/profile', icon: User },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col h-screen fixed left-0 top-0 border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-2xl z-50 transition-all duration-500 shadow-2xl ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header with Toggle */}
        <div className={`flex items-center mb-4 h-16 px-4 border-b border-white/5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <Link href="/app" className="flex items-center gap-3 shrink-0">
            <div className="relative shrink-0 p-1.5 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20 border border-white/10 group-hover:scale-110 transition-all">
              <Image
                src="/logos/logo.png"
                alt="ULurne Logo"
                width={24}
                height={24}
              />
            </div>
            {!isCollapsed && (
              <span className="font-heading font-black text-xs tracking-tighter uppercase italic text-shimmer">
                ULurne
              </span>
            )}
          </Link>

          <button
            onClick={onToggle}
            className={`p-1.5 rounded-xl text-muted hover:text-white hover:bg-white/5 transition-all ${
              isCollapsed ? 'w-10 h-10 flex items-center justify-center' : ''
            }`}
          >
            {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Items */}
        <nav className="flex-1 space-y-1 px-2 pt-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative ${
                  isActive
                    ? 'text-white'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <div className={`relative z-10 transition-transform group-active:scale-90 ${isActive ? 'text-primary' : ''}`}>
                  <item.icon className="w-5 h-5 shrink-0" />
                </div>
                
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative z-10 text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}

                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-2xl">
                    {item.name}
                  </div>
                )}

                {isActive && (
                  <>
                    <motion.div
                      layoutId="sidebar-pill"
                      className="absolute inset-0 bg-white/5 rounded-xl border border-white/5"
                    />
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 w-1 h-4 bg-primary rounded-full"
                    />
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-2 space-y-1 mb-2">
          <Link
            href="/settings"
            className={`flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all group relative ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap">Settings</span>
            )}
          </Link>

          <button
            onClick={() => setShowLogoutModal(true)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-red-500/40 hover:bg-red-500/10 hover:text-red-500 transition-all group relative ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" />
            {!isCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap">Logout</span>
            )}
          </button>
        </div>
      </aside>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
}
