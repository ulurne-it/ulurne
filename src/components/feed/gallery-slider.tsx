'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface GallerySliderProps {
  images: any[];
  isActive: boolean;
  getPublicUrl: (path: string) => string;
  onView?: () => void;
}

export function GallerySlider({ images, isActive, getPublicUrl, onView }: GallerySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    if (isActive && images.length > 0 && !hasViewed) {
      setHasViewed(true);
      onView?.();
    }
    if (!isActive) {
      setHasViewed(false);
    }
  }, [isActive, images.length, hasViewed]);

  // Autoswipe logic
  useEffect(() => {
    if (!isActive || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [isActive, images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 backdrop-blur-3xl gap-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Syncing Media...</p>
      </div>
    );
  }

  return (
    <div className="group/gallery relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
      <motion.div
        className="flex w-full h-full cursor-grab active:cursor-grabbing"
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{ type: "spring", stiffness: 250, damping: 30, mass: 0.5 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(e, { offset, velocity }) => {
          const threshold = 50;
          const velocityThreshold = 500;

          if ((offset.x < -threshold || velocity.x < -velocityThreshold) && currentIndex < images.length - 1) {
            setCurrentIndex(prev => prev + 1);
          } else if ((offset.x > threshold || velocity.x > velocityThreshold) && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
          }
        }}
      >
        {images.map((img, i) => (
          <div key={i} className="w-full h-full shrink-0 relative flex items-center justify-center bg-black/20 overflow-hidden">
            {/* Blurred Background */}
            <motion.img
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 0.4 }}
              src={getPublicUrl(img.image_url)}
              className="absolute inset-0 w-full h-full object-cover blur-3xl"
              alt=""
            />
            {/* Main Image */}
            <AnimatePresence mode="wait">
              <motion.img
                key={`${img.image_url}-${currentIndex === i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                src={getPublicUrl(img.image_url)}
                className="relative max-w-full max-h-full object-contain z-10 pointer-events-none drop-shadow-2xl px-4"
                alt=""
              />
            </AnimatePresence>
          </div>
        ))}
      </motion.div>

      {/* Gallery Info Overlay */}
      <div className="absolute top-24 right-6 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black z-30 text-white shadow-2xl">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Gallery Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
            }}
            disabled={currentIndex === 0}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-primary/20 hover:border-primary/30 disabled:hidden active:scale-90"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (currentIndex < images.length - 1) setCurrentIndex(prev => prev + 1);
            }}
            disabled={currentIndex === images.length - 1}
            className="absolute right-20 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-primary/20 hover:border-primary/30 disabled:hidden active:scale-90"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Progress Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
        {images.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-primary' : 'w-1 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
}
