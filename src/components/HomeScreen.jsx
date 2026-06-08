import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useParty } from '../contexts/PartyContext';
import { api } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Search,
  Bell,
  Sparkles,
  ChevronRight,
  CalendarDays,
  MapPin,
  MessageCircle,
  Link as LinkIcon,
  Plus
} from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';
import NotificationCenter from './NotificationCenter';

export default function HomeScreen({ onCreateParty, onViewParty, onQuickAction }) {
  const { user } = useAuth();
  const { parties, currentParty, setCurrentParty, loadParties } = useParty();
  const [searchQuery, setSearchQuery] = useState('');

  const [guests, setGuests] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadParties();
  }, [loadParties]);

  useEffect(() => {
    if (currentParty?.id) {
      api.guests.getAll(currentParty.id).then(setGuests).catch(console.error);
      api.expenses.getAll(currentParty.id).then(setExpenses).catch(console.error);
      api.tasks.getAll(currentParty.id).then(setTasks).catch(console.error);
    } else {
      setGuests([]);
      setExpenses([]);
      setTasks([]);
    }
  }, [currentParty?.id]);

  const copyRSVPLink = () => {
    if (!currentParty) return;
    const url = `${window.location.origin}/rsvp/${currentParty.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link do RSVP copiado!');
  };

  const getCountdown = () => {
    if (!currentParty || !currentParty.date) return { days: 0, hours: 0, mins: 0 };
    const diff = new Date(currentParty.date) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, mins };
  };

  const countdown = getCountdown();

  const totalGuests = guests.reduce((acc, g) => acc + 1 + (g.companions || 0), 0);
  const confirmedCount = guests.filter(g => g.status === 'confirmed').reduce((acc, g) => acc + 1 + (g.companions || 0), 0);
  const pendingCount = guests.filter(g => g.status === 'pending').reduce((acc, g) => acc + 1 + (g.companions || 0), 0);
  const declinedCount = guests.filter(g => g.status === 'declined').reduce((acc, g) => acc + 1 + (g.companions || 0), 0);

  const totalBudget = currentParty?.budget || 0;
  const totalSpent = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);

  const tasksCompleted = tasks.filter(t => t.done).length;
  const tasksTotal = tasks.length;

  const budgetProgress = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
  const tasksProgress = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;
  const guestsProgress = totalGuests > 0 ? Math.round((confirmedCount / totalGuests) * 100) : 0;

  const getActivities = () => {
    if (!currentParty) return [];
    const all = [];
    guests.forEach(g => {
      if (g.status === 'confirmed') all.push({ id: `g_${g.id}`, type: 'guest', text: `Novo RSVP de ${g.name}`, date: new Date(g.updatedAt || g.createdAt) });
    });
    tasks.forEach(t => {
      if (t.done) all.push({ id: `t_${t.id}`, type: 'task', text: `Tarefa concluída: ${t.name}`, date: new Date(t.updatedAt || t.createdAt) });
      else all.push({ id: `t_c_${t.id}`, type: 'task', text: `Nova tarefa: ${t.name}`, date: new Date(t.createdAt) });
    });
    expenses.forEach(e => {
      all.push({ id: `e_${e.id}`, type: 'expense', text: `Nova despesa: ${e.name}`, date: new Date(e.createdAt) });
    });
    return all.sort((a, b) => b.date - a.date).slice(0, 3);
  };

  const activities = getActivities();
  const nextEvents = parties.filter(p => p.id !== currentParty?.id).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Circular Progress Component — dark mode aware
  const ProgressCircle = ({ percentage, label, sublabel, color }) => (
    <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-[20px] bg-card border border-border shadow-sm">
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-1.5">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-muted/60"
            strokeWidth="3"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
            fill="none"
            strokeLinecap="round"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="absolute text-[11px] font-black text-foreground">{percentage}%</span>
      </div>
      <span className="text-[10px] font-extrabold text-foreground text-center leading-tight">{label}</span>
      <span className="text-[9px] font-bold text-muted-foreground text-center">{sublabel}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans relative overflow-hidden group">

      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px] opacity-60"
        />
        <motion.div
          animate={{ x: [0, -40, 20, 0], y: [0, 40, -10, 0], scale: [1, 1.2, 0.8, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-secondary/8 dark:bg-secondary/5 blur-[120px] opacity-50"
        />
      </div>

      <div className="relative z-10 p-4 md:p-8">

        {/* ── MOBILE HEADER ── */}
        <div className="lg:hidden mb-5">
          {/* Logo Celebrate! — branding principal no mobile */}
          <div className="flex items-center justify-between mb-4 pt-2">
            <div className="flex-1 flex justify-center">
              <AnimatedLogo />
            </div>
            <NotificationCenter onNavigate={onQuickAction} />
          </div>

          {/* Seletor de festa no mobile */}
          <div className="relative">
            <Select value={currentParty?.id || ''} onValueChange={(value) => {
              const party = parties.find(p => p.id === value);
              if (party) setCurrentParty(party);
            }}>
              <SelectTrigger className="w-full bg-card/70 border border-border/60 text-foreground text-xs font-black rounded-xl px-4 py-2.5 h-[44px] shadow-sm backdrop-blur-sm">
                <SelectValue placeholder="Nenhuma festa encontrada" />
              </SelectTrigger>
              <SelectContent>
                {parties.length === 0 && <SelectItem value="none" disabled>Nenhuma festa encontrada</SelectItem>}
                {parties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── DESKTOP HEADER ── */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground flex flex-wrap items-center gap-3">
              <span>Bem-vindo(a), <span className="uppercase">{user?.name?.split(' ')[0] || 'Host'}</span>!</span>
              <button
                onClick={() => onQuickAction && onQuickAction('subscription')}
                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-card border border-border hover:border-primary/50 hover:bg-primary/5 px-3 py-1.5 rounded-full shadow-sm cursor-pointer transition-all duration-300"
              >
                <Sparkles size={11} className="text-primary" />
                <span>Plano {user?.plan || 'FREE'}</span>
              </button>
            </h1>
            <p className="text-sm font-bold text-muted-foreground mt-1 tracking-wide">Vamos celebrar!</p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search size={16} strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 rounded-full border-border bg-card text-sm font-bold h-11 shadow-sm focus-visible:ring-primary/20"
              />
            </div>
            <NotificationCenter onNavigate={onQuickAction} />
            <Button
              onClick={onCreateParty}
              className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-black text-xs px-5 h-11 shadow-md border-0 transition-transform hover:scale-105 whitespace-nowrap flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nova Festa</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </div>
        </div>

        {/* ── CONTEÚDO PRINCIPAL ── */}
        {currentParty ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

            {/* Coluna central: card da festa + countdown */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Card da festa ativa */}
              <div
                onClick={() => onViewParty(currentParty.id)}
                className="relative rounded-[28px] sm:rounded-[32px] overflow-hidden p-6 sm:p-8 shadow-md isolate group cursor-pointer transition-all duration-500 hover:shadow-lg hover:-translate-y-1 border border-border/60 bg-card"
                style={currentParty.coverPhoto ? {
                  backgroundImage: `linear-gradient(180deg, rgba(var(--card-rgb, 255,255,255), 0.45) 0%, rgba(var(--card-rgb, 255,255,255), 0.92) 100%), url(${currentParty.coverPhoto})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : undefined}
              >
                <div className="absolute top-5 right-5 w-9 h-9 rounded-2xl bg-background/80 flex items-center justify-center backdrop-blur-md border border-border/60 group-hover:bg-primary group-hover:border-primary transition-all duration-300 shadow-sm">
                  <ChevronRight size={16} className="text-foreground group-hover:text-primary-foreground transition-colors" strokeWidth={2.5} />
                </div>

                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-primary mb-3 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Evento Ativo
                </span>

                <h2 className="text-2xl sm:text-4xl font-serif text-foreground tracking-wide leading-tight mb-6 max-w-[85%] font-medium group-hover:text-primary transition-colors duration-300">
                  {currentParty.name || 'Nova Festa'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border/60 pt-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-card border border-border/60 flex items-center justify-center text-primary shrink-0 shadow-sm">
                      <CalendarDays size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-widest leading-none mb-0.5">Data & Hora</span>
                      <span className="text-[11px] sm:text-xs font-bold leading-normal text-foreground/90">
                        {new Date(currentParty.date).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })} às {new Date(currentParty.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-card border border-border/60 flex items-center justify-center text-primary shrink-0 shadow-sm">
                      <MapPin size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-widest leading-none mb-0.5">Local</span>
                      <span className="text-[11px] sm:text-xs font-bold leading-normal truncate max-w-[160px] text-foreground/90">
                        {currentParty.location || 'Local a definir'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Countdown Widget */}
              <div className="flex items-center justify-center py-2 relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                  className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center"
                >
                  <div className="absolute inset-0 rounded-full border border-primary/30 border-dashed animate-[spin_20s_linear_infinite]">
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(212,175,55,1)]" />
                    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="absolute bottom-6 left-6 w-4 h-4 rounded-full bg-secondary shadow-[0_0_15px_rgba(183,110,121,1)]" />
                  </div>
                  <motion.div
                    animate={{ boxShadow: ["inset 0 0 10px rgba(212,175,55,0.2)", "inset 0 0 20px rgba(212,175,55,0.4)", "inset 0 0 10px rgba(212,175,55,0.2)"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-4 rounded-full border-[10px] border-primary/20"
                  />
                  <svg className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                    <motion.circle
                      cx="50" cy="50" r="44"
                      stroke="var(--primary)" strokeWidth="4" fill="none"
                      strokeLinecap="round" strokeDasharray="276" strokeDashoffset="50"
                      animate={{ filter: ["drop-shadow(0 0 2px rgba(212,175,55,0.4))", "drop-shadow(0 0 8px rgba(212,175,55,0.8))", "drop-shadow(0 0 2px rgba(212,175,55,0.4))"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </svg>
                  <motion.div
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 flex flex-col items-center justify-center bg-card w-44 h-44 sm:w-48 sm:h-48 rounded-full border border-border/30 shadow-inner"
                  >
                    <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-1">Falta Pouco</motion.span>
                    <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter flex items-center gap-1">
                      <span>{countdown.days.toString().padStart(2, '0')}</span>
                      <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-primary">:</motion.span>
                      <span>{countdown.hours.toString().padStart(2, '0')}</span>
                      <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-primary">:</motion.span>
                      <span>{countdown.mins.toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex gap-4 text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                      <span>Dias</span><span>Horas</span><span>Min</span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Coluna direita: métricas + convites */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              {/* Acesso Rápido — Progress Circles */}
              <div>
                <h3 className="text-base font-black text-foreground mb-3">Acesso Rápido</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <ProgressCircle percentage={guestsProgress} label="Convidados" sublabel="Confirmados" color="var(--primary)" />
                  <ProgressCircle percentage={tasksProgress} label="Tarefas" sublabel="Concluídas" color="var(--foreground)" />
                  <ProgressCircle percentage={budgetProgress} label="Orçamento" sublabel="Utilizado" color="var(--secondary)" />
                </div>
              </div>

              {/* Convites */}
              <div className="bg-card rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-sm border border-border/60 relative overflow-hidden">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-base font-black text-foreground">Convites</h3>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* RSVP Link */}
                  <div className="bg-primary/8 dark:bg-primary/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative border border-primary/20 aspect-[3/4]">
                    <h4 className="font-serif text-lg italic text-primary font-semibold mb-2">Você está<br />Convidado!</h4>
                    <p className="text-[10px] font-bold text-foreground/70 mb-4 leading-tight">Junte-se a nós em<br />{currentParty.name}</p>
                    <Button onClick={copyRSVPLink} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-[9px] font-black h-6 px-3 uppercase tracking-wider">
                      Copiar Link
                    </Button>
                  </div>
                  {/* WhatsApp */}
                  <div className="bg-card rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-border/60 aspect-[3/4] relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                      <MessageCircle size={18} className="text-emerald-500" strokeWidth={2} />
                    </div>
                    <h4 className="font-serif text-sm italic text-foreground font-semibold mb-2">Disparo por<br />WhatsApp</h4>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-3 leading-tight">Enviar p/ Todos</p>
                    <Button onClick={() => onQuickAction('whatsapp')} variant="outline" size="sm" className="rounded-full text-[9px] font-black h-6 px-3 uppercase tracking-wider border-foreground/30 text-foreground hover:bg-foreground hover:text-background transition-colors">
                      Configurar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-[28px] p-10 sm:p-12 text-center shadow-sm border border-border/60 flex flex-col items-center justify-center min-h-[40vh]">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Sparkles size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">Nenhuma Festa Ativa</h2>
            <p className="text-muted-foreground font-bold mb-8">Clique em "Nova Festa" para começar a planejar seu próximo evento.</p>
            <Button
              onClick={onCreateParty}
              className="rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-black px-8 h-12 shadow-md border-0"
            >
              Nova Festa
            </Button>
          </div>
        )}

        {/* ── FEED INFERIOR ── */}
        {currentParty && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6 lg:mt-8">

            {/* Atualizações Recentes */}
            <div className="bg-card rounded-[28px] p-5 sm:p-6 shadow-sm border border-border/60">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-black text-foreground">Atualizações</h3>
                <span className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-1">Ver Todas <ChevronRight size={14} /></span>
              </div>
              <div className="space-y-4 relative">
                {activities.length > 0 ? (
                  <>
                    <div className="absolute left-[15px] top-[24px] bottom-[24px] w-px bg-border/60" />
                    {activities.map((act, idx) => (
                      <div key={idx} className="flex gap-3 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center flex-shrink-0 text-primary">
                          {act.type === 'guest' ? <Sparkles size={12} /> : act.type === 'task' ? <Bell size={12} /> : <LinkIcon size={12} />}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-foreground leading-tight">{act.text}</p>
                          <p className="text-[10px] font-bold text-muted-foreground mt-0.5">{act.date.toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-xs font-bold text-muted-foreground text-center py-4">Nenhuma atividade recente.</p>
                )}
              </div>
            </div>

            {/* Status da Lista */}
            <div className="bg-card rounded-[28px] p-5 sm:p-6 shadow-sm border border-border/60 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-black text-foreground">Status da Lista</h3>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
              <div className="flex justify-between px-2 mb-5 flex-1">
                <div className="text-center">
                  <span className="block text-3xl font-black text-foreground">{confirmedCount}</span>
                  <span className="block text-[10px] font-bold text-muted-foreground">Confirmados</span>
                </div>
                <div className="text-center">
                  <span className="block text-3xl font-black text-foreground">{pendingCount}</span>
                  <span className="block text-[10px] font-bold text-muted-foreground">Pendentes</span>
                </div>
                <div className="text-center">
                  <span className="block text-3xl font-black text-foreground">{declinedCount}</span>
                  <span className="block text-[10px] font-bold text-muted-foreground">Recusaram</span>
                </div>
              </div>
              <div className="flex justify-center -space-x-2 overflow-hidden mt-auto">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`inline-block h-8 w-8 rounded-full ring-2 ring-card bg-gradient-to-tr from-primary to-secondary opacity-${100 - i * 10} shadow-sm`} />
                ))}
              </div>
            </div>

            {/* Próximos Eventos */}
            <div className="bg-card rounded-[28px] p-5 sm:p-6 shadow-sm border border-border/60">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm sm:text-base font-black text-foreground">Próximos Eventos</h3>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {nextEvents.length > 0 ? nextEvents.slice(0, 2).map((evt) => (
                  <div key={evt.id} className="rounded-2xl p-4 bg-muted/50 border border-border/50 cursor-pointer hover:shadow-md transition-all group" onClick={() => setCurrentParty(evt)}>
                    <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">{evt.name}</h4>
                    <div className="mt-2">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">
                        <span>Progresso</span>
                      </div>
                      <div className="w-full h-1.5 bg-border/60 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary w-1/2 rounded-full" />
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl p-4 bg-muted/30 border border-border/40 text-center">
                    <p className="text-xs font-bold text-muted-foreground">Nenhuma outra festa programada.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}