'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { VideoPlayer } from '@/components/feed/video-player';
import { GallerySlider } from '@/components/feed/gallery-slider';
import { FeedSidebar } from '@/components/feed/feed-sidebar';
import { FeedContentInfo } from '@/components/feed/feed-content-info';
import { DoubleTapHeart } from '@/components/feed/double-tap-heart';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

interface ProfileFeedOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  videos: any[];
  initialIndex: number;
}

export function ProfileFeedOverlay({ isOpen, onClose, videos, initialIndex }: ProfileFeedOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [galleryImages, setGalleryImages] = useState<Record<string, any[]>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(videos);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const element = document.getElementById(`video-${initialIndex}`);
      element?.scrollIntoView({ behavior: 'instant' });
      setCurrentIndex(initialIndex);
      fetchGalleries();
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Set initial items from prop
      setItems(videos);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex, videos]);

  useEffect(() => {
    if (!isOpen) return;

    // Real-time subscription
    const channel = supabase
      .channel('profile-feed-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'content' },
        (payload) => {
          setItems(prev => prev.map(v => 
            v.id === payload.new.id ? { ...v, likes_count: payload.new.likes_count, views_count: payload.new.views_count } : v
          ));
        }
      )
      .subscribe();

    if (user && items.length > 0) {
      fetchUserLikes();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, user, items.length]);

  const fetchUserLikes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('content_likes')
      .select('content_id')
      .eq('user_id', user.id)
      .in('content_id', items.map(v => v.id));
    
    if (data) {
      setLikedIds(new Set(data.map(d => d.content_id)));
    }
  };

  const handleLike = async (contentId: string) => {
    if (!user) {
      toast.error('Please login to like');
      return;
    }

    const isLiked = likedIds.has(contentId);
    
    // Optimistic Update
    setLikedIds(prev => {
      const next = new Set(prev);
      if (isLiked) next.delete(contentId);
      else next.add(contentId);
      return next;
    });

    setItems(prev => prev.map(v => 
      v.id === contentId 
        ? { ...v, likes_count: (v.likes_count || 0) + (isLiked ? -1 : 1) } 
        : v
    ));

    try {
      if (isLiked) {
        await supabase
          .from('content_likes')
          .delete()
          .match({ content_id: contentId, user_id: user.id });
      } else {
        await supabase
          .from('content_likes')
          .insert({ content_id: contentId, user_id: user.id });
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      // Rollback
      setLikedIds(prev => {
        const next = new Set(prev);
        if (isLiked) next.add(contentId);
        else next.delete(contentId);
        return next;
      });
      setItems(prev => prev.map(v => 
        v.id === contentId 
          ? { ...v, likes_count: (v.likes_count || 0) + (isLiked ? 1 : -1) } 
          : v
      ));
    }
  };

  const handleView = async (contentId: string) => {
    try {
      setItems(prev => prev.map(v => 
        v.id === contentId ? { ...v, views_count: (v.views_count || 0) + 1 } : v
      ));

      await supabase
        .from('content_views')
        .insert({ content_id: contentId, user_id: user?.id });
    } catch (err) {
      // UNIQUE handles duplicates
    }
  };

  // Keyboard Listeners for Desktop Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const nextIndex = Math.min(videos.length - 1, currentIndex + 1);
        scrollToIndex(nextIndex);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prevIndex = Math.max(0, currentIndex - 1);
        scrollToIndex(prevIndex);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, videos.length, onClose]);

  const getPublicUrl = (path: string) => {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('academy-media').getPublicUrl(path);
    return data.publicUrl;
  };

  const fetchGalleries = async () => {
    const galleries = videos.filter(v => v.type === 'image_gallery');
    if (galleries.length === 0) return;

    try {
      const { data } = await supabase
        .from('content_gallery')
        .select('*')
        .in('content_id', galleries.map(v => v.id))
        .order('display_order', { ascending: true });

      if (data) {
        const mapped = data.reduce((acc: any, img: any) => {
          if (!acc[img.content_id]) acc[img.content_id] = [];
          acc[img.content_id].push(img);
          return acc;
        }, {});
        setGalleryImages(mapped);
      }
    } catch (err) {
      console.error('Error fetching gallery images:', err);
    }
  };

  const scrollToIndex = (index: number) => {
    document.getElementById(`video-${index}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 left-6 z-[60] p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 transition-all"
      >
        <X className="w-6 h-6" />
      </button>

      <div 
        ref={containerRef}
        className="h-full w-full max-w-md mx-auto overflow-y-auto snap-y snap-mandatory scroll-smooth hide-scrollbar relative bg-[#0a0a0f]"
        onScroll={(e) => {
          const index = Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight);
          if (index !== currentIndex) setCurrentIndex(index);
        }}
      >
        {items.map((item, index) => {
          const isVideo = item.type?.startsWith('video');
          const isGallery = item.type === 'image_gallery';
          const isActive = index === currentIndex;

          return (
            <section
              key={item.id}
              id={`video-${index}`}
              className="h-full w-full snap-start relative flex flex-col justify-end overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-black">
                <DoubleTapHeart onDoubleTap={() => !likedIds.has(item.id) && handleLike(item.id)}>
                  {isVideo ? (
                    <VideoPlayer 
                      src={getPublicUrl(item.media_url)} 
                      isActive={isActive} 
                      onView={() => handleView(item.id)}
                    />
                  ) : isGallery ? (
                    <GallerySlider 
                      images={galleryImages[item.id] || []} 
                      isActive={isActive}
                      getPublicUrl={getPublicUrl}
                      onView={() => handleView(item.id)}
                    />
                  ) : (
                    <img 
                      src={getPublicUrl(item.media_url || item.thumbnail_url)} 
                      className="w-full h-full object-contain" 
                      alt=""
                    />
                  )}
                </DoubleTapHeart>
              </div>

              <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

              <FeedContentInfo 
                username={item.profiles?.username}
                avatarUrl={item.profiles?.avatar_url}
                type={item.type}
                title={item.title}
                description={item.description}
              />

              <FeedSidebar 
                likes={item.likes_count || 0}
                comments={item.comments_count || 0}
                saves={item.saves_count || 0}
                isLiked={likedIds.has(item.id)}
                onLike={() => handleLike(item.id)}
              />
            </section>
          );
        })}
      </div>

      <div className="fixed right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4 text-white/20 z-50">
         <button 
          onClick={() => scrollToIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="p-2 hover:text-primary transition-colors disabled:opacity-10"
         >
          <ChevronUp className="w-8 h-8" />
         </button>
         <div className="h-20 w-[1px] bg-white/10 mx-auto" />
         <button 
          onClick={() => scrollToIndex(Math.min(items.length - 1, currentIndex + 1))}
          disabled={currentIndex === items.length - 1}
          className="p-2 hover:text-primary transition-colors disabled:opacity-10"
         >
          <ChevronDown className="w-8 h-8" />
         </button>
      </div>
    </motion.div>
  );
}
