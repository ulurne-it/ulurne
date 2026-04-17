'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, RefreshCcw } from 'lucide-react';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0f]">
      <div className="max-w-md w-full space-y-8 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6"
        >
          <div className="mx-auto w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
              Authentication Sync Failed
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We couldn't synchronize your secure session with our academy servers. This usually happens due to a temporary database timeout or misconfigured redirect.
            </p>
          </div>

          <div className="pt-4 space-y-3">
             <button 
               onClick={() => window.location.href = '/login'}
               className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
             >
               <RefreshCcw className="w-4 h-4" />
               Try Again
             </button>
             
             <Link 
               href="/"
               className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-muted hover:text-white transition-colors py-2"
             >
               <ArrowLeft className="w-4 h-4" />
               Back to Terminal
             </Link>
          </div>
        </motion.div>
        
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/30 font-black">
          Error Code: AUTH_SYNC_FAILURE_X01
        </p>
      </div>
    </div>
  );
}
