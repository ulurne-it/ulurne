'use client';

import { MessageSquare, LifeBuoy, ExternalLink, Send } from 'lucide-react';
import { toast } from 'sonner';

export function SupportSection() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Support Protocol Initiated: A specialist will review your ticket.');
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-black uppercase tracking-widest text-sm italic">Direct Support</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Inquiry Type</label>
              <select className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest focus:border-primary outline-none transition-all">
                <option>Technical Issue</option>
                <option>Billing Question</option>
                <option>Course Content</option>
                <option>Partnership</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Message</label>
              <textarea 
                placeholder="How can we help you today?"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-xs font-medium min-h-[120px] focus:border-primary outline-none transition-all resize-none"
              />
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95">
              <Send className="w-3 h-3" />
              Initialize Support Ticket
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <LifeBuoy className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-black uppercase tracking-widest text-sm italic">Help Center</h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              'Getting Started Guide',
              'Advanced Learning Patterns',
              'Subscription Policies',
              'Creator Program FAQ',
              'Safety & Community Guidelines'
            ].map((link) => (
              <button key={link} className="flex items-center justify-between p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group">
                <span className="text-[10px] font-black uppercase tracking-widest">{link}</span>
                <ExternalLink className="w-3 h-3 opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all" />
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-white/5 space-y-4">
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted">System Status</span>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-green-500">All Systems Operational</span>
                </div>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted">App Version</span>
                <span className="text-[9px] font-black uppercase tracking-widest">v2.4.1-stable</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
