'use client';

import { Settings, Share2, MapPin, Link as LinkIcon, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ProfileHeaderProps {
  user: any;
  profile: any;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onEditToggle: () => void;
  onFollowToggle?: () => void;
}

export function ProfileHeader({ 
  user, 
  profile, 
  isOwnProfile, 
  isFollowing, 
  onEditToggle, 
  onFollowToggle 
}: ProfileHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] bg-linear-to-br from-primary via-secondary to-accent p-1 shadow-2xl shadow-primary/20 rotate-3 group-hover:rotate-6 transition-transform">
            <div className="w-full h-full rounded-[2.3rem] bg-[#0a0a0f] overflow-hidden -rotate-3 group-hover:-rotate-6 transition-transform border-4 border-[#0a0a0f]">
              {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                <img 
                  src={`${profile?.avatar_url || user?.user_metadata?.avatar_url}?t=${profile?._ts || Date.now()}`} 
                  alt={profile?.full_name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/50">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white border-4 border-[#0a0a0f] shadow-lg">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>
        </div>

        {/* Identity */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-black font-heading uppercase italic tracking-tighter">
            {profile?.full_name || user?.user_metadata?.full_name || 'Loading...'}
          </h1>
          <p className="text-primary font-black text-xs uppercase tracking-widest opacity-80 decoration-primary decoration-2 underline-offset-4 decoration-dotted underline">
            @{profile?.username || user?.email?.split('@')[0] || 'profile'}
          </p>
        </div>

        {/* Bio & Details */}
        <div className="max-w-md text-center space-y-6">
          {profile?.bio && (
            <p className="text-sm font-medium leading-relaxed text-muted-foreground italic px-4">
               "{profile.bio}"
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
             {profile?.occupation && (
               <div className="flex items-center gap-2">
                 <Briefcase className="w-3 h-3 text-primary/50" />
                 <span>{profile.occupation}</span>
               </div>
             )}
             
             {profile?.occupation && (profile?.location || profile?.website) && (
               <span className="hidden md:block w-1 h-1 rounded-full bg-white/10" />
             )}

             {profile?.location && (
               <div className="flex items-center gap-2">
                 <MapPin className="w-3 h-3 text-primary/50" />
                 <span>{profile.location}</span>
               </div>
             )}

             {profile?.location && profile?.website && (
               <span className="hidden md:block w-1 h-1 rounded-full bg-white/10" />
             )}

             {profile?.website && (
               <Link href={profile.website} target="_blank" className="flex items-center gap-2 hover:text-primary transition-colors">
                 <LinkIcon className="w-3 h-3 text-primary/50" />
                 <span>Portfolio</span>
               </Link>
             )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full max-w-sm">
          {isOwnProfile ? (
            <>
              <button 
                onClick={onEditToggle}
                className="flex-1 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                Edit Profile
              </button>
              <Link
                href="/settings"
                className="p-4 rounded-2xl bg-white/5 border border-white/5 text-white hover:bg-white/10 transition-all active:scale-90"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </>
          ) : (
            <>
              <button 
                onClick={onFollowToggle}
                className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${
                  isFollowing 
                    ? 'bg-white/5 border border-white/10 text-white' 
                    : 'bg-primary text-white shadow-primary/20'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button className="p-4 rounded-2xl bg-white/5 border border-white/5 text-white hover:bg-white/10 transition-all active:scale-90">
                <Share2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
