'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/lib/supabase';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileStats } from '@/components/profile/profile-stats';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { VideoGrid } from '@/components/profile/video-grid';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { FollowsModal } from '@/components/profile/follows-modal';

import { Laboratory } from '@/components/profile/laboratory';
import { ContentCard } from '@/components/sections/content-card';
import { ProfileFeedOverlay } from '@/components/profile/profile-feed-overlay';

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [profile, setProfile] = useState<any>(null);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, videos: 0, likes: 0 });
  const [activeTab, setActiveTab] = useState('feed');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followsModal, setFollowsModal] = useState<{ isOpen: boolean; type: 'followers' | 'following' }>({
    isOpen: false,
    type: 'followers'
  });

  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);

  const getPublicUrl = (path: string) => {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('academy-media').getPublicUrl(path);
    return data.publicUrl;
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchFeed();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeed = async () => {
    if (!user) return;
    try {
      // Fetch from both legacy 'videos' and new 'content'
      const [vRes, cRes] = await Promise.all([
        supabase.from('videos').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('content').select('*, profiles(username, full_name, avatar_url), series(title)').eq('creator_id', user.id).order('created_at', { ascending: false })
      ]);

      const combined = [
        ...(cRes.data || []),
        ...(vRes.data || []).map(v => ({ 
          ...v, 
          type: 'video_short', 
          title: v.title || 'Legacy Bite',
          media_url: v.video_url 
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Fetch thumbnails for galleries
      const galleryIds = combined.filter(i => i.type === 'image_gallery').map(i => i.id);
      if (galleryIds.length > 0) {
        const { data: thumbs } = await supabase
          .from('content_gallery')
          .select('content_id, image_url')
          .in('content_id', galleryIds)
          .order('display_order', { ascending: true });
        
        if (thumbs) {
          const thumbMap = thumbs.reduce((acc: any, t: any) => {
             if (!acc[t.content_id]) acc[t.content_id] = t.image_url;
             return acc;
          }, {});
          
          const finalItems = combined.map(item => ({
            ...item,
            thumbnail_url: item.thumbnail_url || thumbMap[item.id]
          }));
          setFeedItems(finalItems);
          console.log('Profile Feed Loaded:', finalItems.length, 'items');
        } else {
          setFeedItems(combined);
        }
      } else {
        setFeedItems(combined);
      }
      
      setStats(prev => ({ ...prev, videos: combined.length }));
    } catch (err) {
      console.error('Feed fetch error:', err);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    try {
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id);

      setStats(prev => ({
        ...prev,
        followers: followersCount || 0,
        following: followingCount || 0
      }));
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleUpdateProfile = async (values: any) => {
    if (!user) return;
    try {
      await supabase.from('profiles').update(values).eq('id', user.id);
      setIsEditOpen(false);
      fetchProfile();
      toast.success('Academy profile synced!');
    } catch (err) {
      toast.error('Sync failed');
    }
  };

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="absolute top-0 left-0 right-0 h-64 bg-linear-to-b from-primary/10 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 pt-12 space-y-10">
        <ProfileHeader
          user={user}
          profile={profile}
          isOwnProfile={true}
          onEditToggle={() => setIsEditOpen(true)}
        />

        <ProfileStats
          stats={stats}
          onStatClick={(type) => setFollowsModal({ isOpen: true, type })}
        />

        <div className="pt-8">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'feed' && (
                <VideoGrid 
                  videos={feedItems} 
                  onVideoClick={(index) => setSelectedVideoIndex(index)} 
                />
              )}

              {activeTab === 'laboratory' && <Laboratory />}

              {activeTab === 'saved' && (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                  <p className="font-black uppercase tracking-widest text-xs">No saved insights yet</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isEditOpen && (
          <EditProfileForm userId={user.id} initialValues={profile} onClose={() => setIsEditOpen(false)} onSave={handleUpdateProfile} />
        )}
        {followsModal.isOpen && (
          <FollowsModal userId={profile.id} username={profile.username} type={followsModal.type} onClose={() => setFollowsModal(prev => ({ ...prev, isOpen: false }))} />
        )}
        {selectedVideoIndex !== null && (
          <ProfileFeedOverlay 
            isOpen={true} 
            videos={feedItems} 
            initialIndex={selectedVideoIndex} 
            onClose={() => setSelectedVideoIndex(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
