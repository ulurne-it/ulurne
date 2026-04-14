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
        className={`hidden lg:flex flex-col h-screen fixed left-0 top-0 border-r border-white/5 bg-background z-50 transition-all duration-300 shrink-0 ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Header with Toggle */}
        <div className={`flex items-center mb-10 h-20 border-b border-white/5 px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <Link href="/app" className={`flex items-center gap-3 shrink-0 ${isCollapsed ? 'hidden' : 'flex'}`}>
            <div className="relative shrink-0">
              <Image
                src="/logos/logo.png"
                alt="ULurne Logo"
                width={32}
                height={32}
              />
            </div>
          </Link>

          <button
            onClick={onToggle}
            className={`p-1 rounded-xl text-muted hover:text-white transition-all ${isCollapsed ? 'w-12 h-12 flex items-center justify-center' : ''}`}
          >
            {isCollapsed ? <PanelLeft className="w-6 h-6" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        {/* Sidebar Items */}
        <nav className="flex-1 space-y-2 p-4 pt-0">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all group relative ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-white/5 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <item.icon className={`w-6 h-6 shrink-0 transition-transform group-active:scale-90 ${isActive ? 'text-primary' : ''}`} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-black uppercase tracking-widest whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}

                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-2xl">
                    {item.name}
                  </div>
                )}

                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            href="/settings"
            className={`flex items-center gap-4 p-4 rounded-2xl text-muted hover:bg-white/5 hover:text-white transition-all group relative ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Settings className="w-6 h-6 shrink-0" />
            {!isCollapsed && (
              <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap text-muted-foreground">Settings</span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-2xl">
                Settings
              </div>
            )}
          </Link>

          <button
            onClick={() => setShowLogoutModal(true)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-all group relative ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-6 h-6 shrink-0 group-hover:rotate-12 transition-transform" />
            {!isCollapsed && (
              <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">Logout</span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-2xl">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
}
