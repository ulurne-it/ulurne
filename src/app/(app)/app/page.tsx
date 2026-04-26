'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { VideoPlayer } from '@/components/feed/video-player';
import { GallerySlider } from '@/components/feed/gallery-slider';
import { FeedSidebar } from '@/components/feed/feed-sidebar';
import { FeedContentInfo } from '@/components/feed/feed-content-info';
import { DoubleTapHeart } from '@/components/feed/double-tap-heart';
import { useAppSelector } from '@/store/hooks';

export default function FeedPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const { user } = useAppSelector(state => state.auth);
  const PAGE_SIZE = 5;

  const getPublicUrl = (path: string) => {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('academy-media').getPublicUrl(path);
    return data.publicUrl;
  };

  const fetchFeed = async (pageNum: number, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      else setLoadingMore(true);

      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('content')
        .select('*, profiles(username, full_name, avatar_url), series(title)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        if (isLoadMore) setVideos(prev => [...prev, ...data]);
        else setVideos(data);

        const galleryIds = data.filter(item => item.type === 'image_gallery').map(item => item.id);
        if (galleryIds.length > 0) fetchGalleries(galleryIds);

        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
      toast.error('Failed to sync academy feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchGalleries = async (contentIds: string[]) => {
    try {
      const { data } = await supabase
        .from('content_gallery')
        .select('*')
        .in('content_id', contentIds)
        .order('display_order', { ascending: true });

      if (data) {
        const mapped = data.reduce((acc: any, img: any) => {
          if (!acc[img.content_id]) acc[img.content_id] = [];
          acc[img.content_id].push(img);
          return acc;
        }, {});
        setGalleryImages(prev => ({ ...prev, ...mapped }));
      }
    } catch (err) {
      console.error('Error fetching galleries:', err);
    }
  };

  useEffect(() => {
    fetchFeed(0);
    
    // Subscribe to content changes for real-time likes
    const channel = supabase
      .channel('feed-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'content' },
        (payload) => {
          setVideos(prev => prev.map(v => 
            v.id === payload.new.id ? { ...v, likes_count: payload.new.likes_count } : v
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (user && videos.length > 0) {
      fetchUserLikes();
    }
  }, [user, videos.length]);

  const fetchUserLikes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('content_likes')
      .select('content_id')
      .eq('user_id', user.id)
      .in('content_id', videos.map(v => v.id));
    
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

    setVideos(prev => prev.map(v => 
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
      // Rollback on error
      setLikedIds(prev => {
        const next = new Set(prev);
        if (isLiked) next.add(contentId);
        else next.delete(contentId);
        return next;
      });
      setVideos(prev => prev.map(v => 
        v.id === contentId 
          ? { ...v, likes_count: (v.likes_count || 0) + (isLiked ? 1 : -1) } 
          : v
      ));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollToIndex(Math.min(videos.length - 1, currentIndex + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToIndex(Math.max(0, currentIndex - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length]);

  const scrollToIndex = (index: number) => {
    document.getElementById(`feed-item-${index}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const index = Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight);
    if (index !== currentIndex) {
      setCurrentIndex(index);
      if (index >= videos.length - 2 && hasMore && !loadingMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchFeed(nextPage, true);
      }
    }
  };

  if (loading && videos.length === 0) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse text-white">Syncing Academy Feed...</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onScroll={onScroll}
      className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth hide-scrollbar bg-black relative"
    >
      {videos.map((item, index) => {
        const isVideo = item.type?.startsWith('video');
        const isGallery = item.type === 'image_gallery';
        const isActive = index === currentIndex;

        return (
          <section
            key={item.id}
            id={`feed-item-${index}`}
            className="h-screen w-full snap-start relative flex flex-col justify-end overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-black">
              <DoubleTapHeart onDoubleTap={() => !likedIds.has(item.id) && handleLike(item.id)}>
                {isVideo ? (
                  <VideoPlayer 
                    src={getPublicUrl(item.media_url)} 
                    isActive={isActive} 
                  />
                ) : isGallery ? (
                  <GallerySlider 
                    images={galleryImages[item.id] || []} 
                    isActive={isActive}
                    getPublicUrl={getPublicUrl}
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
          onClick={() => scrollToIndex(Math.min(videos.length - 1, currentIndex + 1))}
          disabled={currentIndex === videos.length - 1 && !hasMore}
          className="p-2 hover:text-primary transition-colors disabled:opacity-10"
         >
          <ChevronDown className="w-8 h-8" />
         </button>
      </div>
    </div>
  );
}
