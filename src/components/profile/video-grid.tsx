'use client';

import { Play, Copy, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface VideoGridProps {
  videos: any[];
  onVideoClick?: (index: number) => void;
}

export function VideoGrid({ videos, onVideoClick }: VideoGridProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30">
        <Play className="w-12 h-12 mb-4" />
        <p className="font-black uppercase tracking-[0.3em] text-xs">No Content Yet</p>
      </div>
    );
  }

  const getPublicUrl = (path: string) => {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('academy-media').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 md:gap-2">
      {videos.map((item, i) => {
        const isGallery = item.type === 'image_gallery';
        const displayThumbnail = item.thumbnail_url; // Already mapped in fetch

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onVideoClick?.(i)}
            className="group relative aspect-[9/16] rounded-sm md:rounded-lg overflow-hidden bg-white/5 cursor-pointer"
          >
            {displayThumbnail ? (
              <img 
                src={getPublicUrl(displayThumbnail)} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
            ) : item.type?.startsWith('video') && item.media_url ? (
              <video 
                src={getPublicUrl(item.media_url)} 
                className="w-full h-full object-cover"
                preload="metadata"
                muted
              />
            ) : (
               <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-white/5 to-white/10">
                  {isGallery ? <ImageIcon className="w-8 h-8 opacity-20" /> : <Play className="w-8 h-8 opacity-20" />}
               </div>
            )}
            
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute top-2 right-2 flex items-center justify-center z-10">
               {isGallery && (
                  <div className="p-1.5 rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-xl">
                     <Copy className="w-3 h-3" />
                  </div>
               )}
            </div>

            <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white font-bold text-[10px] md:text-xs drop-shadow-md">
              {isGallery ? <ImageIcon className="w-3 h-3" /> : <Play className="w-3 h-3 fill-white" />}
              {item.views_count >= 1000 ? `${(item.views_count / 1000).toFixed(1)}K` : item.views_count || 0}
            </div>

            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        );
      })}
    </div>
  );
}
