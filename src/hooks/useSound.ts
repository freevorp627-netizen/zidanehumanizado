import { useRef, useCallback } from 'react';

const SOUNDS = {
  notification: '/notificacao-audio.mp3',
  whatsapp: '/som-notificacao-whatsapp.mp3',
  utmify: '/som-notificacao-utmify.mp3',
  incoming_call: '/audio-ligacao.mp3',
  vibration: '/som-vibracao-ligacao.mp3',
  hangup: '/som-desligar-call.mp3',
  whatsapp_msg: '/mensagem-dentro-do-whatsapp.mp3',
};

export const useSound = () => {
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});

  const playSound = useCallback((key: keyof typeof SOUNDS, loop = false) => {
    if (!audioCache.current[key]) {
      audioCache.current[key] = new Audio(SOUNDS[key]);
    }
    
    const audio = audioCache.current[key];
    audio.loop = loop;
    
    // Reset if already playing or ended
    audio.currentTime = 0;
    
    return audio.play().catch(e => {
        console.warn(`Sound ${key} blocked:`, e);
    });
  }, []);

  const stopSound = useCallback((key: keyof typeof SOUNDS) => {
    const audio = audioCache.current[key];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  return { playSound, stopSound };
};
