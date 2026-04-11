import { useRef, useCallback } from 'react';

const R2_BASE_URL = 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/audios';

const SOUNDS = {
  notification: `${R2_BASE_URL}/notificacao-audio.mp3`,
  whatsapp: `${R2_BASE_URL}/som-notificacao-whatsapp.mp3`,
  utmify: `${R2_BASE_URL}/som-notificacao-utmify.mp3`,
  incoming_call: `${R2_BASE_URL}/audio-ligacao.mp3`,
  vibration: `${R2_BASE_URL}/som-vibracao-ligacao.mp3`,
  hangup: `${R2_BASE_URL}/som-desligar-call.mp3`,
  whatsapp_msg: `${R2_BASE_URL}/mensagem-dentro-do-whatsapp.mp3`,
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
