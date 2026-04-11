import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Phone, Video, Volume2, MicOff, MoreHorizontal, Grid } from 'lucide-react';
import { StatusBar } from '../components/layout';
import { useSound } from '../hooks/useSound';

interface IncomingCallProps {
  onAccept: () => void;
  time: string;
}

export const IncomingCallScreen = React.memo(({ onAccept, time }: IncomingCallProps) => {
  return (
    <div className="relative w-full h-full bg-[#1c1c1e] flex flex-col items-center">
      <StatusBar time={time} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      <div className="z-10 text-center mt-24">
        <p className="text-white/60 text-[17px] font-medium mb-1">FaceTime de vídeo...</p>
        <h2 className="text-[34px] font-bold text-white tracking-tight">Zidane Rocha</h2>
      </div>

      <div className="z-10 w-full px-12 flex justify-between items-center mt-auto mb-20">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="w-[64px] h-[64px] rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/40 cursor-not-allowed"
          >
            <Phone size={28} className="rotate-[135deg]" fill="currentColor" />
          </motion.div>
          <span className="text-[13px] font-medium text-white/40">Recusar</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onAccept}
            className="w-[64px] h-[64px] rounded-full bg-ios-green flex items-center justify-center text-white shadow-lg"
          >
            <Video size={28} fill="white" />
          </motion.button>
          <span className="text-[13px] font-medium text-white">Aceitar</span>
        </div>
      </div>
    </div>
  );
});

interface FaceTimeProps {
  onFinish: () => void;
  onNearEnd?: () => void;
  time: string;
}

export const FaceTimeScreen = React.memo(({ onFinish, onNearEnd, time }: FaceTimeProps) => {
  const [timer, setTimer] = useState(0);
  const [nearEndFired, setNearEndFired] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { playSound } = useSound();

  const hangUp = () => {
    playSound('hangup');
    onFinish();
  };

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (video.duration && video.duration - video.currentTime <= 2 && !nearEndFired) {
        setNearEndFired(true);
        onNearEnd?.();
      }
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const controls = [
    { name: 'Áudio', icon: <Volume2 size={20} />, color: 'bg-white text-black' },
    { name: 'FaceTime', icon: <Video size={20} />, color: 'bg-white/20 text-white' },
    { name: 'Mudo', icon: <MicOff size={20} />, color: 'bg-white/20 text-white' },
    { name: 'Mais', icon: <MoreHorizontal size={20} />, color: 'bg-white/20 text-white' },
    { name: 'Desligar', icon: <Phone size={20} className="rotate-[135deg]" fill="white" />, color: 'bg-ios-red text-white' },
    { name: 'Teclado Numérico', icon: <Grid size={20} />, color: 'bg-white/20 text-white' },
  ];

  return (
    <div className="relative w-full h-full bg-[#1c1c1e]">
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          onEnded={hangUp}
          onTimeUpdate={handleTimeUpdate}
          preload="auto"
          className="w-full h-full object-cover"
          src="https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/WhatsApp%20Video%202026-04-08%20at%2015.57.00.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-10 bg-black z-50 flex items-center">
        <StatusBar time={time} />
      </div>

      <div className="absolute top-10 left-0 right-0 pt-4 text-center z-40 bg-gradient-to-b from-black/80 to-transparent pb-10">
        <p className="text-white/60 text-[13px] font-medium">FaceTime de vídeo...</p>
        <h2 className="text-[28px] font-bold text-white tracking-tight">Zidane Rocha</h2>
        <p className="text-white/40 text-[13px] mt-1">{formatTime(timer)}</p>
      </div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute bottom-20 left-0 right-0 px-12"
      >
        <div className="grid grid-cols-3 gap-y-6 gap-x-2">
          {controls.map((control, index) => (
            <div key={control.name} className="flex flex-col items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.92, transition: { duration: 0.1 } }}
                className={`w-[56px] h-[56px] rounded-full flex items-center justify-center shadow-lg ${control.color}`}
              >
                {control.icon}
              </motion.button>
              <span className="text-[11px] font-medium text-white/90 text-center leading-tight">
                {control.name.split(' ').map((word, i) => <div key={i}>{word}</div>)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
});
