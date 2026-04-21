'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, Users, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from '@/components/ui/user-avatar';
import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import Link from 'next/link';

export function UserSearch() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [myFollowing, setMyFollowing] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setItems([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    fetchMyFollowing();
  }, [currentUser]);

  const fetchMyFollowing = async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUser.id);
    
    if (data) {
      setMyFollowing(new Set(data.map(f => f.following_id)));
    }
  };

  const performSearch = async () => {
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .neq('id', currentUser?.id || '')
        .limit(20);

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleToggleFollow = async (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Join the academy to connect');
      return;
    }

    const isCurrentlyFollowing = myFollowing.has(targetId);

    try {
      if (isCurrentlyFollowing) {
        setProcessingIds(prev => new Set(prev).add(targetId));
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', targetId);
        
        if (error) throw error;

        setMyFollowing(prev => {
          const next = new Set(prev);
          next.delete(targetId);
          return next;
        });
      } else {
        setProcessingIds(prev => new Set(prev).add(targetId));
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: targetId
          });
        
        if (error) {
          if (error.message.includes('Rate Limit')) {
            toast.error(error.message);
            return;
          }
          throw error;
        }

        setMyFollowing(prev => {
          const next = new Set(prev);
          next.add(targetId);
          return next;
        });
        toast.success('Connected!');
      }
    } catch (err: any) {
      console.error('Follow error:', err);
      toast.error(err.message || 'Connection failed');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto group">
        <div className="absolute inset-x-0 -bottom-2 h-10 bg-primary/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <div className="relative flex items-center bg-[#0a0a0f]/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-2 pr-6 group-focus-within:border-primary/30 transition-all">
          <div className="p-4 text-muted-foreground group-focus-within:text-primary transition-colors">
            {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </div>
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search academy members by name or handle..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-muted-foreground/40"
          />
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            Search
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {query.trim() === '' ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="py-20 text-center space-y-4 opacity-20"
            >
              <Users className="w-12 h-12 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Find your squad in the academy</p>
            </motion.div>
          ) : searching && items.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 rounded-[1.5rem] bg-white/5 animate-pulse" />
              ))}
            </motion.div>
          ) : items.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               className="py-20 text-center space-y-4 opacity-40"
            >
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">No members found matching "{query}"</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {items.map((profile) => (
                <div 
                  key={profile.id}
                  className="flex items-center gap-5 p-5 rounded-[2rem] bg-[#0a0a0f]/40 border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all group"
                >
                   <Link href={`/profile/${profile.username}`} className="shrink-0">
                      <UserAvatar 
                        src={profile.avatar_url} 
                        name={profile.full_name || profile.username} 
                        size="lg" 
                        className="group-hover:scale-105"
                      />
                   </Link>
                   
                   <div className="flex-1 min-w-0">
                      <Link href={`/profile/${profile.username}`}>
                        <h3 className="text-[13px] font-black italic truncate leading-none mb-1.5 hover:text-primary transition-colors">{profile.full_name || 'Member'}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground truncate opacity-50">@{profile.username}</p>
                      </Link>
                   </div>

                   <button
                    onClick={(e) => handleToggleFollow(e, profile.id)}
                    disabled={processingIds.has(profile.id)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all h-fit min-w-[90px] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed ${
                      myFollowing.has(profile.id)
                        ? 'bg-white/5 text-white/40 border border-white/5'
                        : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95'
                    } ${processingIds.has(profile.id) ? 'opacity-50 !cursor-wait shadow-none' : ''}`}
                   >
                     {processingIds.has(profile.id) ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                     ) : (
                        myFollowing.has(profile.id) ? 'Following' : 'Follow'
                     )}
                   </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
