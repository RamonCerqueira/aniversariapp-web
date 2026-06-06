import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Loader2,
  Sparkles,
  Navigation,
  CalendarCheck,
  Users,
  Clock,
  Heart,
  User,
  QrCode,
  Music,
  Utensils,
  Camera,
  Play,
  Mail,
  Phone,
  Bookmark
} from 'lucide-react';
import { toast } from 'sonner';

// QR Code display component
function QRCodeDisplay({ guestId, themeAccent }) {
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(guestId, {
        width: 200,
        margin: 2,
        color: { dark: '#12131A', light: '#FFFFFF' }
      }).then(url => setQrUrl(url));
    });
  }, [guestId]);

  if (!qrUrl) return (
    <div className="w-[160px] h-[160px] bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
      <Loader2 className="animate-spin text-white/50" size={24} />
    </div>
  );

  return (
    <div className="bg-white p-3 rounded-2xl shadow-xl border border-white/10">
      <img src={qrUrl} alt="QR Code de Confirmação" className="w-[140px] h-[140px]" />
    </div>
  );
}

// Interactive Countdown Component
function CountdownTimer({ partyDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!partyDate) return;
    const updateTime = () => {
      const diff = new Date(partyDate) - new Date();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [partyDate]);

  return (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-sm mx-auto pt-2">
      {Object.entries(timeLeft).map(([label, val]) => (
        <div key={label} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-3 flex flex-col items-center">
          <span className="text-2xl sm:text-3xl font-light font-luxury-serif text-white tracking-tight">
            {val.toString().padStart(2, '0')}
          </span>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">
            {label === 'days' ? 'Dias' : label === 'hours' ? 'Horas' : label === 'minutes' ? 'Minutos' : 'Segundos'}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RSVPPage() {
  const { id } = useParams();
  const [guest, setGuest] = useState(null);
  const [step, setStep] = useState('view'); // 'view' | 'form' | 'confirmed' | 'declined'
  const [formStep, setFormStep] = useState(1); // 1: presenca, 2: detalhes
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [status, setStatus] = useState('confirmed');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hasCompanions, setHasCompanions] = useState('no');
  const [companionNames, setCompanionNames] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [favoriteSong, setFavoriteSong] = useState('');
  const [messageToHost, setMessageToHost] = useState('');
  const [selfieBase64, setSelfieBase64] = useState('');

  useEffect(() => {
    if (id) fetchGuestData();
  }, [id]);

  const fetchGuestData = async () => {
    setIsLoading(true);
    try {
      const data = await api.guests.publicGet(id);
      setGuest(data);
      if (data.status === 'confirmed') setStep('confirmed');
      else if (data.status === 'declined') setStep('declined');
      
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setFavoriteSong(data.favoriteSong || '');
      setMessageToHost(data.messageToHost || '');
      setSelfieBase64(data.photoUrl || '');
      
      if (data.companionNames?.length > 0) {
        setCompanionNames(data.companionNames);
        setHasCompanions('yes');
      } else {
        setCompanionNames(Array(data.companions).fill(''));
        setHasCompanions('no');
      }
      if (data.dietaryRestrictions?.length > 0) {
        setDietaryRestrictions(data.dietaryRestrictions);
      }
    } catch (err) {
      setError('Convite inválido ou não encontrado.');
    } finally {
      setIsLoading(false);
    }
  };

  const getThemeConfig = () => {
    if (!guest?.party) return themeStyles['luxury-black'];
    const dbTheme = guest.party.theme;
    if (themeStyles[dbTheme]) return themeStyles[dbTheme];
    
    // Fallback inteligente com base no tipo da festa
    const partyType = guest.party.type?.toLowerCase() || '';
    if (partyType.includes('casamento') || partyType.includes('wedding')) return themeStyles['wedding'];
    if (partyType.includes('15 anos') || partyType.includes('debutante') || partyType.includes('aniversario')) return themeStyles['gold'];
    if (partyType.includes('infantil') || partyType.includes('criança')) return themeStyles['kids'];
    if (partyType.includes('corporativo') || partyType.includes('empresa')) return themeStyles['corp'];
    return themeStyles['luxury-black'];
  };

  // Fallback de dados para preencher a landing page com requinte caso não estejam no banco
  const getPartyCustomizations = () => {
    const defaultCustoms = {
      coverPhoto: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200',
      dressCode: '👗 Traje Social / Esporte Fino\nQueremos que você se sinta confortável e deslumbrante!',
      giftListUrl: '#',
      timeline: [
        { time: '19:00', title: 'Recepção', description: 'Boas-vindas aos convidados.' },
        { time: '20:30', title: 'Cerimônia / Jantar', description: 'Celebração principal seguida de banquete.' },
        { time: '22:30', title: 'Abertura da Pista', description: 'Festa com DJ e banda ao vivo.' }
      ],
      hotels: [
        { name: 'Hotel Royal Garden (Próximo ao local)', distance: '500m', phone: '(11) 99999-8888', link: '#' },
        { name: 'Palace Central Suites', distance: '1.5km', phone: '(11) 98888-7777', link: '#' }
      ],
      gallery: [
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=400',
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=400'
      ],
      coverVideo: null,
      teaserVideo: null
    };

    if (!guest?.party) return defaultCustoms;

    // Configurando fallbacks específicos por tipo de festa
    const pType = guest.party.type?.toLowerCase() || '';
    if (pType.includes('casamento') || pType.includes('wedding')) {
      defaultCustoms.coverPhoto = 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200';
      defaultCustoms.dressCode = '👗 Traje Social Fino / Passeio Completo\nMulheres de vestido longo/midi e homens de terno.';
      defaultCustoms.timeline = [
        { time: '19:00', title: 'Cerimônia Religiosa', description: 'Entrada dos noivos e benção.' },
        { time: '20:30', title: 'Coquetel & Fotos', description: 'Espaço aberto para recepção dos convidados.' },
        { time: '21:30', title: 'Jantar Imperial', description: 'Buffet especial servido no salão principal.' },
        { time: '23:00', title: 'Festa & DJ', description: 'Pista de dança aberta com atrações surpresas.' }
      ];
    } else if (pType.includes('15 anos') || pType.includes('debutante')) {
      defaultCustoms.coverPhoto = 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=1200';
      defaultCustoms.dressCode = '👗 Traje Social / Gala\nMulheres de vestido longo/festa e homens de blazer/terno.';
      defaultCustoms.timeline = [
        { time: '21:00', title: 'Recepção dos Convidados', description: 'Bebidas de boas-vindas e música ambiente.' },
        { time: '22:30', title: 'Entrada da Debutante', description: 'Apresentação especial e homenagens.' },
        { time: '23:15', title: 'Valsa & Brinde', description: 'Momento tradicional com a família.' },
        { time: '23:45', title: 'Balada', description: 'Abertura da pista de dança até o amanhecer.' }
      ];
    }

    // Mesclar os dados do banco sobrepondo os fallbacks se existirem
    return {
      coverPhoto: guest.party.coverPhoto || defaultCustoms.coverPhoto,
      dressCode: guest.party.dressCode || defaultCustoms.dressCode,
      giftListUrl: guest.party.giftListUrl || defaultCustoms.giftListUrl,
      timeline: guest.party.timeline || defaultCustoms.timeline,
      hotels: guest.party.hotels || defaultCustoms.hotels,
      gallery: guest.party.gallery?.length > 0 ? guest.party.gallery : defaultCustoms.gallery,
      coverVideo: guest.party.coverVideo || null,
      teaserVideo: guest.party.teaserVideo || null
    };
  };

  const submitRsvp = async (targetStatus) => {
    setIsSubmitting(true);
    try {
      const resolvedCompanionNames = status === 'confirmed' && hasCompanions === 'yes'
        ? companionNames.filter(n => n.trim().length > 1)
        : [];
      
      const payload = {
        status: targetStatus,
        companionNames: resolvedCompanionNames,
        email: targetStatus === 'confirmed' ? email : null,
        phone: phone,
        dietaryRestrictions: targetStatus === 'confirmed' ? dietaryRestrictions : [],
        favoriteSong: targetStatus === 'confirmed' ? favoriteSong : '',
        photoUrl: targetStatus === 'confirmed' ? selfieBase64 : '',
        messageToHost: messageToHost
      };

      await api.guests.publicRsvp(id, payload);
      
      // Simulando salvamento de campos estendidos caso a API pública apenas salve os acompanhantes
      // Se a rota publicRsvp do backend suportar todos os parâmetros (como configuramos no Bloco 1), ela salvará tudo direto.
      // E atualizamos a tela pública.
      setStep(targetStatus === 'confirmed' ? 'confirmed' : 'declined');
      if (targetStatus === 'confirmed') {
        toast.success('Presença confirmada! Nos vemos na comemoração! 🎉', { position: 'top-center' });
      } else {
        toast.info('Poxa, sentiremos sua falta. Obrigado por nos avisar!', { position: 'top-center' });
      }
    } catch (err) {
      toast.error('Erro ao enviar confirmação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelfieChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfieBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleDietary = (restriction) => {
    if (dietaryRestrictions.includes(restriction)) {
      setDietaryRestrictions(dietaryRestrictions.filter(r => r !== restriction));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, restriction]);
    }
  };

  const getGoogleCalendarLink = () => {
    if (!guest?.party) return '';
    const title = encodeURIComponent(`🎉 ${guest.party.name}`);
    const location = encodeURIComponent(guest.party.location || '');
    const partyDate = new Date(guest.party.date);
    const startDate = partyDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = new Date(partyDate.getTime() + 4 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&location=${location}`;
  };

  const getOutlookCalendarLink = () => {
    if (!guest?.party) return '';
    const title = encodeURIComponent(`🎉 ${guest.party.name}`);
    const location = encodeURIComponent(guest.party.location || '');
    const partyDate = new Date(guest.party.date);
    const startDate = partyDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = new Date(partyDate.getTime() + 4 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&startdt=${startDate}&enddt=${endDate}&location=${location}`;
  };

  const getAppleCalendarLink = () => {
    if (!guest?.party) return '';
    const title = `🎉 ${guest.party.name}`;
    const location = guest.party.location || '';
    const partyDate = new Date(guest.party.date);
    const startDate = partyDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = new Date(partyDate.getTime() + 4 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `URL:${window.location.href}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${title}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');
    
    return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
  };

  const getGoogleMapsLink = () => {
    if (!guest?.party?.location) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(guest.party.location)}`;
  };

  const pDate = guest?.party?.date ? new Date(guest.party.date) : null;
  const theme = getThemeConfig();
  const customs = getPartyCustomizations();

  // ─── Loading Screen ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0C0D12] flex flex-col items-center justify-center relative overflow-hidden font-luxury-sans">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');
          .font-luxury-serif { font-family: 'Cormorant Garamond', serif; }
          .font-luxury-sans { font-family: 'Montserrat', sans-serif; }
          .font-script { font-family: 'Alex Brush', cursive; }
        `}</style>
        <div className="text-center space-y-6 relative z-10">
          <div className="relative inline-block">
            <div className="w-14 h-14 rounded-full border-2 border-[#C5A880]/20 border-t-[#C5A880] animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#C5A880] h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-light tracking-[0.35em] text-[#C5A880] uppercase">CELEBRATE</h2>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-2">Carregando convite de luxo...</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error Screen ──────────────────────────────────────────────────────────
  if (error || !guest) {
    return (
      <div className="min-h-screen bg-[#0C0D12] flex items-center justify-center p-6 relative overflow-hidden font-luxury-sans">
        <div className="max-w-md w-full bg-[#161720]/80 backdrop-blur-xl p-10 rounded-[32px] border border-red-500/20 shadow-[0_30px_70px_rgba(0,0,0,0.8)] text-center">
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <XCircle size={24} />
          </div>
          <h1 className="text-xl font-light text-white tracking-[0.15em] mb-3 uppercase">Convite Indisponível</h1>
          <p className="text-xs text-white/40 leading-relaxed max-w-xs mx-auto">
            Este link é inválido ou expirou. Solicite um novo convite ao anfitrião.
          </p>
        </div>
      </div>
    );
  }

  const monogramText = guest.party?.name
    ? guest.party.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()
    : 'C';

  // ─── Render View (Screen 1: Landing Page) ──────────────────────────────────
  if (step === 'view') {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} font-luxury-sans transition-colors duration-500 relative overflow-x-hidden`}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');
          .font-luxury-serif { font-family: 'Cormorant Garamond', serif; }
          .font-luxury-sans { font-family: 'Montserrat', sans-serif; }
          .font-script { font-family: 'Alex Brush', cursive; }
          .glass-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(16px); }
          .light-glass-card { background: rgba(255, 255, 255, 0.65); border: 1px solid rgba(0,0,0,0.05); backdrop-filter: blur(20px); }
        `}</style>

        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#C5A880]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-0 w-[500px] h-[500px] rounded-full bg-[#FF7E67]/3 blur-[120px] pointer-events-none" />

        {/* HERO SECTION - Fullscreen */}
        <section className="relative h-screen flex flex-col justify-between items-center text-center p-6 bg-black">
          {/* Cover Asset */}
          <div className="absolute inset-0 z-0">
            <img 
              src={customs.coverPhoto} 
              alt="Capa do Evento" 
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0C0D12]" />
          </div>

          {/* Top Logo / Monogram */}
          <div className="relative z-10 mt-8">
            <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md bg-white/5">
              <span className={`text-xl font-light tracking-widest text-[#F5F2EB] ${theme.initials}`}>
                {monogramText}
              </span>
            </div>
          </div>

          {/* Center Titles */}
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-[0.3em] block">VOCÊ FOI CONVIDADO(A)</span>
            <h1 className="text-4xl sm:text-6xl font-light text-white font-luxury-serif tracking-wide leading-tight">
              {guest.party?.name}
            </h1>
            <p className="text-xs sm:text-sm font-light text-white/70 italic max-w-sm mx-auto leading-relaxed">
              "Estamos muito felizes em compartilhar este momento especial com você."
            </p>
            
            <div className="pt-4">
              <CountdownTimer partyDate={pDate} />
            </div>
          </div>

          {/* Bottom Action / CTA */}
          <div className="relative z-10 mb-10 w-full max-w-xs space-y-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep('form')}
              className={`w-full py-4.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl cursor-pointer ${theme.btn}`}
            >
              Confirmar Presença
            </motion.button>
            <div className="animate-bounce flex justify-center text-white/40">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7 7 7 7-7"/></svg>
            </div>
          </div>
        </section>

        {/* DETAILS SECTION */}
        <section className="py-20 px-6 max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-widest font-luxury-serif">Detalhes do Evento</h2>
            <div className="w-12 h-[1px] bg-[#C5A880]/40 mx-auto mt-2" />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Data */}
            {pDate && (
              <div className={`p-6 rounded-[24px] flex flex-col items-center text-center space-y-4 ${guest.party.theme === 'wedding' ? 'light-glass-card' : 'glass-card'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBox}`}>
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">Data</h4>
                  <p className="text-sm font-semibold capitalize mt-1 text-white/90">
                    {pDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}

            {/* Horário */}
            {pDate && (
              <div className={`p-6 rounded-[24px] flex flex-col items-center text-center space-y-4 ${guest.party.theme === 'wedding' ? 'light-glass-card' : 'glass-card'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBox}`}>
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">Horário</h4>
                  <p className="text-sm font-semibold mt-1 text-white/90">
                    {pDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h
                  </p>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">Pontualmente</p>
                </div>
              </div>
            )}

            {/* Local */}
            {guest.party?.location && (
              <div className={`p-6 rounded-[24px] flex flex-col items-center text-center space-y-4 ${guest.party.theme === 'wedding' ? 'light-glass-card' : 'glass-card'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBox}`}>
                  <MapPin size={20} />
                </div>
                <div className="min-w-0 w-full">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">Local</h4>
                  <p className="text-sm font-semibold mt-1 text-white/90 truncate">
                    {guest.party.location}
                  </p>
                  <a
                    href={getGoogleMapsLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#C5A880] uppercase tracking-wider mt-3 hover:underline"
                  >
                    Ver no Mapa <Navigation size={10} />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* DRESS CODE & GIFT LIST ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* Dress Code Card */}
            <div className={`p-8 rounded-[28px] space-y-4 relative overflow-hidden ${guest.party.theme === 'wedding' ? 'light-glass-card' : 'glass-card'}`}>
              <div className="absolute inset-4 rounded-[20px] border border-white/5 pointer-events-none" />
              <div className="flex items-center gap-3">
                <Bookmark size={16} className="text-[#C5A880]" />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A880]">Traje Sugerido</h3>
              </div>
              <p className="text-xs font-semibold text-white/80 leading-relaxed whitespace-pre-line">
                {customs.dressCode}
              </p>
            </div>

            {/* Gift List Card */}
            <div className={`p-8 rounded-[28px] space-y-5 relative overflow-hidden ${guest.party.theme === 'wedding' ? 'light-glass-card' : 'glass-card'}`}>
              <div className="absolute inset-4 rounded-[20px] border border-white/5 pointer-events-none" />
              <div className="flex items-center gap-3">
                <Heart size={16} className="text-[#C5A880]" />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A880]">Lista de Presentes</h3>
              </div>
              <p className="text-xs font-light text-white/60 leading-relaxed">
                Sua presença é o nosso maior presente! Mas se desejar nos presentear, confira nossa lista online no botão abaixo.
              </p>
              <button
                onClick={() => {
                  if (customs.giftListUrl && customs.giftListUrl !== '#') {
                    window.open(customs.giftListUrl, '_blank');
                  } else {
                    toast.info('Lista de presentes disponível em breve ou sob consulta com os anfitriões.');
                  }
                }}
                className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880] hover:text-black transition-colors cursor-pointer`}
              >
                Ver Lista de Presentes
              </button>
            </div>
          </div>

          {/* GALLERY GRID */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-center text-[#C5A880]">Galeria do Evento</h3>
            <div className="grid grid-cols-3 gap-3">
              {customs.gallery.slice(0, 3).map((url, index) => (
                <div key={index} className="aspect-square rounded-2xl overflow-hidden border border-white/5">
                  <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM BUTTON */}
          <div className="flex justify-center pt-8">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep('form')}
              className={`px-10 py-4.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl cursor-pointer ${theme.btn}`}
            >
              Confirmar Minha Presença
            </motion.button>
          </div>
        </section>

        <p className="text-center text-[9px] text-white/20 uppercase tracking-[0.2em] font-semibold pb-10">CELEBRATE EXPERIENCE ✨</p>
      </div>
    );
  }

  // ─── Render Form (Screen 2: Multi-step Form) ──────────────────────────────
  if (step === 'form') {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} font-luxury-sans transition-colors duration-500 flex items-center justify-center p-4 relative overflow-hidden text-white`}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');
          .font-luxury-serif { font-family: 'Cormorant Garamond', serif; }
          .font-luxury-sans { font-family: 'Montserrat', sans-serif; }
        `}</style>

        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#C5A880]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#FF7E67]/5 blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-lg rounded-[32px] border overflow-hidden p-8 relative shadow-2xl ${
            guest.party?.theme === 'wedding' ? 'bg-white text-gray-800 border-[#E5B5B0]/30' : 'bg-gradient-to-b from-[#1C1D26] to-[#12131A] border-[#C5A880]/20'
          }`}
        >
          {/* Inner borders */}
          <div className={`absolute inset-4 rounded-[24px] border pointer-events-none ${guest.party?.theme === 'wedding' ? 'border-[#E5B5B0]/10' : 'border-[#C5A880]/15'}`} />

          <div className="relative z-10 space-y-6">
            {/* Header Form */}
            <div className="text-center">
              <h2 className="text-xl font-light tracking-[0.2em] uppercase font-luxury-serif">Confirmar Presença</h2>
              <div className="flex justify-center items-center gap-1.5 mt-2">
                <div className={`w-2 h-2 rounded-full ${formStep === 1 ? 'bg-[#C5A880]' : 'bg-white/20'}`} />
                <div className={`w-2 h-2 rounded-full ${formStep === 2 ? 'bg-[#C5A880]' : 'bg-white/20'}`} />
              </div>
            </div>

            {/* FORM STEP 1 */}
            {formStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                {/* Pergunta Sim/Não */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] block text-center">Você irá comparecer?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus('confirmed')}
                      className={`py-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        status === 'confirmed' 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                          : 'border-white/10 text-white/50 hover:bg-white/5'
                      }`}
                    >
                      <CheckCircle2 size={16} /> Sim, estarei presente
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('declined')}
                      className={`py-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        status === 'declined' 
                          ? 'bg-red-500/10 border-red-500 text-red-500' 
                          : 'border-white/10 text-white/50 hover:bg-white/5'
                      }`}
                    >
                      <XCircle size={16} /> Não comparecerei
                    </button>
                  </div>
                </div>

                {/* Se confirmado, colhe dados */}
                {status === 'confirmed' ? (
                  <div className="space-y-4">
                    {/* Nome */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block">Nome Completo</label>
                      <input 
                        type="text" 
                        value={guest.name}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-semibold text-white/60 cursor-not-allowed h-11"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block">E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                        <input 
                          type="email" 
                          placeholder="Digite seu email..."
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-white placeholder-white/20 focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 transition-all h-11"
                        />
                      </div>
                    </div>

                    {/* Telefone */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 block">Telefone / WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                        <input 
                          type="tel" 
                          placeholder="(99) 99999-9999"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-white placeholder-white/20 focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 transition-all h-11"
                        />
                      </div>
                    </div>

                    {/* Acompanhantes selector */}
                    {guest.companions > 0 && (
                      <div className="space-y-3 border-t border-white/5 pt-4">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] block">Você levará acompanhante?</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs font-semibold text-white/70 cursor-pointer">
                            <input 
                              type="radio" 
                              name="hasCompanions" 
                              value="no" 
                              checked={hasCompanions === 'no'}
                              onChange={() => setHasCompanions('no')}
                              className="accent-[#C5A880]"
                            />
                            Não, irei sozinho(a)
                          </label>
                          <label className="flex items-center gap-2 text-xs font-semibold text-white/70 cursor-pointer">
                            <input 
                              type="radio" 
                              name="hasCompanions" 
                              value="yes"
                              checked={hasCompanions === 'yes'}
                              onChange={() => setHasCompanions('yes')}
                              className="accent-[#C5A880]"
                            />
                            Sim, levarei acompanhante(s)
                          </label>
                        </div>

                        {/* Nomes dos acompanhantes */}
                        {hasCompanions === 'yes' && (
                          <div className="space-y-3 pt-2">
                            {companionNames.map((name, idx) => (
                              <div key={idx} className="space-y-1">
                                <span className="text-[8px] font-bold uppercase tracking-wider text-white/30">Nome Completo do Acompanhante #{idx + 1}</span>
                                <input 
                                  type="text" 
                                  placeholder="Escreva o nome..."
                                  value={name}
                                  onChange={(e) => {
                                    const updated = [...companionNames];
                                    updated[idx] = e.target.value;
                                    setCompanionNames(updated);
                                  }}
                                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-[#C5A880] transition-all h-10"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <p className="text-xs text-white/50 text-center leading-relaxed max-w-xs mx-auto">
                      Sentiremos sua falta! Deixe um recado para os anfitriões se desejar e confirme abaixo.
                    </p>
                    <textarea 
                      placeholder="Deixe uma mensagem..."
                      value={messageToHost}
                      onChange={(e) => setMessageToHost(e.target.value)}
                      className="w-full h-24 bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-xs font-semibold text-white placeholder-white/20 focus:outline-none focus:border-[#C5A880] resize-none"
                    />
                  </div>
                )}

                {/* Footer buttons Step 1 */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                  <button
                    onClick={() => setStep('view')}
                    className="px-4 py-3.5 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-wider text-white/60 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                  {status === 'confirmed' ? (
                    <button
                      onClick={() => setFormStep(2)}
                      className={`px-4 py-3.5 rounded-xl bg-gradient-to-r from-[#AA771C] via-[#C5A880] to-[#F5E0C3] text-black text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer flex items-center justify-center gap-1.5`}
                    >
                      Continuar
                    </button>
                  ) : (
                    <button
                      onClick={() => submitRsvp('declined')}
                      disabled={isSubmitting}
                      className="px-4 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Confirmar Recusa'}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* FORM STEP 2 */}
            {formStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                {/* Restrições Alimentares */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] flex items-center gap-1.5">
                    <Utensils size={14} /> Restrições Alimentares
                  </label>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Marque se possuir alguma restrição alimentar:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Vegetariano(a)', 'Vegano(a)', 'Lactose', 'Glúten (Celíaco)', 'Frutos do mar', 'Sem restrições'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleDietary(item)}
                        className={`px-3 py-2 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer ${
                          dietaryRestrictions.includes(item)
                            ? 'bg-[#C5A880]/10 border-[#C5A880] text-[#C5A880]'
                            : 'border-white/10 text-white/50 hover:bg-white/5'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Música favorita */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] flex items-center gap-1.5">
                    <Music size={14} /> Música Favorita
                  </label>
                  <input 
                    type="text" 
                    placeholder="Nome da música / Cantor..."
                    value={favoriteSong}
                    onChange={(e) => setFavoriteSong(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-[#C5A880] transition-all h-11"
                  />
                </div>

                {/* Selfie do Convidado */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] flex items-center gap-1.5">
                    <Camera size={14} /> Sua Foto / Selfie (Opcional)
                  </label>
                  <div className="flex items-center gap-4">
                    {selfieBase64 ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#C5A880]">
                        <img src={selfieBase64} alt="Selfie" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setSelfieBase64('')}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center text-white/80 hover:text-white text-[9px] font-bold"
                        >
                          Limpar
                        </button>
                      </div>
                    ) : (
                      <label className="w-16 h-16 rounded-full border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-white/40 transition-colors">
                        <Camera size={18} className="text-white/40" />
                        <input type="file" accept="image/*" onChange={handleSelfieChange} className="hidden" />
                      </label>
                    )}
                    <span className="text-[10px] text-white/40 font-medium">Sua foto será adicionada ao mural virtual da festa!</span>
                  </div>
                </div>

                {/* Mensagem para o anfitrião */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] block">Recado Especial</label>
                  <textarea 
                    placeholder="Escreva um recado carinhoso para os noivos/anfitriões..."
                    value={messageToHost}
                    onChange={(e) => setMessageToHost(e.target.value)}
                    className="w-full h-24 bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-xs font-semibold text-white placeholder-white/20 focus:outline-none focus:border-[#C5A880] resize-none"
                  />
                </div>

                {/* Footer buttons Step 2 */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                  <button
                    onClick={() => setFormStep(1)}
                    className="px-4 py-3.5 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-wider text-white/60 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => submitRsvp('confirmed')}
                    disabled={isSubmitting}
                    className={`px-4 py-3.5 rounded-xl bg-gradient-to-r from-[#AA771C] via-[#C5A880] to-[#F5E0C3] text-black text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer flex items-center justify-center gap-1.5`}
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin text-black" /> : 'Confirmar Presença'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Step: Declined Screen ──────────────────────────────────────────────────
  if (step === 'declined') {
    return (
      <div className="min-h-screen bg-[#0C0D12] flex items-center justify-center p-6 relative overflow-hidden font-luxury-sans text-white">
        <div className="max-w-md w-full bg-gradient-to-b from-[#1C1D26] to-[#12131A] rounded-[32px] border border-[#C5A880]/20 p-10 text-center relative shadow-[0_30px_70px_rgba(0,0,0,0.85)]">
          <div className="absolute inset-4 rounded-[24px] border border-[#C5A880]/10 pointer-events-none" />
          <div className="w-16 h-16 bg-white/[0.02] border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            😢
          </div>
          <h1 className="text-2xl font-light text-[#F5F2EB] font-luxury-serif tracking-wide mb-3">Sentiremos sua falta!</h1>
          <p className="text-xs text-white/40 leading-relaxed mb-8 px-4">
            Obrigado por nos avisar, {guest.name.split(' ')[0]}. Sua recusa foi devidamente registrada e comunicada aos anfitriões.
          </p>
          <button
            onClick={() => setStep('view')}
            className="text-[10px] font-bold text-[#C5A880] hover:text-[#AA771C] uppercase tracking-widest underline underline-offset-4 cursor-pointer border-0 bg-transparent"
          >
            Mudei de ideia — Quero confirmar!
          </button>
          <p className="text-white/20 text-[9px] font-semibold uppercase tracking-[0.2em] mt-10">CELEBRATE EXPERIENCE ✨</p>
        </div>
      </div>
    );
  }

  // ─── Step: Confirmed (Screen 3: Ticket Stub + Exclusive Area) ───────────────
  if (step === 'confirmed') {
    return (
      <div className="min-h-screen bg-[#0C0D12] flex flex-col items-center justify-start py-12 px-4 relative overflow-y-auto font-luxury-sans text-white">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');
          .font-luxury-serif { font-family: 'Cormorant Garamond', serif; }
          .font-luxury-sans { font-family: 'Montserrat', sans-serif; }
          .glass-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(16px); }
        `}</style>

        {/* Confetti particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, x: Math.random() * 400 - 200, opacity: 0 }}
            animate={{ y: '100vh', opacity: [0, 1, 0] }}
            transition={{ duration: 4 + Math.random() * 3, delay: Math.random() * 2, repeat: Infinity, ease: 'linear' }}
            className="fixed top-0 pointer-events-none z-0"
            style={{
              left: `${10 + Math.random() * 80}%`,
              width: `${3 + Math.random() * 6}px`,
              height: `${3 + Math.random() * 6}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '0',
              backgroundColor: ['#C5A880', '#E5D5C5', '#FF7E67', '#AA771C', '#FFFFFF'][Math.floor(Math.random() * 5)],
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center space-y-6 relative z-10"
        >
          {/* Header Ticket */}
          <div className="space-y-1.5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-14 h-14 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-full flex items-center justify-center mx-auto shadow-2xl"
            >
              <CheckCircle2 size={28} className="text-[#C5A880]" />
            </motion.div>
            <h1 className="text-2xl font-light tracking-wide text-[#F5F2EB] font-luxury-serif uppercase">Presença Confirmada!</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none">Nos vemos no grande dia!</p>
          </div>

          {/* Ticket Card Wrapper */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gradient-to-b from-[#1C1D26] to-[#12131A] border border-[#C5A880]/20 rounded-[28px] overflow-hidden shadow-2xl"
          >
            {/* Elegant inner frames */}
            <div className="absolute inset-3 rounded-[20px] border border-[#C5A880]/10 pointer-events-none" />
            
            {/* Card Content */}
            <div className="p-6 pb-4 relative z-10 space-y-4">
              <div className="flex items-center justify-center gap-2">
                <QrCode size={14} className="text-[#C5A880]" />
                <p className="text-[9px] font-bold text-[#C5A880] uppercase tracking-[0.2em]">CONVITE DIGITAL EXCLUSIVO</p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center py-2 gap-2">
                <QRCodeDisplay guestId={id} />
                <span className="text-[9px] font-mono text-white/40 tracking-wider">CÓDIGO: {id}</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{guest.name.toUpperCase()}</h3>
                {guest.companionNames?.length > 0 && (
                  <p className="text-[9px] text-white/50 font-medium">
                    Acompanhante{guest.companionNames.length > 1 ? 's' : ''}: {guest.companionNames.join(', ')}
                  </p>
                )}
                {/* Mesa e Setor se fornecidos */}
                {(guest.tableNumber || guest.sector) && (
                  <div className="flex justify-center gap-3 pt-2">
                    {guest.tableNumber && (
                      <span className="bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-lg px-2.5 py-1 text-[9px] font-bold text-[#C5A880]">
                        MESA {guest.tableNumber}
                      </span>
                    )}
                    {guest.sector && (
                      <span className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-[9px] font-bold text-white/60">
                        SETOR {guest.sector}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Dotted Tear Line */}
            <div className="relative flex items-center justify-between py-2">
              <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-[#0C0D12] border-r border-[#C5A880]/20" />
              <div className="w-full border-t border-dashed border-[#C5A880]/20 mx-4" />
              <div className="absolute right-[-8px] w-4 h-4 rounded-full bg-[#0C0D12] border-l border-[#C5A880]/20" />
            </div>

            {/* Ticket Info Section */}
            <div className="p-5 pt-3 relative z-10 bg-white/[0.01]">
              <p className="text-[9px] text-[#C5A880] uppercase font-bold tracking-widest mb-1">Apresentação na Portaria</p>
              <p className="text-[9px] text-white/40 leading-relaxed px-4 mx-auto">
                Salve ou apresente este QR Code diretamente na portaria do evento para realizar seu check-in de entrada.
              </p>
            </div>
          </motion.div>

          {/* Add to Calendar Options */}
          <div className="space-y-2.5 pt-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-white/50 text-center">Adicionar ao Calendário</h4>
            <div className="grid grid-cols-3 gap-2">
              <a 
                href={getGoogleCalendarLink()}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-[9px] font-bold uppercase tracking-widest flex flex-col items-center gap-1"
              >
                <CalendarCheck size={12} className="text-[#C5A880]" /> Google
              </a>
              <a 
                href={getAppleCalendarLink()}
                className="py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-[9px] font-bold uppercase tracking-widest flex flex-col items-center gap-1"
              >
                <CalendarCheck size={12} className="text-[#FF7E67]" /> Apple
              </a>
              <a 
                href={getOutlookCalendarLink()}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-[9px] font-bold uppercase tracking-widest flex flex-col items-center gap-1"
              >
                <CalendarCheck size={12} className="text-blue-400" /> Outlook
              </a>
            </div>
          </div>

          {/* ─── EXCLUSIVE GUEST AREA ─── */}
          <div className="text-left border-t border-white/10 pt-8 mt-6 space-y-6">
            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">
                Área Exclusiva do Convidado
              </span>
              <p className="text-[9px] text-white/40 uppercase tracking-widest">Tudo o que você precisa para o grande dia!</p>
            </div>

            {/* Cronograma (Timeline) */}
            <div className="glass-card rounded-[24px] p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A880] flex items-center gap-2">
                <Clock size={14} /> Cronograma
              </h3>
              <div className="space-y-4 relative pl-3.5 border-l border-white/10">
                {customs.timeline.map((event, idx) => (
                  <div key={idx} className="relative space-y-0.5">
                    <div className="absolute left-[-18.5px] top-1 w-2.5 h-2.5 rounded-full bg-[#C5A880] border-2 border-[#0C0D12]" />
                    <span className="text-[10px] font-bold text-[#C5A880]">{event.time}</span>
                    <h5 className="text-xs font-semibold text-white/95">{event.title}</h5>
                    <p className="text-[10px] text-white/40 font-medium">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendações de Hotéis */}
            <div className="glass-card rounded-[24px] p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A880] flex items-center gap-2">
                <MapPin size={14} /> Hotéis Recomendados
              </h3>
              <div className="space-y-3">
                {customs.hotels.map((hotel, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <h5 className="font-bold text-white/95">{hotel.name}</h5>
                      <span className="text-[9px] text-white/40 font-medium">Distância: {hotel.distance} — Tel: {hotel.phone}</span>
                    </div>
                    {hotel.link && hotel.link !== '#' && (
                      <a 
                        href={hotel.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[9px] font-bold uppercase text-[#C5A880] hover:underline shrink-0"
                      >
                        Reservar
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Como Chegar */}
            {guest.party?.location && (
              <div className="glass-card rounded-[24px] p-6 space-y-3 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A880] flex items-center gap-2">
                    <Navigation size={14} /> Local do Evento
                  </h3>
                  <p className="text-[10px] text-white/40 mt-1 max-w-[220px] truncate">{guest.party.location}</p>
                </div>
                <a 
                  href={getGoogleMapsLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#C5A880] hover:bg-[#B89870] text-black rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors shrink-0"
                >
                  Abrir no GPS
                </a>
              </div>
            )}
          </div>

          <p className="text-white/20 text-[9px] font-semibold uppercase tracking-[0.2em] pt-8">CELEBRATE EXPERIENCE ✨</p>
        </motion.div>
      </div>
    );
  }
}

// Themes mapping config styling classes
const themeStyles = {
  'gold': {
    bg: 'bg-gradient-to-br from-[#12110F] via-[#24211A] to-[#12110F]',
    text: 'text-[#EBE0C5]',
    card: 'bg-[#1C1A16]/90 border-[#D4AF37]/30 shadow-2xl',
    accent: 'text-[#D4AF37]',
    btn: 'bg-gradient-to-r from-[#AA771C] via-[#D4AF37] to-[#F3E5AB] text-black hover:opacity-90',
    iconBox: 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]',
    initials: 'font-luxury-serif text-[#D4AF37]'
  },
  'wedding': {
    bg: 'bg-gradient-to-br from-[#FAEDEC] via-[#FFF6F5] to-[#FAEDEC]',
    text: 'text-[#5A4B41]',
    card: 'bg-white/90 border-[#E5B5B0]/30 shadow-2xl',
    accent: 'text-[#D37F75]',
    btn: 'bg-gradient-to-r from-[#D37F75] to-[#E5B5B0] text-white hover:opacity-90',
    iconBox: 'bg-[#D37F75]/10 border border-[#D37F75]/25 text-[#D37F75]',
    initials: 'font-script text-[#D37F75]'
  },
  'floral': {
    bg: 'bg-gradient-to-br from-[#111612] via-[#1A261D] to-[#111612]',
    text: 'text-[#E2ECE3]',
    card: 'bg-[#18221B]/90 border-[#8FBC8F]/30 shadow-2xl',
    accent: 'text-[#8FBC8F]',
    btn: 'bg-gradient-to-r from-[#556B2F] to-[#8FBC8F] text-[#111612] hover:opacity-90',
    iconBox: 'bg-[#8FBC8F]/10 border border-[#8FBC8F]/25 text-[#8FBC8F]',
    initials: 'font-script text-[#8FBC8F]'
  },
  'kids': {
    bg: 'bg-gradient-to-br from-[#EDF7FA] via-[#F5FCFF] to-[#EDF7FA]',
    text: 'text-[#4A5568]',
    card: 'bg-white/95 border-[#9AD2E7]/40 shadow-xl rounded-[40px]',
    accent: 'text-[#FFB6C1]',
    btn: 'bg-gradient-to-r from-[#FFB6C1] to-[#9AD2E7] text-white rounded-full hover:opacity-90',
    iconBox: 'bg-[#9AD2E7]/10 border border-[#9AD2E7]/35 text-[#54B1D6]',
    initials: 'font-bold text-[#54B1D6]'
  },
  'corp': {
    bg: 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]',
    text: 'text-[#E2E8F0]',
    card: 'bg-[#1E293B]/90 border-[#38BDF8]/20 shadow-2xl',
    accent: 'text-[#38BDF8]',
    btn: 'bg-gradient-to-r from-[#0284C7] to-[#38BDF8] text-white hover:opacity-90',
    iconBox: 'bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8]',
    initials: 'font-mono text-[#38BDF8]'
  },
  'luxury-black': {
    bg: 'bg-gradient-to-br from-[#0B0C10] via-[#1F2026] to-[#0B0C10]',
    text: 'text-[#E5D5C5]',
    card: 'bg-[#1C1D24]/90 border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]',
    accent: 'text-[#C5A880]',
    btn: 'bg-gradient-to-r from-[#AA771C] via-[#C5A880] to-[#E5D5C5] text-black hover:opacity-90',
    iconBox: 'bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880]',
    initials: 'font-luxury-serif text-[#C5A880]'
  }
};
