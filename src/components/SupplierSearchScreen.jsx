import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api.js';
import { useParty } from '../contexts/PartyContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Search, SlidersHorizontal, Star, MapPin, Users, Phone, ArrowRight,
  Filter, X, Sparkles, AlertCircle, Loader2, Navigation, ArrowLeft, Compass, Send, Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import SupplierProfileView from './SupplierProfileView.jsx';

export default function SupplierSearchScreen({ onBack, onGoToMessages }) {
  const { parties, currentParty } = useParty();
  
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(null);
  
  const [selectedPartyId, setSelectedPartyId] = useState(currentParty?.id || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSupplierForView, setSelectedSupplierForView] = useState(null);

  // Geolocation states
  const [userLocation, setUserLocation] = useState(null);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

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

  // Helper de Haversine
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return (R * c); 
  };

  const handleGetLocation = () => {
    setIsGpsLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada pelo seu navegador.');
      setIsGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        toast.success('Buscando fornecedores próximos a você! 📍');
        setIsGpsLoading(false);
      },
      (error) => {
        toast.error('Erro ao obter GPS. Verifique as permissões.');
        setIsGpsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Process and sort suppliers
  const processedSuppliers = suppliers.map(s => {
    const dist = userLocation && s.locationMap?.lat 
      ? calculateDistance(userLocation.lat, userLocation.lng, s.locationMap.lat, s.locationMap.lng) 
      : null;
    return { ...s, distance: dist };
  }).sort((a, b) => {
    if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
    if (a.distance !== null) return -1;
    if (b.distance !== null) return 1;
    return 0;
  });

  const handleRequestQuote = async (supplier) => {
    if (!selectedPartyId) {
      toast.warning('Por favor, selecione uma festa ativa como referência!', { position: 'top-center' });
      return;
    }

    const party = parties.find(p => p.id === selectedPartyId);
    if (!party) return;

    setIsRequesting(supplier.id);
    try {
      await api.leads.create(party.id, supplier.id);
      const dateText = party.date ? new Date(party.date).toLocaleDateString('pt-BR') : '';
      const textMessage = `Olá ${supplier.companyName}! Encontrei seu portfólio no Celebrate! e gostaria de solicitar um orçamento para o meu evento "${party.name}".
📅 Data: ${dateText}
📍 Local: ${party.location}
👥 Convidados: ${party.guestCount || 'Não informado'} pessoas.
Aguardo seu retorno com orçamento!`;

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${supplier.phone}&text=${encodeURIComponent(textMessage)}`;
      
      toast.success('Solicitação de orçamento enviada com sucesso! O fornecedor entrará em contato.');
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);
    } catch (error) {
      console.error('Erro ao solicitar orçamento:', error);
      toast.error('Ocorreu um erro ao enviar a solicitação. Tente novamente mais tarde.');
    } finally {
      setIsRequesting(null);
    }
  };

  if (selectedSupplierForView) {
    return (
      <SupplierProfileView 
        supplier={selectedSupplierForView} 
        onBack={() => setSelectedSupplierForView(null)} 
        onRequestQuote={handleRequestQuote}
        onGoToMessages={onGoToMessages}
        selectedPartyId={selectedPartyId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-primary/10 dark:bg-primary/5 blur-[80px] md:blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] rounded-full bg-secondary/10 dark:bg-secondary/5 blur-[80px] md:blur-[150px] pointer-events-none z-0" />

      <div className="relative z-10 pt-10 pb-10 px-6 border-b border-border/40 shadow-sm overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop" 
            alt="Background" 
            className="w-full h-full object-cover opacity-[0.08] mix-blend-multiply dark:mix-blend-lighten dark:opacity-[0.15]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background/95 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-[60px] pointer-events-none z-0" />
        <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-foreground hover:bg-muted rounded-full w-10 h-10 border border-border/50 bg-background/50 backdrop-blur-sm"
            >
              <ArrowLeft size={20} />
            </Button>
          </motion.div>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full">
            <Compass size={16} strokeWidth={2.5} className="text-primary" />
            <h1 className="text-[10px] font-black uppercase tracking-widest text-primary">Diretório</h1>
          </div>
          <div className="w-10 h-10" />
        </div>
        
        <div className="max-w-3xl mx-auto mt-6 text-center z-10 relative">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-black tracking-tight text-foreground"
          >
            Diretório de Fornecedores
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-3 text-sm font-semibold text-muted-foreground max-w-lg mx-auto"
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
                <div className="w-full sm:w-72">
                  <Select value={selectedPartyId} onValueChange={setSelectedPartyId}>
                    <SelectTrigger className="w-full border border-border/60 rounded-xl px-4 py-2.5 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner font-medium h-[42px]">
                      <SelectValue placeholder="Selecione uma festa..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" disabled>Selecione uma festa...</SelectItem>
                      {parties.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({new Date(p.date).toLocaleDateString('pt-BR')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                <Card className="bg-card/90 backdrop-blur-sm p-5 rounded-2xl border border-border/50 grid grid-cols-1 sm:grid-cols-4 gap-4 shadow-md">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Localização</Label>
                    <Button 
                      onClick={handleGetLocation}
                      disabled={isGpsLoading}
                      variant={userLocation ? "default" : "outline"}
                      className={`w-full h-[42px] rounded-xl flex items-center justify-center gap-2 font-bold text-xs border-border/80 ${userLocation ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg' : ''}`}
                    >
                      {isGpsLoading ? <Loader2 className="animate-spin" size={14} /> : <Navigation size={14} />}
                      {userLocation ? 'Perto de Mim (Ativo)' : 'Buscar Perto de Mim'}
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="filter-cat" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoria</Label>
                    <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                      <SelectTrigger className="w-full h-[42px] border rounded-xl px-3 bg-background border-border/80 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium transition-all shadow-sm">
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                  {/* Card Actions */}
                  <div className="p-4 border-t border-border/50 bg-muted/20 flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedSupplierForView(supplier)}
                      className="flex-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-border/60 hover:bg-muted"
                    >
                      Ver Perfil
                    </Button>
                    <Button 
                      onClick={() => handleRequestQuote(supplier)}
                      disabled={isRequesting === supplier.id}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-premium-hover transition-all text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 group"
                    >
                      {isRequesting === supplier.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> 
                          Orçamento
                        </>
                      )}
                    </Button>
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
