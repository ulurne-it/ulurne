'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, Music, UserPlus } from 'lucide-react';

const STATIC_VIDEOS = [
  {
    id: 1,
    creator: '@design_master',
    description: 'Learn the basics of Glassmorphism in 60 seconds! 🎨 #Design #WebDev',
    song: 'Original Sound - Design Master',
    likes: '128.4K',
    comments: '1.2K',
    saves: '45.2K',
    shares: '12K',
    color: 'bg-indigo-600',
  },
  {
    id: 2,
    creator: '@code_queen',
    description: 'Next.js 16 is here! Top 3 features you NEED to know. 🚀 #NextJS #Programming',
    song: 'Future Beats - Code Queen',
    likes: '89.2K',
    comments: '842',
    saves: '32.1K',
    shares: '8K',
    color: 'bg-emerald-600',
  },
  {
    id: 3,
    creator: '@math_wizard',
    description: 'Calculus made easy: The Power Rule in under a minute! 📐 #Math #Education',
    song: 'Lofi Study Session - Math Wizard',
    likes: '245K',
    comments: '3.5K',
    saves: '120K',
    shares: '20K',
    color: 'bg-amber-600',
  },
];

export default function FeedPage() {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar bg-black">
      {STATIC_VIDEOS.map((video) => (
        <section
          key={video.id}
          className="h-screen w-full snap-start relative flex flex-col justify-end"
        >
          {/* Background Placeholder for Video */}
          <div className={`absolute inset-0 ${video.color} opacity-20`} />
          <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/80" />

          {/* Content Overlay */}
          <div className="relative z-10 flex w-full p-6 pb-24 md:pb-8 lg:pb-12 h-fit">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center font-black">
                  {video.creator.charAt(1).toUpperCase()}
                </div>
                <span className="font-black text-lg">{video.creator}</span>
                <button className="bg-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  Connect
                </button>
              </div>
              <p className="text-sm max-w-[80%] leading-relaxed">
                {video.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted">
                <Music className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{video.song}</span>
              </div>
            </div>

            {/* Interaction Buttons */}
            <div className="flex flex-col gap-6 items-center">
              <InteractionButton icon={Heart} label={video.likes} />
              <InteractionButton icon={MessageCircle} label={video.comments} />
              <InteractionButton icon={Bookmark} label={video.saves} />
              <InteractionButton icon={Share2} label={video.shares} />

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-full border-4 border-white/20 p-1 mt-4"
              >
                <div className="w-full h-full rounded-full bg-linear-to-br from-primary to-secondary" />
              </motion.div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function InteractionButton({ icon: Icon, label }: { icon: any; label: string }) {
  const [active, setActive] = useState(false);

  return (
    <button
      onClick={() => setActive(!active)}
      className="flex flex-col items-center gap-1 group"
    >
      <div className={`w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 transition-all ${active ? 'bg-primary/20 text-primary border-primary/30' : 'group-hover:bg-white/10'
        }`}>
        <Icon className={`w-6 h-6 transition-transform group-active:scale-125 ${active ? 'fill-current' : ''}`} />
      </div>
      <span className="text-[10px] font-black tracking-widest uppercase opacity-80">{label}</span>
    </button>
  );
}
