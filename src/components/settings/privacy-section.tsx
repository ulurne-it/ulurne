'use client';

import { useState } from 'react';
import { Eye, Shield, UserX, Globe, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function PrivacySection({ user, settings, onUpdate }: { user: any, settings: any, onUpdate: (values: any) => void }) {
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
      toast.success('Privacy Shield Configuration Updated');
    } catch (err: any) {
      toast.error('Data Integrity Logic Failure: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-black uppercase tracking-widest text-sm italic">Visibility</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest">Private Account</p>
                <p className="text-[9px] text-muted-foreground">Only approved followers can see your profile and bites.</p>
              </div>
              <button 
                onClick={() => toggleSetting('is_private', !settings?.is_private)}
                disabled={loading}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings?.is_private ? 'bg-primary' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${settings?.is_private ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest">Show Active Status</p>
                <p className="text-[9px] text-muted-foreground">Allow others to see when you are online learning.</p>
              </div>
              <button 
                onClick={() => toggleSetting('show_active_status', !settings?.show_active_status)}
                disabled={loading}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings?.show_active_status ? 'bg-primary' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${settings?.show_active_status ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-black uppercase tracking-widest text-sm italic">Data & Permissions</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 grayscale opacity-50 cursor-not-allowed">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest">Personalization</p>
                <p className="text-[9px] text-muted-foreground">Use your learning history to suggest new courses.</p>
              </div>
              <div className="w-12 h-6 bg-primary/20 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-primary" />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                  <UserX className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Blocked Accounts</span>
              </div>
              <span className="text-[10px] font-black text-muted-foreground">0 Users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
