import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuests } from './GuestContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Search, UserCheck, UserX, Users, Clock, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function GateDesk({ onBack }) {
  const { guests, updateGuest } = useGuests();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all | checked-in | pending
  
  const total = guests.length;
  const checkedIn = guests.filter(g => g.status === 'confirmed').length;
  const pending = total - checkedIn;
  const percentCheckedIn = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  // Filtro inteligente de busca (ignora acentos e case)
  const normalize = (str) => 
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredGuests = guests.filter(g => {
    const nameMatch = normalize(g.name).includes(normalize(searchQuery));
    const phoneMatch = g.phone.includes(searchQuery);
    const matchesSearch = nameMatch || phoneMatch;

    if (filter === 'checked-in') {
      return matchesSearch && g.status === 'confirmed';
    }
    if (filter === 'pending') {
      return matchesSearch && g.status !== 'confirmed';
    }
    return matchesSearch;
  });

  const handleToggleCheckIn = async (guest) => {
    const newStatus = guest.status === 'confirmed' ? 'pending' : 'confirmed';
    try {
      await updateGuest({
        ...guest,
        status: newStatus
      });
    } catch (error) {
      console.error('Erro ao atualizar check-in:', error);
      toast.error('Erro no Check-in', {
        description: 'Não foi possível atualizar o status. Tente novamente.',
        position: 'top-center'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header Portaria */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 pt-12 pb-8 px-6 text-white text-center relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-xl font-bold flex items-center gap-1.5">
            <Sparkles size={20} className="text-amber-300 animate-pulse" /> Modo Portaria (Gate Desk)
          </h1>
          <div className="w-10 h-10" />
        </div>
        
        <div className="max-w-2xl mx-auto mt-6 z-10 relative">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Recepção & Check-in Rápido
          </h2>
          <p className="mt-4 text-base text-white/80">
            Gerencie a entrada dos convidados em tempo real com busca instantânea e confirmação em um toque.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        {/* Painel de Indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total */}
          <Card className="shadow border-l-4 border-l-violet-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Total de Convidados</p>
                <h3 className="text-3xl font-extrabold mt-1">{total}</h3>
              </div>
              <div className="p-3 bg-violet-50 dark:bg-violet-950/20 rounded-full text-violet-600">
                <Users size={24} />
              </div>
            </CardContent>
          </Card>

          {/* Confirmados / Entraram */}
          <Card className="shadow border-l-4 border-l-green-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Presença Confirmada</p>
                <h3 className="text-3xl font-extrabold mt-1 text-green-600">
                  {checkedIn} <span className="text-sm font-normal text-muted-foreground">({percentCheckedIn}%)</span>
                </h3>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-full text-green-500">
                <UserCheck size={24} />
              </div>
            </CardContent>
          </Card>

          {/* Pendentes / Faltando */}
          <Card className="shadow border-l-4 border-l-amber-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Pendentes na Entrada</p>
                <h3 className="text-3xl font-extrabold mt-1 text-amber-600">{pending}</h3>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-full text-amber-500">
                <Clock size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Busca e Filtros */}
        <Card className="shadow">
          <CardContent className="p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Busque por nome do convidado ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-base"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className="rounded-full text-xs py-1"
              >
                Todos
              </Button>
              <Button
                variant={filter === 'checked-in' ? 'default' : 'outline'}
                onClick={() => setFilter('checked-in')}
                className="rounded-full text-xs py-1 flex items-center gap-1"
              >
                <UserCheck size={14} /> Entraram ({checkedIn})
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                className="rounded-full text-xs py-1 flex items-center gap-1"
              >
                <Clock size={14} /> Pendentes ({pending})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Listagem de Convidados para Portaria */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-foreground">Resultados ({filteredGuests.length})</h3>
            <p className="text-xs text-muted-foreground">Clique no card para confirmar ou reverter a entrada.</p>
          </div>

          <AnimatePresence>
            {filteredGuests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 bg-card rounded-lg border border-dashed shadow-sm"
              >
                <Users className="mx-auto text-zinc-300 h-12 w-12 mb-3" />
                <p className="text-muted-foreground">Nenhum convidado localizado com os filtros aplicados.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredGuests.map(guest => (
                  <motion.div
                    key={guest.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      onClick={() => handleToggleCheckIn(guest)}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-md border-l-4 ${
                        guest.status === 'confirmed'
                          ? 'border-l-green-500 bg-green-50/30 dark:bg-green-950/10'
                          : 'border-l-zinc-300 dark:border-l-zinc-700 bg-card'
                      }`}
                    >
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-base text-foreground flex items-center gap-1.5">
                            {guest.name}
                            {guest.status === 'confirmed' && (
                              <CheckCircle2 size={16} className="text-green-500 fill-green-500/20" />
                            )}
                          </h4>
                          <p className="text-xs text-muted-foreground">{guest.phone || 'Sem telefone'}</p>
                          <p className="text-xs text-foreground/80">
                            Acompanhantes: <strong>{guest.accompany}</strong>
                          </p>
                          {guest.companionNames && guest.companionNames.length > 0 && (
                            <div className="text-[11px] text-muted-foreground mt-1.5 border-t border-border/40 pt-1">
                              <strong>Acompanhantes:</strong> {guest.companionNames.join(', ')}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center">
                          {guest.status === 'confirmed' ? (
                            <div className="bg-green-500 text-white rounded-full p-2">
                              <UserCheck size={20} />
                            </div>
                          ) : (
                            <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-full p-2 group-hover:text-primary-custom">
                              <UserX size={20} />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
