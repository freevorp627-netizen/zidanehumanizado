import React, { useState, useEffect, useRef } from 'react';
import { Plus, Camera, Mic, Video, Phone, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { StatusBar } from '../components/layout';
import { AudioMessage } from '../components/AudioMessage';
import { useSound } from '../hooks/useSound';

const R2_AUDIO_BASE = 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/audios';

const SIMULATED_MESSAGES = [
  { id: 1, sender: 'Victor Ferreira', text: 'Cara fico impressionado o tanto que esse cara mente... Vive falando mal da galera do black mas o cara não fatura nem 1k dia kkkkk 🤣🤣🤣', type: 'text' },
  { id: 2, sender: 'Paulo Plinio', text: 'E a placa de faturamento dele kkk? tudo comprado na shopee , da pra ver a qualidade ruim 🤡', type: 'text' },
  { id: 3, sender: 'Augusto Chagas', audioSrc: `${R2_AUDIO_BASE}/audiohater3.ogg`, audioDuration: '0:16', type: 'audio' },
  { id: 4, sender: 'José Matheus', audioSrc: `${R2_AUDIO_BASE}/audiohater1.ogg`, audioDuration: '0:08', type: 'audio' },
  { id: 5, sender: 'Felipe Almeida', audioSrc: `${R2_AUDIO_BASE}/audiohater2.ogg`, audioDuration: '0:11', type: 'audio' },
  { id: 7, sender: 'Zidane Rocha', image: 'https://i.ibb.co/7dQzZGTB/image.png', type: 'image', verified: true },
  { id: 75, sender: 'Zidane Rocha', audioSrc: `${R2_AUDIO_BASE}/audio-resposta-grupo.ogg`, audioDuration: '0:35', type: 'audio', verified: true },
  { id: 8, sender: 'Zidane Rocha', text: 'Entra na minha comunidade fechada', link: 'Comunidade Zidane Rocha', type: 'link', verified: true },
];

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
  'Zidane Rocha': '+55 93 99543-5325',
};

interface WhatsAppProps {
  onJoinCommunity?: () => void;
  onImageClick: (url: string) => void;
  time: string;
}

