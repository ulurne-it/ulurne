'use client';

import { Music } from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';
import Link from 'next/link';

interface FeedContentInfoProps {
  username: string;
  avatarUrl?: string;
  type: string;
  title: string;
  description?: string;
}

export function FeedContentInfo({ username, avatarUrl, type, title, description }: FeedContentInfoProps) {
  const typeLabel = type === 'video_short' ? 'Academy Insight' : type === 'video_long' ? 'Full Tutorial' : 'Visual Gallery';

  return (
    <div className="relative z-10 p-6 pb-24 md:pb-8 lg:pb-12 space-y-4 pointer-events-none">
      <Link 
        href={`/profile/${username}`} 
        className="flex items-center gap-3 pointer-events-auto w-fit group/creator"
      >
        <UserAvatar
          src={avatarUrl}
          name={username || 'Member'}
          size="sm"
          className="border-2 border-primary/50 group-hover/creator:border-primary transition-all duration-300"
        />
        <div className="flex flex-col">
          <span className="font-black text-white text-sm uppercase tracking-wider italic group-hover/creator:text-primary transition-colors">
            @{username || 'anonymous'}
          </span>
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-tight leading-none mt-0.5">
            View Profile
          </span>
        </div>
        <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[8px] font-black uppercase tracking-widest text-primary">
          {typeLabel}
        </span>
      </Link>

      <h3 className="text-lg font-black text-white leading-tight uppercase italic tracking-tight">
        {title}
      </h3>

      <p className="text-xs text-white/70 max-w-[90%] leading-relaxed line-clamp-2">
        {description || 'Exclusive insight from the ULurne Academy research labs.'}
      </p>

      <div className="flex items-center gap-2 text-[10px] text-primary/60 font-bold uppercase tracking-[0.2em]">
        <Music className="w-3 h-3" />
        <span className="truncate">original sound - {username || 'anonymous'}</span>
      </div>
    </div>
  );
}
