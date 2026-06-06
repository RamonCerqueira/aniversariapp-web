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
  Link as LinkIcon
} from 'lucide-react';

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

  const handleNotificationPress = () => {
    toast.info('Você não tem novas notificações no momento. 🎈', {
      position: 'top-center',
      className: 'rounded-xl font-semibold'
    });
  };

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

  // Metrics
  const totalGuests = guests.reduce((acc, g) => acc + 1 + (g.companions || 0), 0);
  const confirmedCount = guests.filter(g => g.status === 'confirmed').reduce((acc, g) => acc + 1 + (g.companions || 0), 0);
  const pendingCount = guests.filter(g => g.status === 'pending').reduce((acc, g) => acc + 1 + (g.companions || 0), 0);
  const declinedCount = guests.filter(g => g.status === 'declined').reduce((acc, g) => acc + 1 + (g.companions || 0), 0);

  const totalBudget = currentParty?.budget || 0;
  const totalSpent = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
  
  const tasksCompleted = tasks.filter(t => t.done).length;
  const tasksTotal = tasks.length;

  // Progress Percentages
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

  // Circular Progress Component
  const ProgressCircle = ({ percentage, label, sublabel, colorClass }) => (
    <div className="flex flex-col items-center justify-center p-3 rounded-[24px] bg-white/40 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.02)] border border-white/60">
      <div className="relative w-16 h-16 flex items-center justify-center mb-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-[#E8E2D9]"
            strokeWidth="3"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={colorClass}
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="absolute text-[11px] font-black text-[#2A2A2A]">{percentage}%</span>
      </div>
      <span className="text-[10px] font-extrabold text-[#2A2A2A] text-center leading-tight">{label}</span>
      <span className="text-[8px] font-bold text-[#8A857D] text-center">{sublabel}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2A2A2A] transition-colors duration-300 font-sans p-4 md:p-8 relative overflow-hidden group">
      
      {/* Ambient Background Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Orb 1: Top Left */}
        <motion.div 
          animate={{ 
            x: [0, 30, -20, 0], 
            y: [0, -20, 30, 0],
            scale: [1, 1.1, 0.9, 1] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FF7E67]/20 blur-[120px] opacity-60 group-hover:opacity-80 transition-opacity duration-700"
        />
        
        {/* Orb 2: Center Right */}
        <motion.div 
          animate={{ 
            x: [0, -40, 20, 0], 
            y: [0, 40, -10, 0],
            scale: [1, 1.2, 0.8, 1] 
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-[#FF7E67]/10 blur-[120px] opacity-50 group-hover:opacity-70 transition-opacity duration-700"
        />
        
        {/* Orb 3: Bottom Left */}
        <motion.div 
          animate={{ 
            x: [0, 50, -30, 0], 
            y: [0, -50, 20, 0],
            scale: [1, 0.9, 1.1, 1] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-40 left-1/4 w-[400px] h-[400px] rounded-full bg-[#FF9B8A]/15 blur-[120px] opacity-40 group-hover:opacity-60 transition-opacity duration-700"
        />

        {/* Small floating particles around the edges */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
            className="absolute rounded-full bg-[#FF7E67] blur-[2px]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Mobile Party Switcher (visible only on mobile if sidebar is hidden) */}
      <div className="lg:hidden mb-6 flex justify-between items-center">
        <div className="relative max-w-[200px] flex-1">
          <Select value={currentParty?.id || ''} onValueChange={(value) => {
            const party = parties.find(p => p.id === value);
            if (party) setCurrentParty(party);
          }}>
            <SelectTrigger className="w-full bg-white/50 border border-[#E8E2D9] text-[#2A2A2A] text-xs font-black rounded-xl px-4 py-2.5 h-[42px] shadow-sm">
              <SelectValue placeholder="Nenhuma festa encontrada" />
            </SelectTrigger>
            <SelectContent>
              {parties.length === 0 && <SelectItem value="none" disabled>Nenhuma festa encontrada</SelectItem>}
              {parties.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-white shadow-sm border border-[#E8E2D9] relative" onClick={handleNotificationPress}>
          <Bell size={18} strokeWidth={1.5} className="text-[#2A2A2A]" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FF7E67] rounded-full" />
        </Button>
      </div>

      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#2A2A2A] flex flex-wrap items-center gap-3">
            <span>Bem-vindo(a), <span className="uppercase">{user?.name?.split(' ')[0] || 'Host'}</span>!</span>
            <button
              onClick={() => onQuickAction && onQuickAction('subscription')}
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] bg-white border border-[#EAE3DA] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 px-3 py-1.5 rounded-full shadow-sm cursor-pointer transition-all duration-300"
              title="Ir para tela de Assinaturas"
            >
              <Sparkles size={11} className="text-[#D4AF37]" />
              <span>Plano {user?.plan || 'FREE'}</span>
            </button>
          </h1>
          <p className="text-sm font-bold text-[#8A857D] mt-1 tracking-wide">
            Vamos celebrar!
          </p>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search size={16} strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A39C]" />
            <Input 
              placeholder="Pesquisar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 rounded-full border-[#E8E2D9] bg-white text-sm font-bold h-11 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus-visible:ring-[#FF7E67]/20"
            />
          </div>
          <Button 
            onClick={onCreateParty} 
            className="rounded-full bg-gradient-to-r from-[#FF7E67] to-[#FF9B8A] hover:from-[#FF6A50] hover:to-[#FF8A75] text-white font-black text-xs px-6 h-11 shadow-[0_8px_20px_-6px_rgba(255,126,103,0.4)] border-0 transition-transform hover:scale-105"
          >
            Nova Festa
          </Button>
        </div>
      </div>

      {/* Main Grid Content */}
      {currentParty ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CENTER COLUMN: Active Event & Countdown (Takes up more space in desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Active Event Card */}
            <div 
              onClick={() => onViewParty(currentParty.id)}
              className="relative rounded-[32px] overflow-hidden p-8 shadow-[0_20px_50px_rgba(138,133,125,0.08)] isolate group cursor-pointer transition-all duration-500 hover:shadow-[0_30px_60px_rgba(138,133,125,0.15)] hover:-translate-y-1.5 border border-[#EAE3DA]"
              style={{
                background: currentParty.coverPhoto 
                  ? `linear-gradient(180deg, rgba(253, 251, 247, 0.45) 0%, rgba(253, 251, 247, 0.9) 100%), url(${currentParty.coverPhoto}) center/cover no-repeat`
                  : `linear-gradient(135deg, #FDFBF7 0%, #F1EBE1 100%)`
              }}
            >
              {/* Soft gold/rose glow in top-right */}
              {!currentParty.coverPhoto && (
                <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#FF7E67]/5 blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
              )}
              
              <div className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-white/85 flex items-center justify-center backdrop-blur-md border border-[#EAE3DA] group-hover:bg-[#FF7E67] group-hover:text-white group-hover:border-[#FF7E67] transition-all duration-300 shadow-sm">
                <ChevronRight size={18} className="text-[#2A2A2A] group-hover:text-white group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              </div>
              
              <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-[#FF7E67] mb-3 bg-[#FFF4F1] border border-[#FFE3D8] px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7E67] animate-pulse" />
                Evento Ativo
              </span>
              
              <h2 className="text-3xl sm:text-4xl font-serif text-[#2A2A2A] tracking-wide leading-tight mb-8 max-w-[85%] font-medium group-hover:text-[#FF7E67] transition-colors duration-300">
                {currentParty.name || 'Nova Festa'}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#EAE3DA] pt-6">
                <div className="flex items-center gap-3 text-[#2A2A2A] font-medium text-xs sm:text-sm">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE3DA] flex items-center justify-center text-[#FF7E67] shrink-0 shadow-sm">
                    <CalendarDays size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold uppercase text-[#8A857D] tracking-widest leading-none mb-0.5">Data & Hora</span>
                    <span className="text-[11px] sm:text-xs font-bold leading-normal text-[#2A2A2A]/90">
                      {new Date(currentParty.date).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })} às {new Date(currentParty.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-[#2A2A2A] font-medium text-xs sm:text-sm">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE3DA] flex items-center justify-center text-[#FF7E67] shrink-0 shadow-sm">
                    <MapPin size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold uppercase text-[#8A857D] tracking-widest leading-none mb-0.5">Local</span>
                    <span className="text-[11px] sm:text-xs font-bold leading-normal truncate max-w-[150px] text-[#2A2A2A]/90">
                      {currentParty.location || 'Local a definir'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Circular Countdown Widget */}
            <div className="flex items-center justify-center py-4 relative">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center"
              >
                
                {/* Outer decorative ring with orbiting dots */}
                <div className="absolute inset-0 rounded-full border border-[#FF7E67]/30 border-dashed animate-[spin_20s_linear_infinite]">
                  {/* Orbiting dots with pulsing scale */}
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#FF7E67] shadow-[0_0_15px_rgba(255,126,103,1)]" />
                  <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="absolute bottom-6 left-6 w-4 h-4 rounded-full bg-[#4ECCA3] shadow-[0_0_15px_rgba(78,204,163,1)]" />
                  <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.2, repeat: Infinity, delay: 1 }} className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,1)]" />
                </div>
                
                {/* Inner thick ring with soft glow pulse */}
                <motion.div 
                  animate={{ boxShadow: ["inset 0 0 10px rgba(255,227,216,0.5)", "inset 0 0 20px rgba(255,126,103,0.3)", "inset 0 0 10px rgba(255,227,216,0.5)"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-4 rounded-full border-[12px] border-[#FFE3D8]" 
                />
                
                {/* Progress colored ring */}
                <svg className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                  <motion.circle 
                    cx="50" cy="50" r="44" 
                    stroke="#FF7E67" strokeWidth="4" fill="none" 
                    strokeLinecap="round" strokeDasharray="276" strokeDashoffset="50"
                    animate={{ strokeWidth: [4, 5, 4], filter: ["drop-shadow(0px 0px 2px rgba(255,126,103,0.4))", "drop-shadow(0px 0px 8px rgba(255,126,103,0.8))", "drop-shadow(0px 0px 2px rgba(255,126,103,0.4))"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </svg>

                {/* Heartbeat Center Circle */}
                <motion.div 
                  animate={{ scale: [1, 1.03, 1], boxShadow: ["0 10px 30px -10px rgba(255,126,103,0.3)", "0 15px 40px -5px rgba(255,126,103,0.5)", "0 10px 30px -10px rgba(255,126,103,0.3)"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 flex flex-col items-center justify-center bg-[#FDFBF7] w-48 h-48 rounded-full"
                >
                  <motion.span 
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-xs font-extrabold uppercase tracking-widest text-[#8A857D] mb-1"
                  >
                    Falta Pouco
                  </motion.span>
                  <div className="text-3xl font-black text-[#2A2A2A] tracking-tighter flex items-center gap-1.5">
                    <span>{countdown.days.toString().padStart(2, '0')}</span>
                    <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-[#FF7E67]">:</motion.span>
                    <span>{countdown.hours.toString().padStart(2, '0')}</span>
                    <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-[#FF7E67]">:</motion.span>
                    <span>{countdown.mins.toString().padStart(2, '0')}</span>
                  </div>
                  <div className="flex gap-4 text-[8px] font-black uppercase tracking-widest text-[#8A857D] mt-1 ml-1">
                    <span>Dias</span>
                    <span>Horas</span>
                    <span>Min</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

          </div>

          {/* RIGHT COLUMN: Quick Access & Invitations */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Quick Access */}
            <div>
              <h3 className="text-base font-black text-[#2A2A2A] mb-4">Acesso Rápido</h3>
              <div className="grid grid-cols-3 gap-3">
                <ProgressCircle percentage={guestsProgress} label="Convidados" sublabel="Confirmados" colorClass="text-[#FF7E67]" />
                <ProgressCircle percentage={tasksProgress} label="Tarefas" sublabel="Concluídas" colorClass="text-[#2A2A2A]" />
                <ProgressCircle percentage={budgetProgress} label="Orçamento" sublabel="Utilizado" colorClass="text-[#FF7E67]" />
              </div>
            </div>

            {/* Event Invitations */}
            <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] border border-[#E8E2D9] relative overflow-hidden group">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-black text-[#2A2A2A]">Convites</h3>
                <ChevronRight size={16} className="text-[#8A857D]" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Invite Card 1 (RSVP Link) */}
                <div className="bg-[#FFF4F1] rounded-2xl p-4 flex flex-col items-center justify-center text-center relative border border-[#FFE3D8] aspect-[3/4]">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 rounded-2xl"></div>
                  <h4 className="font-serif text-xl italic text-[#FF7E67] font-semibold mb-2 relative z-10">Você está<br/>Convidado!</h4>
                  <p className="text-[10px] font-bold text-[#2A2A2A]/70 mb-4 relative z-10 leading-tight">Junte-se a nós em<br/>{currentParty.name}</p>
                  <Button onClick={copyRSVPLink} size="sm" className="relative z-10 bg-[#FF7E67] hover:bg-[#FF6A50] text-white rounded-full text-[9px] font-black h-6 px-3 uppercase tracking-wider">
                    Copiar Link
                  </Button>
                </div>
                
                {/* Invite Card 2 (WhatsApp Integration Preview) */}
                <div className="bg-gradient-to-b from-[#FDFBF7] to-[#F1EBE1] rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-[#E8E2D9] aspect-[3/4] relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                    <MessageCircle size={18} className="text-emerald-500" strokeWidth={2} />
                  </div>
                  <h4 className="font-serif text-sm italic text-[#2A2A2A] font-semibold mb-2">Disparo por<br/>WhatsApp</h4>
                  <p className="text-[8px] font-bold text-[#8A857D] uppercase tracking-widest mb-3 leading-tight">Enviar p/ Todos</p>
                  <Button onClick={() => onQuickAction('whatsapp')} variant="outline" size="sm" className="rounded-full text-[9px] font-black h-6 px-3 uppercase tracking-wider border-[#2A2A2A] text-[#2A2A2A] hover:bg-[#2A2A2A] hover:text-white transition-colors">
                    Configurar
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] p-12 text-center shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] border border-[#E8E2D9] flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-20 h-20 bg-[#FFF4F1] rounded-full flex items-center justify-center mb-6">
            <Sparkles size={32} className="text-[#FF7E67]" />
          </div>
          <h2 className="text-2xl font-black text-[#2A2A2A] mb-2">Nenhuma Festa Ativa</h2>
          <p className="text-[#8A857D] font-bold mb-8">Clique em "Nova Festa" para começar a planejar seu próximo evento.</p>
          <Button 
            onClick={onCreateParty} 
            className="rounded-full bg-gradient-to-r from-[#FF7E67] to-[#FF9B8A] hover:from-[#FF6A50] hover:to-[#FF8A75] text-white font-black px-8 h-12 shadow-[0_8px_20px_-6px_rgba(255,126,103,0.4)] border-0"
          >
            Nova Festa
          </Button>
        </div>
      )}

      {/* BOTTOM ROW: Feeds & Status */}
      {currentParty && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          
          {/* Recent Updates */}
          <div className="lg:col-span-4 bg-white rounded-[32px] p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] border border-[#E8E2D9]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-black text-[#2A2A2A]">Atualizações Recentes</h3>
              <span className="text-xs font-bold text-[#2A2A2A] cursor-pointer flex items-center gap-1">Ver Todas <ChevronRight size={14}/></span>
            </div>
            
            <div className="space-y-5 relative">
              {activities.length > 0 ? (
                <>
                  <div className="absolute left-[15px] top-[24px] bottom-[24px] w-px bg-[#E8E2D9]" />
                  {activities.map((act, idx) => (
                    <div key={idx} className="flex gap-4 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-[#FFF4F1] border-2 border-white flex items-center justify-center flex-shrink-0 text-[#FF7E67]">
                        {act.type === 'guest' ? <Sparkles size={12} /> : act.type === 'task' ? <Bell size={12} /> : <LinkIcon size={12} />}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#2A2A2A] leading-tight">{act.text}</p>
                        <p className="text-[10px] font-bold text-[#8A857D] mt-0.5">{act.date.toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-xs font-bold text-[#8A857D] text-center py-4">Nenhuma atividade recente.</p>
              )}
            </div>
          </div>

          {/* Guest List Status */}
          <div className="lg:col-span-4 bg-white rounded-[32px] p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] border border-[#E8E2D9] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-black text-[#2A2A2A]">Status da Lista</h3>
              <ChevronRight size={16} className="text-[#8A857D]" />
            </div>
            
            <div className="flex justify-between px-2 mb-6 flex-1">
              <div className="text-center">
                <span className="block text-3xl font-black text-[#2A2A2A]">{confirmedCount}</span>
                <span className="block text-[10px] font-bold text-[#8A857D] capitalize">Confirmados</span>
              </div>
              <div className="text-center">
                <span className="block text-3xl font-black text-[#2A2A2A]">{pendingCount}</span>
                <span className="block text-[10px] font-bold text-[#8A857D] capitalize">Pendentes</span>
              </div>
              <div className="text-center">
                <span className="block text-3xl font-black text-[#2A2A2A]">{declinedCount}</span>
                <span className="block text-[10px] font-bold text-[#8A857D] capitalize">Recusaram</span>
              </div>
            </div>

            <div className="flex justify-center -space-x-2 overflow-hidden mt-auto">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-tr from-[#FF7E67] to-[#D4F0E8] opacity-${100 - i*10} shadow-sm`} />
              ))}
            </div>
          </div>

          {/* My Next Events */}
          <div className="lg:col-span-4 bg-white rounded-[32px] p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] border border-[#E8E2D9]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-black text-[#2A2A2A]">Meus Próximos Eventos</h3>
              <ChevronRight size={16} className="text-[#8A857D]" />
            </div>
            
            <div className="space-y-4">
              {nextEvents.length > 0 ? nextEvents.slice(0, 2).map((evt) => (
                <div key={evt.id} className="rounded-2xl p-4 bg-gradient-to-r from-[#FDFBF7] to-[#F1EBE1] border border-[#E8E2D9] cursor-pointer hover:shadow-md transition-all group" onClick={() => setCurrentParty(evt)}>
                  <h4 className="text-sm font-black text-[#2A2A2A] group-hover:text-[#FF7E67] transition-colors truncate">{evt.name}</h4>
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[#8A857D] mb-1.5">
                      <span>Progresso</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#FF7E67] to-[#FF9B8A] w-1/2 rounded-full" />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl p-4 bg-gray-50 border border-gray-100 text-center">
                  <p className="text-xs font-bold text-[#8A857D]">Nenhuma outra festa programada.</p>
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