import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageSquare, Send, Bookmark, MoreHorizontal, Home, Search, Video, Music, Plus } from 'lucide-react';
import { StatusBar } from '../components/layout';
import { VideoPlayer } from '../components/VideoPlayer';

interface InstagramProps {
  onNext: () => void;
  time: string;
}

export const InstagramReelsScreen = React.memo(({ onNext, time }: InstagramProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [likedReels, setLikedReels] = useState<number[]>([]);

  const reels = [
    { id: 1, avatar: 'https://i.ibb.co/0pDBnkKW/image.png', video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/ssstik.io_%40sociologofalou_1775873231326.mp4', user: '@raiam_cortes', desc: 'Shape não serve pra nada...', likes: '128k', comments: '3.4k' },
    { id: 2, avatar: 'https://i.ibb.co/xqgQcMQs/image.png', video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/SaveClip.App_AQM_ZLm6U2nG05c_nSCJxQLBAosgqajqOCDKVb6o6rA6_i2igz2NnZhP8Re0bXskQB5e5_r0aQoIcbzxpmVeFV8fRLbjIa6CJdS8hOg.mp4', user: '@memes_br322', desc: 'siga para mais videos', likes: '45.2k', comments: '892' },
    { id: 4, isAd: true, avatar: 'https://i.ibb.co/ZP5wt8W/image.png', video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/vsl%20zid.mov', user: '@zidane.rochaa', desc: 'pov : você não precisa mentir para escalar.', likes: '256k', comments: '12.5k' },
  ];

  return (
    <div className="relative w-full h-full bg-black flex flex-col">
      <StatusBar time={time} />
      <div className="flex-1 relative overflow-y-scroll snap-y snap-mandatory no-scrollbar" onScroll={(e) => setCurrentIndex(Math.round(e.currentTarget.scrollTop / (scrollRef.current?.clientHeight || 844)))}>
        <div ref={scrollRef} className="h-full">
            {reels.map((reel, i) => (
            <div key={reel.id} className="h-full w-full snap-start relative">
                <VideoPlayer src={reel.video} isActive={currentIndex === i} onDoubleTap={() => setLikedReels(p=>[...p, reel.id])} onEnded={() => reel.isAd && onNext()} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
                <div className="absolute bottom-6 left-4 right-16 pointer-events-none z-10">
                <div className="flex items-center gap-2 mb-3">
                    <img src={reel.avatar} className="w-8 h-8 rounded-full" />
                    <span className="font-bold text-[14px] text-white">{reel.user}</span>
                    <button className="text-[12px] font-bold px-3 py-1 rounded-lg border bg-white/10 border-white/20 text-white pointer-events-auto" onClick={() => reel.isAd && onNext()}>Seguir</button>
                </div>
                <p className="text-[14px] text-white mb-1">{reel.desc}</p>
                <div className="flex items-center gap-2"><Music size={12} className="text-white" /><span className="text-[12px] text-white">Som original</span></div>
                </div>
                <div className="absolute bottom-6 right-4 flex flex-col items-center gap-5 z-10">
                <Heart size={32} className={likedReels.includes(reel.id) ? "text-ios-red fill-ios-red" : "text-white"} onClick={() => setLikedReels(p=>[...p, reel.id])} />
                <MessageSquare size={32} className="text-white" />
                <Send size={32} className="text-white" />
                <Bookmark size={32} className="text-white" />
                <img src={reel.avatar} className="w-8 h-8 rounded-lg border-2 border-white" />
                </div>
            </div>
            ))}
        </div>
      </div>
      <div className="h-[84px] bg-black flex items-center justify-around px-4 pb-4">
        <Home size={26} className="text-white" /><Search size={26} className="text-white" /><div className="w-7 h-7 border-2 border-white rounded-lg flex items-center justify-center"><Plus size={18} className="text-white" /></div><Video size={26} className="text-white" /><div className="w-7 h-7 rounded-full bg-neutral-600 border border-white/20"></div>
      </div>
    </div>
  );
});
