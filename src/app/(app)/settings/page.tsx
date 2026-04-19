'use client';

import { useState, useEffect } from 'react';
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
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Components
import { AccountSection } from '@/components/settings/account-section';
import { PrivacySection } from '@/components/settings/privacy-section';
import { NotificationsSection } from '@/components/settings/notifications-section';
import { BillingSection } from '@/components/settings/billing-section';
import { SupportSection } from '@/components/settings/support-section';

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeSection, setActiveSection] = useState('account');
  const [isMobileDetail, setIsMobileDetail] = useState(false);
  
  // Data State
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      initData();
    }
  }, [user]);

  const initData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setProfile(profileData);

      // 2. Fetch Settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
      
      if (!settingsData) {
        // Create if doesn't exist
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert({ user_id: user.id })
          .select()
          .single();
        if (!createError) setSettings(newSettings);
      } else {
        setSettings(settingsData);
      }
    } catch (err) {
      console.error('Settings init error:', err);
      toast.error('Failed to sync settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (type: 'settings' | 'profile', values: any) => {
    if (type === 'settings') setSettings(values);
    if (type === 'profile') setProfile(values);
  };

  const sections = [
    { id: 'account', label: 'Security & Login', icon: Shield, subtitle: 'Password, Email & 2FA' },
    { id: 'privacy', label: 'Privacy & Visibility', icon: Eye, subtitle: 'Profile visibility & interactions' },
    { id: 'notifications', label: 'Notifications', icon: Bell, subtitle: 'Push, Email & SMS alerts' },
    { id: 'billing', label: 'Payments', icon: CreditCard, subtitle: 'Invoices & Subscriptions' },
    { id: 'support', label: 'Help & Support', icon: MessageSquare, subtitle: 'Contact us & FAQ' },
  ];

  const renderSection = () => {
    if (loading) return (
      <div className="flex items-center justify-center py-20">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );

    switch (activeSection) {
      case 'account': return <AccountSection user={user} settings={settings} profile={profile} onUpdate={handleUpdate} />;
      case 'privacy': return <PrivacySection user={user} settings={settings} onUpdate={(val) => handleUpdate('settings', val)} />;
      case 'notifications': return <NotificationsSection user={user} settings={settings} onUpdate={(val) => handleUpdate('settings', val)} />;
      case 'billing': return <BillingSection settings={settings} />;
      case 'support': return <SupportSection />;
      default: return (
        <div className="flex flex-col items-center justify-center py-20 opacity-20 italic">
          <p className="font-black uppercase tracking-widest text-xs">Section under construction</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen pb-20 pt-8 lg:pt-14">
      <div className="max-w-6xl mx-auto px-6">
        <header className={`mb-4 lg:mb-12 transition-all duration-500 ${isMobileDetail ? 'hidden lg:block' : 'block'}`}>
          <h1 className="text-lg lg:text-4xl font-black font-heading uppercase italic tracking-tighter mb-0.5 lg:mb-2">
            System Settings
          </h1>
          <p className="text-[9px] lg:text-sm text-muted-foreground font-medium italic leading-none">Manage your ULurne experience and security.</p>
        </header>

        {isMobileDetail && (
          <button
            onClick={() => setIsMobileDetail(false)}
            className="lg:hidden flex items-center gap-3 mb-8 text-primary font-black uppercase tracking-widest text-[10px] group transition-all"
          >
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:border-primary/50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </div>
            Back to Overview
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Sidebar / Navigation */}
          <div className={`lg:col-span-4 space-y-2 ${isMobileDetail ? 'hidden lg:block' : 'block'}`}>
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setIsMobileDetail(true);
                  }}
                  className={`w-full group flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-300 relative overflow-hidden ${isActive
                    ? 'bg-primary shadow-xl shadow-primary/20 text-white'
                    : 'bg-[#0a0a0f]/40 border border-white/5 text-muted-foreground hover:border-white/20'
                    }`}
                >
                  <div className={`p-3 rounded-2xl ${isActive ? 'bg-white/20' : 'bg-white/5 border border-white/5'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-start gap-1 text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{section.label}</span>
                    <span className={`text-[8px] font-medium leading-none opacity-60 ${isActive ? 'text-white' : 'text-muted-foreground'}`}>{section.subtitle}</span>
                  </div>
                  <ChevronRight className={`ml-auto w-4 h-4 transition-transform group-hover:translate-x-1 ${isActive ? 'opacity-100' : 'opacity-20'}`} />
                </button>
              );
            })}

            <div className="pt-8">
              <button 
                onClick={() => supabase.auth.signOut()}
                className="w-full flex items-center gap-4 p-5 rounded-[2rem] bg-red-500/5 border border-red-500/10 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                <div className="p-3 rounded-2xl bg-red-500/10">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className={`lg:col-span-8 ${isMobileDetail ? 'block' : 'hidden lg:block'}`}>
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="bg-[#0a0a0f]/60 border border-white/5 rounded-[3rem] p-6 md:p-10 shadow-2xl backdrop-blur-3xl min-h-[500px]"
            >
              <div className="mb-6 lg:hidden flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  {(() => {
                    const Icon = sections.find(s => s.id === activeSection)?.icon || Shield;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <h2 className="text-base lg:text-2xl font-black font-heading uppercase italic tracking-tighter">
                  {sections.find(s => s.id === activeSection)?.label}
                </h2>
              </div>
              {renderSection()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

