'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/store/hooks';
import { 
  Book, Plus, FolderSync, LayoutGrid, 
  Settings2, ChevronRight, Loader2, Sparkles,
  BarChart3, Film, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentCard } from '@/components/sections/content-card';
import { toast } from 'sonner';

export function Laboratory() {
  const { user } = useAppSelector((state) => state.auth);
  const [series, setSeries] = useState<any[]>([]);
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'overview' | 'series_detail'>('overview');
  const [selectedSeries, setSelectedSeries] = useState<any>(null);

  useEffect(() => {
    if (user) fetchLaboratoryData();
  }, [user]);

  const fetchLaboratoryData = async () => {
    try {
      setLoading(true);
      // Fetch User's Series
      const { data: sData, error: sErr } = await supabase
        .from('series')
        .select('*, content(count)')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false });

      if (sErr) throw sErr;
      setSeries(sData || []);

      // Fetch Standalone Content (No series)
      const { data: cData, error: cErr } = await supabase
        .from('content')
        .select('*, profiles(username, full_name, avatar_url)')
        .eq('creator_id', user?.id)
        .is('series_id', null)
        .order('created_at', { ascending: false });

      if (cErr) throw cErr;
      setContent(cData || []);
    } catch (err: any) {
      toast.error('Failed to sync laboratory records');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeriesDetail = async (s: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('*, profiles(username, full_name, avatar_url)')
        .eq('series_id', s.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSelectedSeries({ ...s, items: data || [] });
      setView('series_detail');
    } catch (err) {
      toast.error('Failed to load series contents');
    } finally {
      setLoading(false);
    }
  };

  if (loading && series.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Calibrating Lab Instruments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <AnimatePresence mode="wait">
        {view === 'overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-16"
          >
            {/* Masterclass Series Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Book className="w-4 h-4" />
                   </div>
                   <h2 className="text-[12px] font-black uppercase tracking-[0.3em] font-heading leading-none">Curriculum Series</h2>
                </div>
              </div>

              {series.length === 0 ? (
                <div className="p-12 rounded-[2.5rem] bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4">
                   <FolderSync className="w-10 h-10 text-white/10" />
                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed max-w-xs">You haven't structured any academy series yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {series.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => fetchSeriesDetail(s)}
                      className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-primary/40 hover:bg-white/[0.05] transition-all text-left group relative backdrop-blur-xl"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex flex-col items-center justify-center text-primary border border-primary/20 shadow-xl group-hover:scale-105 transition-transform">
                         <span className="text-xl font-black italic">{s.content?.[0]?.count || 0}</span>
                         <span className="text-[7px] font-black uppercase tracking-widest">Units</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black uppercase italic tracking-wider truncate mb-1 group-hover:text-primary transition-colors">{s.title}</h3>
                        <p className="text-[10px] font-medium text-muted-foreground opacity-50 line-clamp-1">{s.description || 'No description provided'}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Standalone Research Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                 <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="w-4 h-4" />
                 </div>
                 <h2 className="text-[12px] font-black uppercase tracking-[0.3em] font-heading leading-none">Standalone Insights</h2>
              </div>

              {content.length === 0 ? (
                <div className="p-12 rounded-[2.5rem] bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4">
                   <LayoutGrid className="w-10 h-10 text-white/10" />
                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed max-w-xs">No experimental works recorded.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {content.map((c) => (
                    <ContentCard key={c.id} content={c} showCreator={false} />
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('overview')}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4 rotate-180" /> Back to Lab
              </button>
              <div className="h-4 w-px bg-white/10" />
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">{selectedSeries?.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {/* Series Sidebar Stats */}
               <div className="md:col-span-1 space-y-4">
                  <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 space-y-4">
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Total Units</p>
                        <p className="text-3xl font-black italic">{selectedSeries?.items?.length || 0}</p>
                     </div>
                     <div className="pt-4 border-t border-primary/10">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Efficiency</p>
                        <div className="flex items-center gap-2">
                           <BarChart3 className="w-4 h-4 text-primary" />
                           <span className="text-sm font-black italic">High</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Units Grid */}
               <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {selectedSeries?.items?.map((item: any) => (
                    <ContentCard key={item.id} content={item} showCreator={false} />
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
