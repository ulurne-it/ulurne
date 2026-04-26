'use client';

import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeedSidebarProps {
  likes: number;
  comments: number;
  saves: number;
  onLike?: () => void;
  onComment?: () => void;
  onSave?: () => void;
  onShare?: () => void;
}

export function FeedSidebar({ likes, comments, saves, onLike, onComment, onSave, onShare }: FeedSidebarProps) {
  return (
    <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-20">
      <FeedActionButton icon={Heart} label={likes} onClick={onLike} />
      <FeedActionButton icon={MessageCircle} label={comments} onClick={onComment} />
      <FeedActionButton icon={Bookmark} label={saves} onClick={onSave} />
      <FeedActionButton icon={Share2} label="Share" onClick={onShare} />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-2 border-primary/30 p-1 mt-4"
      >
        <div className="w-full h-full rounded-full bg-linear-to-br from-primary to-secondary" />
      </motion.div>
    </div>
  );
}

function FeedActionButton({ icon: Icon, label, onClick }: { icon: any; label: string | number; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-1 group pointer-events-auto cursor-pointer"
    >
      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
        <Icon className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
      </div>
      <span className="text-[10px] font-black text-white/70 tracking-widest uppercase">{label}</span>
    </button>
  );
}
