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

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, videos: 0, likes: 0 });
  const [activeTab, setActiveTab] = useState('videos');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followsModal, setFollowsModal] = useState<{ isOpen: boolean; type: 'followers' | 'following' }>({
    isOpen: false,
    type: 'followers'
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchVideos();
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

      if (!data) {
        // If profile doesn't exist for some reason, create it
        const hName = user.user_metadata?.full_name || 'ULurne Member';
        const hUser = user.email?.split('@')[0] || 'member';
        const hAvatar = user.user_metadata?.avatar_url || '';
        const newProfile = { 
          id: user.id, 
          full_name: hName, 
          username: hUser,
          avatar_url: hAvatar 
        };
        await supabase.from('profiles').insert(newProfile);
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast.error('Failed to load academy profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setVideos(data || []);
    setStats(prev => ({ ...prev, videos: data?.length || 0 }));
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
      // 1. Update the Profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update(values)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. If full_name or avatar_url changed, update Supabase Auth metadata
      // This ensures the Top Bar and other components stay in sync
      if (values.full_name || values.avatar_url) {
        await supabase.auth.updateUser({
          data: { 
            full_name: values.full_name || user.user_metadata.full_name,
            avatar_url: values.avatar_url || user.user_metadata.avatar_url,
          }
        });
      }

      // 3. Re-fetch and update local state explicitly
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!fetchError) {
        setProfile({ ...updatedProfile, _ts: Date.now() }); // Force state change
      }
      
      setIsEditOpen(false);
      toast.success('Academy profile synced across system!');
    } catch (err: any) {
      console.error('Update error:', err);
      toast.error('Failed to update profile: ' + err.message);
    }
  };

  if (loading || !user) {
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
      {/* Background Decor */}
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'videos' && <VideoGrid videos={videos} />}
              {activeTab !== 'videos' && (
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
            userId={user.id}
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
      </AnimatePresence>
    </div>
  );
}
