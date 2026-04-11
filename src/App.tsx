import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  Phone,
  MessageCircle,
  Camera,
  Instagram,
  Settings,
  Image as ImageIcon,
  Mic,
  Video,
  Volume2,
  UserPlus,
  X,
  Heart,
  MessageSquare,
  Send,
  MoreHorizontal,
  Plus,
  ChevronLeft,
  Search,
  CheckCircle2,
  ShoppingBag,
  Gift,
  Share2,
  Fingerprint,
  MicOff,
  Grid,
  Check,
  Music,
  Home,
  User,
  Bookmark,
  Lock,
  Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShinyButton } from './components/ui/shiny-button';

// --- Types ---
type Screen = 'PRESELL' | 'LOCK' | 'HOME' | 'INCOMING_CALL' | 'FACETIME' | 'WHATSAPP_GROUP' | 'WHATSAPP_COMMUNITY' | 'INSTAGRAM_REELS' | 'TIKTOK_FEED' | 'TIKTOK_LIVE';

interface Notification {
  id: string;
  app: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: () => void;
}

// --- Components ---

const StatusBar = ({ dark = false, time }: { dark?: boolean; time: string; key?: string }) => (
  <div className={`flex justify-between items-center px-6 pt-4 pb-1 w-full z-50 ${dark ? 'text-black' : 'text-white'}`}>
    <div className="font-bold text-[15px] tracking-tight">{time}</div>
    <div className="flex items-center gap-1.5">
      <Signal size={16} fill="currentColor" />
      <span className="text-[13px] font-bold">5G</span>
      <div className="relative flex items-center">
        <div className="w-[25px] h-[12px] border border-white/40 rounded-[3px] flex items-center px-[1px]">
          <div className="h-full bg-white rounded-[1px]" style={{ width: '57%' }} />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black">57</span>
        </div>
        <div className="w-[1.5px] h-[4px] bg-white/40 rounded-r-full ml-[1px]" />
      </div>
    </div>
  </div>
);

const NotificationBanner = ({ notification, onDismiss }: { notification: Notification; onDismiss: () => void; key?: string }) => {
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
};

