import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Unlock } from 'lucide-react';
import { ShinyButton } from '../components/ui/shiny-button';

interface PresellScreenProps {
  onStart: () => void;
}

export const PresellScreen = React.memo(({ onStart }: PresellScreenProps) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const unlockAudio = () => {
    const silentAudio = new Audio('https://raw.githubusercontent.com/anars/blank-audio/master/250-milliseconds-of-silence.mp3');
    silentAudio.play().then(() => {
      silentAudio.pause();
    }).catch(e => console.log("Audio unlock failed:", e));

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const context = new AudioContext();
      if (context.state === 'suspended') {
        context.resume();
      }
    }
  };

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js";
    s.async = true;
    document.head.appendChild(s);

    if (iframeRef.current) {
      const baseUrl = 'https://scripts.converteai.net/ab14c621-69de-4bc7-ad1a-73b273a93155/players/69d6c18b4461c2c4b58520e1/v4/embed.html';
      const params = (window.location.search || '?') + '&vl=' + encodeURIComponent(window.location.href);
      iframeRef.current.src = baseUrl + params;
    }
  }, []);

  const handleStart = () => {
    unlockAudio();
    setIsUnlocking(true);
    setTimeout(() => {
      onStart();
    }, 1500);
  };

  return (
    <div className="w-full h-full bg-[#0a0a0a] text-white flex flex-col font-sans relative" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', minHeight: '100%' }}>
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#ff0000]/10 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-6 px-6 flex flex-col items-center text-center z-10"
      >
        <div className="bg-[#ff0000]/10 border border-[#ff0000]/20 text-[#ff0000] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
          Imersão 100x - Zidane Rocha
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold pb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent leading-tight mb-3 tracking-tight">
          No final, cada renúncia recebe a sua respectiva recompensa.
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full relative z-10 mb-5 px-6"
      >
        <div className="w-full rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(255,0,0,0.15)] relative overflow-hidden bg-black">
          <div id="ifr_69d6c18b4461c2c4b58520e1_wrapper" style={{ margin: "0 auto", width: "100%" }}>
            <div style={{ position: "relative", padding: "56.018518518518526% 0 0 0" }} id="ifr_69d6c18b4461c2c4b58520e1_aspect">
              <iframe
                ref={iframeRef}
                frameBorder="0"
                allowFullScreen
                allow="autoplay; fullscreen"
                id="ifr_69d6c18b4461c2c4b58520e1"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                referrerPolicy="origin"
              ></iframe>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="z-10 w-full flex flex-col items-center px-6 pb-8 pt-2"
      >
        <p className="text-[11.5px] text-white/80 font-medium mb-4 text-center tracking-tight w-full">
          Clique no botão abaixo e Tenha a melhor Experiência dentro do Digital.
        </p>
        <ShinyButton
          onClick={handleStart}
          disabled={isUnlocking}
          className="w-full font-bold h-14 active:scale-[0.98] transition-transform"
        >
          <AnimatePresence mode="wait">
            {!isUnlocking ? (
              <motion.div
                key="default"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                Iniciar a imersão
                <ChevronLeft className="w-5 h-5 rotate-180" />
              </motion.div>
            ) : (
              <motion.div
                key="unlocking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <Unlock className="w-5 h-5 animate-pulse" />
                </motion.div>
                Desbloqueando...
              </motion.div>
            )}
          </AnimatePresence>
        </ShinyButton>
      </motion.div>
    </div>
  );
});
