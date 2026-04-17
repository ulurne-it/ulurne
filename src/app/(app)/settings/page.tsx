'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Shield, 
  Bell, 
  Eye, 
  CreditCard, 
  MessageSquare,
  ChevronRight,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { AccountSection } from '@/components/settings/account-section';

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeSection, setActiveSection] = useState('account');

  const sections = [
    { id: 'account', label: 'Security & Login', icon: Shield, subtitle: 'Password, Email & 2FA' },
    { id: 'privacy', label: 'Privacy & Visibility', icon: Eye, subtitle: 'Profile visibility & interactions' },
    { id: 'notifications', label: 'Notifications', icon: Bell, subtitle: 'Push, Email & SMS alerts' },
    { id: 'billing', label: 'Payments', icon: CreditCard, subtitle: 'Invoices & Subscriptions' },
    { id: 'support', label: 'Help & Support', icon: MessageSquare, subtitle: 'Contact us & FAQ' },
  ];

  const renderSection = () => {
    switch(activeSection) {
      case 'account': return <AccountSection user={user} />;
      default: return (
        <div className="flex flex-col items-center justify-center py-20 opacity-20 italic">
           <p className="font-black uppercase tracking-widest text-xs">Section under construction</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen pb-20 pt-12">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="text-4xl font-black font-heading uppercase italic tracking-tighter mb-2">
            System Settings
          </h1>
          <p className="text-muted-foreground font-medium italic">Manage your ULurne experience and security.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar / Navigation */}
          <div className="lg:col-span-4 space-y-2">
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full group flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-300 relative overflow-hidden ${
                    isActive 
                      ? 'bg-primary shadow-xl shadow-primary/20 text-white' 
                      : 'bg-[#0a0a0f]/40 border border-white/5 text-muted-foreground hover:border-white/20'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${isActive ? 'bg-white/20' : 'bg-white/5 border border-white/5'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest">{section.label}</span>
                    <span className={`text-[8px] font-medium leading-none opacity-60 ${isActive ? 'text-white' : 'text-muted-foreground'}`}>{section.subtitle}</span>
                  </div>
                  <ChevronRight className={`ml-auto w-4 h-4 transition-transform group-hover:translate-x-1 ${isActive ? 'opacity-100' : 'opacity-20'}`} />
                </button>
              );
            })}

            <div className="pt-8">
               <button className="w-full flex items-center gap-4 p-5 rounded-[2rem] bg-red-500/5 border border-red-500/10 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all">
                  <div className="p-3 rounded-2xl bg-red-500/10">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
               </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#0a0a0f]/60 border border-white/5 rounded-[3rem] p-10 shadow-2xl backdrop-blur-3xl min-h-[600px]"
            >
              {renderSection()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
