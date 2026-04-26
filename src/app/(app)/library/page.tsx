'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentCard } from '@/components/sections/content-card';
import { 
  Sparkles, Filter, LayoutGrid, 
  Film, Image as ImageIcon, BookOpen, 
  Loader2, Search as SearchIcon
} from 'lucide-react';
import { toast } from 'sonner';

const FILTERS = [
  { id: 'all', name: 'Discovery Feed', icon: Sparkles },
  { id: 'video_long', name: 'Masterclasses', icon: BookOpen },
  { id: 'video_short', name: 'Academy Insights', icon: Film },
  { id: 'image_gallery', name: 'Visual Exhibits', icon: ImageIcon },
];

export default function LibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 12;

  const fetchContent = async (pageNum: number, filterType: string, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      else setLoadingMore(true);

      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('content')
        .select('*, profiles(username, full_name, avatar_url), series(title)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      const { data, error } = await query.range(from, to);

      if (error) throw error;

      if (isLoadMore) {
        setItems(prev => [...prev, ...(data || [])]);
      } else {
        setItems(data || []);
      }

      setHasMore((data || []).length === PAGE_SIZE);
    } catch (err: any) {
      console.error('Library fetch error:', err);
      toast.error('Failed to sync discovery feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchContent(0, activeFilter);
  }, [activeFilter]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchContent(nextPage, activeFilter, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, activeFilter]);

  return (
    <div className="relative min-h-screen pb-20">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-primary/5 blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-12 space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-5xl md:text-7xl font-black font-heading uppercase italic tracking-tighter leading-none"
              >
                The <span className="text-primary italic">Library</span>
              </motion.h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1">
                 Access the collective intelligence of the academy
              </p>
           </div>

           {/* Mobile Filter Toggle placeholder or search */}
           <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl w-full md:w-96 focus-within:border-primary/50 transition-all">
              <SearchIcon className="w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search tutorials, series..."
                className="bg-transparent border-none outline-none text-xs font-bold w-full placeholder:opacity-30"
              />
           </div>
        </div>

        {/* Dynamic Navigation Filters */}
        <div className="flex items-center gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] w-fit backdrop-blur-xl">
           {FILTERS.map((f) => (
             <button
               key={f.id}
               onClick={() => setActiveFilter(f.id)}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative cursor-pointer ${
                 activeFilter === f.id ? 'text-white' : 'text-muted-foreground hover:text-white hover:bg-white/5'
               }`}
             >
               <f.icon className="w-3.5 h-3.5" />
               {f.name}
               {activeFilter === f.id && (
                 <motion.div 
                   layoutId="active-library-filter"
                   className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl -z-10 shadow-xl"
                 />
               )}
             </button>
           ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           <AnimatePresence mode="wait">
             {loading && items.length === 0 ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-video rounded-[2.5rem] bg-white/[0.03] animate-pulse" />
                ))
             ) : items.length === 0 ? (
                <div className="col-span-full py-32 text-center space-y-4 opacity-30">
                   <LayoutGrid className="w-12 h-12 mx-auto" />
                   <p className="text-xs font-black uppercase tracking-widest italic">No academy insights recorded in this sector</p>
                </div>
             ) : (
                items.map((item) => (
                  <ContentCard key={item.id} content={item} />
                ))
             )}
           </AnimatePresence>
        </div>

        {/* Loading Indicator / Intersection Anchor */}
        <div ref={observerTarget} className="h-20 flex items-center justify-center">
            {loadingMore && (
              <div className="flex items-center gap-3 opacity-50">
                 <Loader2 className="w-5 h-5 animate-spin text-primary" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Scanning deeper records...</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
