'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Termination Error: ' + error.message);
    } else {
      toast.success('Session Terminated Safely');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm glass-card p-8 rounded-[2rem] border border-white/10 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black font-outfit uppercase tracking-tight">Confirm Sign Out</h2>
                <p className="text-muted text-sm font-medium">Are you sure you want to end your session? You&apos;ll need to log back in to access your courses.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest transition-all"
                >
                  Stay
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
