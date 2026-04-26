'use client';

import { motion } from 'framer-motion';
import { Play, Clock, Folder, Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';
import Link from 'next/link';
import Image from 'next/image';

interface ContentCardProps {
  content: any;
  showCreator?: boolean;
}

export function ContentCard({ content, showCreator = true }: ContentCardProps) {
  const isVideo = content.type.startsWith('video');
  const isShort = content.type === 'video_short';
  
  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col bg-[#0a0a0f]/40 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-primary/30 transition-all hover:bg-white/[0.03] shadow-2xl"
    >
      {/* Media Preview Container */}
      <div className="relative aspect-video overflow-hidden bg-white/5">
        {content.thumbnail_url ? (
          <Image 
            src={content.thumbnail_url} 
            alt={content.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
            {isVideo ? <Play className="w-10 h-10 text-primary/20 group-hover:scale-125 transition-transform" /> : <Folder className="w-10 h-10 text-primary/20" />}
          </div>
        )}

        {/* Dynamic Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-xl border ${
             isShort ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-white/10 border-white/10 text-white'
           }`}>
             {isShort ? 'Academy Insight' : isVideo ? 'Full Tutorial' : 'Visual Gallery'}
           </span>
           
           {content.series && (
              <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-black/60 backdrop-blur-xl border border-white/10 text-white/60">
                Part of Series
              </span>
           )}
        </div>

        {isVideo && content.duration_seconds > 0 && (
          <div className="absolute bottom-4 right-4 px-2 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/5 text-[9px] font-black text-white">
            {formatDuration(content.duration_seconds)}
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <div className="p-4 rounded-full bg-primary text-white shadow-2xl scale-75 group-hover:scale-100 transition-transform">
              <Play className="w-6 h-6 fill-current" />
           </div>
        </div>
      </div>

      {/* Content Meta */}
      <div className="p-6 space-y-4">
        <div>
           {content.series && (
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1.5 opacity-80">
                {content.series.title}
             </p>
           )}
           <h3 className="text-sm font-black uppercase italic tracking-wider leading-tight group-hover:text-primary transition-colors truncate">
             {content.title}
           </h3>
        </div>

        {showCreator && content.profiles && (
           <div className="flex items-center justify-between pt-2">
              <Link href={`/profile/${content.profiles.username}`} className="flex items-center gap-2 group/creator">
                 <UserAvatar 
                   src={content.profiles.avatar_url} 
                   name={content.profiles.full_name || content.profiles.username} 
                   size="sm" 
                 />
                 <div>
                    <p className="text-[9px] font-black uppercase leading-none mb-0.5">{content.profiles.full_name || 'Member'}</p>
                    <p className="text-[8px] font-bold text-muted-foreground opacity-50 leading-none">Academy Researcher</p>
                 </div>
              </Link>
              
              <div className="flex items-center gap-3">
                 <button className="p-1.5 text-muted-foreground hover:text-white transition-colors">
                    <Heart className="w-4 h-4" />
                 </button>
                 <button className="p-1.5 text-muted-foreground hover:text-white transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                 </button>
              </div>
           </div>
        )}
      </div>
    </motion.div>
  );
}
