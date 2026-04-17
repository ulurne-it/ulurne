'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, Lock, Mail, HardDrive, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const accountSchema = z.object({
  email: z.string().email(),
  language: z.string(),
  twoFactor: z.boolean(),
});

export function AccountSection({ user }: { user: any }) {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: user?.email || '',
      language: 'English',
      twoFactor: false,
    },
  });

  const onSubmit = (values: any) => {
    console.log(values);
    toast.success('Account preferences updated');
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-black uppercase tracking-widest text-sm italic">Account Integrity</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Email Address</label>
              <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl px-5 py-4">
                <Mail className="w-4 h-4 text-muted" />
                <span className="text-xs font-black">{user?.email}</span>
                <span className="ml-auto text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-green-500/10 text-green-500">Verified</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5">
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest">Two-Factor Authentication</p>
                 <p className="text-[9px] text-muted-foreground">Add an extra layer of security to your academy account.</p>
              </div>
              <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                 <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-black uppercase tracking-widest text-sm italic">Privacy Settings</h3>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5">
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest">Private Profile</p>
                   <p className="text-[9px] text-muted-foreground">Only approved followers can see your bites.</p>
                </div>
                <div className="w-12 h-6 bg-primary/20 rounded-full relative cursor-pointer">
                   <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-primary shadow-sm" />
                </div>
             </div>

             <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5">
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest">Active Status</p>
                   <p className="text-[9px] text-muted-foreground">Show when you are browsing or learning.</p>
                </div>
                <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                   <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white/20" />
                </div>
             </div>
          </div>
        </div>
      </div>

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
  );
}
