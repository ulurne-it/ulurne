'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/store/hooks';
import { FolderPlus, Book, Hash, Loader2, Plus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SeriesSelectorProps {
  onSelect: (seriesId: string | 'standalone', isNew?: boolean, newData?: any) => void;
  selectedId?: string | 'standalone';
}

export function SeriesSelector({ onSelect, selectedId }: SeriesSelectorProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'select' | 'create'>('select');
  
  // New Series State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    if (user) fetchSeries();
  }, [user]);

  const fetchSeries = async () => {
    try {
      const { data, error } = await supabase
        .from('series')
        .select('*')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSeries(data || []);
      
      // Default to standalone if no series exist
      if (!selectedId && (data?.length === 0)) {
        onSelect('standalone');
      }
    } catch (err) {
      console.error('Error fetching series:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    onSelect('new', true, { title: newTitle, description: newDesc });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          Organization / Series
        </label>
        
        <button 
          onClick={() => setMode(mode === 'select' ? 'create' : 'select')}
          className="text-primary text-[10px] font-black uppercase flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          {mode === 'select' ? <Plus className="w-3.5 h-3.5" /> : <Book className="w-3.5 h-3.5" />}
          {mode === 'select' ? 'Start New Series' : 'Select Existing'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'select' ? (
          <motion.div 
            key="select-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 gap-2"
          >
            {/* Standalone Option */}
            <button
              onClick={() => onSelect('standalone')}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                selectedId === 'standalone' 
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                  : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              <div className={`p-2.5 rounded-xl transition-colors ${
                selectedId === 'standalone' ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground group-hover:text-white'
              }`}>
                <Hash className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider">Standalone Content</p>
                <p className="text-[9px] font-medium text-muted-foreground opacity-60">One-off post in your feed</p>
              </div>
            </button>

            {loading ? (
              <div className="flex items-center justify-center py-6 opacity-30">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              series.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                    selectedId === s.id 
                      ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${
                    selectedId === s.id ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground group-hover:text-white'
                  }`}>
                    <Book className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider">{s.title}</p>
                    <p className="text-[9px] font-medium text-muted-foreground opacity-60 truncate">
                      {s.description || 'Academy Tutorial Series'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="create-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-4"
          >
            <div className="space-y-2">
              <input 
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter series title (e.g. Masterclass 2024)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-primary/50 transition-all placeholder:opacity-30"
              />
              <textarea 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe what this series covers..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-primary/50 transition-all placeholder:opacity-30 min-h-[80px] resize-none"
              />
            </div>
            
            <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-[9px] leading-relaxed text-primary/80 font-bold uppercase tracking-tight">
                New series will be created automatically when you publish your first content to it.
              </p>
            </div>

            <button
               onClick={handleCreate}
               disabled={!newTitle.trim()}
               className="w-full py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
               Connect to new series
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
