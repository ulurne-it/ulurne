'use client';

interface ProfileStatsProps {
  stats: {
    followers: number;
    following: number;
    videos: number;
    likes: number;
  };
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const items = [
    { label: 'Followers', value: stats.followers },
    { label: 'Following', value: stats.following },
    { label: 'Videos', value: stats.videos },
    { label: 'Likes', value: stats.likes },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-lg mx-auto">
      {items.map((item) => (
        <div 
          key={item.label}
          className="flex flex-col items-center justify-center py-4 px-2 rounded-2xl bg-[#0a0a0f]/40 border border-white/5 backdrop-blur-md"
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
