import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic } from 'lucide-react';

interface AudioMessageProps {
  sender: string;
  audioSrc?: string;
  audioDuration?: string;
  isZidane: boolean;
  autoPlay?: boolean;
  onEnded?: () => void;
}

const BAR_HEIGHTS = Array.from({ length: 30 }, (_, i) =>
  Math.round(20 + Math.sin(i * 0.7) * 30 + (i % 5) * 8)
);

const SENDER_AVATARS: Record<string, string> = {
  'Victor Ferreira': 'https://i.ibb.co/0p5PtQzn/image.png',
  'Paulo Plinio': 'https://i.ibb.co/j9sGch9D/image.png',
  'Augusto Chagas': 'https://i.ibb.co/wXXQQ9c/image.png',
  'José Matheus': 'https://i.ibb.co/GQYfwcv2/image.png',
  'Felipe Almeida': 'https://i.ibb.co/r29MGRX2/image.png',
  'Zidane Rocha': 'https://i.ibb.co/p69twTYp/image.png',
};

export const AudioMessage =React.memo( ({ sender, audioSrc, audioDuration, isZidane, autoPlay, onEnded }: AudioMessageProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState('0:00');
  const [realDuration, setRealDuration] = useState<string | null>(null);

  useEffect(() => {
    if (!autoPlay || !audioSrc || !audioRef.current) return;
    const audio = audioRef.current;

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (e) {
        setTimeout(async () => {
          try {
            await audio.play();
            setIsPlaying(true);
          } catch (retryError) {
             // Silence
          }
        }, 500);
      }
    };

    playAudio();
    return () => {
      audio.pause();
    };
  }, [autoPlay, audioSrc]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress(audio.currentTime / audio.duration);
    const s = Math.floor(audio.currentTime);
    setElapsed(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play(); setIsPlaying(true); }
  };

  const activeBars = Math.round(progress * 30);

  return (
    <div className="flex flex-col gap-1 px-1 py-1 min-w-[260px]">
      {audioSrc && (
        <audio ref={audioRef} src={audioSrc}
          onLoadedMetadata={() => {
            const d = audioRef.current?.duration;
            if (d) {
              const s = Math.floor(d);
              setRealDuration(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
            }
          }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => { setIsPlaying(false); setProgress(1); onEnded?.(); }}
        />
      )}
      <div className="flex items-center gap-2">
        <button onClick={togglePlay} className="w-9 h-9 shrink-0 flex items-center justify-center active:bg-white/10 rounded-full text-white/60">
          {isPlaying ? (
            <div className="flex gap-[3px] items-center">
              <div className="w-[3px] h-3.5 bg-white/60 rounded-full" />
              <div className="w-[3px] h-3.5 bg-white/60 rounded-full" />
            </div>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between h-6 w-full relative">
            <div
              className="absolute w-[10px] h-[10px] bg-[#3dbed1] rounded-full z-10 -ml-[5px] transition-all duration-100 ease-linear"
              style={{ left: `${Math.max(0, progress * 100)}%` }}
            />
            {BAR_HEIGHTS.map((h, i) => {
              const played = i < activeBars;
              const active = isPlaying && i === activeBars;
              return (
                <motion.div
                  key={i}
                  className={`w-[2.5px] rounded-full ${played ? 'bg-[#8696a0]' : 'bg-white/20'}`}
                  animate={active ? { height: ['30%', '95%', '30%'] } : { height: `${h}%` }}
                  transition={active ? { duration: 0.35, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>
          <div className="flex justify-between items-center w-full mt-1">
            <span className="text-[11px] text-white/50">{progress > 0 ? elapsed : (realDuration || audioDuration)}</span>
            <span className="text-[11px] text-white/50">16:50</span>
          </div>
        </div>

        <div className="w-10 h-10 rounded-full relative shrink-0 ml-1">
          <img src={SENDER_AVATARS[sender] || `https://picsum.photos/seed/${sender}/100/100`} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
          <div className="absolute -bottom-1 -left-1">
            <Mic className="text-[#3dbed1]" size={14} fill="currentColor" />
          </div>
        </div>
      </div>
    </div>
  );
});
