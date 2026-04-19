'use client';

import { CreditCard, Rocket, CheckCircle2, Clock } from 'lucide-react';

export function BillingSection({ settings }: { settings: any }) {
  const currentPlan = settings?.billing_plan || 'Free';

  return (
    <div className="space-y-8">
      {/* Current Plan Overview */}
      <div className="p-8 rounded-[3rem] bg-linear-to-br from-primary/20 to-secondary/20 border border-white/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Rocket className="w-32 h-32 text-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Current Tier</span>
            <h3 className="text-4xl font-black font-heading uppercase italic tracking-tighter">
              {currentPlan} <span className="text-sm not-italic opacity-50 font-sans">Student</span>
            </h3>
            <p className="text-xs text-muted-foreground font-medium italic">Your next billing date is May 19, 2026</p>
          </div>
          
          <button className="px-10 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all shadow-xl shadow-white/10">
            Manage Subscription
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-black uppercase tracking-widest text-sm italic">Payment Methods</h3>
          </div>

          <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center font-black italic text-[10px] text-muted">VISA</div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest">•••• 4242</p>
                <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Expires 12/28</p>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
               <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-black uppercase tracking-widest text-sm italic">Billing History</h3>
          </div>

          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest">Invoice #UL-00{i}</p>
                  <p className="text-[8px] text-muted-foreground italic">April {20-i}, 2026</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black">$49.00</span>
                  <button className="text-[8px] font-black uppercase tracking-widest text-primary hover:underline">PDF</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
