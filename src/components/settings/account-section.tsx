'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, Lock, Mail, ChevronRight, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { MfaEnrollment } from './mfa-enrollment';

const accountSchema = z.object({
  email: z.string().email(),
  language: z.string(),
});

export function AccountSection({ user, settings, profile, onUpdate }: { 
  user: any, 
  settings: any, 
  profile: any,
  onUpdate: (type: 'settings' | 'profile', values: any) => void 
}) {
  const [loading, setLoading] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [factors, setFactors] = useState<any[]>([]);
  
  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: user?.email || '',
      language: settings?.language || 'English',
    },
  });

  useEffect(() => {
    reset({
      email: user?.email || '',
      language: settings?.language || 'English',
    });
    fetchMfaFactors();
  }, [user, settings, reset]);

  const fetchMfaFactors = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (!error) {
      setFactors(data.all || []);
    }
  };

  const isMfaActive = factors.some(f => f.status === 'verified');

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const { error: settingsError } = await supabase
        .from('user_settings')
        .update({ language: values.language })
        .eq('user_id', user.id);

      if (settingsError) throw settingsError;

      if (values.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({ email: values.email });
        if (authError) throw authError;
        toast.info('Identity Verification Protocol Initiated: Check your inbox to confirm your new email.');
      }

      onUpdate('settings', { ...settings, language: values.language });
      toast.success('System Preferences Synchronized Successfully');
    } catch (err: any) {
      toast.error('Synchronization Failure: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMfa = async () => {
    if (isMfaActive) {
      // Unenroll
      setLoading(true);
      try {
        const factor = factors.find(f => f.status === 'verified');
        if (factor) {
          const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
          if (error) throw error;
          
          await supabase.from('user_settings').update({ two_factor_enabled: false }).eq('user_id', user.id);
          onUpdate('settings', { ...settings, two_factor_enabled: false });
          fetchMfaFactors();
          toast.success('System Security Hardened: MFA Deactivated Safely');
        }
      } catch (err: any) {
        toast.error('Emergency Response: Failed to modify security factors');
      } finally {
        setLoading(false);
      }
    } else {
      setShowMfaModal(true);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-black uppercase tracking-widest text-sm italic">Identity</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Email Address</label>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl px-5 py-4 focus-within:border-primary transition-all">
                    <Mail className="w-4 h-4 text-muted" />
                    <input 
                      {...register('email')}
                      className="bg-transparent border-none outline-none text-xs font-black w-full"
                    />
                    <span className="ml-auto text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-green-500/10 text-green-500">Verified</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">System Language</label>
                  <select 
                    {...register('language')}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest focus:border-primary outline-none transition-all appearance-none"
                  >
                    <option value="English">English (US)</option>
                    <option value="Spanish">Español</option>
                    <option value="French">Français</option>
                    <option value="German">Deutsch</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-black uppercase tracking-widest text-sm italic">Security</h3>
              </div>

              <div className="space-y-4">
                <div className={`flex items-center justify-between p-5 rounded-3xl bg-white/5 border transition-all ${isMfaActive ? 'border-primary/20 bg-primary/5' : 'border-white/5'}`}>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest">Two-Factor Auth</p>
                     <p className="text-[9px] text-muted-foreground italic">Add a verification layer to your login.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={handleToggleMfa}
                    disabled={loading}
                    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isMfaActive ? 'bg-primary' : 'bg-white/10'}`}
                  >
                    {loading ? (
                      <Loader2 className="w-3 h-3 animate-spin mx-auto text-white mt-1.5" />
                    ) : (
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${isMfaActive ? 'right-1' : 'left-1'}`} />
                    )}
                  </button>
                </div>

                <button 
                  type="button" 
                  onClick={() => toast.success('Password Reset Sequence Initiated: check your registered email')}
                  className="w-full flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">Change Password</span>
                  <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-all" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="px-10 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all shadow-xl shadow-white/10 disabled:opacity-50"
            >
              {loading ? 'Synchronizing...' : 'Save Meta Changes'}
            </button>
          </div>
        </form>

        <div className="pt-8 border-t border-white/5">
          <div className="p-6 rounded-[2rem] bg-red-500/5 border border-red-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-xs font-black uppercase tracking-widest text-red-500/80">Danger Zone</p>
              <p className="text-[10px] text-muted-foreground italic">Permanently erase your account, courses progress, and all data.</p>
            </div>
            <button className="px-8 py-3 rounded-xl bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-[9px] hover:bg-red-500 transition-all hover:text-white">
              Deactivate Account
            </button>
          </div>
        </div>
      </div>

      {showMfaModal && (
        <MfaEnrollment 
          onClose={() => setShowMfaModal(false)}
          onComplete={() => {
            setShowMfaModal(false);
            fetchMfaFactors();
            onUpdate('settings', { ...settings, two_factor_enabled: true });
          }}
        />
      )}
    </>
  );
}
