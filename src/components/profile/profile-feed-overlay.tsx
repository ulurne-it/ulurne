'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, Music, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';
import { supabase } from '@/lib/supabase';

interface ProfileFeedOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  videos: any[];
  initialIndex: number;
}

export function ProfileFeedOverlay({ isOpen, onClose, videos, initialIndex }: ProfileFeedOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [galleryImages, setGalleryImages] = useState<Record<string, any[]>>({});
  const [galleryIndices, setGalleryIndices] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const getPublicUrl = (path: string) => {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('academy-media').getPublicUrl(path);
    return data.publicUrl;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Scroll to the initial video
      setTimeout(() => {
        const element = document.getElementById(`video-${initialIndex}`);
        element?.scrollIntoView({ behavior: 'auto' });
      }, 0);
      
      // Fetch images for all galleries in the current feed
      fetchGalleries();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const nextIndex = Math.min(videos.length - 1, currentIndex + 1);
        const element = document.getElementById(`video-${nextIndex}`);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prevIndex = Math.max(0, currentIndex - 1);
        const element = document.getElementById(`video-${prevIndex}`);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, videos.length, onClose]);

  const navigateTo = (index: number) => {
    const element = document.getElementById(`video-${index}`);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchGalleries = async () => {
    const galleries = videos.filter(v => v.type === 'image_gallery');
    if (galleries.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('content_gallery')
        .select('*')
        .in('content_id', galleries.map(g => g.id))
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

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 left-6 z-[60] p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 transition-all"
      >
        <X className="w-6 h-6" />
      </button>

      <div 
        ref={containerRef}
        className="h-full w-full max-w-md mx-auto overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar relative bg-[#0a0a0f]"
        onScroll={(e) => {
          const index = Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight);
          if (index !== currentIndex) setCurrentIndex(index);
        }}
      >
        {videos.map((item, index) => {
          const isVideo = item.type?.startsWith('video');
          const isGallery = item.type === 'image_gallery';
          const isActive = index === currentIndex;
          const images = galleryImages[item.id] || [];

          return (
            <section
              key={item.id}
              id={`video-${index}`}
              className="h-full w-full snap-start relative flex flex-col justify-end overflow-hidden"
            >
              {/* Media Content */}
              <div className="absolute inset-0 w-full h-full">
                {isVideo ? (
                  <video
                    src={getPublicUrl(item.media_url)}
                    className="w-full h-full object-cover"
                    autoPlay={isActive}
                    loop
                    muted
                    playsInline
                  />
                ) : isGallery ? (
                  <div className="group/gallery relative w-full h-full overflow-hidden">
                    <motion.div 
                      id={`gallery-${item.id}`}
                      className="flex h-full cursor-grab active:cursor-grabbing"
                      animate={{ x: `-${(galleryIndices[item.id] || 0) * 100}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(e, { offset, velocity }) => {
                        const currentImgIndex = galleryIndices[item.id] || 0;
                        const threshold = 50;
                        if (offset.x < -threshold && currentImgIndex < images.length - 1) {
                          setGalleryIndices(prev => ({ ...prev, [item.id]: currentImgIndex + 1 }));
                        } else if (offset.x > threshold && currentImgIndex > 0) {
                          setGalleryIndices(prev => ({ ...prev, [item.id]: currentImgIndex - 1 }));
                        }
                      }}
                    >
                      {images.length > 0 ? (
                        images.map((img: any, i: number) => (
                          <div key={i} className="w-full h-full shrink-0 relative">
                            <img 
                              src={getPublicUrl(img.image_url)} 
                              className="w-full h-full object-cover pointer-events-none" 
                              alt=""
                            />
                          </div>
                        ))
                      ) : (
                         <img 
                           src={getPublicUrl(item.thumbnail_url || item.media_url)} 
                           className="w-full h-full object-cover opacity-50" 
                           alt=""
                         />
                      )}
                    </motion.div>

                    {/* Gallery Info Overlay */}
                    {images.length > 0 && (
                      <div className="absolute top-20 right-6 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black z-30">
                        {(galleryIndices[item.id] || 0) + 1} / {images.length}
                      </div>
                    )}

                    {/* Gallery Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentImgIndex = galleryIndices[item.id] || 0;
                            if (currentImgIndex > 0) {
                              setGalleryIndices(prev => ({ ...prev, [item.id]: currentImgIndex - 1 }));
                            }
                          }}
                          disabled={(galleryIndices[item.id] || 0) === 0}
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-primary/20 hover:border-primary/30 disabled:hidden"
                        >
                          <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentImgIndex = galleryIndices[item.id] || 0;
                            if (currentImgIndex < images.length - 1) {
                              setGalleryIndices(prev => ({ ...prev, [item.id]: currentImgIndex + 1 }));
                            }
                          }}
                          disabled={(galleryIndices[item.id] || 0) === images.length - 1}
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-primary/20 hover:border-primary/30 disabled:hidden"
                        >
                          <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <img 
                    src={getPublicUrl(item.media_url || item.thumbnail_url)} 
                    className="w-full h-full object-cover" 
                    alt=""
                  />
                )}
              </div>

              <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

              {/* Content Overlay */}
              <div className="relative z-10 p-6 pb-12 space-y-4 pointer-events-none">
                <div className="flex items-center gap-3">
                  <UserAvatar 
                    src={item.profiles?.avatar_url} 
                    name={item.profiles?.username || 'Member'} 
                    size="sm"
                    className="border-2 border-primary/50"
                  />
                  <span className="font-black text-white text-sm uppercase tracking-wider italic">
                     @{item.profiles?.username || 'anonymous'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[8px] font-black uppercase tracking-widest text-primary">
                    {item.type === 'video_short' ? 'Academy Insight' : item.type === 'video_long' ? 'Full Tutorial' : 'Visual Gallery'}
                  </span>
                </div>
                
                <h3 className="text-lg font-black text-white leading-tight uppercase italic tracking-tight">
                  {item.title}
                </h3>
                
                <p className="text-xs text-white/70 max-w-[90%] leading-relaxed line-clamp-2">
                  {item.description || 'Exclusive insight from the ULurne Academy research labs.'}
                </p>
                
                <div className="flex items-center gap-2 text-[10px] text-primary/60 font-bold uppercase tracking-[0.2em]">
                  <Music className="w-3 h-3" />
                  <span>Academy Beats - Original</span>
                </div>
              </div>

              {/* Side Interactions */}
              <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-20">
                 <FeedActionButton icon={Heart} label={item.likes_count || '0'} />
                 <FeedActionButton icon={MessageCircle} label={item.comments_count || '0'} />
                 <FeedActionButton icon={Bookmark} label={item.saves_count || '0'} />
                 <FeedActionButton icon={Share2} label="Share" />
                 
                 <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 rounded-full border-2 border-primary/30 p-1 mt-4"
                >
                  <div className="w-full h-full rounded-full bg-linear-to-br from-primary to-secondary" />
                </motion.div>
              </div>
            </section>
          );
        })}
      </div>
      
      {/* Navigation Hints */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4 text-white/20">
         <button 
          onClick={() => navigateTo(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="p-2 hover:text-primary transition-colors disabled:opacity-10 disabled:cursor-not-allowed"
         >
          <ChevronUp className="w-8 h-8" />
         </button>
         <div className="h-20 w-[1px] bg-white/10 mx-auto" />
         <button 
          onClick={() => navigateTo(Math.min(videos.length - 1, currentIndex + 1))}
          disabled={currentIndex === videos.length - 1}
          className="p-2 hover:text-primary transition-colors disabled:opacity-10 disabled:cursor-not-allowed"
         >
          <ChevronDown className="w-8 h-8" />
         </button>
      </div>
    </motion.div>
  );
}

function FeedActionButton({ icon: Icon, label }: { icon: any; label: string | number }) {
  return (
    <button className="flex flex-col items-center gap-1 group">
      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
        <Icon className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
      </div>
      <span className="text-[10px] font-black text-white/70 tracking-widest uppercase">{label}</span>
    </button>
  );
}