export const WhatsAppGroupScreen = React.memo(({ onJoinCommunity, onImageClick, time }: WhatsAppProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [activeAudioId, setActiveAudioId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSound();

  const triggerNext = () => setCurrentIndex(prev => prev + 1);

  useEffect(() => {
    let isMounted = true;
    const runSequence = async () => {
      if (currentIndex >= SIMULATED_MESSAGES.length || !isMounted) return;
      const nextMsg = SIMULATED_MESSAGES[currentIndex];
      setStatus(nextMsg.type === 'audio' ? 'Gravando áudio...' : 'Digitando...');
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      if (!isMounted) return;
      
      playSound('whatsapp_msg');

      setMessages(prev => [...prev, nextMsg]);
      if (nextMsg.type === 'audio') setActiveAudioId(nextMsg.id);
      setStatus(null);

      if (['text', 'image', 'link'].includes(nextMsg.type)) {
        setTimeout(() => isMounted && triggerNext(), 4000);
      }
    };
    runSequence();
    return () => { isMounted = false; };
  }, [currentIndex]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, status]);

  return (
    <div className="relative w-full h-full bg-[#000000] bg-[url('https://i.ibb.co/CNyc9yX/Sem-T-tulo-1.png')] bg-cover bg-center flex flex-col">
      <div className="bg-black"><StatusBar time={time} /></div>
      <div className="bg-[#1f2c34] pt-2 pb-2 px-3 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-neutral-600 overflow-hidden">
          <img src="https://i.ibb.co/YFHnq4tG/image.png" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[15px] text-white truncate">Zidane Mentiroso</h3>
          {status ? <p className="text-[11px] text-[#00a884] font-medium">{status}</p> : <p className="text-[11px] text-white/50 truncate">José Matheus, Augusto Chagas...</p>}
        </div>
        <div className="flex items-center gap-4 text-[#00a884]"><Video size={22} /><Phone size={20} /><MoreHorizontal size={22} className="rotate-90" /></div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => {
          const isZidane = msg.sender === 'Zidane Rocha';
          return (
            <div key={msg.id} className={`flex ${isZidane ? 'justify-end' : 'justify-start'} w-full gap-1.5`}>
              {!isZidane && msg.type !== 'link' && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5">
                  <img src={SENDER_AVATARS[msg.sender]} className="w-full h-full object-cover" />
                </div>
              )}
              <div className={`max-w-[80%] relative ${msg.type === 'link' ? '' : `p-1.5 rounded-2xl shadow-sm ${isZidane ? 'bg-[#005c4b] rounded-tr-none' : 'bg-[#202c33] rounded-tl-none'}`}`}>
                {!isZidane && msg.type !== 'link' && <div className="px-2 pt-0.5 pb-1"><span className="text-[13px] font-bold text-[#3dbed1]">~ {msg.sender}</span></div>}
                {msg.type === 'text' && <p className="text-[14px] px-2 py-0.5 leading-tight">{msg.text}</p>}
                {msg.type === 'image' && <img onClick={() => onImageClick(msg.image)} src={msg.image} className="rounded-[10px] w-full h-auto max-h-[350px] object-cover cursor-pointer" />}
                {msg.type === 'audio' && <AudioMessage sender={msg.sender} audioSrc={msg.audioSrc} isZidane={isZidane} autoPlay={activeAudioId === msg.id} onEnded={() => { setActiveAudioId(null); triggerNext(); }} />}
                {msg.type === 'link' && (
                  <div className="bg-[#1c2327] rounded-2xl overflow-hidden border border-white/5 w-[280px] shadow-lg">
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shrink-0 relative"><img src="https://img.icons8.com/color/144/000000/whatsapp.png" className="w-6 h-6" /></div>
                      <div className="flex-1"><h4 className="text-[17px] font-semibold text-white leading-tight">Comunidade Zidane</h4><p className="text-[14px] text-white/50 leading-tight">Convite para grupo</p></div>
                    </div>
                    <button onClick={onJoinCommunity} className="w-full py-3.5 border-t border-white/5 text-[#00a884] font-semibold text-[16px]">Entrar no grupo</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-[#1f2c34] p-3 flex items-center gap-3 pb-8"><Plus size={24} className="text-white/60" /><div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-white/40 text-[15px]">Mensagem</div><Camera size={24} className="text-white/60" /><Mic size={24} className="text-white/60" /></div>
    </div>
  );
});

const COMMUNITY_MESSAGES = [
  { id: 1, sender: 'Zidane Rocha', type: 'text', text: 'Pra vocês que tem dúvida se eu realmente trago resultado pros meus alunos, olha esses depoimentos abaixoo!! 👇', time: '16:05' },
  { id: 2, sender: 'Zidane Rocha', type: 'video', video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/WhatsApp%20Video%202026-04-08%20at%2016.06.50.mp4', time: '16:06' },
  { id: 3, sender: 'Zidane Rocha', type: 'video', video: 'https://pub-a772dcccd942498d933354c58ab4ce29.r2.dev/WhatsApp%20Video%202026-04-08%20at%2016.13.03.mp4', time: '16:13' },
  { id: 4, sender: 'Zidane Rocha', type: 'audio', audioSrc: `${R2_AUDIO_BASE}/audio-resultado1.ogg`, time: '16:14' },
  { id: 5, sender: 'Zidane Rocha', type: 'audio', audioSrc: `${R2_AUDIO_BASE}/audio-resultado2.ogg`, time: '16:15' },
  { id: 6, sender: 'Zidane Rocha', type: 'audio', audioSrc: `${R2_AUDIO_BASE}/audio-resultado3.ogg`, time: '16:16' },
];

export const WhatsAppCommunityScreen = React.memo(({ onNext, onImageClick, time }: { onNext: () => void; onImageClick: (url: string) => void; time: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSound();

  const triggerNext = () => currentIndex < COMMUNITY_MESSAGES.length - 1 ? (playSound('whatsapp_msg'), setCurrentIndex(prev => prev + 1)) : onNext();

  useEffect(() => {
    if (currentIndex === 0) playSound('whatsapp_msg');
    const msg = COMMUNITY_MESSAGES[currentIndex];
    if (msg?.type === 'text' || msg?.type === 'image') {
      const t = setTimeout(triggerNext, 4000);
      return () => clearTimeout(t);
    }
  }, [currentIndex]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [currentIndex]);

  return (
    <div className="relative w-full h-full bg-[#000000] bg-[url('https://i.ibb.co/kgxLnzw4/image.png')] bg-cover bg-center flex flex-col">
      <div className="bg-black"><StatusBar time={time} /></div>
      <div className="bg-[#1f2c34] pt-2 pb-3 px-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-600 overflow-hidden"><img src="https://i.ibb.co/p69twTYp/image.png" /></div>
        <div className="flex-1"><h3 className="font-bold text-[15px] flex items-center gap-1 text-white">Comunidade Zidane Rocha <CheckCircle2 size={14} className="text-ios-blue fill-ios-blue text-white" /></h3><p className="text-[11px] text-white/60">Avisos</p></div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar pb-12">
        {COMMUNITY_MESSAGES.slice(0, currentIndex + 1).map((msg) => (
          <div key={msg.id} className="flex justify-start w-full gap-1.5 items-end">
             <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5"><img src={SENDER_AVATARS[msg.sender]} /></div>
             <div className={`max-w-[80%] p-1.5 rounded-2xl rounded-tl-none bg-[#1c2327]`}>
                <div className="flex gap-1.5 px-2 pt-0.5 pb-1"><span className="text-[13px] font-bold text-[#3dbed1]">~ {msg.sender}</span></div>
                {msg.type === 'text' && <p className="text-[14px] px-2 leading-tight text-white">{msg.text}</p>}
                {msg.type === 'video' && <video src={msg.video} className="rounded-[10px] w-full h-auto max-h-[350px] object-cover" controls autoPlay={msg.id === COMMUNITY_MESSAGES[currentIndex].id} onEnded={triggerNext} playsInline preload="auto" />}
                {msg.type === 'audio' && <AudioMessage sender={msg.sender} audioSrc={msg.audioSrc} isZidane={false} autoPlay={msg.id === COMMUNITY_MESSAGES[currentIndex].id} onEnded={triggerNext} />}
             </div>
          </div>
        ))}
      </div>
      <div className="bg-[#1f2c34] p-4 text-center border-t border-white/5 pb-8"><p className="text-[12px] text-white/60 leading-tight">Somente admins podem enviar avisos.</p></div>
    </div>
  );
});
