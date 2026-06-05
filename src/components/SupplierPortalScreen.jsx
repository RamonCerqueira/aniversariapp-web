import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  CheckCircle2, 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Mail, 
  Loader2, 
  Sparkles, 
  MessageCircle,
  Instagram,
  Settings,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function SupplierPortalScreen({ onBack }) {
  const { user, updateUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('leads');

  const [form, setForm] = useState({
    companyName: '',
    cnpj: '',
    category: 'Buffet',
    phone: '',
    instagram: '',
    city: '',
    capacityMin: '10',
    capacityMax: '1000',
    description: '',
  });

  const categories = ['Buffet', 'Decoração', 'DJ & Som', 'Bartender', 'Fotografia', 'Brinquedos', 'Espaço / Salão', 'Outros'];

  useEffect(() => {
    fetchProfileAndLeads();
  }, []);

  const fetchProfileAndLeads = async () => {
    setIsLoading(true);
    try {
      const myProfile = await api.suppliers.getMyProfile();
      setProfile(myProfile);
      
      if (myProfile) {
        setForm({
          companyName: myProfile.companyName || '',
          cnpj: myProfile.cnpj || '',
          category: myProfile.category || 'Buffet',
          phone: myProfile.phone || '',
          instagram: myProfile.instagram || '',
          city: myProfile.city || '',
          capacityMin: myProfile.capacityMin?.toString() || '10',
          capacityMax: myProfile.capacityMax?.toString() || '1000',
          description: myProfile.description || '',
        });

        // Se o perfil existe, busca os leads recebidos
        const myLeads = await api.leads.getSupplierLeads();
        setLeads(myLeads);
      } else {
        setActiveTab('register');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do fornecedor:', error);
      toast.error('Não foi possível carregar as informações do fornecedor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.phone || !form.city || !form.description) {
      toast.warning('Por favor, preencha todos os campos obrigatórios!', { position: 'top-center' });
      return;
    }

    setIsSubmitting(true);
    try {
      const savedProfile = await api.suppliers.saveProfile({
        companyName: form.companyName.trim(),
        cnpj: form.cnpj.trim(),
        category: form.category,
        phone: form.phone.trim(),
        instagram: form.instagram.trim(),
        city: form.city.trim(),
        capacityMin: parseInt(form.capacityMin) || 0,
        capacityMax: parseInt(form.capacityMax) || 10000,
        description: form.description.trim(),
        images: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=300'] // mock de imagem de portfólio
      });

      setProfile(savedProfile);
      
      // Atualiza o estado do usuário logado (role virou SUPPLIER e plano SUPPLIER_MONTHLY)
      updateUser({ role: 'SUPPLIER', plan: 'SUPPLIER_MONTHLY' });
      
      toast.success(
        profile 
          ? 'Perfil atualizado com sucesso! 💼' 
          : 'Perfil de parceiro ativado com sucesso! 🎉', 
        { position: 'top-center' }
      );
      
      // Busca leads novos
      const myLeads = await api.leads.getSupplierLeads();
      setLeads(myLeads);
      setActiveTab('leads');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Ocorreu um erro ao salvar o perfil de fornecedor.', { position: 'top-center' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      await api.leads.updateStatus(leadId, newStatus);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      toast.success(
        newStatus === 'closed' 
          ? 'Parabéns! Contrato fechado! 🎉' 
          : 'Status de contato atualizado! 👍', 
        { position: 'top-center' }
      );
    } catch (error) {
      console.error('Erro ao atualizar status do lead:', error);
      toast.error('Erro ao atualizar o status da solicitação.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
        <div className="text-center relative z-10 space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
          <p className="text-sm font-semibold text-muted-foreground tracking-wide">Carregando painel do parceiro...</p>
        </div>
      </div>
    );
  }

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
            src="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1200&auto=format&fit=crop" 
            alt="Event Setup Background" 
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
            <ShieldCheck size={20} className="text-secondary animate-pulse" />
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
            {profile ? profile.companyName : 'Portal do Parceiro'}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-3 text-sm sm:text-base text-white/80 max-w-lg mx-auto"
          >
            {profile 
              ? `${profile.category} • Destaque credenciado em ${profile.city}` 
              : 'Ofereça buffet, decoração, brinquedos e fotografia direto para quem está planejando aniversários!'}
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 relative z-10">
        {profile ? (
          // Visualização do Fornecedor Ativo (Abas de Leads e Edição)
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 max-w-md mx-auto bg-muted/80 backdrop-blur border border-border/50 p-1.5 rounded-2xl">
              <TabsTrigger 
                value="leads"
                className="rounded-xl px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md cursor-pointer"
              >
                Oportunidades ({leads.length})
              </TabsTrigger>
              <TabsTrigger 
                value="edit"
                className="rounded-xl px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md cursor-pointer"
              >
                Editar Perfil
              </TabsTrigger>
            </TabsList>

            {/* Aba de Leads */}
            <TabsContent value="leads" className="space-y-4">
              <div className="pb-1">
                <h3 className="text-lg sm:text-xl font-extrabold text-foreground">Solicitações Recebidas</h3>
                <p className="text-xs text-muted-foreground">Novos leads interessados em contratar seus serviços no Celebrate!</p>
              </div>
              
              {leads.length === 0 ? (
                <Card className="border-dashed border-2 border-border/60 p-12 text-center bg-card/30 rounded-3xl shadow-inner max-w-md mx-auto">
                  <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border/30 text-muted-foreground/50">
                    <Briefcase size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-foreground/80 mb-1">Nenhum orçamento recebido</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Seu perfil profissional está ativo e visível na busca de fornecedores! Avisaremos assim que receber novas cotações.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {leads.map(lead => {
                    const party = lead.party;
                    const eventDate = party?.date ? new Date(party.date) : null;
                    const leadWhatsAppUrl = `https://api.whatsapp.com/send?phone=${lead.party?.user?.phone || '55'}&text=${encodeURIComponent(
                      `Olá! Recebi sua solicitação de orçamento pelo Celebrate! para o evento "${party?.name}". Vamos fechar os detalhes?`
                    )}`;

                    return (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className={`shadow-md border border-border/50 bg-card/90 backdrop-blur-sm rounded-2xl overflow-hidden relative ${
                          lead.status === 'closed' ? 'bg-emerald-500/[0.01]' : ''
                        }`}>
                          <div className={`absolute top-0 left-0 w-1.5 h-full ${
                            lead.status === 'closed' 
                              ? 'bg-emerald-500' 
                              : lead.status === 'contacted' 
                              ? 'bg-indigo-500' 
                              : 'bg-amber-500'
                          }`} />
                          
                          <CardContent className="p-5 sm:p-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                              <div className="space-y-3 flex-1">
                                <span className={`inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                  lead.status === 'closed' 
                                    ? 'bg-emerald-500/10 text-emerald-600' 
                                    : lead.status === 'contacted' 
                                    ? 'bg-indigo-500/10 text-indigo-600' 
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    lead.status === 'closed' ? 'bg-emerald-500 animate-pulse' :
                                    lead.status === 'contacted' ? 'bg-indigo-500' : 'bg-amber-500'
                                  }`} />
                                  {lead.status === 'closed' ? 'Contrato Fechado' : lead.status === 'contacted' ? 'Contato Feito' : 'Pendente'}
                                </span>
                                
                                <h4 className="text-lg font-extrabold text-foreground leading-tight">
                                  {party?.name || 'Festa de Aniversário'}
                                </h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-1 border-t border-border/30 text-xs sm:text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <User size={15} className="mr-2 text-primary" />
                                    <span>Cliente: <strong className="text-foreground">{party?.user?.name || 'Usuário'}</strong></span>
                                  </div>
                                  {eventDate && (
                                    <div className="flex items-center">
                                      <Calendar size={15} className="mr-2 text-secondary" />
                                      <span>Data: <strong className="text-foreground">{eventDate.toLocaleDateString('pt-BR')}</strong></span>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <MapPin size={15} className="mr-2 text-amber-500" />
                                    <span>Local: {party?.location}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MessageCircle size={15} className="mr-2 text-indigo-500" />
                                    <span>Tamanho: {party?.guestCount || 0} convidados</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-border/40">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 w-full">
                                  <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-1.5 py-5.5 text-xs font-bold rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer">
                                    <a href={leadWhatsAppUrl} target="_blank" rel="noreferrer" onClick={() => handleUpdateLeadStatus(lead.id, 'contacted')}>
                                      <Phone size={15} /> Contatar WhatsApp
                                    </a>
                                  </Button>
                                </motion.div>
                                
                                {lead.status !== 'closed' && (
                                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 w-full">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateLeadStatus(lead.id, 'closed')}
                                      className="w-full text-xs font-bold py-5.5 rounded-xl border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/30 cursor-pointer"
                                    >
                                      <CheckCircle size={13} /> Fechar Contrato
                                    </Button>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Aba de Edição do Perfil */}
            <TabsContent value="edit">
              <Card className="shadow-lg border border-border/50 bg-card/85 backdrop-blur-md rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
                    <Settings size={20} className="text-primary" /> Configurações do Portfólio
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Atualize seus dados profissionais para manter atração máxima.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="companyName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome do Negócio / Razão Social *</Label>
                        <Input
                          id="companyName"
                          placeholder="Ex: Buffet Estrela Guia Ltda"
                          value={form.companyName}
                          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                          required
                          className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="cnpj" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CNPJ (opcional)</Label>
                        <Input
                          id="cnpj"
                          placeholder="Ex: 00.000.000/0001-00"
                          value={form.cnpj}
                          onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                          className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoria do Serviço *</Label>
                        <select
                          id="category"
                          className="w-full h-[42px] border rounded-xl px-3 bg-background border-border/80 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium cursor-pointer transition-all shadow-sm"
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Celular WhatsApp *</Label>
                        <Input
                          id="phone"
                          placeholder="Ex: 11999999999"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          required
                          className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="instagram" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Instagram (opcional)</Label>
                        <div className="relative">
                          <Instagram size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                          <Input
                            id="instagram"
                            placeholder="Ex: @buffet_estrela"
                            value={form.instagram}
                            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                            className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5 pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cidade Principal *</Label>
                        <Input
                          id="city"
                          placeholder="Ex: São Paulo"
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          required
                          className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="capacityMin" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capac. Mín</Label>
                          <Input
                            id="capacityMin"
                            type="number"
                            placeholder="10"
                            value={form.capacityMin}
                            onChange={(e) => setForm({ ...form, capacityMin: e.target.value })}
                            className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="capacityMax" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capac. Máx</Label>
                          <Input
                            id="capacityMax"
                            type="number"
                            placeholder="1000"
                            value={form.capacityMax}
                            onChange={(e) => setForm({ ...form, capacityMax: e.target.value })}
                            className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição do Serviço *</Label>
                      <textarea
                        id="description"
                        rows={4}
                        className="w-full border rounded-xl p-3 bg-background border-border/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm font-medium shadow-sm transition-all"
                        placeholder="Descreva o que seu serviço oferece, diferenciais, etc."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        required
                      />
                    </div>

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2">
                      <Button type="submit" disabled={isSubmitting} className="w-full py-6 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider shadow-md shadow-primary/10">
                        {isSubmitting ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="animate-spin h-3.5 w-3.5" />
                            Salvando...
                          </span>
                        ) : 'Salvar Alterações'}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Formulário de Cadastro do Fornecedor (Caso não possua perfil ativo)
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="max-w-2xl mx-auto shadow-xl border border-border/50 bg-card/85 backdrop-blur-md rounded-3xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-black flex items-center justify-center gap-1.5 text-primary">
                  <Sparkles size={24} className="text-secondary animate-bounce-slow" /> Ative seu Negócio
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm pt-1">
                  Divulgue seus serviços de buffet, brinquedos, bar ou fotografia direto para organizadores ativos no Celebrate!.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="companyName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome do Negócio / Razão Social *</Label>
                      <Input
                        id="companyName"
                        placeholder="Ex: Buffet Estrela Guia Ltda"
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                        required
                        className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="cnpj" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CNPJ (opcional)</Label>
                      <Input
                        id="cnpj"
                        placeholder="Ex: 00.000.000/0001-00"
                        value={form.cnpj}
                        onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                        className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoria do Serviço *</Label>
                      <select
                        id="category"
                        className="w-full h-[42px] border rounded-xl px-3 bg-background border-border/80 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium cursor-pointer transition-all"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Telefone WhatsApp *</Label>
                      <Input
                        id="phone"
                        placeholder="Ex: 11999999999"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                        className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="instagram" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Instagram (opcional)</Label>
                      <div className="relative">
                        <Instagram size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                        <Input
                          id="instagram"
                          placeholder="Ex: @buffet_estrela"
                          value={form.instagram}
                          onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                          className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5 pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cidade Principal *</Label>
                      <Input
                        id="city"
                        placeholder="Ex: São Paulo"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        required
                        className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="capacityMin" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capac. Mín</Label>
                        <Input
                          id="capacityMin"
                          type="number"
                          placeholder="10"
                          value={form.capacityMin}
                          onChange={(e) => setForm({ ...form, capacityMin: e.target.value })}
                          className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="capacityMax" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capac. Máx</Label>
                        <Input
                          id="capacityMax"
                          type="number"
                          placeholder="1000"
                          value={form.capacityMax}
                          onChange={(e) => setForm({ ...form, capacityMax: e.target.value })}
                          className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição do Serviço *</Label>
                    <textarea
                      id="description"
                      rows={4}
                      className="w-full border rounded-xl p-3 bg-background border-border/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm font-medium shadow-sm transition-all"
                      placeholder="Descreva o que seu serviço oferece, especialidades, etc."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      required
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2">
                    <Button type="submit" disabled={isSubmitting} className="w-full py-6 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md shadow-primary/10 cursor-pointer">
                      {isSubmitting ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="animate-spin h-3.5 w-3.5" />
                          Ativando...
                        </span>
                      ) : 'Ativar Meu Negócio no App'}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
