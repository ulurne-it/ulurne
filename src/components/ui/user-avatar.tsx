'use client';

import { motion } from 'framer-motion';

interface UserAvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: 'w-6 h-6 rounded-md text-[8px]',
  sm: 'w-8 h-8 rounded-lg text-[10px]',
  md: 'w-10 h-10 rounded-xl text-xs',
  lg: 'w-12 h-12 rounded-2xl text-sm',
  xl: 'w-32 h-32 rounded-[2.5rem] text-2xl',
};

const innerBorderRadius = {
  xs: 'rounded-[5px]',
  sm: 'rounded-md',
  md: 'rounded-[10px]',
  lg: 'rounded-[14px]',
  xl: 'rounded-[2.3rem]',
};

export function UserAvatar({ src, name, size = 'md', className = '' }: UserAvatarProps) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  return (
    <div className={`${sizes[size]} shrink-0 overflow-hidden shadow-xl transition-all ${className} ${!src ? 'bg-linear-to-br from-primary via-secondary to-accent' : 'bg-white/5'}`}>
      <div className="w-full h-full flex items-center justify-center">
        {src ? (
          <img 
            src={src} 
            alt={name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = ''; 
              (e.target as HTMLImageElement).style.display = 'none';
              // If image fails, the background gradient will show through
              (e.target as HTMLElement).parentElement?.parentElement?.classList.add('bg-linear-to-br', 'from-primary', 'via-secondary', 'to-accent');
            }}
          />
        ) : (
          <span className="font-black italic tracking-tighter text-white drop-shadow-md">
            {initials}
          </span>
        )}
      </div>
    </div>
  );
}