const AppUnavailableModal = ({ appName, onClose }: { appName: string; onClose: () => void }) => (
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
);

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('PRESELL');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [shownNotificationIds, setShownNotificationIds] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unavailableApp, setUnavailableApp] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const vibrationRef = useRef<HTMLAudioElement | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const formatted = date.toLocaleDateString('pt-BR', options);
    // Capitalize first letter and format as "terça-feira, 7 de abril"
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const timeString = formatTime(currentTime);
  const dateString = formatDate(currentTime);

  const triggerNotification = (notif: Notification) => {
    if (shownNotificationIds.includes(notif.id)) return;

    // Play notification sound if not FaceTime
    if (notif.id !== 'facetime') {
      let soundFile = '/notificacao-audio.mp3'; // Default for Instagram
      if (notif.id === 'whatsapp') soundFile = '/som-notificacao-whatsapp.mp3';
      if (notif.id === 'utmify') soundFile = '/som-notificacao-utmify.mp3';

      const sound = new Audio(soundFile);
      sound.play().catch(e => console.log("Notif sound blocked:", e));
    }

    // Small delay for the visual so it syncs with the audio loading
    setTimeout(() => {
      setNotification(notif);
      setShownNotificationIds(prev => [...prev, notif.id]);
    }, 250);
  };

  // Ringtone and Vibration Logic
  useEffect(() => {
    const shouldRing = (screen === 'HOME' && notification?.id === 'facetime') || screen === 'INCOMING_CALL';

    if (shouldRing) {
      if (!ringtoneRef.current) {
        ringtoneRef.current = new Audio('/audio-ligacao.mp3');
        ringtoneRef.current.loop = true;
      }
      if (!vibrationRef.current) {
        vibrationRef.current = new Audio('/som-vibracao-ligacao.mp3');
        vibrationRef.current.loop = true;
      }
      ringtoneRef.current.play().catch(e => console.log("Audio play blocked:", e));
      vibrationRef.current.play().catch(e => console.log("Vibration play blocked:", e));
    } else {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
      if (vibrationRef.current) {
        vibrationRef.current.pause();
        vibrationRef.current.currentTime = 0;
      }
    }

    return () => {
      ringtoneRef.current?.pause();
      vibrationRef.current?.pause();
    };
  }, [screen, notification]);

  // Auto-transition logic
  useEffect(() => {
    if (screen !== 'HOME' || !isUnlocked) return;

    let delay = 0;
    let nextScreen: Screen | null = null;

    switch (currentStep) {
      case 1:
        delay = 4500;
        nextScreen = 'INCOMING_CALL';
        break;
      case 2:
        delay = 6000;
        nextScreen = 'WHATSAPP_GROUP';
        break;
      case 3:
        delay = 6000;
        nextScreen = 'INSTAGRAM_REELS';
        break;
      case 4:
        delay = 6000;
        nextScreen = 'TIKTOK_FEED';
        break;
    }

    if (nextScreen) {
      const timer = setTimeout(() => {
        if (currentStep !== 1) setNotification(null);
        setScreen(nextScreen!);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [screen, currentStep, isUnlocked]);

  // Notification trigger logic
  useEffect(() => {
    if (screen !== 'HOME' || !isUnlocked) return;

    const triggerStepNotification = (step: number) => {
      switch (step) {
        case 1:
          if (!shownNotificationIds.includes('facetime')) {
            return {
              id: 'facetime',
              app: 'FaceTime',
              icon: <img src="https://img.icons8.com/color/144/000000/facetime.png" className="w-full h-full object-cover" referrerPolicy="no-referrer" />,
              title: 'Zidane Rocha',
              message: 'Chamada de vídeo recebida',
              delay: 500,
              action: () => {
                setScreen('INCOMING_CALL');
              }
            };
          }
          break;
        case 2:
          if (!shownNotificationIds.includes('whatsapp')) {
            return {
              id: 'whatsapp',
              app: 'WhatsApp',
              icon: <img src="https://img.icons8.com/color/144/000000/whatsapp.png" className="w-full h-full p-0.5" referrerPolicy="no-referrer" />,
              title: 'WhatsApp',
              message: 'Você foi adicionado no grupo HATERS ZIDANE',
              delay: 300,
              action: () => {
                setNotification(null);
                setScreen('WHATSAPP_GROUP');
              }
            };
          }
          break;
        case 3:
          if (!shownNotificationIds.includes('instagram')) {
            return {
              id: 'instagram',
              app: 'Instagram',
              icon: <img src="https://img.icons8.com/color/144/000000/instagram-new.png" className="w-full h-full p-0.5" referrerPolicy="no-referrer" />,
              title: 'Instagram',
              message: '@ana.kruger te enviou um reel',
              delay: 2000,
              action: () => {
                setNotification(null);
                setScreen('INSTAGRAM_REELS');
              }
            };
          }
          break;
        case 4:
          if (!shownNotificationIds.includes('utmify')) {
            return {
              id: 'utmify',
              app: 'Utmify',
              icon: <img src="https://i.ibb.co/93HhFt0L/image.png" className="w-full h-full object-cover rounded-md" referrerPolicy="no-referrer" />,
              title: 'Utmify',
              message: 'Parabéns! Hoje você está no prejuízo de R$2.914, continue com a sua dopamina diária 🎮',
              delay: 2000,
              action: () => {
                setNotification(null);
                setScreen('TIKTOK_FEED');
              }
            };
          }
          break;
      }
      return null;
    };

    const notifInfo = triggerStepNotification(currentStep);
    if (notifInfo) {
      const timer = setTimeout(() => {
        triggerNotification({
          id: notifInfo.id,
          app: notifInfo.app,
          icon: notifInfo.icon,
          title: notifInfo.title,
          message: notifInfo.message,
          action: notifInfo.action
        });
      }, notifInfo.delay);
      return () => clearTimeout(timer);
    }
  }, [screen, currentStep, isUnlocked, shownNotificationIds]);

  const handleUnlock = () => {
    setIsUnlocked(true);
    setScreen('HOME');
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  return (
    <div className="flex items-center justify-center bg-black font-sans" style={{ minHeight: '100dvh' }}>
      {/* Main App Container - Mobile First */}
      <div className="relative w-full max-w-[450px] bg-black shadow-2xl" style={{ height: '100dvh', overflow: screen === 'PRESELL' ? 'auto' : 'hidden' }}>
        <div className="relative w-full h-full">
          <AnimatePresence>
            {notification && (
              <NotificationBanner
                key={notification.id}
                notification={notification}
                onDismiss={() => setNotification(null)}
              />
            )}
            {unavailableApp && (
              <AppUnavailableModal
                appName={unavailableApp}
                onClose={() => setUnavailableApp(null)}
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {screen === 'PRESELL' && (
              <motion.div
                key="presell"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-full min-h-full bg-[#0a0a0a]"
              >
                <PresellScreen onStart={() => setScreen('LOCK')} />
              </motion.div>
            )}
            {screen === 'LOCK' && (
              <motion.div
                key="lock"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <LockScreen onUnlock={handleUnlock} time={timeString} date={dateString} />
              </motion.div>
            )}
            {screen === 'HOME' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full"
              >
                <HomeScreen onOpenApp={(app) => setUnavailableApp(app)} time={timeString} />
              </motion.div>
            )}
            {screen === 'INCOMING_CALL' && (
              <motion.div
                key="incoming"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <IncomingCallScreen onAccept={() => { setNotification(null); setScreen('FACETIME'); }} time={timeString} />
              </motion.div>
            )}
            {screen === 'FACETIME' && (
              <motion.div
                key="facetime"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8 }}
                className="w-full h-full"
              >
                <FaceTimeScreen
                  onEnd={() => { }}
                  onFinish={() => {
                    setTimeout(() => {
                      setNotification(null);
                      setScreen('WHATSAPP_GROUP');
                      setCurrentStep(2);
                    }, 1200);
                  }}
                  onNearEnd={() => {
                    triggerNotification({
                      id: 'whatsapp',
                      app: 'WhatsApp',
                      icon: <img src="https://img.icons8.com/color/144/000000/whatsapp.png" className="w-full h-full p-0.5" referrerPolicy="no-referrer" />,
                      title: 'WhatsApp',
                      message: 'Você foi adicionado no grupo HATERS ZIDANE',
                      action: () => {
                        setNotification(null);
                        setScreen('WHATSAPP_GROUP');
                        setCurrentStep(2);
                      }
                    });
                  }}
                  time={timeString}
                />
              </motion.div>
            )}
            {screen === 'WHATSAPP_GROUP' && (
              <motion.div
                key="wa-group"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="w-full h-full"
              >
                <WhatsAppGroupScreen onJoinCommunity={() => setScreen('WHATSAPP_COMMUNITY')} onImageClick={setFullscreenImage} time={timeString} />
              </motion.div>
            )}
            {screen === 'WHATSAPP_COMMUNITY' && (
              <motion.div
                key="wa-comm"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="w-full h-full"
              >
                <WhatsAppCommunityScreen
                  onNext={() => {
                    // Trigger Instagram notification while still on Community screen
                    triggerNotification({
                      id: 'instagram',
                      app: 'Instagram',
                      icon: <img src="https://img.icons8.com/color/144/000000/instagram-new.png" className="w-full h-full p-0.5" referrerPolicy="no-referrer" />,
                      title: 'Instagram',
                      message: '@ana.kruger te enviou um reel',
                      action: () => {
                        setNotification(null);
                        setScreen('INSTAGRAM_REELS');
                        setCurrentStep(3);
                      }
                    });

                    // Auto-transition to Reels after 4 seconds
                    setTimeout(() => {
                      setNotification(null);
                      setScreen('INSTAGRAM_REELS');
                      setCurrentStep(3);
                    }, 4000);
                  }}
                  onImageClick={setFullscreenImage}
                  time={timeString}
                />
              </motion.div>
            )}
            {screen === 'INSTAGRAM_REELS' && (
              <motion.div
                key="ig-reels"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <InstagramReelsScreen
                  onNext={() => {
                    // 1. Show notification
                    triggerNotification({
                      id: 'utmify-1',
                      app: 'Utmify',
                      icon: <div className="w-full h-full overflow-hidden rounded-md bg-black"><img src="https://i.ibb.co/Cpx6fH1G/image.png" className="w-full h-full object-cover" /></div>,
                      title: 'Pagamento Aprovado',
                      message: 'Parabéns hoje você está no prejuízo de R$2.914, continue com a sua dopamina diária 🤡',
                    });

                    // 2. Transition to TikTok fast (1s)
                    setTimeout(() => {
                      setScreen('TIKTOK_FEED');
                      setCurrentStep(4);

                      // 3. Dismiss only after 4 seconds on TikTok
                      setTimeout(() => {
                        setNotification(null);
                      }, 4000);
                    }, 1000);
                  }}
                  time={timeString}
                />
              </motion.div>
            )}
            {screen === 'TIKTOK_FEED' && (
              <motion.div
                key="tt-feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <TikTokFeedScreen onEnterLive={() => setScreen('TIKTOK_LIVE')} time={timeString} />
              </motion.div>
            )}
            {screen === 'TIKTOK_LIVE' && (
              <motion.div
                key="tt-live"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <TikTokLiveScreen time={timeString} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {fullscreenImage && (
              <motion.div
                key="fullscreen-image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
                onClick={closeFullscreen}
              >
                <button
                  onClick={closeFullscreen}
                  className="absolute top-10 right-6 text-white bg-white/10 p-2 rounded-full backdrop-blur-md z-20"
                >
                  <X size={24} />
                </button>
                <img
                  src={fullscreenImage}
                  className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  referrerPolicy="no-referrer"
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/40 rounded-full z-[100]" />
      </div>
    </div>
  );
}

// --- Screen Components ---

const PresellScreen = ({ onStart }: { onStart: () => void }) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const unlockAudio = () => {
    // Toca um som silencioso/curto para liberar o contexto de áudio no mobile
    const silentAudio = new Audio('https://raw.githubusercontent.com/anars/blank-audio/master/250-milliseconds-of-silence.mp3');
    silentAudio.play().then(() => {
      silentAudio.pause();
      console.log("Audio context unlocked for mobile");
    }).catch(e => console.log("Audio unlock failed:", e));

    // Também resume o AudioContext se existir
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const context = new AudioContext();
      if (context.state === 'suspended') {
        context.resume();
      }
    }
  };

  useEffect(() => {
    // Carrega o SDK do SmartPlayer
    const s = document.createElement("script");
    s.src = "https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js";
    s.async = true;
    document.head.appendChild(s);

    // Define a URL do player diretamente para evitar problemas de carregamento no mobile
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
        {/* VSL Card */}
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
};

const LockScreen = ({ onUnlock, time, date }: { onUnlock: () => void; time: string; date: string; key?: string }) => {
  return (
    <div
      className="relative w-full h-full bg-cover bg-center flex flex-col items-center"
      style={{ backgroundImage: 'url(https://i.ibb.co/kRFQsYC/image.png)' }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <StatusBar time={time} />

      <div className="mt-12 text-center z-10 text-white/90">
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-[20px] font-medium mb-[-5px]"
        >
          {date}
        </motion.p>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-[100px] font-serif font-light tracking-tight leading-none"
        >
          {time}
        </motion.h1>

        {/* Battery Widget */}
        <div className="mt-2 flex flex-col items-start px-10 w-full">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-md border border-white/40 flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-white/60 rounded-[1px]" />
            </div>
            <span className="text-[14px] font-medium">52%</span>
          </div>
          <p className="text-[14px] font-medium text-white/80">iPhone de Desconhecido</p>
          <div className="w-32 h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-white w-[52%]" />
          </div>
        </div>
      </div>

      {/* Fingerprint Sensor */}
      <div className="mt-auto mb-12 flex flex-col items-center z-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onUnlock}
          className="relative w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Fingerprint size={40} className="text-white/80" />
          </motion.div>
          <div className="absolute inset-0 rounded-full border-2 border-ios-blue/50 animate-ping opacity-20" />
        </motion.button>
        <p className="mt-4 text-white/60 font-medium animate-pulse">Toque para desbloquear</p>
      </div>

      {/* Bottom Icons */}
      <div className="absolute bottom-12 left-0 right-0 px-12 flex justify-between items-center z-10">
        <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center border border-white/10">
          <div className="w-5 h-8 border-2 border-white/80 rounded-sm relative">
            <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-2 h-1 bg-white/80 rounded-t-sm" />
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/80 rounded-full" />
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center border border-white/10">
          <Camera size={24} className="text-white/80" />
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full" />
    </div>
  );
};

const HomeScreen = ({ onOpenApp, time }: { onOpenApp: (app: string) => void; time: string; key?: string }) => {
  const apps: { name: string; icon: string; color: string; badge?: string; padding?: string }[] = [
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

      {/* Widgets */}
      <div className="px-6 mt-4 flex gap-4">
        {/* Calendar Widget */}
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

        {/* Weather Widget */}
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

      {/* App Grid */}
      <div className="grid grid-cols-4 gap-x-4 gap-y-5 px-6 mt-6">
        {apps.map((app) => (
          <div key={app.name} className="flex flex-col items-center gap-1">
            <motion.div
              whileTap={{ scale: 0.9 }}
              onClick={() => onOpenApp(app.name)}
              className={`w-[60px] h-[60px] ${app.color} rounded-[14px] flex items-center justify-center shadow-lg relative overflow-hidden`}
            >
              {app.icon === 'custom-calendar' ? (
                <div className="w-full h-full bg-white flex flex-col items-center">
                  <div className="text-[8px] font-black text-ios-red mt-1">Ter.</div>
                  <div className="text-3xl font-light text-black -mt-1">7</div>
                </div>
              ) : app.icon === 'custom-folder' ? (
                <div className="grid grid-cols-3 gap-1 p-2">
                  {[...Array(9)].map((_, i) => <div key={i} className="w-2.5 h-2.5 bg-white/20 rounded-[2px]" />)}
                </div>
              ) : app.icon === 'custom-clock' ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <div className="w-10 h-10 border border-white/20 rounded-full relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-white origin-bottom" style={{ transform: 'rotate(30deg)' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-white origin-bottom" style={{ transform: 'rotate(120deg)' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-4 bg-ios-red origin-bottom" style={{ transform: 'rotate(240deg)' }} />
                  </div>
                </div>
              ) : (
                <img src={app.icon} className={`w-full h-full object-contain ${app.padding || 'p-2'}`} referrerPolicy="no-referrer" />
              )}
              {app.badge && (
                <div className="absolute -top-1.5 -right-1.5 bg-ios-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-transparent min-w-[20px] text-center">
                  {app.badge}
                </div>
              )}
            </motion.div>
            <span className="text-[11px] font-medium text-white text-center leading-tight">{app.name}</span>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mt-auto mb-4 flex justify-center">
        <div className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full flex items-center gap-1.5">
          <Search size={12} className="text-white/60" />
          <span className="text-[11px] font-medium text-white/80">Buscar</span>
        </div>
      </div>

      {/* Dock */}
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
};

const IncomingCallScreen = ({ onAccept, time }: { onAccept: () => void; time: string; key?: string }) => {
  return (
    <div className="relative w-full h-full bg-[#1c1c1e] flex flex-col items-center">
      <StatusBar time={time} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      <div className="z-10 text-center mt-24">
        <p className="text-white/60 text-[17px] font-medium mb-1">FaceTime de vídeo...</p>
        <h2 className="text-[34px] font-bold text-white tracking-tight">Zidane Rocha</h2>
      </div>

      <div className="z-10 w-full px-12 flex justify-between items-center mt-auto mb-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-[64px] h-[64px] rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/40 cursor-not-allowed">
            <Phone size={28} className="rotate-[135deg]" fill="currentColor" />
          </div>
          <span className="text-[13px] font-medium text-white/40">Recusar</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onAccept}
            className="w-[64px] h-[64px] rounded-full bg-ios-green flex items-center justify-center text-white shadow-lg"
          >
            <Video size={28} fill="white" />
          </motion.button>
          <span className="text-[13px] font-medium text-white">Aceitar</span>
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full" />
    </div>
  );
};

const FaceTimeScreen = ({ onEnd, onFinish, onNearEnd, time }: { onEnd: () => void; onFinish: () => void; onNearEnd?: () => void; time: string; key?: string }) => {
  const [timer, setTimer] = useState(0);
  const [nearEndFired, setNearEndFired] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hangUp = () => {
    const sound = new Audio('/som-desligar-call.mp3');
    sound.play().catch(e => console.log("Hangup sound blocked:", e));
    onFinish();
  };

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (video.duration && video.duration - video.currentTime <= 2 && !nearEndFired) {
        setNearEndFired(true);
        onNearEnd?.();
      }
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const controls: { name: string; icon: React.ReactNode; color: string; action?: () => void }[] = [
    { name: 'Áudio', icon: <Volume2 size={20} />, color: 'bg-white text-black' },
    { name: 'FaceTime', icon: <Video size={20} />, color: 'bg-white/20 text-white' },
    { name: 'Mudo', icon: <MicOff size={20} />, color: 'bg-white/20 text-white' },
    { name: 'Mais', icon: <MoreHorizontal size={20} />, color: 'bg-white/20 text-white' },
    { name: 'Desligar', icon: <Phone size={20} className="rotate-[135deg]" fill="white" />, color: 'bg-ios-red text-white' },
    { name: 'Teclado Numérico', icon: <Grid size={20} />, color: 'bg-white/20 text-white' },
  ];

  return (
    <div
      className="relative w-full h-full bg-[#1c1c1e]"
    >
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          onEnded={hangUp}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover opacity-100"
          src="https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/WhatsApp%20Video%202026-04-08%20at%2015.57.00.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-10 bg-black z-50 flex items-center">
        <StatusBar time={time} />
      </div>

      {/* FaceTime HUD - Top Info */}
      <div className="absolute top-10 left-0 right-0 pt-4 text-center z-40 bg-gradient-to-b from-black/80 to-transparent pb-10">
        <p className="text-white/60 text-[13px] font-medium">FaceTime de vídeo...</p>
        <h2 className="text-[28px] font-bold text-white tracking-tight">Zidane Rocha</h2>
        <p className="text-white/40 text-[13px] mt-1">{formatTime(timer)}</p>
      </div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="absolute bottom-20 left-0 right-0 px-12"
      >
        <div className="grid grid-cols-3 gap-y-6 gap-x-2">
          {controls.map((control, index) => (
            <motion.div
              key={control.name}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={control.action || (() => { })}
                className={`w-[56px] h-[56px] rounded-full flex items-center justify-center shadow-lg ${control.color}`}
              >
                {control.icon}
              </motion.button>
              <span className="text-[11px] font-medium text-white/90 text-center leading-tight">
                {control.name.split(' ').map((word, i) => <div key={i}>{word}</div>)}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full" />
    </div>
  );
};

const SIMULATED_MESSAGES = [
  { id: 1, sender: 'Victor Ferreira', text: 'Cara fico impressionado o tanto que esse cara mente... Vive falando mal da galera do black mas o cara não fatura nem 1k dia kkkkk 🤣🤣🤣', type: 'text' },
  { id: 2, sender: 'Paulo Plinio', text: 'E a placa de faturamento dele kkk? tudo comprado na shopee , da pra ver a qualidade ruim 🤡', type: 'text' },
  { id: 3, sender: 'Augusto Chagas', audioSrc: '/audiohater3.ogg', audioDuration: '0:16', type: 'audio' },
  { id: 4, sender: 'José Matheus', audioSrc: '/audiohater1.ogg', audioDuration: '0:08', type: 'audio' },
  { id: 5, sender: 'Felipe Almeida', audioSrc: '/audiohater2.ogg', audioDuration: '0:11', type: 'audio' },
  { id: 7, sender: 'Zidane Rocha', image: 'https://i.ibb.co/7dQzZGTB/image.png', type: 'image', verified: true },
  { id: 75, sender: 'Zidane Rocha', audioSrc: '/audio-resposta-grupo.ogg', audioDuration: '0:35', type: 'audio', verified: true },
  { id: 8, sender: 'Zidane Rocha', text: 'Entra na minha comunidade fechada', link: 'Comunidade Zidane Rocha', type: 'link', verified: true },
];

// Fixed waveform bar heights
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

const SENDER_PHONES: Record<string, string> = {
  'Victor Ferreira': '+55 11 98057-4472',
  'Paulo Plinio': '+55 81 97569-1915',
  'Augusto Chagas': '+55 24 98884-7182',
  'José Matheus': '+55 92 99900-1960',
  'Felipe Almeida': '+55 53 99625-0323',
  'João Paulo': '+55 95 98798-5708',
  'Zidane Rocha': '+55 93 99543-5325',
};

const AudioMessage = ({ sender, audioSrc, audioDuration, isZidane, autoPlay, onEnded }: {
  sender: string;
  audioSrc?: string;
  audioDuration?: string;
  isZidane: boolean;
  autoPlay?: boolean;
  onEnded?: () => void;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState('0:00');
  const [realDuration, setRealDuration] = useState<string | null>(null);
  const borderColor = isZidane ? '#005c4b' : '#202c33';

  // Only autoplay when explicitly told to
  useEffect(() => {
    if (!autoPlay || !audioSrc || !audioRef.current) return;
    const audio = audioRef.current;

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (e) {
        console.log("Audio autoplay blocked by browser, waiting for user...");
        // Em alguns casos, um pequeno delay resolve se o usuário acabou de trocar de tela
        setTimeout(async () => {
          try {
            await audio.play();
            setIsPlaying(true);
          } catch (retryError) {
            console.log("Audio still blocked after retry");
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
        {/* Play button */}
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

        {/* Waveform Area */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between h-6 w-full relative">
            {/* The Dot */}
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

        {/* Avatar Area */}
        <div className="w-10 h-10 rounded-full relative shrink-0 ml-1">
          <img src={SENDER_AVATARS[sender] || `https://picsum.photos/seed/${sender}/100/100`} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
          <div className="absolute -bottom-1 -left-1">
            <Mic className="text-[#3dbed1]" size={14} fill="currentColor" />
          </div>
        </div>
      </div>
    </div>
  );
};

const WhatsAppGroupScreen = ({ onJoinCommunity, onImageClick, time }: { onJoinCommunity: () => void; onImageClick: (url: string) => void; time: string; key?: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [activeAudioId, setActiveAudioId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const triggerNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    const runSequence = async () => {
      // First message
      if (currentIndex >= SIMULATED_MESSAGES.length || !isMounted) return;

      const nextMsg = SIMULATED_MESSAGES[currentIndex];

      // Set status based on message type
      if (nextMsg.type === 'audio') {
        setStatus('Gravando áudio...');
      } else {
        setStatus('Digitando...');
      }

      // Delay for "sending/recording"
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      if (!isMounted) return;

      // Play notification sound
      const sound = new Audio('/mensagem-dentro-do-whatsapp.mp3');
      sound.play().catch(e => console.log("WA sound blocked:", e));

      setMessages(prev => {
        const updated = [...prev, nextMsg];
        if (nextMsg.type === 'audio') {
          setActiveAudioId(nextMsg.id);
        }
        return updated;
      });
      setStatus(null);

      // Auto-trigger next if it's text or image
      if (nextMsg.type === 'text') {
        setTimeout(() => {
          if (isMounted) triggerNext();
        }, 4000);
      } else if (nextMsg.type === 'image') {
        setTimeout(() => {
          if (isMounted) triggerNext();
        }, 4000);
      } else if (nextMsg.type === 'link') {
        // Stop here or wait a bit? Link is usually the end of this screen
        setTimeout(() => {
          if (isMounted) triggerNext();
        }, 4000);
      }
      // For audio, triggerNext is called by onEnded in the AudioMessage component
    };

    runSequence();

    return () => {
      isMounted = false;
    };
  }, [currentIndex]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  return (
    <div
      className="relative w-full h-full bg-[#000000] bg-[url('https://i.ibb.co/CNyc9yX/Sem-T-tulo-1.png')] bg-cover bg-center flex flex-col"
    >
      <div className="bg-black">
        <StatusBar time={time} />
      </div>
      {/* Header */}
      <div className="bg-[#1f2c34] pt-2 pb-2 px-3 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-neutral-600 overflow-hidden">
          <img src="https://i.ibb.co/YFHnq4tG/image.png" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[15px] text-white truncate">Zidane Mentiroso</h3>
          {status ? (
            <p className="text-[11px] text-[#00a884] font-medium">{status}</p>
          ) : (
            <p className="text-[11px] text-white/50 truncate">José Matheus, Augusto Chagas, Felipe Almeida...</p>
          )}
        </div>
        <div className="flex items-center gap-4 text-[#00a884]">
          <Video size={22} />
          <Phone size={20} />
          <MoreHorizontal size={22} className="rotate-90" />
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {/* System Messages */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="text-[12px] font-bold text-white/40">Você criou este grupo</div>
          <div className="text-[12px] text-white/40">Grupo · 5 membros</div>

          <div className="flex flex-col gap-2 w-full max-w-[280px] mt-2">
            <button className="bg-[#202c33] py-2.5 rounded-xl text-[14px] font-medium text-white flex items-center justify-center gap-2">
              <Plus size={16} /> Adicionar membros
            </button>
            <button className="bg-[#202c33] py-2.5 rounded-xl text-[14px] font-medium text-white flex items-center justify-center gap-2">
              <div className="rotate-45"><Plus size={16} /></div> Convidar via link ou QR code
            </button>
          </div>
        </div>

        {/* Encryption Message */}
        <div className="bg-[#182229] rounded-xl p-3 text-center border border-white/5 mx-4 mb-6">
          <p className="text-[11px] text-[#ffd366] leading-relaxed">
            🔒 As mensagens e ligações são protegidas com a criptografia de ponta a ponta. Somente as pessoas que fazem parte da conversa podem ler, ouvir e compartilhar esse conteúdo. <span className="underline">Saiba mais</span>
          </p>
        </div>

        {messages.map((msg, idx) => {
          if (!msg) return null;
          const isZidane = msg.sender === 'Zidane Rocha';

          return (
            <div key={msg.id} className={`flex ${isZidane ? 'justify-end' : 'justify-start'} w-full gap-1.5`}>
              {!isZidane && msg.type !== 'link' && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5">
                  <img src={SENDER_AVATARS[msg.sender] || 'https://i.ibb.co/wXXQQ9c/image.png'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              <div
                className={`max-w-[80%] relative ${msg.type === 'link'
                  ? ''
                  : `p-1.5 rounded-2xl shadow-sm ${msg.type === 'image' || (msg.type === 'audio' && isZidane)
                    ? `bg-[#1c2327] ${isZidane ? 'rounded-tr-none' : 'rounded-tl-none'}`
                    : isZidane ? 'bg-[#005c4b] rounded-tr-none' : 'bg-[#202c33] rounded-tl-none'
                  }`
                  }`}
              >
                {!isZidane && msg.type !== 'link' && (
                  <div className="flex flex-wrap items-center gap-1.5 px-2 pt-0.5 pb-1">
                    <span className="text-[13px] font-bold text-[#3dbed1]">
                      ~ {msg.sender}
                    </span>
                    <span className="text-[12px] text-white/50">
                      {SENDER_PHONES[msg.sender] || '+55 11 98927-0410'}
                    </span>
                  </div>
                )}

                {msg.type === 'text' && <p className="text-[14px] px-2 py-0.5 leading-tight">{msg.text}</p>}

                {msg.type === 'image' && (
                  <div
                    onClick={() => onImageClick(msg.image!)}
                    className="rounded-[10px] overflow-hidden relative cursor-pointer active:opacity-90"
                  >
                    <img src={msg.image} className="w-full h-auto max-h-[350px] object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-1 right-2 rounded flex items-center justify-center bg-black/30 px-1 py-0.5">
                      <span className="text-[10px] text-white leading-none">16:33</span>
                    </div>
                  </div>
                )}

                {msg.type === 'audio' && (
                  <AudioMessage
                    key={msg.id}
                    sender={msg.sender}
                    audioSrc={msg.audioSrc}
                    audioDuration={msg.audioDuration}
                    isZidane={isZidane}
                    autoPlay={activeAudioId === msg.id}
                    onEnded={() => {
                      if (activeAudioId === msg.id) {
                        setActiveAudioId(null);
                        triggerNext();
                      }
                    }}
                  />
                )}

                {msg.type === 'link' && (
                  <div className="bg-[#1c2327] rounded-2xl overflow-hidden border border-white/5 w-[280px] shadow-lg">
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shrink-0 relative shadow-inner">
                        <div className="flex flex-col items-center">
                          <img src="https://img.icons8.com/color/144/000000/whatsapp.png" className="w-6 h-6" referrerPolicy="no-referrer" />
                          <span className="text-[8px] font-bold text-[#25D366] mt-0.5">WhatsApp</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[17px] font-semibold text-white leading-tight">Comunidade Zidane</h4>
                        <p className="text-[14px] text-white/50 leading-tight mt-0.5">Convite para conversa em grupo</p>
                      </div>
                    </div>
                    <div className="px-4 pb-2 text-right">
                      <span className="text-[11px] text-white/20">16:01</span>
                    </div>
                    <button
                      onClick={onJoinCommunity}
                      className="w-full py-3.5 border-t border-white/5 text-[#00a884] font-semibold text-[16px] active:bg-white/5 transition-colors"
                    >
                      Entrar no grupo
                    </button>
                  </div>
                )}

                {msg.type !== 'link' && msg.type !== 'image' && msg.type !== 'audio' && (
                  <div className="flex justify-end items-center gap-1 px-2 pb-0.5">
                    <span className="text-[9px] text-white/40">16:08</span>
                    {isZidane && <CheckCircle2 size={10} className="text-[#3dbed1] fill-current" />}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="bg-[#1f2c34] p-3 flex items-center gap-3 pb-8">
        <Plus size={24} className="text-white/60" />
        <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-white/40 text-[15px]">
          Mensagem
        </div>
        <Camera size={24} className="text-white/60" />
        <Mic size={24} className="text-white/60" />
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full" />
    </div>
  );
};

const COMMUNITY_MESSAGES = [
  { id: 1, sender: 'Zidane Rocha', type: 'text', text: 'Pra vocês que tem dúvida se eu realmente trago resultado pros meus alunos, olha esses depoimentos abaixoo!! 👇', time: '16:05' },
  { id: 2, sender: 'Zidane Rocha', type: 'video', video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/WhatsApp%20Video%202026-04-08%20at%2016.06.50.mp4', time: '16:06' },
  { id: 3, sender: 'Zidane Rocha', type: 'video', video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/WhatsApp%20Video%202026-04-08%20at%2016.13.03.mp4', time: '16:13' },
  { id: 4, sender: 'Zidane Rocha', type: 'audio', audioSrc: 'audio-resultado1.ogg', time: '16:14' },
  { id: 5, sender: 'Zidane Rocha', type: 'audio', audioSrc: 'audio-resultado2.ogg', time: '16:15' },
  { id: 6, sender: 'Zidane Rocha', type: 'audio', audioSrc: 'audio-resultado3.ogg', time: '16:16' },
  { id: 7, sender: 'Zidane Rocha', type: 'image', image: 'https://i.ibb.co/KjpbL22K/image.png', time: '16:17' },
  { id: 8, sender: 'Zidane Rocha', type: 'image', image: 'https://i.ibb.co/67j1yR4W/image.png', time: '16:17' },
  { id: 9, sender: 'Zidane Rocha', type: 'image', image: 'https://i.ibb.co/rW7LTxn/image.png', time: '16:18' },
  { id: 10, sender: 'Zidane Rocha', type: 'image', image: 'https://i.ibb.co/ZzQqdDbP/image.png', time: '16:18' },
  { id: 11, sender: 'Zidane Rocha', type: 'image', image: 'https://i.ibb.co/DHsh3RFF/image.png', time: '16:19' },
];

const WhatsAppCommunityScreen = ({ onNext, onImageClick, time }: { onNext: () => void; onImageClick: (url: string) => void; time: string; key?: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeAudioId, setActiveAudioId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const triggerNext = () => {
    if (currentIndex < COMMUNITY_MESSAGES.length - 1) {
      // Play notification sound for new message inside WhatsApp
      const sound = new Audio('/mensagem-dentro-do-whatsapp.mp3');
      sound.play().catch(e => console.log("WA sound blocked:", e));

      setCurrentIndex(prev => prev + 1);
    } else {
      // All messages shown, trigger the end of funnel
      onNext();
    }
  };

  useEffect(() => {
    // Play sound for the very first message if it's the beginning
    if (currentIndex === 0) {
      const sound = new Audio('/mensagem-dentro-do-whatsapp.mp3');
      sound.play().catch(e => console.log("WA sound blocked:", e));
    }

    const currentMsg = COMMUNITY_MESSAGES[currentIndex];
    if (!currentMsg) return;

    if (currentMsg.type === 'text') {
      const timer = setTimeout(triggerNext, 4000);
      return () => clearTimeout(timer);
    }

    if (currentMsg.type === 'image') {
      const timer = setTimeout(triggerNext, 4000);
      return () => clearTimeout(timer);
    }

    // For video and audio, we wait for the onEnded event
  }, [currentIndex]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentIndex]);

  const visibleMessages = COMMUNITY_MESSAGES.slice(0, currentIndex + 1);

  return (
    <div
      className="relative w-full h-full bg-[#000000] bg-[url('https://i.ibb.co/kgxLnzw4/image.png')] bg-cover bg-center flex flex-col"
    >
      <div className="bg-black">
        <StatusBar time={time} />
      </div>
      {/* Header */}
      <div className="bg-[#1f2c34] pt-2 pb-3 px-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-600 overflow-hidden">
          <img src="https://i.ibb.co/p69twTYp/image.png" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-[15px] flex items-center gap-1">
            Comunidade Zidane Rocha <CheckCircle2 size={14} className="text-ios-blue fill-ios-blue text-white" />
          </h3>
          <p className="text-[11px] text-white/60">Avisos</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar pb-12">
        <div className="flex justify-center mb-6">
          <div className="bg-[#182229] px-4 py-1 rounded-lg text-[11px] font-medium text-white/60">Hoje</div>
        </div>

        {visibleMessages.map((msg, idx) => (
          <div key={msg.id} className="flex justify-start w-full gap-1.5 items-end">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5">
              <img src={SENDER_AVATARS[msg.sender] || 'https://i.ibb.co/p69twTYp/image.png'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className={`max-w-[80%] relative p-1.5 rounded-2xl shadow-sm rounded-tl-none ${['image', 'video', 'audio'].includes(msg.type) ? 'bg-[#1c2327]' : 'bg-[#202c33]'}`}>
              <div className="flex flex-wrap items-center gap-1.5 px-2 pt-0.5 pb-1">
                <span className="text-[13px] font-bold text-[#3dbed1]">
                  ~ {msg.sender}
                </span>
                <span className="text-[12px] text-white/50">
                  +55 93 99543-5325
                </span>
              </div>

              {msg.type === 'text' && (
                <div className="px-2">
                  <p className="text-[14px] leading-tight pb-1">{msg.text}</p>
                </div>
              )}

              {msg.type === 'image' && (
                <div
                  onClick={() => {
                    onImageClick(msg.image!);
                  }}
                  className="rounded-[10px] overflow-hidden relative cursor-pointer active:opacity-80 transition-opacity"
                >
                  <img src={msg.image} className="w-full h-auto max-h-[350px] object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-1 right-2 rounded flex items-center justify-center bg-black/30 px-1 py-0.5 pointer-events-none">
                    <span className="text-[10px] text-white leading-none">{msg.time}</span>
                  </div>
                </div>
              )}

              {msg.type === 'video' && (
                <div className="rounded-[10px] overflow-hidden relative bg-black">
                  <video
                    src={msg.video}
                    className="w-full h-auto max-h-[350px] object-cover"
                    controls
                    autoPlay={idx === currentIndex}
                    onEnded={triggerNext}
                    playsInline
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-6 right-2 rounded flex items-center justify-center bg-black/30 px-1 py-0.5 pointer-events-none">
                    <span className="text-[10px] text-white leading-none">{msg.time}</span>
                  </div>
                </div>
              )}

              {msg.type === 'audio' && (
                <AudioMessage
                  sender={msg.sender}
                  audioSrc={msg.audioSrc}
                  isZidane={false}
                  autoPlay={idx === currentIndex}
                  onEnded={() => {
                    triggerNext();
                  }}
                />
              )}

              {msg.type === 'text' && (
                <div className="flex justify-end items-center gap-1 px-2 pb-0.5 mt-1">
                  <span className="text-[9px] text-white/40">{msg.time}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1f2c34] p-4 text-center border-t border-white/5 pb-8 flex flex-col gap-3 z-10">
        <p className="text-[12px] text-white/60 leading-tight">
          Você pode responder aos avisos, mas somente os <span className="text-[#00a884] font-bold">admins da comunidade</span> podem enviá-los.
        </p>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-20" />
    </div>
  );
};

const VideoPlayer = ({ src, isActive, onDoubleTap, onEnded }: { src: string; isActive: boolean; onDoubleTap?: () => void; onEnded?: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [showVolumeIcon, setShowVolumeIcon] = useState(false);
  const lastTap = useRef<number>(0);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive && !isPaused) {
        const playVideo = async () => {
          if (!videoRef.current) return;
          try {
            await videoRef.current.play();
          } catch (e) {
            console.log("Autoplay blocked, muting...");
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(() => {});
            }
          }
        };
        const t = setTimeout(playVideo, 100);
        return () => clearTimeout(t);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive, isPaused]);

  const handlePlay = () => {
    if (videoRef.current) {
      setIsMuted(videoRef.current.muted);
    }
  };

  useEffect(() => {
    if (!isActive) {
      setIsPaused(false);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTap.current < 300) {
      onDoubleTap?.();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    } else {
      if (videoRef.current) {
        if (videoRef.current.muted) {
          videoRef.current.muted = false;
          setIsMuted(false);
          videoRef.current.play().catch(() => {});
        } else {
          setIsPaused(!isPaused);
        }
      }
    }
    lastTap.current = now;
  };

  return (
    <div className="w-full h-full relative cursor-pointer" onClick={handleTap}>
      <video
        ref={videoRef}
        src={src}
        loop={!onEnded}
        playsInline
        muted={isMuted}
        autoPlay={isActive}
        className="w-full h-full object-cover"
        onContextMenu={(e) => e.preventDefault()}
        onEnded={onEnded}
        onPlay={handlePlay}
        onCanPlay={(e) => {
          if (isActive && !isPaused) {
            (e.target as HTMLVideoElement).play().catch(() => {});
          }
        }}
      />

      {/* Center Icons */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none"
          >
            <div className="bg-black/40 p-5 rounded-full backdrop-blur-sm">
              <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1" />
            </div>
          </motion.div>
        )}

        {showVolumeIcon && !isPaused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black/40 p-5 rounded-full backdrop-blur-sm">
              {isMuted ? <MicOff size={40} className="text-white" /> : <Volume2 size={40} className="text-white" />}
            </div>
          </motion.div>
        )}

        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <Heart size={100} className="text-ios-red fill-ios-red drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const InstagramReelsScreen = ({ onNext, time }: { onNext: () => void; time: string; key?: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [likedReels, setLikedReels] = useState<number[]>([]);
  const [followedReels, setFollowedReels] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLikedReels(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
  };

  const toggleFollow = (id: number) => {
    setFollowedReels(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
  };

  const reels = [
    {
      id: 1,
      avatar: 'https://i.ibb.co/0pDBnkKW/image.png',
      video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/ssstik.io_%40sociologofalou_1775873231326.mp4',
      user: '@raiam_cortes',
      desc: 'Shape não serve pra nada quando o assunto e ter mais dinheiro 🤣🤣🤣',
      likes: '128k',
      comments: '3.4k',
      shares: '8.2k'
    },
    {
      id: 2,
      avatar: 'https://i.ibb.co/xqgQcMQs/image.png',
      video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/SaveClip.App_AQM_ZLm6U2nG05c_nSCJxQLBAosgqajqOCDKVb6o6rA6_i2igz2NnZhP8Re0bXskQB5e5_r0aQoIcbzxpmVeFV8fRLbjIa6CJdS8hOg.mp4',
      user: '@memes_br322',
      desc: 'siga para mais videos',
      likes: '45.2k',
      comments: '892',
      shares: '2.1k'
    },
    {
      id: 3,
      avatar: 'https://i.ibb.co/w8p6WMJ/image.png',
      video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/SaveClip.App_AQNJeUcCFl_HJQWP4kHx2MbPSJvYm0bl-riwG2VO2cHxGa2O4AtmjAe_ybeCmS5eFkshwGqgXJDk11jxZSlp-Jt3.mp4',
      user: '@badvibesmeme',
      desc: 'quem concorda? siga para ver mais! ...',
      likes: '89k',
      comments: '2.1k',
      shares: '5.4k'
    },
    {
      id: 4,
      isAd: true,
      avatar: 'https://i.ibb.co/ZP5wt8W/image.png',
      video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/vsl%20zid.mov',
      user: '@zidane.rochaa',
      desc: 'pov : você não precisa mentir para escalar.',
      cta: 'Seguir',
      likes: '256k',
      comments: '12.5k',
      shares: '45k'
    },
  ];

  return (
    <div
      className="relative w-full h-full bg-black flex flex-col"
    >
      <StatusBar time={time} />

      {/* Header */}
      <div className="absolute top-12 left-0 right-0 z-10 flex items-center justify-center px-4 py-2">
        <div className="flex items-center gap-4">
          <span className="text-[17px] font-bold text-white">Reels</span>
          <span className="text-[17px] font-bold text-white/40">Amigos</span>
          <div className="flex -space-x-2">
            <img src="https://i.ibb.co/4nqbRqRT/image.png" className="w-5 h-5 rounded-full border border-black object-cover" />
            <img src="https://i.ibb.co/rfZXXVnh/image.png" className="w-5 h-5 rounded-full border border-black object-cover" />
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 relative overflow-y-scroll snap-y snap-mandatory no-scrollbar" onScroll={(e) => {
        const index = Math.round(e.currentTarget.scrollTop / (scrollRef.current?.clientHeight || 844));
        setCurrentIndex(index);
      }}>
        {reels.map((reel, i) => (
          <div key={reel.id} className="h-full w-full snap-start relative">
            <VideoPlayer
              src={reel.video}
              isActive={currentIndex === i}
              onDoubleTap={() => toggleLike(reel.id)}
              onEnded={() => {
                if (reel.isAd) onNext();
              }}
            />

            {/* Overlay UI */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

            <div className="absolute bottom-6 left-4 right-16 pointer-events-none z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-neutral-600 overflow-hidden border border-white/20">
                  <img src={reel.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="font-bold text-[14px] text-white">{reel.user}</span>
                <button
                  className={`text-[12px] font-bold px-3 py-1 rounded-lg border pointer-events-auto transition-all ${followedReels.includes(reel.id)
                    ? "bg-ios-red border-ios-red text-white shadow-lg"
                    : "bg-white/10 border-white/20 text-white"
                    }`}
                  onClick={() => {
                    if (reel.isAd) onNext();
                    else toggleFollow(reel.id);
                  }}
                >
                  {followedReels.includes(reel.id) ? 'Seguindo' : 'Seguir'}
                </button>
              </div>
              <p className="text-[14px] text-white leading-tight mb-1">{reel.desc}</p>
              {reel.isAd && (
                <p className="text-[12px] text-white/80 font-normal mb-2">Patrocinado</p>
              )}
              <div className="flex items-center gap-2">
                <Music size={12} className="text-white" />
                <span className="text-[12px] text-white">Som original</span>
              </div>
            </div>

            <div className="absolute bottom-6 right-4 flex flex-col items-center gap-5 z-10">
              <div className="flex flex-col items-center">
                <motion.button
                  whileTap={{ scale: 1.5 }}
                  onClick={() => toggleLike(reel.id)}
                  className="pointer-events-auto"
                >
                  <Heart
                    size={32}
                    className={likedReels.includes(reel.id) ? "text-ios-red fill-ios-red" : "text-white"}
                    fill={likedReels.includes(reel.id) ? "currentColor" : "none"}
                  />
                </motion.button>
                <span className="text-[12px] font-bold text-white shadow-sm">{reel.likes}</span>
              </div>

              <div className="flex flex-col items-center">
                <MessageSquare size={32} className="text-white" />
                <span className="text-[12px] font-bold text-white shadow-sm">{reel.comments}</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="rotate-[-20deg]"><Send size={32} className="text-white" /></div>
                <span className="text-[12px] font-bold text-white shadow-sm">{reel.shares}</span>
              </div>

              <div className="flex flex-col items-center">
                <Bookmark size={32} className="text-white" />
              </div>

              <MoreHorizontal size={32} className="text-white" />

              <div className="w-8 h-8 rounded-lg border-2 border-white overflow-hidden">
                <img src={reel.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instagram Bottom Nav */}
      <div className="h-[84px] bg-black flex items-center justify-around px-4 pb-4">
        <Home size={26} className="text-white" />
        <Search size={26} className="text-white" />
        <div className="w-7 h-7 border-2 border-white rounded-lg flex items-center justify-center">
          <Plus size={18} className="text-white" />
        </div>
        <Video size={26} className="text-white" />
        <div className="w-7 h-7 rounded-full bg-neutral-600 overflow-hidden border border-white/20">
          <img src="https://i.ibb.co/HfD6dhm7/image.png" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full" />
    </div>
  );
};

const TikTokFeedScreen = ({ onEnterLive, time }: { onEnterLive: () => void; time: string; key?: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedTiktoks, setLikedTiktoks] = useState<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleLike = (id: number) => {
    setLikedTiktoks(prev => prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]);
  };

  const tiktoks = [
    {
      id: 1,
      video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/1.mp4',
      user: 'memesbr___433',
      avatar: 'https://i.ibb.co/2RXzWH7/image.png',
      desc: 'KKKKKKKKKKKK desse jeito #meme #foryou',
      memeCaption: 'EU TODA VEZ QUE VEJO ISSO KKKKK 🤡'
    },
    {
      id: 2,
      video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/2.mp4',
      user: 'joaozinn321',
      avatar: 'https://i.ibb.co/Nd10ts1F/image.png',
      desc: '.... #viraliza #foryoutiktok',
      memeCaption: 'O MARKETING DIGITAL É ASSIM MESMO 😂'
    },
    {
      id: 3,
      video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/3.mp4',
      user: 'almeidaai428',
      avatar: 'https://i.ibb.co/n8trsqKv/image.png',
      desc: 'Acho melhor não convidar KKKKKKK',
      memeCaption: 'NUNCA CONVIDE ESSA PESSOA 💀'
    },
    { id: 4, isLive: true, user: '@zidanerocha', viewers: '1.2k' },
  ];

  return (
    <div
      className="relative w-full h-full bg-black flex flex-col"
    >
      <StatusBar time={time} />

      {/* Header */}
      <div className="absolute top-12 left-0 right-0 z-10 flex items-center justify-center gap-6 px-4 py-2">
        <span className="text-[17px] font-bold text-white/40 whitespace-nowrap">Explorar</span>
        <div className="flex flex-col items-center">
          <span className="text-[17px] font-bold text-white whitespace-nowrap">Para você</span>
          <div className="w-6 h-0.5 bg-white mt-1" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 relative overflow-y-scroll snap-y snap-mandatory no-scrollbar" onScroll={(e) => {
        const viewportHeight = e.currentTarget.clientHeight;
        const index = Math.round(e.currentTarget.scrollTop / viewportHeight);
        if (index !== currentIndex) {
          setCurrentIndex(index);
        }
      }}>
        {tiktoks.map((tt, i) => (
          <div key={tt.id} className="h-full w-full snap-start relative">
            {tt.memeCaption && (
              <div className="absolute top-[10%] left-0 right-0 z-20 bg-white py-4 px-6 text-center shadow-xl">
                <h3 className="text-black font-black text-[22px] leading-tight uppercase tracking-tighter">
                  {tt.memeCaption}
                </h3>
              </div>
            )}
            {tt.isLive ? (
              <div className="w-full h-full relative cursor-pointer">
                <VideoPlayer
                  src="https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/WhatsApp%20Video%202026-04-11%20at%2000.50.19.mp4"
                  isActive={currentIndex === i}
                  onEnded={() => { }}
                />
                <div
                  className="absolute inset-0 bg-transparent z-10"
                  onClick={onEnterLive}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

                {/* Live Preview UI */}
                <div className="absolute top-6 left-4 flex items-center gap-2">
                </div>
                <div className="absolute top-6 right-4">
                </div>
                <div className="absolute top-18 left-4">
                </div>

                {/* Middle CTA - Adjusted size, position and ANIMATED */}
                <div className="absolute bottom-32 left-0 right-0 flex items-center justify-center gap-3 px-10 pointer-events-none">
                  <div className="h-[0.5px] flex-1 bg-white/20" />
                  <div className="flex items-center gap-2">
                    <div className="flex items-end gap-[2px] h-4">
                      <motion.div
                        animate={{ height: ["30%", "70%", "30%"] }}
                        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-[2px] bg-white/90"
                      />
                      <motion.div
                        animate={{ height: ["50%", "100%", "50%"] }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                        className="w-[2px] bg-white/90"
                      />
                      <motion.div
                        animate={{ height: ["40%", "80%", "40%"] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                        className="w-[2px] bg-white/90"
                      />
                    </div>
                    <span className="text-white font-bold text-[13px] tracking-wide drop-shadow-md uppercase">Toque para assistir à LIVE</span>
                  </div>
                  <div className="h-[0.5px] flex-1 bg-white/20" />
                </div>

                <div className="absolute bottom-6 left-4 right-16 z-10">
                  <div className="bg-ios-red px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 mb-2">
                    LIVE agora
                  </div>
                  <h4 className="font-bold text-[16px] text-white">Zidane Rocha</h4>
                  <p className="text-[14px] text-white mt-1 leading-tight">LIVE INICIOU BORAAAAA 🦇🔥</p>
                </div>
              </div>
            ) : (
              <VideoPlayer
                src={tt.video}
                isActive={currentIndex === i}
              />
            )}

            {/* TikTok UI Overlay */}
            {!tt.isLive && (
              <>
                <div className="absolute bottom-6 left-4 right-16 pointer-events-none z-10">
                  <h4 className="font-bold text-[18px] text-white">@{tt.user}</h4>
                  <p className="text-[14px] text-white mt-1 leading-tight">{tt.desc}</p>
                </div>

                <div className="absolute bottom-6 right-4 flex flex-col items-center gap-5 z-10">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                      <img src={tt.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-ios-red rounded-full p-0.5 border-2 border-black">
                      <Plus size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <motion.button
                      whileTap={{ scale: 1.5 }}
                      onClick={() => toggleLike(tt.id)}
                      className="pointer-events-auto"
                    >
                      <Heart
                        size={32}
                        className={likedTiktoks.includes(tt.id) ? "text-ios-red fill-ios-red" : "text-white fill-white"}
                        fill="currentColor"
                      />
                    </motion.button>
                    <span className="text-[12px] font-bold">{likedTiktoks.includes(tt.id) ? '27.1 mil' : '27 mil'}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageSquare size={32} fill="white" className="text-white" />
                    <span className="text-[12px] font-bold">125</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bookmark size={32} fill="white" className="text-white" />
                    <span className="text-[12px] font-bold">531</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="rotate-[-20deg]"><Send size={32} fill="white" className="text-white" /></div>
                    <span className="text-[12px] font-bold">273</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-neutral-800 border-4 border-neutral-700 animate-spin-slow overflow-hidden">
                    <img src={tt.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* TikTok Nav */}
      <div className="h-[84px] bg-black flex items-center justify-around px-4 pb-4">
        <div className="flex flex-col items-center gap-1">
          <Home size={24} className="text-white" />
          <span className="text-[10px] font-bold text-white">Início</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <User size={24} className="text-white/60" />
          <span className="text-[10px] font-bold text-white/60">Amigos</span>
        </div>
        <div className="relative w-12 h-8">
          <div className="absolute inset-0 bg-[#00f2ea] rounded-lg translate-x-1" />
          <div className="absolute inset-0 bg-[#ff0050] rounded-lg -translate-x-1" />
          <div className="absolute inset-0 bg-white rounded-lg flex items-center justify-center">
            <Plus size={20} className="text-black" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 relative">
          <MessageCircle size={24} className="text-white/60" />
          <div className="absolute -top-1 -right-1 bg-ios-red text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black">2</div>
          <span className="text-[10px] font-bold text-white/60">Mensagens</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <User size={24} className="text-white/60" />
          <span className="text-[10px] font-bold text-white/60">Perfil</span>
        </div>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full" />
    </div>
  );
};

const TikTokLiveScreen = ({ onOpenCheckout, time, key }: { onOpenCheckout: () => void; time: string; key?: string }) => {
  const [showShop, setShowShop] = useState(false);
  const [likes, setLikes] = useState(100000);
  const [viewers, setViewers] = useState(245);
  const [lastJoinedUser, setLastJoinedUser] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);
  const scriptedFlags = useRef({ c1: false, c2: false, c3: false, shop: false });

  const brNames = ['João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Juliana', 'Mateus', 'Beatriz', 'Gabriel', 'Letícia', 'Rafael', 'Camila', 'Thiago', 'Fernanda', 'Carlos', 'Amanda', 'Ricardo', 'Vanessa', 'Marcos', 'Aline'];
  const brSurnames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Carvalho', 'Almeida', 'Ferreira', 'Ribeiro', 'Rodrigues', 'Gomes', 'Martins', 'Lima', 'Rocha', 'Alves', 'Nascimento', 'Araújo', 'Melo', 'Barbosa'];

  const addScriptedComment = (specificName: string | null, text: string) => {
    setComments(prev => {
      const name = specificName || brNames[Math.floor(Math.random() * brNames.length)];
      const surname = specificName ? '' : brSurnames[Math.floor(Math.random() * brSurnames.length)];
      const randomAvatar = `https://i.pravatar.cc/100?u=${name}${surname}${Date.now()}`;
      const newComment = {
        id: Math.random().toString(36).substr(2, 9),
        user: specificName ? name : `${name} ${surname}`,
        text: text,
        avatar: randomAvatar,
        badge: undefined
      };
      return [...prev.slice(-15), newComment];
    });
  };

  const handleTimeUpdate = (e: any) => {
    const t = e.target.currentTime;

    // 00:00 -> 1st comment (dispara no 0.5s pra dar tempo de carregar)
    if (t >= 0.5 && !scriptedFlags.current.c1) {
      scriptedFlags.current.c1 = true;
      addScriptedComment('Leo', 'Fala zid oque é neurociencia e porque e importante na oferta?');
    }
    // 00:38 -> 2nd comment
    if (t >= 38 && !scriptedFlags.current.c2) {
      scriptedFlags.current.c2 = true;
      addScriptedComment(null, 'sou do organico, estudo de mercado e publico e realmente algo relevante?');
    }
    // 01:37 -> 97s -> 3rd comment
    if (t >= 97 && !scriptedFlags.current.c3) {
      scriptedFlags.current.c3 = true;
      addScriptedComment(null, 'como criar um funil que escale muito zid? não quero rodar mentira');
    }
    // 02:39 -> 159s -> Shop Event
    if (t >= 159 && !scriptedFlags.current.shop) {
      scriptedFlags.current.shop = true;
      setShowShop(true);
    }
  };

  useEffect(() => {
    const possibleComments = [
      // Hype & Enthusiasm
      "Live toooop", "Fodaaa", "Zidane é o brabo!!", "O brabo tem nome", "Melhor live de hoje", "Só conteúdo de valor", "Ave maria, que aula", "Pesado demais", "Brabo dms!", "Top top top", "Eitaaaa", "Aí sim!", "Aula gratuita!", "Explodiu a mente", "Visão de cria", "Mlk é gênio", "Surreal isso", "Não tô acreditando", "Mágico", "Insano", "O melhor do mercado", "Ninguém entrega isso", "Pura verdade", "Concordo plenamente", "Isso vale ouro", "Anotado!", "Meu deus, que sacada", "Mudou meu jogo", "Gratidão Zidane", "Tamo junto!", "É o mestre", "Incrível", "Sensacional", "Show de bola", "Manda brasa", "Fuegooo 🔥", "🦇🔥", "🚀🚀🚀", "💎💎💎", "Ta maluco!", "Estratégia braba", "O cara é uma máquina", "Zidane vc é foda", "Mlk é luz", "Inspirador", "Que vibe!", "O cara manja muito", "Referência", "Elite", "Diferenciado",

      // Purchase & Conversion Intent
      "Quero comprar, aonde eu compro?", "Como faço pra entrar?", "Ainda tem vaga?", "Quero o link!", "Manda o link no chat", "Vou garantir o meu agora", "Já quero começar", "Qual o investimento?", "Tem garantia?", "Onde assina?", "Abre o carrinho logo!", "Quero mudar de vida hoje", "Passa o cartão aqui", "Bora pra cima!", "Vou entrar pro time", "Me aceita no grupo", "Quero o bônus", "Vale muito o investimento", "Barato pelo que entrega", "Onde clica?", "Vou comprar agora", "Não quero ficar de fora", "Reserva a minha vaga", "Manda o zap", "Garantido!", "Vou dar o próximo passo", "Chega de desculpas", "É hj que eu começo", "Tô com o cartão na mão", "Libera logo!", "Quero o desconto", "Vou investir em mim", "Melhor investimento do ano", "Tô dentro!", "Pode contar comigo", "Já sou aluno!",

      // Beginner & Education Questions
      "Você ensina do básico ao avançado?", "Quem tá começando do zero consegue?", "Funciona pra quem não sabe nada?", "Precisa ter experiência?", "É difícil de aprender?", "Quanto tempo pra ter resultado?", "Dá pra fazer pelo celular?", "Precisa de computador?", "Ensina a subir campanha?", "Como funciona o suporte?", "Tem mentoria?", "Você pega na mão?", "Dá pra começar com pouco dinheiro?", "É seguro?", "Qual o primeiro passo?", "Como faz pra ver as aulas?", "Tem acesso vitalício?", "Funciona em 2024?", "Ainda vale a pena começar?", "Dá pra conciliar com o trabalho?", "Quantas horas por dia precisa?", "Tem certificado?", "Precisa aparecer?", "Sou muito iniciante, consigo?", "Tô perdido, me ajuda", "O que é marketing digital?", "Como cria a conta?", "Dá pra começar hoje?", "Quero aprender do zero", "Me ensina!", "Sou fã!",

      // Technical & Advanced Questions
      "Você roda so white?", "Roda black também?", "Como tá o ROI hoje?", "Qual a melhor contingência?", "Usa multilogin?", "Tá usando qual fonte de tráfego?", "Ads tá entregando bem?", "Como tá o CPM?", "Dá pra escalar?", "Isso é PLR?", "Dropshipping ou Afiliado?", "Tráfego pago puro?", "Dá pra rodar no orgânico?", "Qual o melhor nicho?", "Isso serve pra lançamento?", "Dá pra aplicar no local?", "Como tá o checkout?", "Usa qual plataforma?", "Tem automação?", "Qual ferramenta você usa?", "A estrutura é própria?", "Como evitar bloqueios?", "O Facebook Ads tá chato né?", "Google Ads compensa?", "TikTok Ads tá entregando?", "E o Pinterest?", "Onde você hospeda?", "Precisa de CNPJ?", "Como declara os ganhos?", "Qual o limite de escala?",

      // Testimonials & Social Proof
      "Fiz R$1.000 ontem com o que você ensinou!", "Apliquei e deu certo!", "Melhor decisão da minha vida", "Minha primeira venda saiu!", "Zidane mudou meu mindset", "Tô ganhando mais que no meu antigo emprego", "Hoje vivo de internet", "Obrigado por tudo", "Sua estratégia é infalível", "Nunca vi nada igual", "Vale cada centavo", "O suporte é top", "Comunidade nota 10", "Já recuperei o investimento", "Minha família agradece", "Tô no lucro!", "Resultados reais aqui", "Não tive bloqueios", "Escalando forte!", "O cara entrega tudo", "Sem enrolação", "Direto ao ponto", "Prático e rápido", "Funciona mesmo", "Pode confiar", "Sem palavras", "Gratidão eterna", "Sou prova viva que funciona",

      // Interaction & Miscellaneous
      "Manda salve pra SP!", "Manda salve pra BH!", "Salve do RJ!", "De onde vcs são?", "Tô assistindo de Portugal", "Boa noite Zidane!", "A live vai ficar salva?", "Perdi o começo!", "Explica de novo por favor", "O áudio tá bom", "Imagem top", "Fala meu nome!", "Cadê o PDF?", "Manda o material", "Que horas acaba?", "Faz outra live amanhã", "Sou seu fã de longa data", "Te sigo há muito tempo", "Amanhã tem mais?", "Qual o seu Instagram?", "Responde o direct!", "Tô focado!", "Bora bater a meta", "Curtindo muito a vibe", "A galera tá animada hj", "Vamo que vamo", "Pra cima deles", "Foco no objetivo", "Zero desculpas", "O jogo virou", "Dá-lhe Zidane!", "Batman do Marketing 🦇", "O homem não para", "Manda oi rs"
    ];

    const likeInterval = setInterval(() => setLikes(l => l + Math.floor(Math.random() * 50)), 2000);
    const viewerInterval = setInterval(() => {
      setViewers(v => {
        const change = Math.floor(Math.random() * 7) - 3;
        const newVal = v + change;
        return Math.min(Math.max(newVal, 100), 290);
      });
    }, 3000);

    const checkHeartInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        setFloatingHearts(prev => [...prev, { id: Date.now(), left: Math.random() * 40 + 60 }]);
      }
    }, 400);

    const joinInterval = setInterval(() => {
      const name = brNames[Math.floor(Math.random() * brNames.length)];
      const surname = brSurnames[Math.floor(Math.random() * brSurnames.length)];
      setLastJoinedUser(`${name} ${surname}`);
    }, 4500);

    let commentTimeout: any;
    const addRandomComment = () => {
      setComments(prev => {
        const name = brNames[Math.floor(Math.random() * brNames.length)];
        const surname = brSurnames[Math.floor(Math.random() * brSurnames.length)];

        if (!(window as any).commentIdx) (window as any).commentIdx = 0;
        if (!(window as any).shuffledComments) {
          (window as any).shuffledComments = [...possibleComments].sort(() => Math.random() - 0.5);
        }

        const idx = (window as any).commentIdx % (window as any).shuffledComments.length;
        const commentText = (window as any).shuffledComments[idx];
        (window as any).commentIdx++;

        if (idx === (window as any).shuffledComments.length - 1) {
          (window as any).shuffledComments = [...possibleComments].sort(() => Math.random() - 0.5);
        }

        const randomAvatar = `https://i.pravatar.cc/100?u=${name}${surname}${idx}`;

        const newComment = {
          id: Math.random().toString(36).substr(2, 9),
          user: `${name} ${surname}`,
          text: commentText,
          avatar: randomAvatar,
          badge: Math.random() > 0.8 ? `Nº ${Math.floor(Math.random() * 10)}` : undefined
        };

        return [...prev.slice(-15), newComment];
      });

      const nextDelay = 1800 + Math.random() * 3500;
      commentTimeout = setTimeout(addRandomComment, nextDelay);
    };

    // Begin random comments slightly after the first scripted one
    commentTimeout = setTimeout(addRandomComment, 3500);

    return () => {
      clearInterval(likeInterval);
      clearInterval(viewerInterval);
      clearInterval(joinInterval);
      clearInterval(checkHeartInterval);
      clearTimeout(commentTimeout);
    };
  }, []);

  return (
    <div
      className="relative w-full h-full bg-black overflow-hidden"
    >
      <StatusBar time={time} />
      {/* Live Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover"
          src="https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/WhatsApp%20Video%202026-04-11%20at%2000.50.19.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* Floating Hearts Animation */}
      <div className="absolute bottom-20 right-0 w-[100px] h-[300px] pointer-events-none z-30 overflow-hidden">
        <AnimatePresence>
          {floatingHearts.map(heart => (
            <motion.div
              key={heart.id}
              initial={{ y: 300, opacity: 1, scale: 0.5, x: 0 }}
              animate={{
                y: -50,
                opacity: 0,
                scale: 1.5,
                x: [0, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 + Math.random(), ease: "easeOut" }}
              className="absolute bottom-0"
              style={{ left: `${heart.left}%` }}
              onAnimationComplete={() => {
                setFloatingHearts(prev => prev.filter(h => h.id !== heart.id));
              }}
            >
              <Heart size={24} className="text-ios-red fill-ios-red drop-shadow-lg" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="absolute top-12 left-4 right-4 z-20 space-y-3 pointer-events-none">
        <div className="flex justify-between items-center z-20">
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="bg-black/40 backdrop-blur-md rounded-full p-0.5 flex items-center pr-3 border border-white/10">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                <img src="https://i.ibb.co/ZP5wt8W/image.png" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-white line-clamp-1 max-w-[80px]">Zidane Rocha</p>
                <div className="flex items-center gap-1">
                  <Heart size={8} className="text-white fill-white" />
                  <p className="text-[9px] text-white/90">{(likes / 1000).toFixed(1)}K</p>
                </div>
              </div>
              <button className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full ml-3 flex items-center gap-1 border border-white/10">
                Seguindo
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 pointer-events-auto">
            <div className="flex -space-x-1.5 mr-1">
              <img src="https://i.ibb.co/s9MNHS9K/image.png" className="w-6 h-6 rounded-full border border-white/20 object-cover" />
              <img src="https://i.ibb.co/zWx8YBCs/image.png" className="w-6 h-6 rounded-full border border-white/20 object-cover" />
            </div>
            <div className="bg-black/30 backdrop-blur-md rounded-md px-2 py-0.5 text-[12px] font-bold text-white/90">
              {viewers}
            </div>
            <button className="p-1 px-2 text-white/80">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Small Badges Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 pointer-events-auto">
          <div className="bg-black/30 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1 shrink-0 border border-white/5">
            <span className="text-[10px] text-pink-300 font-bold">💎 Top 10% da Liga D2</span>
          </div>
          <div className="bg-black/30 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1 shrink-0 border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            <span className="text-[10px] text-white/90 font-bold">0/10</span>
          </div>
          <div className="bg-black/30 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1 shrink-0 border border-white/5">
            <span className="text-[10px] text-white/90 font-bold">12:45 (Duração...)</span>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="absolute bottom-36 left-4 right-16 max-h-[360px] flex flex-col justify-end gap-2.5 z-20 mask-fade-top pointer-events-none">
        <AnimatePresence>
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -20, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
              className="flex items-start gap-2 max-w-full shrink-0"
            >
              <div className="flex items-start gap-2 group">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10 shadow-lg bg-neutral-800">
                  <img src={c.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-white/80 font-bold text-[12px] mix-blend-plus-lighter">{c.user}</span>
                    {c.badge && (
                      <span className="bg-[#ff4e20] text-white text-[8px] px-1.5 py-0.5 rounded-sm font-black italic border border-white/20">
                        {c.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-white text-[14px] leading-tight font-bold drop-shadow-2xl">{c.text}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Static Join Notification */}
      <div className="absolute bottom-20 left-4 z-30 min-h-[32px] pointer-events-none">
        <AnimatePresence mode="wait">
          {lastJoinedUser && (
            <motion.div
              key={lastJoinedUser}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-black/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2 border border-white/5"
            >
              <span className="text-[14px]">👋</span>
              <span className="text-white font-bold text-[14px]">{lastJoinedUser}</span>
              <span className="text-white/80 text-[14px]">entrou</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="absolute bottom-6 left-4 right-4 flex items-center gap-2 z-20 pointer-events-auto">
        <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10 group active:scale-90 transition-transform">
          <div className="w-6 h-6 bg-[#ffca28] rounded-md flex items-center justify-center shadow-lg">
            <Grid size={14} className="text-black" />
          </div>
        </div>

        <div className="flex-1 bg-black/40 backdrop-blur-md rounded-full px-4 h-11 flex items-center border border-white/10">
          <span className="text-white/60 text-[14px]">Tipo...</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
            <div className="text-white/90">😊</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
            <UserPlus size={22} className="text-white" />
          </div>
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
            <span className="text-2xl">🌹</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
            <Gift size={22} className="text-[#ff4081]" />
          </div>
          <div className="relative w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
            <Send size={22} className="text-white rotate-[-15deg] translate-x-[1px] -translate-y-[1px]" />
            <div className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black/20">5</div>
          </div>
        </div>
      </div>

      {/* Shop Button / Product Banner */}
      <AnimatePresence>
        {showShop && (
          <>
            {/* Floating Product Banner */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="absolute bottom-[85px] left-4 right-4 z-[100] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center p-2.5 pr-3 pointer-events-auto border border-black/5"
            >
              {/* Product Image */}
              <div className="relative w-20 h-20 rounded-lg bg-[#f5f5f5] shrink-0 overflow-hidden border border-black/5 flex items-center justify-center p-1">
                <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 rounded-sm z-10">
                  1
                </div>
                <img src="https://i.ibb.co/ZP5wt8W/image.png" className="w-full h-full object-contain drop-shadow-md" />
              </div>

              {/* Product Details */}
              <div className="flex-1 ml-3 flex flex-col justify-between h-full">
                {/* Title & Close */}
                <div className="flex justify-between items-start">
                  <p className="text-black font-semibold text-[13px] leading-tight line-clamp-1 pr-2">IMERSÃO 100X - Zidane Rocha</p>
                  <button className="bg-[#f0f0f0] rounded-full p-1 shrink-0" onClick={() => setShowShop(false)}>
                    <X size={12} className="text-black/60" />
                  </button>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="bg-[#fff1eb] text-[#ff6b00] text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    ⚡ Oferta Relâmpago da LIVE
                  </span>
                  <span className="bg-[#fceeed] text-[#f23d5b] text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    🎫 APENAS NESSA LIVE
                  </span>
                </div>

                {/* Pricing & Buy Button */}
                <div className="flex items-end justify-between mt-1.5">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-black font-extrabold text-[15px]">R$ 27,90</span>
                    <span className="text-[#f23d5b] text-[11px] line-through">R$ 57,90</span>
                    <span className="bg-[#f23d5b] text-white text-[9px] font-black px-1 rounded-sm ml-0.5">-51%</span>
                  </div>
                  <button onClick={() => window.location.href = 'https://checkout.perfectpay.com.br/pay/PPU38CQA2MH'} className="bg-[#f23d5b] active:scale-95 transition-transform text-white text-[12px] font-bold px-3.5 py-1.5 rounded-lg ml-2 shadow-[0_2px_10px_rgba(242,61,91,0.3)]">
                    Comprar
                  </button>
                </div>
              </div>
            </motion.div>


          </>
        )}
      </AnimatePresence>
    </div>
  );
};
