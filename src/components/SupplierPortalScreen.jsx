import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Building, BookOpen, ImageIcon, Briefcase, MapPin, 
  Calendar, DollarSign, Star, BarChart3, Upload, Loader2, Sparkles, Plus, Trash2, CheckCircle2,
  Gift, LogOut, ChevronLeft, ChevronRight, MessageSquare
} from 'lucide-react';
import ChatModule from './ChatModule';
import SupplierLocationTab from './SupplierLocationTab';
import SupplierPricingTab from './SupplierPricingTab';
import SupplierReviewsTab from './SupplierReviewsTab';
import SupplierMetricsTab from './SupplierMetricsTab';
import { toast } from 'sonner';
import NotificationCenter from './NotificationCenter';

const TABS = [
  { id: 'identidade', label: 'Identidade', icon: Building },
  { id: 'descricao', label: 'Descrição', icon: BookOpen },
  { id: 'portfolio', label: 'Portfólio', icon: ImageIcon },
  { id: 'atendimento', label: 'Atendimento', icon: MessageSquare },
  { id: 'localizacao', label: 'Localização', icon: MapPin },
  { id: 'disponibilidade', label: 'Agenda', icon: Calendar },
  { id: 'precos', label: 'Preços', icon: DollarSign },
  { id: 'avaliacoes', label: 'Avaliações', icon: Star },
  { id: 'metricas', label: 'Métricas', icon: BarChart3 },
];

const DIFFERENTIALS_LIST = [
  'Equipe própria', 'Equipamentos próprios', 'Contrato digital',
  'Nota fiscal', 'Atendimento 24h', 'Montagem inclusa',
  'Desmontagem inclusa', 'Seguro de responsabilidade'
];

