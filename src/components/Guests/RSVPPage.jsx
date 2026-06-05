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
  Gift,
  Clock,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';

export default function RSVPPage() {
  const { id } = useParams(); // id do convidado na URL
  const [guest, setGuest] = useState(null);
  const [response, setResponse] = useState(null); // 'confirmed' ou 'declined'
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchGuestData();
    }
  }, [id]);

  const fetchGuestData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.guests.publicGet(id);
      setGuest(data);
      setResponse(data.status);
    } catch (err) {
      console.error('Erro ao carregar convite público:', err);
      setError('Convite inválido ou não encontrado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (status) => {
    setIsSubmitting(true);
    try {
      await api.guests.publicRsvp(id, status);
      setResponse(status);
      if (status === 'confirmed') {
        toast.success('Presença confirmada! Nos vemos lá! 🎉', { position: 'top-center' });
      } else {
        toast.info('Poxa, sentimos sua falta. Agradecemos por avisar! 🌟', { position: 'top-center' });
      }
    } catch (err) {
      console.error('Erro ao enviar RSVP:', err);
      toast.error('Falha ao registrar sua resposta. Tente novamente.', { position: 'top-center' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
        {/* Decorative elements while loading */}
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-secondary/10 blur-[80px] pointer-events-none" />
        
        <div className="text-center relative z-10 space-y-4">
          <div className="relative inline-block">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto" />
            <Sparkles className="absolute -top-1 -right-1 text-secondary h-4 w-4 animate-bounce" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground tracking-wide">Carregando seu convite digital premium...</p>
        </div>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-destructive/10 blur-[80px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card/80 backdrop-blur-md p-8 rounded-3xl shadow-xl text-center border border-border/50 relative z-10"
        >
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-5 border border-destructive/20">
            <XCircle size={30} className="animate-pulse" />
          </div>
          <h1 className="text-xl font-bold mb-2">Ops! Convite Inválido</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Este link de convite não foi encontrado, expirou ou foi cancelado pela organização da festa. Por favor, solicite um novo convite ao anfitrião.
          </p>
        </motion.div>
      </div>
    );
  }

  const partyDate = guest.party?.date ? new Date(guest.party.date) : null;

  // Gerar link do Google Calendar
  const getGoogleCalendarLink = () => {
    if (!guest.party) return '';
    const title = encodeURIComponent(`🎉 Festa: ${guest.party.name}`);
    const details = encodeURIComponent(`Você foi convidado(a) como convidado(a) especial! Link de RSVP confirmado.`);
    const location = encodeURIComponent(guest.party.location || '');
    
    let dateStr = '';
    if (partyDate) {
      const startDate = partyDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
      const endDateObj = new Date(partyDate.getTime() + 3 * 60 * 60 * 1000); // duração estimada 3h
      const endDate = endDateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
      dateStr = `${startDate}/${endDate}`;
    }
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}&details=${details}&location=${location}`;
  };

  // Gerar link do Google Maps
  const getGoogleMapsLink = () => {
    if (!guest.party?.location) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(guest.party.location)}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6 bg-background relative overflow-hidden transition-colors duration-300">
      
      {/* Decorative Aurora Glows & Sparkles Background */}
      <div className="absolute top-[-25%] left-[-20%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-primary/10 dark:bg-primary/5 blur-[80px] sm:blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-secondary/10 dark:bg-secondary/5 blur-[80px] sm:blur-[120px] pointer-events-none z-0" />
      
      {/* Floating Confetti SVGs for Celebration theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 opacity-20 dark:opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Sparkles and balloons vectors */}
          <circle cx="10%" cy="20%" r="8" fill="#6366F1" className="animate-pulse" />
          <circle cx="85%" cy="15%" r="12" fill="#EC4899" className="animate-pulse" />
          <path d="M150 200 l10 -15 l-5 -10 Z" fill="#EAB308" />
          <path d="M800 600 l15 -20 l-10 -10 Z" fill="#10B981" />
          <path d="M90% 80% l10 -10 l5 15 Z" fill="#6366F1" />
          <circle cx="20%" cy="75%" r="15" fill="#EAB308" className="animate-pulse" />
        </svg>
      </div>

      <div className="w-full max-w-lg space-y-6 relative z-10">
        
        {/* Detalhes da Festa - Visual de Convite Premium */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card/85 backdrop-blur-md rounded-3xl shadow-xl border border-border/50 overflow-hidden relative"
        >
          {/* Card Header Top Ribbon Accent */}
          <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
          
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
                <Heart size={10} className="fill-primary" /> Você foi Convidado(a)!
              </span>
              
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight pt-1 leading-tight">
                🎉 {guest.party?.name || 'Comemoração Especial'}
              </h1>
              
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Anfitrião: {guest.party?.hostName || 'Organizador'}
              </p>
            </div>
            
            <div className="space-y-4 border-t border-border/40 pt-6">
              {partyDate && (
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors border border-border/20">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Data do Evento</p>
                    <span className="text-sm font-extrabold text-foreground capitalize">
                      {partyDate.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                </div>
              )}

              {partyDate && (
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors border border-border/20">
                  <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Horário de Início</p>
                    <span className="text-sm font-extrabold text-foreground">
                      {partyDate.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}h
                    </span>
                  </div>
                </div>
              )}
              
              {guest.party?.location && (
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors border border-border/20">
                  <div className="w-10 h-10 bg-accent/10 text-accent-foreground rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Local da Festa</p>
                    <p className="text-sm font-extrabold text-foreground truncate pr-2">
                      {guest.party.location}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Convite individual e Ações Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-card/85 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-border/50 text-center relative overflow-hidden"
        >
          <div className="absolute top-[-50px] right-[-50px] w-28 h-28 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
          
          <h2 className="text-lg sm:text-xl font-black text-foreground mb-1">Olá, {guest.name}!</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            Por favor, confirme sua presença e de seus acompanhantes:
          </p>

          {/* Badge de acompanhantes */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border/30 mb-6 text-xs font-bold text-foreground/80">
            <Users size={14} className="text-primary" />
            <span>Seu convite inclui: <strong className="text-primary font-black">Você + {guest.companions} acompanhante(s)</strong></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Botão "Confirmar Presença" */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleResponse('confirmed')}
              disabled={isSubmitting}
              className={`
                flex items-center justify-center space-x-2.5 px-6 py-4 rounded-2xl font-extrabold text-sm sm:text-base transition-all duration-300 shadow-md cursor-pointer border
                ${response === 'confirmed'
                  ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700'}
                disabled:opacity-50
              `}
            >
              {isSubmitting && response === 'confirmed' ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <CheckCircle2 size={20} className={response === 'confirmed' ? 'animate-bounce' : ''} />
              )}
              <span>Vou sim! 🎉</span>
            </motion.button>

            {/* Botão "Recusar Presença" */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleResponse('declined')}
              disabled={isSubmitting}
              className={`
                flex items-center justify-center space-x-2.5 px-6 py-4 rounded-2xl font-extrabold text-sm sm:text-base transition-all duration-300 shadow-md cursor-pointer border
                ${response === 'declined'
                  ? 'bg-destructive border-destructive text-white shadow-destructive/20'
                  : 'bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20 hover:text-destructive-foreground'}
                disabled:opacity-50
              `}
            >
              {isSubmitting && response === 'declined' ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <XCircle size={20} />
              )}
              <span>Não poderei ir 😢</span>
            </motion.button>
          </div>
          
          <AnimatePresence>
            {response === 'confirmed' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center justify-center gap-2"
              >
                <Sparkles size={16} className="animate-spin-slow text-amber-500" />
                <span>Sua presença foi confirmada! Obrigado! 🎉</span>
              </motion.div>
            )}
            
            {response === 'declined' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="mt-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold flex items-center justify-center gap-2"
              >
                <Gift size={16} className="text-secondary" />
                <span>Poxa, sentimos muito. Agradecemos por avisar!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Links de Ações Rápidas (Mapa e Agenda) */}
        {response === 'confirmed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            {/* Como Chegar */}
            {guest.party?.location && (
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href={getGoogleMapsLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3.5 bg-card/90 hover:bg-card text-foreground border border-border/60 rounded-2xl shadow-sm text-xs font-bold text-center transition-all cursor-pointer"
              >
                <Navigation size={15} className="text-primary animate-pulse" />
                <span>Como Chegar (Maps)</span>
              </motion.a>
            )}

            {/* Adicionar à Agenda */}
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={getGoogleCalendarLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3.5 bg-card/90 hover:bg-card text-foreground border border-border/60 rounded-2xl shadow-sm text-xs font-bold text-center transition-all cursor-pointer"
            >
              <CalendarCheck size={15} className="text-secondary" />
              <span>Adicionar à Agenda</span>
            </motion.a>
          </motion.div>
        )}
        
      </div>
    </div>
  );
}
