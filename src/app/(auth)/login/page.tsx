'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'mfa'>('login');
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [showError, setShowError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for explicit flag OR implicit session requirement
    const isMfaStep = searchParams.get('mfa') === 'true';
    checkSessionMfa(isMfaStep);
  }, [searchParams]);

  const checkSessionMfa = async (isExplicit: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.nextLevel === 'aal2' && aalData?.currentLevel !== 'aal2') {
        initiateMfaChallenge(isExplicit);
      } else if (isExplicit) {
        initiateMfaChallenge(true);
      }
    } else if (isExplicit) {
      initiateMfaChallenge(true);
    }
  };

  const initiateMfaChallenge = async (showToast = false) => {
    setLoading(true);
    try {
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const totpFactor = factors.all.filter(f => f.status === 'verified')[0];
      if (!totpFactor) throw new Error('No MFA factor found');

      setMfaFactorId(totpFactor.id);
      setStep('mfa');
      if (showToast) {
        toast.info('Identity Verification Required: Please enter your security token');
      }
    } catch (error: any) {
      console.error('MFA Initiation Error:', error);
      if (showToast) toast.error('MFA Initiation Error: ' + error.message);
      setStep('login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check if MFA is required
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) throw aalError;

      if (aalData.nextLevel === 'aal2' && aalData.currentLevel !== 'aal2') {
        initiateMfaChallenge();
      } else {
        toast.success('Access Granted: Identity Authenticated');
        router.push('/app');
      }
    } catch (error: any) {
      toast.error('Authentication Error: ' + (error.message || 'Identity verification failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (code: string) => {
    setLoading(true);
    setShowError(false);

    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code
      });

      if (verifyError) throw verifyError;

      toast.success('Security Clearance Confirmed: Profile Synchronized');
      router.push('/app');
    } catch (error: any) {
      setShowError(true);
      toast.error('Identity Verification Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...mfaCode];
    newOtp[index] = value;
    setMfaCode(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit
    if (newOtp.every(digit => digit !== '')) {
      handleMfaVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !mfaCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(`External Identity Sync Failed: Check your ${provider} account status`);
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
            {step === 'login' ? 'Welcome back' : 'Secure Vault'}
          </h1>
          <p className="text-muted-foreground font-medium">
            {step === 'login' ? 'The next chapter of your growth starts here.' : 'Identity verification required to access your academy assets.'}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-10"
          >
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
                <span className="bg-transparent px-4 text-muted">
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
          </motion.div>
        ) : (
          <motion.div
            key="mfa"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div className="space-y-10">
              <div className="space-y-6">
                <p className={`text-center text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${showError ? 'text-red-500' : 'text-muted'}`}>
                  {showError ? 'Access Denied: Invalid Token' : '6-Digit Security Token'}
                </p>
                <div className="flex justify-center gap-3">
                  {mfaCode.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      autoFocus={i === 0}
                      className={`w-12 h-16 md:w-14 md:h-20 text-center text-3xl font-black rounded-2xl border transition-all outline-none 
                        ${showError 
                          ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' 
                          : 'bg-white/5 border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary/20 focus:bg-white/10'
                        }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <button
                  disabled={loading || mfaCode.some(d => d === '')}
                  onClick={() => handleMfaVerify(mfaCode.join(''))}
                  className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 group
                    ${showError 
                      ? 'bg-red-500 text-white shadow-red-500/20' 
                      : 'bg-white text-black shadow-white/10'}`}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {showError ? 'Retry Authorization' : 'Confirm Identity'}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setStep('login');
                    setMfaCode(['', '', '', '', '', '']);
                    setShowError(false);
                  }}
                  className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-white transition-colors"
                >
                  Return to credentials
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
