'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, ArrowRight, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserAvatar } from '@/components/ui/user-avatar';
import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import Link from 'next/link';

export function SuggestedUsers() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myFollowing, setMyFollowing] = useState<Set<string>>(new Set());
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSuggested();
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

  const PAGE_SIZE = 10;

  const fetchSuggested = async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);

    try {
      const from = isLoadMore ? items.length : 0;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('trending_profiles')
        .select('*')
        .neq('id', currentUser?.id || '')
        .range(from, to);

      if (error) throw error;

      if (isLoadMore) {
        setItems(prev => [...prev, ...(data || [])]);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
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
        toast.success('Academy Connection Established!');
      }
    } catch (err: any) {
      console.error('Follow error:', err);
      toast.error(err.message || 'Failed to sync connection');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-30">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-[9px] font-black uppercase tracking-widest">Finding Trending Members...</p>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <>
      {items.map((profile, i) => (
        <motion.div
          key={profile.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-6 p-4 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all group"
        >
          <Link href={`/profile/${profile.username}`} className="shrink-0">
            <UserAvatar
              src={profile.avatar_url}
              name={profile.full_name || profile.username}
              size="lg"
              className="group-hover:scale-110 transition-transform shadow-none"
            />
          </Link>

          <div className="flex-1 min-w-0 pr-4">
            <Link href={`/profile/${profile.username}`}>
              <h3 className="text-sm font-black italic leading-none mb-2 group-hover:text-primary transition-colors">
                {profile.full_name || 'Member'}
              </h3>
              <div className="flex items-center gap-2 opacity-50">
                <p className="text-[10px] font-bold">@{profile.username}</p>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <p className="text-[10px] font-black uppercase tracking-tighter">{profile.follower_count} Network Base</p>
              </div>
            </Link>
          </div>

          <button
            onClick={(e) => handleToggleFollow(e, profile.id)}
            disabled={processingIds.has(profile.id)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all h-fit shrink-0 min-w-[90px] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed ${myFollowing.has(profile.id)
              ? 'bg-white/5 text-white/50 border border-white/5'
              : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all'
              } ${processingIds.has(profile.id) ? 'opacity-50 !cursor-wait shadow-none' : ''}`}
          >
            {processingIds.has(profile.id) ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              myFollowing.has(profile.id) ? 'Following' : 'Follow'
            )}
          </button>
        </motion.div>
      ))}

      {items.length >= PAGE_SIZE && (
        <div className="col-span-full pt-8 flex justify-center">
          <button 
            onClick={() => fetchSuggested(true)}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 rounded-[1.5rem] bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white hover:scale-105 active:scale-95 transition-all shadow-2xl cursor-pointer disabled:cursor-wait"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            Discovery more members
          </button>
        </div>
      )}
    </>
  );
}