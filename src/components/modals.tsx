import React from 'react';
import { motion } from 'motion/react';

export const AppUnavailableModal = React.memo(({ appName, onClose }: { appName: string; onClose: () => void }) => (
  <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-10">
    <motion.div
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-[#f0f0f0]/95 backdrop-blur-2xl w-full max-w-[270px] rounded-[14px] overflow-hidden flex flex-col items-center shadow-2xl"
    >
      <div className="p-5 text-center">
        <h3 className="text-[17px] font-bold text-black mb-1">{appName}</h3>
        <p className="text-[13px] text-black/80 leading-tight">Este app está indisponível no momento.</p>
      </div>
      <button
        onClick={onClose}
        className="w-full h-11 border-t border-black/10 text-ios-blue text-[17px] font-medium active:bg-black/10 transition-colors"
      >
        OK
      </button>
    </motion.div>
  </div>
));
