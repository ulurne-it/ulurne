'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { FaGoogle, FaGithub, FaFacebook, FaTwitter } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Welcome back to ULurne!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter' | 'github') => {
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
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black font-outfit tracking-tight bg-linear-to-b from-white to-white/60 bg-clip-text text-transparent">
          Welcome back
        </h1>
        <p className="text-muted-foreground font-medium">
          The next chapter of your growth starts here.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { id: 'google', icon: FaGoogle, color: 'hover:text-[#DB4437]' },
          { id: 'github', icon: FaGithub, color: 'hover:text-white' },
          { id: 'facebook', icon: FaFacebook, color: 'hover:text-[#4267B2]' },
          { id: 'twitter', icon: FaTwitter, color: 'hover:text-[#1DA1F2]' },
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
            OR CONTINUING WITH
          </span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
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
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-black uppercase tracking-widest text-muted/80">Secure Password</label>
            <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
              Forgot?
            </Link>
          </div>
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
              Sign Entry
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-4">
        <p className="text-sm font-medium text-muted">
          New to the movement?{' '}
          <Link href="/register" className="text-white font-black hover:text-primary transition-colors">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
