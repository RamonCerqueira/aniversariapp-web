import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api.js';
import { useParty } from '../contexts/PartyContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Search, 
  Phone, 
  Send, 
  Sparkles, 
  SlidersHorizontal, 
  Loader2, 
  Briefcase,
  MapPin,
  Users,
  Compass
} from 'lucide-react';
import { toast } from 'sonner';

export default function SupplierSearchScreen({ onBack }) {
  const { parties, currentParty } = useParty();
  
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(null);
  
  const [selectedPartyId, setSelectedPartyId] = useState(currentParty?.id || '');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: '',
    city: '',
    capacity: '',
  });

  const categories = ['Buffet', 'Decoração', 'DJ & Som', 'Bartender', 'Fotografia', 'Brinquedos', 'Espaço / Salão', 'Outros'];

  useEffect(() => {
    fetchSuppliers();
  }, [filters]);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await api.suppliers.getAll(filters);
      setSuppliers(data);
    } catch (error) {
      console.error('Erro ao buscar fornecedores da API:', error);
      toast.error('Erro ao carregar lista de fornecedores.', { position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestQuote = async (supplier) => {
    if (!selectedPartyId) {
      toast.warning('Por favor, selecione uma festa ativa como referência!', { position: 'top-center' });
      return;
    }

    const party = parties.find(p => p.id === selectedPartyId);
    if (!party) return;

    setIsRequesting(supplier.id);
    try {
      // 1. Registra o Lead físico no banco de dados PostgreSQL
      await api.leads.create(party.id, supplier.id);

      // 2. Formata mensagem preenchida para o WhatsApp do Fornecedor
      const dateText = party.date ? new Date(party.date).toLocaleDateString('pt-BR') : '';
      const textMessage = `Olá ${supplier.companyName}! Encontrei seu portfólio no Celebrate! e gostaria de solicitar um orçamento para o meu evento "${party.name}".
📅 Data: ${dateText}
📍 Local: ${party.location}
👥 Convidados: ${party.guestCount || 'Não informado'} pessoas.
Aguardo seu retorno com orçamento!`;

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${supplier.phone}&text=${encodeURIComponent(textMessage)}`;
      
      toast.success('Solicitação registrada! Abrindo WhatsApp do fornecedor... 🚀', { position: 'top-center' });
      
      // 3. Redireciona para o WhatsApp
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);
    } catch (error) {
      console.error('Erro ao registrar lead:', error);
      toast.error('Não foi possível enviar a solicitação. Tente novamente.', { position: 'top-center' });
    } finally {
      setIsRequesting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-primary/10 dark:bg-primary/5 blur-[80px] md:blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] rounded-full bg-secondary/10 dark:bg-secondary/5 blur-[80px] md:blur-[150px] pointer-events-none z-0" />

      {/* Header Container with Beautiful Themed Background Image */}
      <div className="relative z-10 overflow-hidden text-white pt-14 pb-12 px-6 shadow-xl border-b border-zinc-800/80">
        {/* Background Image with dark blurred overlay for maximum premium feel */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop" 
            alt="Suppliers Directory Background" 
            className="w-full h-full object-cover scale-105 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-zinc-950/75 bg-gradient-to-r from-zinc-950/90 via-zinc-950/70 to-zinc-950/40" />
          <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:16px_16px]" />
        </div>
        <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/10 rounded-full w-10 h-10 border border-white/10 backdrop-blur-sm"
            >
              <ArrowLeft size={20} />
            </Button>
          </motion.div>
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-secondary animate-pulse" />
            <h1 className="text-sm font-bold uppercase tracking-widest text-white/90">Celebrate!</h1>
          </div>
          <div className="w-10 h-10" />
        </div>
        
        <div className="max-w-3xl mx-auto mt-8 text-center z-10 relative">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
          >
            Diretório de Fornecedores
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-3 text-sm sm:text-base text-white/80 max-w-lg mx-auto"
          >
            Encontre, analise e solicite orçamentos diretos pelo WhatsApp com os melhores profissionais de festas.
          </motion.p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8 space-y-6 relative z-10">
        {/* Painel de Escolha de Festa */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="shadow-lg border border-border/50 bg-card/85 backdrop-blur-md rounded-2xl">
            <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-bold flex items-center justify-center sm:justify-start gap-1.5 text-primary text-sm uppercase tracking-wider">
                  <Sparkles size={16} className="text-secondary animate-spin-slow" /> Festa Ativa de Referência
                </h4>
                <p className="text-xs text-muted-foreground">
                  Os detalhes desta festa serão integrados à sua mensagem de solicitação automática.
                </p>
              </div>
              
              {parties.length === 0 ? (
                <span className="text-xs text-destructive font-bold bg-destructive/10 px-3.5 py-1.5 rounded-full border border-destructive/20">
                  Crie sua primeira festa para cotar!
                </span>
              ) : (
                <select
                  className="w-full sm:w-72 border border-border/60 rounded-xl px-4 py-2.5 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer shadow-inner font-medium"
                  value={selectedPartyId}
                  onChange={(e) => setSelectedPartyId(e.target.value)}
                >
                  <option value="">Selecione uma festa...</option>
                  {parties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({new Date(p.date).toLocaleDateString('pt-BR')})
                    </option>
                  ))}
                </select>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Barra de Filtros */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-lg font-extrabold text-foreground">Parceiros Credenciados</h3>
              <p className="text-xs text-muted-foreground">Exibindo {suppliers.length} fornecedores qualificados</p>
            </div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 text-xs font-bold rounded-xl border-border px-3.5 py-4 cursor-pointer"
              >
                <SlidersHorizontal size={14} className="text-primary" /> 
                {showFilters ? 'Ocultar Filtros' : 'Filtrar Busca'}
              </Button>
            </motion.div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Card className="bg-card/90 backdrop-blur-sm p-5 rounded-2xl border border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-md">
                  <div className="space-y-1.5">
                    <Label htmlFor="filter-cat" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoria</Label>
                    <select
                      id="filter-cat"
                      className="w-full h-[42px] border rounded-xl px-3 bg-background border-border/80 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium cursor-pointer transition-all"
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    >
                      <option value="">Todas</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="filter-city" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cidade</Label>
                    <Input
                      id="filter-city"
                      placeholder="Ex: São Paulo"
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="filter-capacity" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capacidade Mínima (Convidados)</Label>
                    <Input
                      id="filter-capacity"
                      type="number"
                      placeholder="Ex: 100"
                      value={filters.capacity}
                      onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
                      className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                    />
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Resultados */}
        {isLoading ? (
          <div className="text-center py-16 bg-card/40 border border-border/30 rounded-2xl">
            <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold">Buscando melhores fornecedores...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="border-dashed border-2 border-border/60 p-12 text-center bg-card/30 rounded-2xl shadow-inner max-w-lg mx-auto">
            <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border/30 text-muted-foreground/50">
              <Briefcase size={24} />
            </div>
            <h4 className="text-sm font-bold text-foreground/80 mb-1">Nenhum fornecedor encontrado</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Tente redefinir ou limpar seus critérios de filtragem acima para ver mais parceiros de eventos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suppliers.map((supplier, idx) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <Card className="h-full flex flex-col justify-between overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-border/50 bg-card/90 backdrop-blur-sm rounded-2xl relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 to-secondary/30" />
                  
                  <CardHeader className="bg-muted/10 pb-4 pt-5 px-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">
                        {supplier.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold flex items-center bg-muted px-2.5 py-1 rounded-full border border-border/20">
                        <MapPin size={11} className="mr-1 text-secondary animate-pulse" /> {supplier.city}
                      </span>
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-extrabold mt-3 text-foreground">{supplier.companyName}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Users size={12} className="text-primary" />
                      <span>Capacidade: <strong>{supplier.capacityMin} a {supplier.capacityMax} convidados</strong></span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-6 flex-1 pt-4">
                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-3">
                      {supplier.description}
                    </p>
                  </CardContent>

                  <div className="p-5 border-t border-border/40 bg-muted/20 flex gap-2">
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="flex-1">
                      <Button 
                        onClick={() => handleRequestQuote(supplier)}
                        disabled={isRequesting !== null}
                        className="w-full bg-primary hover:bg-primary/95 text-white flex items-center justify-center gap-2 py-5 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer uppercase tracking-wider"
                      >
                        {isRequesting === supplier.id ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <>
                            <Send size={13} className="animate-pulse" /> Solicitar Orçamento Grátis
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
