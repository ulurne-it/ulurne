'use client';

import { useState, useEffect, use } from 'react';
import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/lib/supabase';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileStats } from '@/components/profile/profile-stats';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { VideoGrid } from '@/components/profile/video-grid';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { FollowsModal } from '@/components/profile/follows-modal';
import { ProfileFeedOverlay } from '@/components/profile/profile-feed-overlay';

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, videos: 0, likes: 0 });
  const [activeTab, setActiveTab] = useState('feed');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followsModal, setFollowsModal] = useState<{ isOpen: boolean; type: 'followers' | 'following' }>({
    isOpen: false,
    type: 'followers'
  });

  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);

  const isOwnProfile = currentUser?.id === profile?.id;

  useEffect(() => {
    fetchProfileByUsername();
  }, [username]);

  useEffect(() => {
    if (profile?.id) {
       checkFollowStatus();
       fetchVideos();
       fetchStats();
    }
  }, [profile, currentUser]);

  const fetchProfileByUsername = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
           toast.error('Member not found');
           router.push('/app');
        }
        throw error;
      };
      
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    if (!profile?.id) return;
    try {
      const [vRes, cRes] = await Promise.all([
        supabase.from('videos').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('content').select('*, profiles(username, full_name, avatar_url), series(title)').eq('creator_id', profile.id).order('created_at', { ascending: false })
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
          
          const finalVideos = combined.map(item => ({
            ...item,
            thumbnail_url: item.thumbnail_url || thumbMap[item.id]
          }));
          setVideos(finalVideos);
        } else {
          setVideos(combined);
        }
      } else {
        setVideos(combined);
      }
      
      setStats(prev => ({ ...prev, videos: combined.length }));
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id);

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile.id);

      const { data: contentLikes } = await supabase
        .from('content')
        .select('likes_count')
        .eq('creator_id', profile.id);

      const totalLikes = contentLikes?.reduce((acc, curr) => acc + (curr.likes_count || 0), 0) || 0;

      setStats(prev => ({ 
        ...prev, 
        followers: followersCount || 0, 
        following: followingCount || 0,
        likes: totalLikes
      }));
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const checkFollowStatus = async () => {
    if (!currentUser || isOwnProfile) return;
    const { data } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', currentUser.id)
      .eq('following_id', profile.id)
      .single();
    
    setIsFollowing(!!data);
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error('Join the academy to follow members');
      return;
    }

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id);
        
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: profile.id
          });
        
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        toast.success(`Following @${profile.username}`);
      }
    } catch (err) {
      toast.error('Failed to sync connection');
    }
  };

  const handleUpdateProfile = async (values: any) => {
    if (!currentUser) return;
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(values)
        .eq('id', currentUser.id);

      if (profileError) throw profileError;

      if (values.full_name || values.avatar_url) {
        await supabase.auth.updateUser({
          data: { 
            full_name: values.full_name || currentUser.user_metadata.full_name,
            avatar_url: values.avatar_url || currentUser.user_metadata.avatar_url,
          }
        });
      }

      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      setProfile(updatedProfile);
      setIsEditOpen(false);
      toast.success('Academy profile synced across system!');
    } catch (err: any) {
      toast.error('Failed to update profile: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="absolute top-0 left-0 right-0 h-64 bg-linear-to-b from-primary/10 to-transparent -z-10 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 pt-12 space-y-10">
        <ProfileHeader 
          user={isOwnProfile ? currentUser : null} 
          profile={profile} 
          isOwnProfile={isOwnProfile} 
          isFollowing={isFollowing}
          onFollowToggle={handleFollowToggle}
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
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               transition={{ duration: 0.2 }}
             >
               {activeTab === 'feed' && (
                 <VideoGrid 
                   videos={videos} 
                   onVideoClick={(index) => setSelectedVideoIndex(index)}
                 />
               )}
               {activeTab !== 'feed' && (
                 <div className="flex flex-col items-center justify-center py-20 opacity-20">
                    <p className="font-black uppercase tracking-widest text-xs">Nothing here yet</p>
                 </div>
               )}
             </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isEditOpen && (
          <EditProfileForm 
            userId={currentUser?.id || ''}
            initialValues={profile} 
            onClose={() => setIsEditOpen(false)} 
            onSave={handleUpdateProfile}
          />
        )}
        
        {followsModal.isOpen && (
          <FollowsModal
            userId={profile.id}
            username={profile.username}
            type={followsModal.type}
            onClose={() => setFollowsModal(prev => ({ ...prev, isOpen: false }))}
          />
        )}

        {selectedVideoIndex !== null && (
          <ProfileFeedOverlay 
            isOpen={true} 
            videos={videos.map(v => ({ ...v, profiles: profile }))} 
            initialIndex={selectedVideoIndex} 
            onClose={() => setSelectedVideoIndex(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
