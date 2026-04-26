'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  isActive: boolean;
  onTimeUpdate?: (progress: number) => void;
  onSeek?: (progress: number) => void;
}

// Global-like state for mute (shared across instances in the same session)
// Set to false by default as requested, but browsers may block first-play audio
let globalMuted = false;

export function VideoPlayer({ src, isActive, onTimeUpdate }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(globalMuted);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      setIsPlaying(true);
      // Ensure mute state is synced before playing
      video.muted = isMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If unmuted autoplay is blocked, fall back to muted autoplay to ensure visual play
          video.muted = true;
          video.play().catch(() => setIsPlaying(false));
        });
      }
    } else {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(true);
    }
  }, [isActive, src, isMuted]);

  // Sync mute state with global
  useEffect(() => {
    setIsMuted(globalMuted);
  }, [isActive]);

  const togglePlay = (e: React.MouseEvent) => {
    if (seekerRef.current?.contains(e.target as Node)) return;
    
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    globalMuted = newMuted;
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration || isDragging) return;
    const p = (video.currentTime / video.duration) * 100;
    setProgress(p);
    onTimeUpdate?.(p);
  };

  const handleSeek = (e: any) => {
    const video = videoRef.current;
    const seeker = seekerRef.current;
    if (!video || !video.duration || !seeker) return;

    const rect = seeker.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    
    video.currentTime = percentage * video.duration;
    setProgress(percentage * 100);
  };

  const onDragStart = (e: any) => {
    setIsDragging(true);
    handleSeek(e);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: any) => handleSeek(e);
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging]);

  return (
    <div className="relative w-full h-full cursor-pointer bg-black flex items-center justify-center overflow-hidden" onClick={togglePlay}>
      {/* Blurred Background */}
      <video
        src={src}
        className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-110"
        muted
        playsInline
      />
      
      <video
        ref={videoRef}
        src={src}
        className="relative z-10 max-w-full max-h-full object-contain drop-shadow-2xl"
        loop
        muted={isMuted}
        playsInline
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Mute Toggle - Positioned better in bottom right */}
      <button 
        onClick={toggleMute}
        className="absolute bottom-10 right-20 z-50 p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-90 shadow-2xl"
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          >
            <Play className="w-12 h-12 text-white/80 fill-white/20 drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draggable Seeker Bar */}
      {isActive && (
        <div
          ref={seekerRef}
          className="absolute bottom-0 left-0 w-full h-3 flex items-end cursor-pointer z-50 group/seeker"
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full h-1 bg-white/10 relative overflow-hidden group-hover/seeker:h-1.5 transition-all">
            <div
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
          <motion.div 
            className="absolute h-3 w-3 bg-white rounded-full shadow-lg z-[60] opacity-0 group-hover/seeker:opacity-100 transition-opacity"
            style={{ left: `${progress}%`, marginLeft: '-6px', bottom: '-1px' }}
          />
        </div>
      )}
    </div>
  );
}




