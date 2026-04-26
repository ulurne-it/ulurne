'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DoubleTapHeartProps {
  onDoubleTap: () => void;
  children: React.ReactNode;
}

export function DoubleTapHeart({ onDoubleTap, children }: DoubleTapHeartProps) {
  const [showHeart, setShowHeart] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      setShowHeart(true);
      onDoubleTap();
      setTimeout(() => setShowHeart(false), 1000);
    }
    setLastTap(now);
  };

  return (
    <div className="relative w-full h-full cursor-pointer" onClick={handleTap}>
      {children}
      
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1.5, y: -20 }}
            exit={{ opacity: 0, scale: 2, y: -100 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
