import React from 'react';
import { motion } from 'motion/react';
import { Fingerprint, Camera } from 'lucide-react';
import { StatusBar } from '../components/layout';

interface LockScreenProps {
  onUnlock: () => void;
  time: string;
  date: string;
}

export const LockScreen = React.memo(({ onUnlock, time, date }: LockScreenProps) => {
  return (
    <div
      className="relative w-full h-full bg-cover bg-center flex flex-col items-center"
      style={{ backgroundImage: 'url(https://i.ibb.co/kRFQsYC/image.png)' }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <StatusBar time={time} />

      <div className="mt-12 text-center z-10 text-white/90">
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-[20px] font-medium mb-[-5px]"
        >
          {date}
        </motion.p>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-[100px] font-serif font-light tracking-tight leading-none"
        >
          {time}
        </motion.h1>

        <div className="mt-2 flex flex-col items-start px-10 w-full">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-md border border-white/40 flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-white/60 rounded-[1px]" />
            </div>
            <span className="text-[14px] font-medium">52%</span>
          </div>
          <p className="text-[14px] font-medium text-white/80">iPhone de Desconhecido</p>
          <div className="w-32 h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-white w-[52%]" />
          </div>
        </div>
      </div>

      <div className="mt-auto mb-12 flex flex-col items-center z-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onUnlock}
          className="relative w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Fingerprint size={40} className="text-white/80" />
          </motion.div>
          <div className="absolute inset-0 rounded-full border-2 border-ios-blue/50 animate-ping opacity-20" />
        </motion.button>
        <p className="mt-4 text-white/60 font-medium animate-pulse">Toque para desbloquear</p>
      </div>

      <div className="absolute bottom-12 left-0 right-0 px-12 flex justify-between items-center z-10">
        <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center border border-white/10">
          <div className="w-5 h-8 border-2 border-white/80 rounded-sm relative">
            <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-2 h-1 bg-white/80 rounded-t-sm" />
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/80 rounded-full" />
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center border border-white/10">
          <Camera size={24} className="text-white/80" />
        </div>
      </div>
    </div>
  );
});
