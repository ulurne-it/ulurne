'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Copy, Check, Lock, Loader2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface MfaEnrollmentProps {
  onComplete: () => void;
  onClose: () => void;
}

export function MfaEnrollment({ onComplete, onClose }: MfaEnrollmentProps) {
  const [step, setStep] = useState<'intro' | 'qr' | 'verify'>('intro');
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const startEnrollment = async () => {
    setLoading(true);
    try {
      // 1. Clean up any existing unverified factors to avoid "factor already exists" errors
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors?.all) {
        const unverified = factors.all.filter(f => f.status === 'unverified');
        for (const f of unverified) {
          await supabase.auth.mfa.unenroll({ factorId: f.id });
        }
      }

      // 2. Start new enrollment
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'ULurne Authenticator'
      });

      if (error) throw error;
      
      setEnrollmentData(data);
      setStep('qr');
    } catch (err: any) {
      toast.error('Initialization Integrity Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyEnrollment = async () => {
    if (verifyCode.length !== 6) return;
    setLoading(true);
    try {
      // 1. Create Challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollmentData.id,
      });

      if (challengeError) throw challengeError;

      // 2. Verify
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollmentData.id,
        challengeId: challengeData.id,
        code: verifyCode,
      });

      if (verifyError) throw verifyError;

      // 3. Update internal setting flag (optional but good for UX)
      await supabase.from('user_settings').update({ two_factor_enabled: true }).eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      toast.success('System Security Hardened: MFA Factor Active');
      onComplete();
    } catch (err: any) {
      toast.error('Identity Verification Failed: Access denied or invalid token');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(enrollmentData?.totp?.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Security Secret Cached to Clipboard');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020205] overflow-y-auto flex flex-col">
      {/* Immersive Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <button 
        onClick={onClose}
        className="fixed top-10 right-10 z-[110] p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-muted hover:text-white group active:scale-95"
      >
        <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-8 py-20 flex flex-col items-center justify-center text-center"
      >
        <div className="w-full max-w-xl space-y-12">
          <div className="flex flex-col items-center space-y-6">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-[3rem] bg-linear-to-br from-primary/20 to-secondary/10 border border-white/10 text-primary shadow-2xl shadow-primary/20"
            >
              <ShieldCheck className="w-16 h-16" />
            </motion.div>
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black font-heading uppercase italic tracking-tighter shimmer-text">
                Secure Your Academy
              </h2>
              <p className="text-sm md:text-base text-muted-foreground font-medium italic max-w-md mx-auto">
                Add an industrial-grade security layer to your ULurne identity using Two-Factor Authentication.
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'intro' && (
              <motion.div 
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                  <div className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-primary/30 transition-all hover:bg-white/[0.07]">
                    <div className="p-3 w-fit rounded-2xl bg-white/10 mb-6 group-hover:bg-primary/20 transition-colors">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">Enhanced Protection</p>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">Required for specialized permissions and high-tier learning environments.</p>
                  </div>
                  <div className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-primary/30 transition-all hover:bg-white/[0.07]">
                    <div className="p-3 w-fit rounded-2xl bg-white/10 mb-6 group-hover:bg-primary/20 transition-colors">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">Universal Standard</p>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">Fully compatible with Google Authenticator, Authy, or any TOTP provider.</p>
                  </div>
                </div>

                <button 
                  onClick={startEnrollment}
                  disabled={loading}
                  className="w-full py-6 rounded-3xl bg-white text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-primary hover:text-white transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  Begin Setup Initialization
                </button>
              </motion.div>
            )}

            {step === 'qr' && (
              <motion.div 
                key="qr"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10 flex flex-col items-center"
              >
                <div className="relative group">
                  <div className="absolute -inset-8 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-10 rounded-[3rem] bg-white border-[16px] border-white/5 shadow-2xl">
                    {enrollmentData?.totp && (
                      <QRCodeSVG 
                        value={enrollmentData.totp.uri || `otpauth://totp/ULurne?secret=${enrollmentData.totp.secret}`} 
                        size={220} 
                        level="M" 
                        includeMargin={false}
                      />
                    )}
                  </div>
                </div>

                <div className="w-full max-w-md space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">Identify Secret Manually</p>
                    <button 
                      onClick={copySecret}
                      className="w-full group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                    >
                      <span className="text-[10px] font-mono opacity-40 truncate flex-1 text-left mr-4">
                        {enrollmentData?.totp?.secret}
                      </span>
                      <div className="shrink-0 p-2.5 rounded-xl bg-white/10 group-hover:bg-primary/20 transition-colors">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </div>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setStep('verify')}
                  className="w-full max-w-md py-6 rounded-3xl bg-primary text-white font-black uppercase tracking-[0.3em] text-xs hover:shadow-2xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-4 active:scale-95"
                >
                  Continue to Verification
                </button>
              </motion.div>
            )}

            {step === 'verify' && (
              <motion.div 
                key="verify"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12 w-full max-w-md"
              >
                <div className="flex flex-col items-center space-y-8">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-muted">Input 6-Digit Security Token</p>
                  <input 
                    type="text"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000 000"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-3xl px-8 py-8 text-center text-5xl font-black tracking-[0.2em] focus:border-primary outline-none transition-all placeholder:opacity-10 backdrop-blur-md"
                  />
                </div>

                <div className="space-y-6">
                  <button 
                    onClick={verifyEnrollment}
                    disabled={loading || verifyCode.length !== 6}
                    className="w-full py-6 rounded-3xl bg-white text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-primary hover:text-white transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95"
                  >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    Finalize Security Upgrade
                  </button>
                  <button 
                    onClick={() => setStep('qr')}
                    className="w-full text-[10px] font-black uppercase tracking-widest text-muted hover:text-white transition-colors"
                  >
                    Return to QR Identification
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
