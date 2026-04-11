import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageSquare, Send, Bookmark, Home, User, Plus, MessageCircle } from 'lucide-react';
import { StatusBar } from '../components/layout';
import { VideoPlayer } from '../components/VideoPlayer';

interface TikTokProps {
  onEnterLive?: () => void;
  time: string;
}

export const TikTokFeedScreen = React.memo(({ onEnterLive, time }: TikTokProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const tiktoks = [
    { id: 1, video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/1.mp4', user: 'memesbr___433', avatar: 'https://i.ibb.co/2RXzWH7/image.png' },
    { id: 2, video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/2.mp4', user: 'joaozinn321', avatar: 'https://i.ibb.co/Nd10ts1F/image.png' },
    { id: 4, isLive: true, user: '@zidanerocha', viewers: '1.2k' },
  ];

  return (
    <div className="relative w-full h-full bg-black flex flex-col">
      <StatusBar time={time} />
      <div className="flex-1 relative overflow-y-scroll snap-y snap-mandatory no-scrollbar" onScroll={(e) => setCurrentIndex(Math.round(e.currentTarget.scrollTop / (e.currentTarget.clientHeight || 844)))}>
        {tiktoks.map((tt, i) => (
          <div key={tt.id} className="h-full w-full snap-start relative" onClick={tt.isLive ? onEnterLive : undefined}>
            <VideoPlayer src={tt.isLive ? "https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/WhatsApp%20Video%202026-04-11%20at%2000.50.19.mp4" : tt.video!} isActive={currentIndex === i} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
            <div className="absolute bottom-6 left-4 right-16 z-10">
                {tt.isLive && <div className="bg-ios-red px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 mb-2">LIVE agora</div>}
                <h4 className="font-bold text-[16px] text-white">@{tt.user}</h4>
            </div>
            {!tt.isLive && (
                <div className="absolute bottom-6 right-4 flex flex-col items-center gap-5 z-10">
                    <Heart size={32} fill="white" />
                    <MessageSquare size={32} fill="white" />
                    <Bookmark size={32} fill="white" />
                    <Send size={32} fill="white" />
                </div>
            )}
          </div>
        ))}
      </div>
      <div className="h-[84px] bg-black flex items-center justify-around px-4 pb-4">
        <Home size={24} className="text-white" /><User size={24} className="text-white/60" /><Plus size={24} className="text-white" /><MessageCircle size={24} className="text-white/60" /><User size={24} className="text-white/60" />
      </div>
    </div>
  );
});

export const TikTokLiveScreen = React.memo(({ time }: { time: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [likes, setLikes] = useState(100000);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setLikes(l => l + 10), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-[100]"><StatusBar time={time} /></div>
      <video ref={videoRef} autoPlay loop playsInline preload="auto" className="w-full h-full object-cover" src="https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/WhatsApp%20Video%202026-04-11%20at%2000.50.19.mp4" />
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/20" />
            <div className="text-white"><p className="font-bold text-sm">Zidane Rocha</p><p className="text-xs">Liked {likes}</p></div>
        </div>
        <div className="space-y-2 max-h-32 overflow-hidden flex flex-col justify-end">
            <div className="text-white/80 text-sm bg-black/20 p-1 rounded">Boa noite zid!</div>
            <div className="text-white/80 text-sm bg-black/20 p-1 rounded">Live braba demais</div>
        </div>
      </div>
    </div>
  );
});
