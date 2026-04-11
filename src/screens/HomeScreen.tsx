import React from 'react';
import { motion } from 'motion/react';
import { Search, Send } from 'lucide-react';
import { StatusBar } from '../components/layout';

interface HomeScreenProps {
  onOpenApp: (app: string) => void;
  time: string;
}

export const HomeScreen = React.memo(({ onOpenApp, time }: HomeScreenProps) => {
  const apps = [
    { name: 'WhatsApp', icon: 'https://img.icons8.com/color/144/000000/whatsapp.png', color: 'bg-white', padding: 'p-0.5' },
    { name: 'Instagram', icon: 'https://img.icons8.com/color/144/000000/instagram-new.png', color: 'bg-white', padding: 'p-0.5' },
    { name: 'TikTok', icon: 'https://img.icons8.com/color/144/000000/tiktok.png', color: 'bg-white', padding: 'p-0.5' },
  ];

  const dockApps = [
    { name: 'Telefone', icon: 'https://img.icons8.com/ios-filled/144/ffffff/phone.png', color: 'bg-[#34C759]', badge: '47', padding: 'p-2' },
    { name: 'Safari', icon: 'https://img.icons8.com/color/144/000000/safari.png', color: 'bg-white', padding: 'p-0' },
    { name: 'Câmera', icon: 'https://img.icons8.com/ios-filled/144/3a3a3c/camera.png', color: 'bg-[#8E8E93]', padding: 'p-2' },
  ];

  return (
    <div
      className="relative w-full h-full bg-cover bg-center flex flex-col"
      style={{ backgroundImage: 'url(https://i.ibb.co/kRFQsYC/image.png)' }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <StatusBar time={time} />

      <div className="px-6 mt-4 flex gap-4">
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full aspect-square bg-[#1c1c1e] rounded-[28px] p-4 flex flex-col">
            <div className="text-[10px] font-black text-ios-red mb-1">ABRIL</div>
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <span key={`${d}-${i}`} className="text-[8px] font-bold text-white/40">{d}</span>
              ))}
              {[...Array(30)].map((_, i) => {
                const day = i + 1;
                const isToday = day === 7;
                return (
                  <div key={i} className="flex items-center justify-center h-4">
                    <span className={`text-[10px] font-bold ${isToday ? 'bg-ios-red w-4 h-4 rounded-full flex items-center justify-center' : 'text-white'}`}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <span className="text-[11px] font-medium text-white mt-1">Calendário</span>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <div className="w-full aspect-square bg-gradient-to-b from-[#4a5e7b] to-[#2c3e50] rounded-[28px] p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[13px] font-bold">Goiânia</span>
                <div className="rotate-45"><Send size={10} fill="white" /></div>
              </div>
              <div className="text-4xl font-light mt-1">30°</div>
            </div>
            <div>
              <div className="w-6 h-6 bg-white/20 rounded-full mb-1" />
              <p className="text-[10px] font-medium leading-tight">Tempestade e Mais 1</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-white mt-1">Tempo</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-x-4 gap-y-5 px-6 mt-6">
        {apps.map((app) => (
          <div key={app.name} className="flex flex-col items-center gap-1">
            <motion.div
              whileTap={{ scale: 0.9 }}
              onClick={() => onOpenApp(app.name)}
              className={`w-[60px] h-[60px] ${app.color} rounded-[14px] flex items-center justify-center shadow-lg relative overflow-hidden`}
            >
              <img src={app.icon} className={`w-full h-full object-contain ${app.padding || 'p-2'}`} referrerPolicy="no-referrer" />
            </motion.div>
            <span className="text-[11px] font-medium text-white text-center leading-tight">{app.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto mb-4 flex justify-center">
        <div className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full flex items-center gap-1.5">
          <Search size={12} className="text-white/60" />
          <span className="text-[11px] font-medium text-white/80">Buscar</span>
        </div>
      </div>

      <div className="mb-6 mx-auto w-fit h-[84px] bg-white/20 backdrop-blur-2xl rounded-[32px] flex items-center justify-center gap-5 px-6">
        {dockApps.map((app) => (
          <div key={app.name} className="relative">
            <motion.div
              whileTap={{ scale: 0.9 }}
              onClick={() => onOpenApp(app.name)}
              className={`w-[58px] h-[58px] ${app.color} rounded-[13px] flex items-center justify-center shadow-lg overflow-hidden`}
            >
              <img src={app.icon} className={`w-full h-full object-contain ${app.padding || 'p-2'}`} referrerPolicy="no-referrer" />
            </motion.div>
            {app.badge && (
              <div className="absolute -top-1.5 -right-1.5 bg-ios-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-transparent min-w-[20px] text-center">
                {app.badge}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});
