'use client';

interface ProfileStatsProps {
  stats: {
    followers: number;
    following: number;
    videos: number;
    likes: number;
  };
  onStatClick?: (type: 'followers' | 'following') => void;
}

export function ProfileStats({ stats, onStatClick }: ProfileStatsProps) {
  const items = [
    { label: 'Followers', value: stats.followers, type: 'followers' as const },
    { label: 'Following', value: stats.following, type: 'following' as const },
    { label: 'Content', value: stats.videos, type: null },
    { label: 'Likes', value: stats.likes, type: null },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-lg mx-auto">
      {items.map((item) => (
        <div 
          key={item.label}
          onClick={() => item.type && onStatClick?.(item.type)}
          className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl bg-[#0a0a0f]/40 border border-white/5 backdrop-blur-md transition-all ${item.type ? 'cursor-pointer hover:bg-white/10 hover:border-white/20 active:scale-95' : ''}`}
        >
          <span className="text-xl font-black font-heading tracking-tighter italic">
            {item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}K` : item.value}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mt-1">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
