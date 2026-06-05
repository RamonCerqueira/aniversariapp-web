import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useParty } from '../contexts/PartyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Search, 
  Bell, 
  Sparkles, 
  CheckCircle, 
  Users,
  Briefcase,
  Wallet,
  Gift
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function HomeScreen({ onCreateParty, onViewParty, onQuickAction }) {
  const { user } = useAuth();
  const { parties, loadParties } = useParty();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadParties();
  }, [loadParties]);

  const handleNotificationPress = () => {
    toast.info('Você não tem novas notificações no momento. 🎈', {
      position: 'top-center',
      className: 'rounded-xl font-semibold'
    });
  };

  const handleQuick = (action) => {
    switch (action) {
      case 'guests':
        onQuickAction('guests');
        break;
      case 'consumption':
        onQuickAction('consumption');
        break;
      case 'checklist':
        onQuickAction('checklist');
        break;
      case 'suppliers':
        onQuickAction('suppliers');
        break;
      case 'finance':
        onQuickAction('finance');
        break;
      default:
        console.warn(`Ação desconhecida: ${action}`);
    }
  };

  // Pega próxima festa futura
  const getNextParty = () => {
    const now = new Date();
    const upcoming = parties
      .filter(p => new Date(p.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcoming[0] || parties[0] || null;
  };

  const nextParty = getNextParty();

  // Cálculo regressivo para o contador redondo
  const getCountdown = () => {
    if (!nextParty || !nextParty.date) return { days: 0, hours: 0 };
    const diff = new Date(nextParty.date) - new Date();
    if (diff <= 0) return { days: 0, hours: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  };

  const countdown = getCountdown();

  // Estatísticas de convidados
  const totalGuests = nextParty?.guestCount || 350;
  const confirmedCount = Math.round(totalGuests * 0.6);
  const declinedCount = Math.round(totalGuests * 0.24);
  const pendingCount = totalGuests - confirmedCount - declinedCount;

  // Massa de dados para o gráfico spline de RSVP
  const getChartData = () => {
    return [
      { name: 'Out 1', count: Math.round(totalGuests * 0.1) },
      { name: 'Out 6', count: Math.round(totalGuests * 0.25) },
      { name: 'Out 10', count: Math.round(totalGuests * 0.65) },
      { name: 'Out 22', count: Math.round(totalGuests * 0.45) },
      { name: 'Out 23', count: Math.round(totalGuests * 0.55) },
      { name: 'Out 24', count: confirmedCount }
    ];
  };

  const chartData = getChartData();

  // Orçamentos
  const totalBudget = nextParty?.budget || 25000;
  const totalSpent = Math.round(totalBudget * 0.5);

  // Lista de atividades mock
  const activities = [
    { id: 1, text: 'Novo RSVP de Alex J.', time: 'Há 5 min' },
    { id: 2, text: 'Lista de tarefas atualizada', time: 'Há 20 min' },
    { id: 3, text: 'Fornecedor pago com sucesso', time: 'Há 1 hora' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative z-10 flex flex-col">
      
      {/* Top Header / Bar */}
      <header className="border-b border-border/40 backdrop-blur-md bg-background/60 sticky top-0 z-20 px-6 py-4 flex items-center justify-between gap-4">
        
        {/* Brand/Mobile Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 lg:hidden">
            <Gift size={20} strokeWidth={1.5} className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tight text-primary lg:hidden">CELEBRATE</span>
          <span className="hidden lg:block font-black text-xl tracking-tight text-foreground">Visão Geral</span>
        </div>

        {/* Search box matching mockup */}
        <div className="hidden sm:flex items-center gap-3 max-w-sm w-full relative">
          <Search size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar celebrações..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl pl-10 border-border bg-card/60 backdrop-blur-sm text-sm"
          />
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleNotificationPress}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors relative"
          >
            <Bell size={18} strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full" />
          </button>
          
          <Button 
            onClick={onCreateParty} 
            className="bg-primary hover:bg-primary/95 text-white font-extrabold text-xs uppercase tracking-wider px-4 py-5 rounded-xl shadow-md shadow-primary/15"
          >
            <Sparkles size={14} strokeWidth={1.5} className="mr-1.5 text-white" /> Nova Festa
          </Button>
        </div>
      </header>

      {/* Main content grid */}
      <div className="p-6 space-y-8 flex-grow">
        
        {/* Welcome back tag */}
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Bem-vindo de volta, {user?.name?.split(' ')[0] || 'Olivia'}!
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
            {nextParty ? 'Sua próxima grande celebração está chegando!' : 'Comece planejando seu próximo grande evento hoje!'}
          </p>
        </div>

        {/* Interactive Row: Countdown Card & RSVP Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Countdown circular progress card */}
          <div className="lg:col-span-5 flex">
            <Card className="w-full glass-panel shadow-premium border border-border/50 rounded-3xl overflow-hidden flex flex-col justify-between p-6 relative hover:shadow-premium-hover transition-all">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Próximo Evento</span>
                  <h3 className="text-xl font-black leading-tight text-foreground truncate max-w-[200px]">
                    {nextParty ? nextParty.name : 'The Gala Night'}
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-colors">
                  <Sparkles size={14} strokeWidth={1.5} />
                </div>
              </div>

              {/* Glowing ring countdown widget */}
              <div className="my-6 flex items-center justify-center relative">
                <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-primary via-secondary to-accent opacity-20 blur-xl pointer-events-none" />
                
                <div className="w-40 h-40 rounded-full flex flex-col items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                    <defs>
                      <linearGradient id="countdownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#B76E79" />
                      </linearGradient>
                    </defs>
                    {/* Track Circle (Background) */}
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="70" 
                      stroke="currentColor" 
                      className="text-zinc-800/30"
                      strokeWidth="6" 
                      fill="transparent" 
                    />
                    {/* Progress Circle */}
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="70" 
                      stroke="url(#countdownGradient)" 
                      strokeWidth="6" 
                      fill="transparent" 
                      strokeDasharray="440"
                      strokeDashoffset={440 - (440 * (nextParty ? Math.max(0, Math.min(1, countdown.days / 30)) : 0.7))}
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="text-center space-y-0.5 z-10">
                    <span className="text-3xl font-black tracking-tight text-foreground">
                      {nextParty ? countdown.days : '32'}
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dias Restantes</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-border/40 pt-4">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground/80">
                  <span>Localização:</span>
                  <span className="text-foreground truncate max-w-[180px]">{nextParty ? nextParty.location : 'Royal Hall, NYC'}</span>
                </div>
                
                {nextParty ? (
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button 
                      onClick={() => onViewParty(nextParty.id)}
                      className="w-full bg-muted hover:bg-muted/80 text-foreground font-extrabold text-xs uppercase py-5 rounded-xl border border-border/40"
                    >
                      Ver Detalhes
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button 
                      onClick={onCreateParty}
                      className="w-full bg-gradient-to-r from-primary to-secondary text-white font-extrabold text-xs uppercase py-5 rounded-xl shadow-md shadow-primary/10"
                    >
                      Criar Festa
                    </Button>
                  </motion.div>
                )}
              </div>
            </Card>
          </div>

          {/* RSVP summary & Recharts curved line graph */}
          <div className="lg:col-span-7 flex">
            <Card className="w-full glass-panel shadow-premium border border-border/50 rounded-3xl overflow-hidden p-6 flex flex-col justify-between relative hover:shadow-premium-hover transition-all">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-[#9FB6CD]" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Sumário RSVP</span>
                  <h3 className="text-base font-extrabold text-foreground">Engajamento de Convidados</h3>
                </div>
                
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-muted border border-border/30">
                  Fase de Confirmação
                </span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3 text-center my-5 bg-muted/40 border border-border/20 p-3.5 rounded-2xl shadow-inner">
                <div className="space-y-0.5">
                  <p className="text-lg font-black text-foreground">{totalGuests}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Total</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-lg font-black text-emerald-500">{confirmedCount}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Vão Sim</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-lg font-black text-rose-500">{declinedCount}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Recusaram</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-lg font-black text-amber-500">{pendingCount}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Pendentes</p>
                </div>
              </div>

              {/* Spline curved interactive line chart */}
              <div className="w-full h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradientStroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#B76E79" />
                      </linearGradient>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#B76E79" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        borderColor: 'var(--border)', 
                        borderRadius: '12px',
                        color: 'var(--foreground)',
                        fontSize: '11px',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="url(#gradientStroke)" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

        </div>

        {/* Quick Action Grid */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold tracking-tight text-foreground uppercase tracking-widest text-xs">Módulos Rápidos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <button onClick={() => handleQuick('guests')} className="p-4 rounded-2xl glass-panel shadow-premium hover:shadow-premium-hover border border-border/50 transition-all text-center space-y-2 flex flex-col items-center justify-center cursor-pointer group">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-foreground">Convidados</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Presenças</p>
              </div>
            </button>

            <button onClick={() => handleQuick('consumption')} className="p-4 rounded-2xl glass-panel shadow-premium hover:shadow-premium-hover border border-border/50 transition-all text-center space-y-2 flex flex-col items-center justify-center cursor-pointer group">
              <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-foreground">Churrascômetro</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Consumo ideal</p>
              </div>
            </button>

            <button onClick={() => handleQuick('checklist')} className="p-4 rounded-2xl glass-panel shadow-premium hover:shadow-premium-hover border border-border/50 transition-all text-center space-y-2 flex flex-col items-center justify-center cursor-pointer group">
              <div className="w-10 h-10 bg-accent/40 text-foreground rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-foreground">Tarefas</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Lista de afazeres</p>
              </div>
            </button>

            <button onClick={() => handleQuick('suppliers')} className="p-4 rounded-2xl glass-panel shadow-premium hover:shadow-premium-hover border border-border/50 transition-all text-center space-y-2 flex flex-col items-center justify-center cursor-pointer group">
              <div className="w-10 h-10 bg-[#B5C9A4]/20 text-[#B5C9A4] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-foreground">Fornecedores</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Serviços</p>
              </div>
            </button>

            <button onClick={() => handleQuick('finance')} className="p-4 rounded-2xl glass-panel shadow-premium hover:shadow-premium-hover border border-border/50 transition-all text-center space-y-2 flex flex-col items-center justify-center cursor-pointer group">
              <div className="w-10 h-10 bg-[#9FB6CD]/20 text-[#9FB6CD] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-foreground">Orçamento</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">Custos e saldo</p>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Grid: Task Checklist, Budget Tracker & Activity logs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Task Checklist progress */}
          <Card className="glass-panel shadow-premium border border-border/50 rounded-2xl p-5 flex flex-col justify-between hover:shadow-premium-hover transition-all">
            <div className="space-y-1 mb-4">
              <span className="text-[9px] font-black uppercase tracking-wider text-primary">Status de Afazeres</span>
              <h4 className="text-sm font-extrabold text-foreground">Checklist Principal</h4>
            </div>
            <div className="space-y-3.5 flex-1">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-md border border-primary/40 bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle size={10} strokeWidth={1.5} className="text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground line-through">Reserva de Espaço</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-md border border-primary/40 bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle size={10} strokeWidth={1.5} className="text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground line-through">Bolo e Doces Encomendados</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-md border border-border bg-background flex items-center justify-center" />
                <span className="text-xs font-semibold text-foreground">Enviar Convites Digitais</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-md border border-border bg-background flex items-center justify-center" />
                <span className="text-xs font-semibold text-foreground">Contratar Fotógrafo</span>
              </div>
            </div>
            
            <div className="mt-4 pt-3.5 border-t border-border/40 text-[10px] font-extrabold text-muted-foreground flex justify-between uppercase tracking-wider">
              <span>Progresso</span>
              <span className="text-primary font-black">2/4 Concluídas</span>
            </div>
          </Card>

          {/* Budget Progress bar tracking */}
          <Card className="glass-panel shadow-premium border border-border/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden hover:shadow-premium-hover transition-all">
            <div className="space-y-1 mb-4">
              <span className="text-[9px] font-black uppercase tracking-wider text-secondary">Controle Financeiro</span>
              <h4 className="text-sm font-extrabold text-foreground">Planejamento de Custo</h4>
            </div>
            
            <div className="space-y-4 my-auto">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-foreground">R$ {totalSpent.toLocaleString('pt-BR')}</span>
                <span className="text-xs font-bold text-muted-foreground">/ R$ {totalBudget.toLocaleString('pt-BR')}</span>
              </div>
              
              <div className="w-full bg-muted h-3 rounded-full overflow-hidden p-[2px] border border-border/20">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" 
                  style={{ width: `${(totalSpent / totalBudget) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-border/40 text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest font-black">
              Orçamento Saudável
            </div>
          </Card>

          {/* Recent activity feeds */}
          <Card className="glass-panel shadow-premium border border-border/50 rounded-2xl p-5 flex flex-col justify-between hover:shadow-premium-hover transition-all">
            <div className="space-y-1 mb-4">
              <span className="text-[9px] font-black uppercase tracking-wider text-[#9FB6CD]">Logs Recentes</span>
              <h4 className="text-sm font-extrabold text-foreground">Atividades da Festa</h4>
            </div>
            <div className="space-y-3.5 flex-1">
              {activities.map(act => (
                <div key={act.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-primary" />
                    <span className="font-semibold truncate text-foreground/80">{act.text}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-bold shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3.5 border-t border-border/40 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
              Atualizado em tempo real
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
}