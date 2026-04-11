import React from 'react';
import { Wifi, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

export const StatusBar = React.memo(({ dark = false, time }: { dark?: boolean; time: string }) => (
  <div className={`flex justify-between items-center px-4 pt-4 pb-1 w-full z-50 ${dark ? 'bg-black text-white' : 'bg-transparent text-white'} select-none font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]`}>
    <div className="flex items-center gap-1.5">
      <div className="font-bold text-[17px] tracking-tight">{time}</div>
      <Navigation size={12} className="fill-white text-white rotate-[90deg] ml-0.5" />
    </div>

    <div className="flex items-center gap-1.5">
      <div className="flex items-end gap-[1px] h-[10px] mb-[1px]">
        <div className="w-[3px] h-[3px] bg-white rounded-[0.5px]" />
        <div className="w-[3px] h-[5px] bg-white rounded-[0.5px]" />
        <div className="w-[3px] h-[7.5px] bg-white/30 rounded-[0.5px]" />
        <div className="w-[3px] h-[10px] bg-white/30 rounded-[0.5px]" />
      </div>
      <Wifi size={16} className="text-white" />
      <div className="relative flex items-center ml-1">
        <div className="w-[26px] h-[13.5px] rounded-[4.5px] relative border-[0.5px] border-white/20 overflow-hidden bg-white/20">
          <div className="absolute top-0 left-0 bottom-0 bg-white" style={{ width: '49%' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9.5px] font-black text-white leading-none mt-[0.5px]">49</span>
            <span 
              className="absolute inset-0 flex items-center justify-center text-[9.5px] font-black text-black leading-none mt-[0.5px]"
              style={{ clipPath: 'inset(0 51% 0 0)' }}
            >
              49
            </span>
          </div>
        </div>
        <div className="w-[1.6px] h-[4.5px] bg-white/40 rounded-r-[1.5px] ml-[0.5px]" />
      </div>
    </div>
  </div>
));

export interface Notification {
  id: string;
  app: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: () => void;
}

export const NotificationBanner = React.memo(({ notification, onDismiss }: { notification: Notification; onDismiss: () => void }) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.95 }}
      drag="y"
      dragConstraints={{ top: -100, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -20) onDismiss();
      }}
      className="absolute top-12 left-4 right-4 z-[100] ios-notification-blur rounded-[28px] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/10 cursor-pointer"
      onClick={notification.action}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-[5px] overflow-hidden flex items-center justify-center">
          {notification.icon}
        </div>
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.05em] flex-1">{notification.app}</span>
        <span className="text-[10px] text-white/40">agora</span>
      </div>
      <div className="flex flex-col">
        <h4 className="text-[15px] font-bold text-white tracking-tight leading-tight">{notification.title}</h4>
        <p className="text-[14px] text-white/90 leading-tight">{notification.message}</p>
      </div>
    </motion.div>
  );
});
