import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

// Shared Components
import { NotificationBanner, Notification } from './components/layout';
import { AppUnavailableModal } from './components/modals';

// Screens
import { PresellScreen } from './screens/PresellScreen';
import { LockScreen } from './screens/LockScreen';
import { HomeScreen } from './screens/HomeScreen';
import { IncomingCallScreen, FaceTimeScreen } from './screens/CallScreens';
import { WhatsAppGroupScreen, WhatsAppCommunityScreen } from './screens/WhatsAppScreens';
import { InstagramReelsScreen } from './screens/InstagramScreens';
import { TikTokFeedScreen, TikTokLiveScreen } from './screens/TikTokScreens';

// Hooks
import { useSound } from './hooks/useSound';

type Screen = 'PRESELL' | 'LOCK' | 'HOME' | 'INCOMING_CALL' | 'FACETIME' | 'WHATSAPP_GROUP' | 'WHATSAPP_COMMUNITY' | 'INSTAGRAM_REELS' | 'TIKTOK_FEED' | 'TIKTOK_LIVE';

export default function App() {
  const [screen, setScreen] = useState<Screen>('PRESELL');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unavailableApp, setUnavailableApp] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());
  
  const { playSound, stopSound } = useSound();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateString = currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^\w/, (c) => c.toUpperCase());

  const triggerNotification = useCallback((notif: Notification) => {
    if (shownNotifications.has(notif.id)) return;

    if (notif.id !== 'facetime') {
      let key: any = 'notification';
      if (notif.id.includes('whatsapp')) key = 'whatsapp';
      if (notif.id.includes('utmify')) key = 'utmify';
      playSound(key);
    }

    setTimeout(() => {
      setNotification(notif);
      setShownNotifications(prev => new Set(prev).add(notif.id));
    }, 250);
  }, [shownNotifications, playSound]);

  // Call Audio Logic
  useEffect(() => {
    const shouldRing = (screen === 'HOME' && notification?.id === 'facetime') || screen === 'INCOMING_CALL';
    if (shouldRing) {
      playSound('incoming_call', true);
      playSound('vibration', true);
    } else {
      stopSound('incoming_call');
      stopSound('vibration');
    }
  }, [screen, notification, playSound, stopSound]);

  // Sequence Controller
  useEffect(() => {
    if (screen !== 'HOME' || !isUnlocked) return;

    const sequence: Record<number, { delay: number; next: Screen }> = {
      1: { delay: 4500, next: 'INCOMING_CALL' },
      2: { delay: 6000, next: 'WHATSAPP_GROUP' },
      3: { delay: 6000, next: 'INSTAGRAM_REELS' },
      4: { delay: 6000, next: 'TIKTOK_FEED' },
    };

    const step = sequence[currentStep];
    if (step) {
      const timer = setTimeout(() => {
        if (currentStep !== 1) setNotification(null);
        setScreen(step.next);
      }, step.delay);
      return () => clearTimeout(timer);
    }
  }, [screen, currentStep, isUnlocked]);

  // Notification Triggers
  useEffect(() => {
    if (screen !== 'HOME' || !isUnlocked) return;
    
    const timers: any[] = [];
    
    if (currentStep === 1 && !shownNotifications.has('facetime')) {
      timers.push(setTimeout(() => triggerNotification({
        id: 'facetime', app: 'FaceTime', title: 'Zidane Rocha', message: 'Chamada de vídeo recebida',
        icon: <img src="https://img.icons8.com/color/144/000000/facetime.png" />,
        action: () => setScreen('INCOMING_CALL')
      }), 500));
    }
    
    return () => timers.forEach(t => clearTimeout(t));
  }, [screen, currentStep, isUnlocked, shownNotifications, triggerNotification]);

  const handleJoinCommunity = useCallback(() => {
    setScreen('WHATSAPP_COMMUNITY');
  }, []);

  const handleNextFromCommunity = useCallback(() => {
    triggerNotification({
        id: 'instagram', app: 'Instagram', title: 'Instagram', message: '@ana.kruger te enviou um reel',
        icon: <img src="https://img.icons8.com/color/144/000000/instagram-new.png" />,
        action: () => { setNotification(null); setScreen('INSTAGRAM_REELS'); setCurrentStep(3); }
    });
    setTimeout(() => { setNotification(null); setScreen('INSTAGRAM_REELS'); setCurrentStep(3); }, 4000);
  }, [triggerNotification]);

  const handleNextFromInstagram = useCallback(() => {
    triggerNotification({
        id: 'utmify-1', app: 'Utmify', title: 'Pagamento Aprovado', message: 'Parabéns hoje você está no prejuízo...',
        icon: <div className="rounded-md bg-black px-1"><img src="https://i.ibb.co/Cpx6fH1G/image.png" /></div>
    });
    setTimeout(() => { setScreen('TIKTOK_FEED'); setCurrentStep(4); setTimeout(() => setNotification(null), 4000); }, 1000);
  }, [triggerNotification]);

  return (
    <div className="flex items-center justify-center bg-black font-sans" style={{ minHeight: '100dvh' }}>
      <div className="relative w-full max-w-[450px] bg-black shadow-2xl" style={{ height: '100dvh', overflow: screen === 'PRESELL' ? 'auto' : 'hidden' }}>
        <AnimatePresence>
          {notification && <NotificationBanner key={notification.id} notification={notification} onDismiss={() => setNotification(null)} />}
          {unavailableApp && <AppUnavailableModal appName={unavailableApp} onClose={() => setUnavailableApp(null)} />}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {screen === 'PRESELL' && <motion.div key="p" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}><PresellScreen onStart={() => setScreen('LOCK')} /></motion.div>}
          {screen === 'LOCK' && <motion.div key="l" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LockScreen onUnlock={() => { setIsUnlocked(true); setScreen('HOME'); }} time={timeString} date={dateString} /></motion.div>}
          {screen === 'HOME' && <motion.div key="h" className="w-full h-full" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}><HomeScreen onOpenApp={setUnavailableApp} time={timeString} /></motion.div>}
          {screen === 'INCOMING_CALL' && <motion.div key="ic" className="w-full h-full" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><IncomingCallScreen onAccept={() => { setNotification(null); setScreen('FACETIME'); }} time={timeString} /></motion.div>}
          {screen === 'FACETIME' && (
            <motion.div key="f" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
              <FaceTimeScreen 
                onFinish={() => { setNotification(null); setScreen('WHATSAPP_GROUP'); setCurrentStep(2); }} 
                onNearEnd={() => triggerNotification({
                  id: 'whatsapp', app: 'WhatsApp', title: 'WhatsApp', message: 'Você foi adicionado no grupo HATERS ZIDANE',
                  icon: <img src="https://img.icons8.com/color/144/000000/whatsapp.png" />,
                  action: () => { setNotification(null); setScreen('WHATSAPP_GROUP'); setCurrentStep(2); }
                })}
                time={timeString} 
              />
            </motion.div>
          )}
          {screen === 'WHATSAPP_GROUP' && <motion.div key="wg" className="w-full h-full" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}><WhatsAppGroupScreen onJoinCommunity={handleJoinCommunity} onImageClick={setFullscreenImage} time={timeString} /></motion.div>}
          {screen === 'WHATSAPP_COMMUNITY' && <motion.div key="wc" className="w-full h-full" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}><WhatsAppCommunityScreen onNext={handleNextFromCommunity} onImageClick={setFullscreenImage} time={timeString} /></motion.div>}
          {screen === 'INSTAGRAM_REELS' && <motion.div key="ir" className="w-full h-full" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}><InstagramReelsScreen onNext={handleNextFromInstagram} time={timeString} /></motion.div>}
          {screen === 'TIKTOK_FEED' && <motion.div key="tf" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TikTokFeedScreen onEnterLive={() => setScreen('TIKTOK_LIVE')} time={timeString} /></motion.div>}
          {screen === 'TIKTOK_LIVE' && <motion.div key="tl" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TikTokLiveScreen time={timeString} /></motion.div>}
        </AnimatePresence>

        <AnimatePresence>
          {fullscreenImage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4" onClick={() => setFullscreenImage(null)}>
              <button className="absolute top-10 right-6 text-white bg-white/10 p-2 rounded-full backdrop-blur-md z-20"><X size={24} /></button>
              <img src={fullscreenImage} className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/40 rounded-full z-[100]" />
      </div>
    </div>
  );
}