export default function SupplierPortalScreen({ onBack, onLogout }) {
  const { user, updateUser, logout } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('identidade');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chatRooms, setChatRooms] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Buscar chats para pintar os dias de amarelo (Em negociação)
  useEffect(() => {
    if (activeTab === 'disponibilidade') {
      const loadChats = async () => {
        try {
          const rooms = await api.chat.list();
          setChatRooms(rooms);
        } catch (error) {
          console.error('Erro ao buscar chats para a agenda:', error);
        }
      };
      loadChats();
    }
  }, [activeTab]);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDay }, (_, i) => null);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const toggleDate = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setForm(prev => {
      const list = prev.blockedDates || [];
      if (list.includes(dateStr)) return { ...prev, blockedDates: list.filter(d => d !== dateStr) };
      return { ...prev, blockedDates: [...list, dateStr] };
    });
  };

  const getStatusForDate = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Vermelho (Bloqueado Manualmente)
    if (form.blockedDates?.includes(dateStr)) return 'blocked';
    
    // Amarelo (Em negociação via Chat)
    // Party Date is usually ISO string "2026-06-15T00:00:00.000Z"
    const hasNegotiation = chatRooms.some(room => {
      if (!room.party?.date) return false;
      const pDate = new Date(room.party.date);
      return pDate.getFullYear() === currentMonth.getFullYear() &&
             pDate.getMonth() === currentMonth.getMonth() &&
             pDate.getDate() === day;
    });

    if (hasNegotiation) return 'negotiating';

    // Verde (Livre)
    return 'free';
  };

  // Auto-collapse after 3 minutes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCollapsed(true);
    }, 180000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const [form, setForm] = useState({
    companyName: '',
    cnpj: '',
    category: 'Buffet',
    phone: '',
    city: '',
    description: '',
    coverImage: '',
    logo: '',
    foundationYear: '',
    socials: { instagram: '', facebook: '', tiktok: '', website: '', email: '' },
    differentials: [],
    portfolio: [],
    packages: [],
    locationMap: { radius: '50', cities: [], zipCode: '', address: '', neighborhood: '', city: '', state: '', lat: null, lng: null },
    pricing: { min: '', max: '' },
    blockedDates: [],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
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
          city: myProfile.city || '',
          description: myProfile.description || '',
          coverImage: myProfile.images?.[0] || '',
          
          // Novos campos salvos no backend como JSON
          logo: myProfile.logo || '',
          foundationYear: myProfile.foundationYear || '',
          socials: myProfile.socials || { instagram: '', facebook: '', tiktok: '', website: '', email: '' },
          differentials: myProfile.differentials || [],
          portfolio: myProfile.portfolio || [],
          packages: myProfile.packages || [],
          locationMap: myProfile.locationMap || { radius: '50', cities: [], zipCode: '', address: '', neighborhood: '', city: '', state: '', lat: null, lng: null },
          pricing: myProfile.pricing || { min: '', max: '' },
          blockedDates: myProfile.blockedDates || [],
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do fornecedor:', error);
      toast.error('Não foi possível carregar as informações do fornecedor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e, field, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.loading('Fazendo upload da imagem...', { id: 'upload' });
      const res = await api.upload.file(file);
      const url = res.url;
      
      if (field === 'coverImage') {
        setForm({ ...form, coverImage: url });
      } else if (field === 'logo') {
        setForm({ ...form, logo: url });
      } else if (field === 'portfolio') {
        setForm({ ...form, portfolio: [...form.portfolio, url] });
      } else if (field === 'packageImage' && index !== null) {
        const newPackages = [...form.packages];
        newPackages[index].image = url;
        setForm({ ...form, packages: newPackages });
      }
      
      toast.success('Upload concluído!', { id: 'upload' });
    } catch (err) {
      toast.error('Falha no upload do arquivo.', { id: 'upload' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.phone) {
      toast.warning('Por favor, preencha nome e telefone!', { position: 'top-center' });
      return;
    }

    setIsSubmitting(true);
    try {
      const savedProfile = await api.suppliers.saveProfile({
        companyName: form.companyName.trim(),
        cnpj: form.cnpj.trim(),
        category: form.category,
        phone: form.phone.trim(),
        city: form.city.trim(),
        description: form.description.trim(),
        images: form.coverImage ? [form.coverImage] : [],
        
        logo: form.logo,
        foundationYear: parseInt(form.foundationYear) || null,
        socials: form.socials,
        differentials: form.differentials,
        portfolio: form.portfolio,
        packages: form.packages,
        locationMap: form.locationMap,
        pricing: form.pricing,
        blockedDates: form.blockedDates,
      });

      setProfile(savedProfile);
      updateUser({ role: 'SUPPLIER' });
      toast.success('Perfil atualizado com sucesso! 💼', { position: 'top-center' });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Ocorreu um erro ao salvar o perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDifferential = (diff) => {
    setForm(prev => {
      const list = prev.differentials;
      if (list.includes(diff)) return { ...prev, differentials: list.filter(d => d !== diff) };
      return { ...prev, differentials: [...list, diff] };
    });
  };

  const handleAddPackage = () => {
    setForm({
      ...form,
      packages: [...form.packages, { id: Date.now().toString(), name: '', price: '', description: '', image: '', type: 'Bronze' }]
    });
  };

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
  }

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden font-sans">
      {/* Unified V2 Sidebar */}
      <aside 
        className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out bg-card border-r border-border flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30 shadow-xl`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="w-10 h-10 shrink-0 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Gift size={20} className="text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="font-black text-xl tracking-tight leading-none text-foreground">CELEBRATE</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1 truncate">Party Planner</span>
                </div>
              )}
            </div>
          </div>

          {/* User Profile Info */}
          {!isCollapsed && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-accent border border-border">
                <div className="relative w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] shadow-sm">
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-primary text-[10px] font-black">
                    {user?.name?.substring(0, 2).toUpperCase() || 'SP'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-xs truncate uppercase text-foreground">{user?.name || 'Fornecedor'}</span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Premium Host</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-1 space-y-1 overflow-hidden">
            {!isCollapsed && (
               <div className="px-3 pb-1.5 pt-0.5 flex items-center gap-2 text-muted-foreground">
                 <Building size={12} />
                 <span className="text-[9px] font-bold uppercase tracking-widest">Meu Negócio</span>
               </div>
            )}
            
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={isCollapsed ? tab.label : ''}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-3'} py-2.5 rounded-xl transition-all cursor-pointer ${isActive ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                  {!isCollapsed && <span className="text-[11px] font-bold tracking-wider uppercase whitespace-nowrap">{tab.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-3 border-t border-border flex flex-col gap-1.5">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`w-full flex items-center justify-center py-2 rounded-xl text-muted-foreground hover:bg-muted border border-transparent transition-colors cursor-pointer`}
              title={isCollapsed ? "Expandir" : "Colapsar"}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <button 
              onClick={() => {
                if (onLogout) onLogout();
                else if (logout) logout();
                else if (onBack) onBack();
                else window.location.reload();
              }}
              title={isCollapsed ? "Sair" : ""}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center gap-2'} py-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-border transition-colors cursor-pointer`}
            >
              <LogOut size={14} strokeWidth={1.5} className="shrink-0" />
              {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-wider whitespace-nowrap">Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground">{TABS.find(t => t.id === activeTab)?.label}</h1>
            <p className="text-sm text-muted-foreground font-medium">Configure as informações que os clientes verão no seu perfil.</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationCenter onNavigate={(screen) => setActiveTab(screen === 'supplier-portal' ? 'atendimento' : screen)} />
            {activeTab !== 'atendimento' && (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider text-xs px-6 shadow-xl shadow-primary/20">
                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Salvar Alterações
              </Button>
            )}
          </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto w-full">
          {activeTab === 'identidade' && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-8">
              {/* Cover & Logo Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card border-border/50 shadow-sm rounded-3xl overflow-hidden">
                  <CardHeader className="bg-muted/20 pb-4"><CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Foto de Capa Real</CardTitle></CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center gap-4">
                      {form.coverImage ? (
                        <div className="w-full h-32 rounded-2xl overflow-hidden relative group">
                          <img src={form.coverImage} className="w-full h-full object-cover" alt="Capa" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer text-white font-bold text-xs uppercase bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md border border-white/20">
                              Trocar Capa <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'coverImage')} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="w-full h-32 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors text-primary">
                          <Upload size={24} className="mb-2" />
                          <span className="text-xs font-bold uppercase tracking-widest">Fazer Upload da Capa</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'coverImage')} />
                        </label>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border/50 shadow-sm rounded-3xl overflow-hidden">
                  <CardHeader className="bg-muted/20 pb-4"><CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Logotipo</CardTitle></CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center gap-4">
                      {form.logo ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden relative group border-2 border-border">
                          <img src={form.logo} className="w-full h-full object-cover" alt="Logo" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer text-white">
                              <Upload size={16} /> <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="w-24 h-24 rounded-full border-2 border-dashed border-primary/30 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors text-primary">
                          <Upload size={20} />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                        </label>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Basic Info */}
              <Card className="bg-card border-border/50 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-muted/20 pb-4"><CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Dados Básicos</CardTitle></CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nome Fantasia *</Label>
                    <Input value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} className="h-12 rounded-xl bg-muted/30" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">WhatsApp *</Label>
                    <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="h-12 rounded-xl bg-muted/30" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">CNPJ</Label>
                    <Input value={form.cnpj} onChange={e => setForm({...form, cnpj: e.target.value})} className="h-12 rounded-xl bg-muted/30" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ano de Fundação</Label>
                    <Input type="number" value={form.foundationYear} onChange={e => setForm({...form, foundationYear: e.target.value})} className="h-12 rounded-xl bg-muted/30" />
                  </div>
                </CardContent>
              </Card>

              {/* Differentials */}
              <Card className="bg-card border-border/50 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-muted/20 pb-4"><CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Diferenciais da Empresa</CardTitle></CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DIFFERENTIALS_LIST.map(diff => (
                      <label key={diff} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${form.differentials.includes(diff) ? 'border-primary bg-primary/5 text-primary' : 'border-border/50 hover:bg-muted/50 text-muted-foreground'}`}>
                        <input type="checkbox" className="hidden" checked={form.differentials.includes(diff)} onChange={() => toggleDifferential(diff)} />
                        <span className="w-4 h-4 rounded border flex items-center justify-center shrink-0">
                          {form.differentials.includes(diff) && <CheckCircle2 size={12} />}
                        </span>
                        <span className="text-xs font-bold leading-tight">{diff}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'descricao' && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-6">
              <Card className="bg-card border-border/50 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-muted/20 pb-4"><CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Storytelling (Descrição Premium)</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm text-muted-foreground font-medium">Escreva uma descrição rica que cative o cliente. Conte a história da sua empresa, sua missão e por que o seu serviço é inesquecível.</p>
                  <textarea
                    rows={12}
                    className="w-full border rounded-2xl p-5 bg-muted/10 border-border/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm font-medium shadow-inner transition-all resize-y"
                    placeholder="Há mais de 15 anos transformamos sonhos em experiências inesquecíveis..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'portfolio' && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-6">
              <Card className="bg-card border-border/50 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-muted/20 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Galeria de Fotos do Portfólio</CardTitle>
                  <label className="cursor-pointer bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2">
                    <Upload size={14} /> Adicionar Foto
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'portfolio')} />
                  </label>
                </CardHeader>
                <CardContent className="p-6">
                  {form.portfolio.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-border/60 rounded-2xl bg-muted/20">
                      <ImageIcon size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-sm font-bold text-foreground">Sua galeria está vazia</p>
                      <p className="text-xs text-muted-foreground mt-1">Faça upload das suas melhores fotos de eventos.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {form.portfolio.map((imgUrl, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-border/50">
                          <img src={imgUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <button 
                            type="button"
                            onClick={() => setForm({...form, portfolio: form.portfolio.filter((_, i) => i !== idx)})}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'atendimento' && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-6">
              <ChatModule userRole="SUPPLIER" />
            </motion.div>
          )}

          {activeTab === 'disponibilidade' && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Calendário */}
                <div className="md:col-span-2">
                  <Card className="border-border/50 shadow-xl bg-card rounded-3xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-foreground capitalize">
                          {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-full w-8 h-8"><ChevronLeft size={16}/></Button>
                          <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-full w-8 h-8"><ChevronRight size={16}/></Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                          <div key={d} className="text-center text-[10px] font-black uppercase text-muted-foreground">{d}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {paddingDays.map((_, i) => <div key={`empty-${i}`} className="h-12" />)}
                        {daysArray.map(day => {
                          const status = getStatusForDate(day);
                          let bgClass = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"; // free
                          if (status === 'blocked') bgClass = "bg-rose-500 text-white shadow-md hover:bg-rose-600"; // blocked
                          if (status === 'negotiating') bgClass = "bg-amber-400 text-amber-950 shadow-md hover:bg-amber-500"; // negotiating

                          return (
                            <button
                              key={day}
                              onClick={() => toggleDate(day)}
                              className={`h-12 rounded-xl flex items-center justify-center text-sm font-bold border transition-all cursor-pointer ${bgClass}`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Legenda e Instruções */}
                <div className="space-y-4">
                  <Card className="border-border/50 shadow-md bg-card rounded-3xl">
                    <CardContent className="p-5 space-y-4">
                      <h3 className="font-black text-sm uppercase tracking-wider text-foreground border-b border-border/50 pb-2">Legenda</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 text-[10px] font-bold">L</div>
                          <span className="text-sm font-medium text-muted-foreground">Livre (Disponível)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-md bg-amber-400 border border-amber-500 flex items-center justify-center text-amber-950 text-[10px] font-bold">N</div>
                          <span className="text-sm font-medium text-muted-foreground">Em Negociação (Automático)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-md bg-rose-500 border border-rose-600 flex items-center justify-center text-white text-[10px] font-bold">B</div>
                          <span className="text-sm font-medium text-muted-foreground">Bloqueado (Fechado)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/5 border-primary/20 rounded-3xl">
                    <CardContent className="p-5">
                      <p className="text-xs text-primary font-medium leading-relaxed">
                        <b>Dica de Sucesso:</b> Cancele ou bloqueie as datas em que você já assinou contrato fora da plataforma. Se um cliente tem um Chat aberto com você para um dia livre, ele aparecerá em <span className="text-amber-600 font-bold">Amarelo</span> para alertá-lo.
                      </p>
                    </CardContent>
                  </Card>
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === 'localizacao' && (
            <SupplierLocationTab form={form} setForm={setForm} />
          )}

          {activeTab === 'precos' && (
            <SupplierPricingTab form={form} setForm={setForm} plan={user?.plan} />
          )}

          {activeTab === 'avaliacoes' && (
            <SupplierReviewsTab profile={profile} />
          )}

          {activeTab === 'metricas' && (
            <SupplierMetricsTab profile={profile} />
          )}

        </div>
      </main>
    </div>
  );
}
