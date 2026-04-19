'use client';

import { useState } from 'react';
import { Bell, Mail, Smartphone, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function NotificationsSection({ user, settings, onUpdate }: { user: any, settings: any, onUpdate: (values: any) => void }) {
  const [loading, setLoading] = useState(false);

  const toggleSetting = async (key: string, value: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ [key]: value })
        .eq('user_id', user.id);

      if (error) throw error;
      onUpdate({ ...settings, [key]: value });
      toast.success('Communication Channels Synchronized');
    } catch (err: any) {
      toast.error('Notification Logic Disruption: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-black uppercase tracking-widest text-sm italic">Push Notifications</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest">Master Switch</p>
                <p className="text-[9px] text-muted-foreground">Enable push notifications on this device.</p>
              </div>
              <button 
                onClick={() => toggleSetting('notification_push', !settings?.notification_push)}
                disabled={loading}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings?.notification_push ? 'bg-primary' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${settings?.notification_push ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-white/5 border border-white/5 opacity-50">
               <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-muted" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Device: iPhone 15 Pro</span>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-black uppercase tracking-widest text-sm italic">Email & SMS</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest">Email Alerts</p>
                <p className="text-[9px] text-muted-foreground">Receive course updates and academy news.</p>
              </div>
              <button 
                onClick={() => toggleSetting('notification_email', !settings?.notification_email)}
                disabled={loading}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings?.notification_email ? 'bg-primary' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${settings?.notification_email ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest">SMS Notifications</p>
                <p className="text-[9px] text-muted-foreground">Get instant alerts for important messages.</p>
              </div>
              <button 
                onClick={() => toggleSetting('notification_sms', !settings?.notification_sms)}
                disabled={loading}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings?.notification_sms ? 'bg-primary' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${settings?.notification_sms ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
