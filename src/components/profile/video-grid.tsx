'use client';

import { Play, Eye, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoGridProps {
  videos: any[];
}

export function VideoGrid({ videos }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30">
        <Play className="w-12 h-12 mb-4" />
        <p className="font-black uppercase tracking-[0.3em] text-xs">No Content Yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-1 md:gap-4">
      {videos.map((video, i) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-white/5 border border-white/5 cursor-pointer"
        >
          {video.thumbnail_url ? (
            <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 opacity-20" />
             </div>
          )}
          
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
            <div className="flex items-center gap-1.5 text-white font-black text-[10px] uppercase italic tracking-tighter">
              <Eye className="w-3 h-3" />
              {video.view_count >= 1000 ? `${(video.view_count / 1000).toFixed(1)}K` : video.view_count}
            </div>
            <p className="text-[10px] text-white truncate font-medium mt-1">
              {video.title}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
