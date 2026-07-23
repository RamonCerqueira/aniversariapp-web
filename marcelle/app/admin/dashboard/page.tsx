
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, Home, UserPlus, FileText, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalFamilies: number;
  totalFriendsGroups: number;
  totalGroups: number;
  totalCapacity: number;
  totalConfirmedGuests: number;
  confirmedFamiliesCount: number;
  confirmedFriendsCount: number;
  adultsCount: number;
  teensCount: number;
  childrenCount: number;
  occupancyRate: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gold font-cinzel text-xl animate-pulse">Carregando métricas...</div>
      </div>
    );
  }

  const cards = [
    {
      label: "Total de Grupos (Famílias + Amigos)",
      value: stats?.totalGroups || 0,
      sub: `${stats?.totalFamilies} Famílias / ${stats?.totalFriendsGroups} Amigos`,
      icon: Home,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Capacidade Total",
      value: stats?.totalCapacity || 0,
      sub: "Vagas disponíveis",
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "Convidados Confirmados",
      value: stats?.totalConfirmedGuests || 0,
      sub: `${stats?.occupancyRate}% da capacidade`,
      icon: UserCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Grupos Confirmados",
      value: (stats?.confirmedFamiliesCount || 0) + (stats?.confirmedFriendsCount || 0),
      sub: "Responderam ao RSVP",
      icon: FileText,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-cinzel text-gold font-bold flex items-center gap-3"
        >
          <LayoutDashboard className="w-8 h-8" />
          Painel de Controle
        </motion.h1>
        
        <div className="flex gap-4">
          <Link href="/admin/familias">
            <button className="px-6 py-2 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg transition-all flex items-center gap-2">
              <UserPlus size={18} />
              Gerenciar Convidados
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl border backdrop-blur-md ${card.bg} ${card.border} hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-black/20 ${card.color}`}>
                  <Icon size={24} />
                </div>
                <span className={`text-4xl font-bold font-cinzel ${card.color}`}>
                  {card.value}
                </span>
              </div>
              <h3 className="text-gray-200 font-medium mb-1">
                {card.label}
              </h3>
              <p className="text-gray-400 text-xs uppercase tracking-wider">
                {card.sub}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions and Catering Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md"
         >
            <h3 className="text-xl font-cinzel text-gold mb-4 flex items-center gap-2">
               <Users size={20} className="text-gold" />
               Resumo para o Buffet
            </h3>
            <div className="grid grid-cols-3 gap-4">
               <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                  <span className="block text-2xl font-bold text-white">{stats?.adultsCount || 0}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest">Adultos</span>
               </div>
               <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                  <span className="block text-2xl font-bold text-white">{stats?.teensCount || 0}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest">Teens</span>
               </div>
               <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                  <span className="block text-2xl font-bold text-white">{stats?.childrenCount || 0}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest">Crianças</span>
               </div>
            </div>
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md"
         >
            <h3 className="text-xl font-cinzel text-gold mb-4 flex items-center gap-2">
               <LayoutDashboard size={20} className="text-gold" />
               Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <Link href="/admin/familias?new=true" className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors text-center group">
                  <UserPlus className="w-8 h-8 mx-auto mb-2 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-300 text-sm">Nova Família</span>
               </Link>
               <Link href="/admin/relatorios" className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors text-center group">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-300 text-sm">Relatórios</span>
               </Link>
            </div>
         </motion.div>
      </div>
    </div>
  );
}
