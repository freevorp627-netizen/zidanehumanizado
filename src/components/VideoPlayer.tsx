import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, MicOff, Heart } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  isActive: boolean;
  onDoubleTap?: () => void;
  onEnded?: () => void;
}

export const VideoPlayer = React.memo(({ src, isActive, onDoubleTap, onEnded }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const lastTap = useRef<number>(0);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive && !isPaused) {
        videoRef.current.play().catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive, isPaused]);

  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTap.current < 300) {
      onDoubleTap?.();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    } else {
      if (videoRef.current) {
        if (videoRef.current.muted) {
          videoRef.current.muted = false;
          setIsMuted(false);
          videoRef.current.play().catch(() => {});
        } else {
          setIsPaused(!isPaused);
        }
      }
    }
    lastTap.current = now;
  };

  return (
    <div className="w-full h-full relative cursor-pointer" onClick={handleTap}>
      <video
        ref={videoRef}
        src={src}
        loop={!onEnded}
        playsInline
        muted={isMuted}
        preload="auto"
        className="w-full h-full object-cover"
        onEnded={onEnded}
      />
      <AnimatePresence>
        {isPaused && (
           <motion.div initial={{ opacity: 0, scale: 1.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }} className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
             <div className="bg-black/40 p-5 rounded-full backdrop-blur-sm">
               <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1" />
             </div>
           </motion.div>
        )}
        {showHeart && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            <Heart size={100} className="text-ios-red fill-ios-red drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
