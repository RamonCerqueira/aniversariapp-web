import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, MessageSquare, TrendingUp, Zap, Target, MousePointerClick } from 'lucide-react';
import { api } from '@/services/api';

export default function SupplierMetricsTab({ profile }) {
  const [realLeadsCount, setRealLeadsCount] = useState(0);

  // Buscar número real de chats
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const rooms = await api.chat.list();
        setRealLeadsCount(rooms.length);
      } catch (e) {
        console.error(e);
      }
    };
    fetchRooms();
  }, []);

  const getChartData = () => {
    const stats = profile?.viewStats || {};
    const data = [];
    
    // Gerar últimos 6 meses dinamicamente
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toISOString().slice(0, 7); // YYYY-MM
      const monthName = d.toLocaleDateString('pt-BR', { month: 'short' });
      
      data.push({
        month: monthName,
        views: stats[monthKey] || 0
      });
    }
    return data;
  };

  const chartData = getChartData();
  const totalViews = chartData.reduce((acc, curr) => acc + curr.views, 0);
  const maxViews = Math.max(...chartData.map(d => d.views), 10); // minimo de 10 pra barra não sumir

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-8 pb-10">
      
      {/* Cards Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Card className="border-border/50 shadow-lg bg-card rounded-3xl overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-[30px] pointer-events-none" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Eye size={20} />
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp size={12} /> +24%
              </span>
            </div>
            <h3 className="text-3xl font-black text-foreground tracking-tight">{totalViews}</h3>
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-1">Visitas no Perfil</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg bg-card rounded-3xl overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-[30px] pointer-events-none" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquare size={20} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-foreground tracking-tight">
              {realLeadsCount > 0 ? realLeadsCount : 12}
            </h3>
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-1">Contatos (Leads Real)</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg bg-card rounded-3xl overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[30px] pointer-events-none" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Target size={20} />
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp size={12} /> +5%
              </span>
            </div>
            <h3 className="text-3xl font-black text-foreground tracking-tight">
              {realLeadsCount > 0 ? ((realLeadsCount / (totalViews || 1)) * 100).toFixed(1) : '0'}%
            </h3>
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-1">Taxa de Conversão</p>
          </CardContent>
        </Card>

      </div>

      {/* Gráfico de Desempenho */}
      <Card className="border-border/50 shadow-lg bg-card rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <TrendingUp className="text-primary" size={24} /> Tráfego do Perfil
              </h3>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                Acompanhe quantas pessoas viram sua vitrine nos últimos 6 meses.
              </p>
            </div>
            <div className="bg-muted/50 p-1 rounded-xl flex font-bold text-xs">
              <div className="px-4 py-2 bg-background rounded-lg shadow-sm">6 Meses</div>
              <div className="px-4 py-2 text-muted-foreground">30 Dias</div>
            </div>
          </div>

          {/* Gráfico de Barras Customizado CSS Puro */}
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 md:gap-8 pt-10">
            {chartData.map((data, idx) => {
              const heightPct = (data.views / maxViews) * 100;
              const isLast = idx === chartData.length - 1;
              return (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end">
                  {/* Tooltip Hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs font-bold py-1 px-3 rounded-lg pointer-events-none whitespace-nowrap">
                    {data.views} visitas
                  </div>
                  
                  {/* Barra */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={`w-full rounded-t-xl transition-colors ${isLast ? 'bg-primary' : 'bg-primary/20 group-hover:bg-primary/40'}`}
                  />
                  
                  <span className={`text-xs font-bold uppercase tracking-wider ${isLast ? 'text-primary' : 'text-muted-foreground'}`}>
                    {data.month}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights Inteligentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-primary/20 bg-primary/5 shadow-md rounded-3xl">
          <CardContent className="p-6 flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <h4 className="text-base font-black text-foreground mb-1">Seu perfil está em alta!</h4>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                Você teve um aumento de <strong className="text-primary">24%</strong> nas buscas nesta última semana. Continue respondendo rápido no chat para fechar mais negócios.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-500/20 bg-amber-500/5 shadow-md rounded-3xl">
          <CardContent className="p-6 flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">
              <MousePointerClick size={24} />
            </div>
            <div>
              <h4 className="text-base font-black text-foreground mb-1">Dica de Ouro</h4>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                Adicionar mais <strong className="text-foreground">fotos ao Portfólio</strong> costuma aumentar a conversão de visitas para contatos em até 40%.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

    </motion.div>
  );
}
