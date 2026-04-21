'use client';

import { useState, useEffect, useRef } from 'react';
import { X, UserPlus, Users, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from '@/components/ui/user-avatar';
import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import Link from 'next/link';

interface FollowsModalProps {
  userId: string;
  username: string;
  type: 'followers' | 'following';
  onClose: () => void;
}

export function FollowsModal({ userId, username, type, onClose }: FollowsModalProps) {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 10;

  const fetchItems = async (pageNum: number) => {
    try {
      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase.from('follows').select(`
        created_at,
        profiles!follows_${type === 'followers' ? 'follower_id' : 'following_id'}_fkey (
          id,
          username,
          full_name,
          avatar_url,
          bio
        )
      `);

      if (type === 'followers') {
        query = query.eq('following_id', userId);
      } else {
        query = query.eq('follower_id', userId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const formattedData = data.map((item: any) => item.profiles);
      
      if (pageNum === 0) {
        setItems(formattedData);
      } else {
        setItems(prev => [...prev, ...formattedData]);
      }

      setHasMore(formattedData.length === PAGE_SIZE);
    } catch (err: any) {
      console.error('Error fetching follows:', err);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const [myFollowing, setMyFollowing] = useState<Set<string>>(new Set());
  const [confirmingUnfollow, setConfirmingUnfollow] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

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

  const handleToggleFollow = async (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      toast.error('Join the academy to follow members');
      return;
    }

    const isCurrentlyFollowing = myFollowing.has(targetId);

    try {
      if (isCurrentlyFollowing) {
        // Step 1: Open Confirmation
        if (confirmingUnfollow !== targetId) {
          setConfirmingUnfollow(targetId);
          return;
        }

        // Step 2: Execute Unfollow
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
        setConfirmingUnfollow(null);
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
      }
    } catch (err: any) {
      console.error('Connection error:', err);
      toast.error('Connection sync failed: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }
  };

  useEffect(() => {
    fetchItems(0);
    fetchMyFollowing();
  }, [userId, type]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setLoadingMore(true);
          const nextPage = page + 1;
          setPage(nextPage);
          fetchItems(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden h-[80vh] flex flex-col"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              {type === 'followers' ? <Users className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest italic leading-none">
                {type === 'followers' ? 'Followers' : 'Following'}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1 opacity-50">
                @{username}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest">Scanning Academy Records...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20">
              {type === 'followers' ? <Users className="w-12 h-12" /> : <UserPlus className="w-12 h-12" />}
              <p className="text-xs font-black uppercase tracking-widest italic">No connections found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((profile) => (
                <div 
                  key={profile.id} 
                  className="flex items-center gap-3 p-2 px-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                >
                  <Link 
                    href={`/profile/${profile.username}`}
                    onClick={onClose}
                    className="flex flex-1 items-center gap-3 min-w-0 cursor-pointer"
                  >
                    <UserAvatar 
                      src={profile.avatar_url} 
                      name={profile.full_name || profile.username} 
                      size="md" 
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-black italic truncate leading-tight group-hover:text-primary transition-colors">{profile.full_name || `@${profile.username}`}</h3>
                      <p className="text-[9px] font-bold text-muted-foreground truncate opacity-60">@{profile.username}</p>
                    </div>
                  </Link>

                  {currentUser?.id !== profile.id && (
                    <div className="relative">
                      <AnimatePresence>
                        {confirmingUnfollow === profile.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-red-500 text-white px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-tighter whitespace-nowrap shadow-xl z-10 flex items-center gap-2 cursor-default"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            Confirm Unfollow?
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingUnfollow(null);
                              }}
                              className="ml-1 opacity-50 hover:opacity-100 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        onClick={(e) => handleToggleFollow(e, profile.id)}
                        disabled={processingIds.has(profile.id)}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all h-fit min-w-[70px] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed ${
                          myFollowing.has(profile.id)
                            ? confirmingUnfollow === profile.id 
                                ? 'bg-red-500 text-white border-none scale-105' 
                                : 'bg-white/5 border border-white/10 text-white'
                            : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105'
                        } ${processingIds.has(profile.id) ? 'opacity-50 !cursor-wait shadow-none' : ''}`}
                      >
                        {processingIds.has(profile.id) ? (
                          <Loader2 className="w-3 h-3 animate-spin text-white" />
                        ) : (
                          myFollowing.has(profile.id) 
                            ? confirmingUnfollow === profile.id ? 'Disconnect' : 'Following' 
                            : 'Follow'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} className="h-10 flex items-center justify-center">
                {loadingMore && (
                  <Loader2 className="w-5 h-5 animate-spin text-primary opacity-50" />
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
