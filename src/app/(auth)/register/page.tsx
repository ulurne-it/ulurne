'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, User, EyeOff, Eye } from 'lucide-react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      toast.success('Account created successfully! Welcome to ULurne.');
      router.push('/app');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || `Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="glass-card p-10 md:p-14 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-10">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative w-20 h-20 mb-2">
          <Image 
            src="/logos/logo-icon.png" 
            alt="ULurne Logo" 
            fill
            className="object-contain"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black font-outfit tracking-tight bg-linear-to-b from-white to-white/60 bg-clip-text text-transparent">
            Start Journey
          </h1>
          <p className="text-muted-foreground font-medium">
            Join 50k+ students mastering skills in minutes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { id: 'google', icon: FaGoogle, color: 'hover:text-[#DB4437]' },
          { id: 'github', icon: FaGithub, color: 'hover:text-white' },
        ].map((platform) => (
          <platform.icon
            key={platform.id}
            onClick={() => handleSocialLogin(platform.id as any)}
            className={`w-full h-12 p-3.5 rounded-2xl border border-white/5 bg-white/5 cursor-pointer transition-all hover:bg-white/10 hover:border-white/20 active:scale-95 ${platform.color}`}
          />
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/5" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
          <span className="bg-background/20 backdrop-blur-3xl px-4 text-muted">
            OR USE YOUR EMAIL
          </span>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted/80 pl-1">Display Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Name"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.08] transition-all placeholder:text-muted/40 font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted/80 pl-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.08] transition-all placeholder:text-muted/40 font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted/80 pl-1">Secure Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.08] transition-all placeholder:text-muted/40 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Deploy Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-4">
        <p className="text-sm font-medium text-muted">
          Already part of the tribe?{' '}
          <Link href="/login" className="text-white font-black hover:text-primary transition-colors">
            Login Now
          </Link>
        </p>
      </div>
    </div>
  );
}
