import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, MapPin, Phone, Instagram, CheckCircle2, 
  Users, Sparkles, Heart, Share2, Calendar, LayoutGrid, CheckCircle,
  Star, DollarSign, Package, ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api.js';

export default function SupplierProfileView({ supplier, onBack, onRequestQuote, onGoToMessages, selectedPartyId }) {
  const [simulatorData, setSimulatorData] = useState({ date: '', city: '', guests: '' });
  const [matchScore, setMatchScore] = useState(null);
  const [isStartingChat, setIsStartingChat] = useState(false);

  useEffect(() => {
    if (supplier?.id) {
      api.suppliers.incrementView(supplier.id).catch(console.error);
    }
  }, [supplier?.id]);

  if (!supplier) return null;

  // Mescla o portfólio salvo no BD com imagens vazias se não houver 5 imagens
  const images = [];
  const coverImage = supplier.images?.[0] || null;
  images.push(coverImage);
  
  const savedPortfolio = Array.isArray(supplier.portfolio) ? supplier.portfolio : [];
  for (let i = 0; i < 4; i++) {
    images.push(savedPortfolio[i] || null);
  }

  const handleSimulate = () => {
    if (!simulatorData.date || !simulatorData.city || !simulatorData.guests) {
      toast.warning('Preencha todos os campos do simulador para calcular o Match.');
      return;
    }

    // Verifica se a data está bloqueada
    if (supplier.blockedDates && supplier.blockedDates.includes(simulatorData.date)) {
      setMatchScore('INDISPONÍVEL');
      return;
    }

    let score = 50; // Base score (data livre)
    
    // Verifica cidade
    if (supplier.city && simulatorData.city.toLowerCase().trim() === supplier.city.toLowerCase().trim()) {
      score += 30;
    }

    // Verifica capacidade
    const convidados = parseInt(simulatorData.guests);
    if (convidados > supplier.capacityMax) {
      toast.error(`Capacidade Máxima do fornecedor excedida (${supplier.capacityMax}).`);
      score -= 20;
    } else if (supplier.capacityMin && convidados < supplier.capacityMin) {
      toast.warning(`Fornecedor atende a partir de ${supplier.capacityMin} convidados.`);
      score -= 10;
    } else {
      score += 20;
    }

    setMatchScore(Math.max(0, Math.min(100, score)));
  };

  const packages = Array.isArray(supplier.packages) && supplier.packages.length > 0 
    ? supplier.packages 
    : [];

  const differentials = Array.isArray(supplier.differentials) && supplier.differentials.length > 0
    ? supplier.differentials 
    : [];

  // Helper para mostrar preço principal
  const getPricingLabel = () => {
    const min = supplier.pricing?.min;
    const max = supplier.pricing?.max;
    const format = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100);

    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `A partir de ${format(min)}`;
    return 'Preço Sob Consulta';
  };

  const handleStartChat = async () => {
    if (!selectedPartyId) {
      toast.warning('Por favor, selecione uma festa ativa no Diretório antes de iniciar o chat!');
      return;
    }
    
    setIsStartingChat(true);
    try {
      await api.chat.start(selectedPartyId, supplier.id);
      toast.success('Chat iniciado! Redirecionando para suas mensagens...');
      if (onGoToMessages) {
        onGoToMessages();
      }
    } catch (error) {
      toast.error('Erro ao iniciar chat interno.');
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative font-sans">
      
      {/* HEADER FIXO */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="rounded-full flex items-center gap-2">
          <ArrowLeft size={18} /> Voltar à Busca
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full"><Share2 size={16} /></Button>
          <Button variant="outline" size="icon" className="rounded-full text-rose-500 hover:text-rose-600 hover:bg-rose-50"><Heart size={16} /></Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-6">
        
        {/* TITULO E AVALIAÇÕES ACIMA DO GRID */}
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground flex items-center gap-3">
            {supplier.companyName} 
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full uppercase tracking-widest border border-primary/20 flex items-center gap-1">
              <CheckCircle2 size={12} /> Verificado
            </span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-muted-foreground">
            <span className="flex items-center gap-1 text-primary"><Sparkles size={16} /> Novo na Plataforma</span>
            <span className="flex items-center gap-1"><MapPin size={16} /> {supplier.city} • Atende até {supplier.locationMap?.radius || 50}km</span>
            <span className="flex items-center gap-1"><Users size={16} /> Capacidade: {supplier.capacityMax}</span>
            <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-500/20 font-black">
              <DollarSign size={14} /> {getPricingLabel()}
            </span>
          </div>
        </div>

        {/* HERO MASONRY GRID (Estilo Airbnb) */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-12">
          {/* Imagem Principal */}
          <div className="col-span-1 md:col-span-2 row-span-2 rounded-3xl overflow-hidden relative group bg-muted border border-border/50">
            {images[0] ? (
              <img src={images[0]} alt="Capa" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
                <ImageIcon size={48} className="mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest">Em Construção</span>
              </div>
            )}
          </div>
          
          {/* Grid Secundário */}
          {images.slice(1).map((img, i) => (
            <div key={i} className={`rounded-3xl overflow-hidden relative group bg-muted border border-border/50 ${i === 3 ? 'hidden md:block' : ''}`}>
              {img ? (
                <img src={img} alt={`Portfólio ${i+1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 min-h-[150px]">
                  <ImageIcon size={24} className="mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Aguardando</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LADO ESQUERDO: CONTEÚDO */}
          <div className="lg:col-span-2 space-y-12 pb-12 border-b border-border">
            
            <section>
              <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                <Sparkles size={24} className="text-primary" /> Sobre a Empresa
              </h2>
              <div className="text-base text-foreground/80 leading-relaxed font-medium whitespace-pre-line">
                {supplier.description || "Há muitos anos transformando sonhos em realidade. Compromisso com a excelência."}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black mb-4">Diferenciais</h2>
              {differentials.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {differentials.map((diff, i) => (
                    <div key={i} className="flex items-center gap-3 bg-card border border-border/50 p-4 rounded-2xl shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                        <CheckCircle size={16} />
                      </div>
                      <span className="text-sm font-bold text-foreground">{diff}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-border/60 rounded-3xl bg-muted/10">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Diferenciais em construção</span>
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                <Package size={24} className="text-primary" /> Pacotes Disponíveis
              </h2>
              {packages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {packages.map((pkg, i) => (
                    <div key={pkg.id || i} className="flex flex-col p-6 border border-border/60 rounded-3xl bg-card shadow-sm hover:shadow-xl transition-shadow group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none z-0" />
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">
                              {pkg.type || 'Pacote'}
                            </span>
                            <h3 className="text-lg font-black text-foreground mt-2 leading-tight">{pkg.name}</h3>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          {pkg.price ? (
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-bold text-muted-foreground">R$</span>
                              <span className="text-3xl font-black text-foreground tracking-tight">{(pkg.price / 100).toFixed(2).replace('.', ',')}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">Sob Consulta</span>
                          )}
                        </div>

                        <div className="text-sm text-foreground/80 font-medium leading-relaxed whitespace-pre-line flex-1 mb-6 bg-muted/30 p-4 rounded-2xl border border-border/50">
                          {pkg.description}
                        </div>

                        <Button variant="outline" className="w-full rounded-xl font-bold uppercase tracking-wider text-xs border-primary/20 text-primary hover:bg-primary/5 mt-auto">
                          Solicitar este pacote
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-border/60 rounded-3xl bg-muted/10">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Pacotes em construção</span>
                  <p className="text-xs text-muted-foreground mt-2">O fornecedor ainda não listou pacotes fixos. Mande uma mensagem para negociar!</p>
                </div>
              )}
            </section>
          </div>

          {/* LADO DIREITO: STICKY CARD & SIMULATOR */}
          <div className="relative">
            <div className="sticky top-28 space-y-6">
              
              {/* Card Simulador de Evento */}
              <Card className="bg-primary/5 border border-primary/20 shadow-lg rounded-[2rem] overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={20} className="text-primary" />
                    <h3 className="font-black text-lg text-foreground">Simulador de Evento</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-6 font-medium">Descubra se este fornecedor é o Match perfeito para o seu evento.</p>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Data do Evento</Label>
                      <Input type="date" value={simulatorData.date} onChange={e=>setSimulatorData({...simulatorData, date:e.target.value})} className="h-10 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cidade</Label>
                        <Input placeholder="Ex: Salvador" value={simulatorData.city} onChange={e=>setSimulatorData({...simulatorData, city:e.target.value})} className="h-10 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Convidados</Label>
                        <Input type="number" placeholder="150" value={simulatorData.guests} onChange={e=>setSimulatorData({...simulatorData, guests:e.target.value})} className="h-10 rounded-xl" />
                      </div>
                    </div>
                    
                    {!matchScore ? (
                      <Button onClick={handleSimulate} className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest rounded-xl mt-2 shadow-md">
                        Calcular Compatibilidade
                      </Button>
                    ) : matchScore === 'INDISPONÍVEL' ? (
                      <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                        <div className="text-xl font-black text-rose-600 mb-1">INDISPONÍVEL</div>
                        <p className="text-[10px] text-rose-600/80 mt-1 font-medium">O fornecedor já possui evento nesta data e bloqueou a agenda.</p>
                      </motion.div>
                    ) : (
                      <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <div className="text-3xl font-black text-emerald-600 mb-1">{matchScore}%</div>
                        <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Excelente Match!</div>
                        <p className="text-[10px] text-emerald-600/80 mt-1 font-medium">Este fornecedor tem capacidade, atende a região e costuma ter disponibilidade na época.</p>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Card de Contato */}
              <Card className="bg-card border-border/60 shadow-2xl rounded-[2rem]">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div>
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">A partir de</div>
                    <div className="text-2xl font-black text-foreground">R$ 5.000 <span className="text-sm font-medium text-muted-foreground normal-case tracking-normal">/evento</span></div>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <Button onClick={() => onRequestQuote(supplier)} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2">
                      <Phone size={18} /> Iniciar Orçamento
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleStartChat}
                      disabled={isStartingChat}
                      className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs border-border/80"
                    >
                      {isStartingChat ? 'Iniciando...' : 'Enviar Mensagem Interna'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
