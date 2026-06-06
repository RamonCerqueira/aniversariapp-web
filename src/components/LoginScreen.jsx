import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Gift, 
  User, 
  Mail, 
  Calendar, 
  ArrowRight,
  Briefcase, 
  Building,
  Phone,
  MapPin,
  Instagram,
  AlignLeft,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import AnimatedLogo from './AnimatedLogo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LoginScreen({ onLoginSuccess }) {
  const { loginUser, registerUser } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isSupplierSignup, setIsSupplierSignup] = useState(false);
  const [supplierStep, setSupplierStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Login Form
  const [loginForm, setLoginForm] = useState({
    email: '', birthDate: '',
  });

  // Organizer Form
  const [organizerForm, setOrganizerForm] = useState({
    name: '', email: '', birthDate: '',
  });

  // Supplier Form
  const [supplierForm, setSupplierForm] = useState({
    name: '', email: '', birthDate: '', companyName: '', cnpj: '',
    category: 'Buffet', otherCategory: '', phone: '', instagram: '', city: '', description: '',
  });

  const categories = ['Buffet', 'Decoração', 'DJ & Som', 'Bartender', 'Fotografia', 'Brinquedos', 'Espaço / Salão', 'Outros'];

  const validateOrganizerForm = () => {
    const newErrors = {};
    if (!organizerForm.name.trim()) newErrors.name = 'Obrigatório';
    if (!organizerForm.email.trim()) newErrors.email = 'Obrigatório';
    if (!organizerForm.birthDate.trim()) newErrors.birthDate = 'Obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDirectLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email.trim() || !loginForm.birthDate.trim()) {
      toast.error('Preencha os campos de login.');
      return;
    }
    setIsLoading(true);
    try {
      await loginUser(loginForm.email.trim(), new Date(loginForm.birthDate));
      toast.success('Bem-vindo de volta! 🎉', { position: 'top-center' });
      onLoginSuccess();
    } catch (error) {
      toast.error(error.message || 'Credenciais inválidas.', { position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrganizerLogin = async (e) => {
    e.preventDefault();
    if (!validateOrganizerForm()) return;
    setIsLoading(true);
    try {
      await registerUser({
        name: organizerForm.name.trim(),
        email: organizerForm.email.trim(),
        birthDate: new Date(organizerForm.birthDate),
        role: 'ORGANIZER',
      });
      toast.success('Bem-vindo ao Celebrate! 🎉', { position: 'top-center' });
      onLoginSuccess();
    } catch (error) {
      toast.error(error.message || 'Erro ao cadastrar.', { position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupplierLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerUser({
        name: supplierForm.name.trim(),
        email: supplierForm.email.trim(),
        birthDate: new Date(supplierForm.birthDate),
        role: 'SUPPLIER',
        supplierProfile: {
          companyName: supplierForm.companyName.trim(),
          cnpj: supplierForm.cnpj.trim(),
          category: supplierForm.category === 'Outros' ? supplierForm.otherCategory.trim() : supplierForm.category,
          phone: supplierForm.phone.trim(),
          city: supplierForm.city.trim(),
          description: supplierForm.description.trim(),
        }
      });
      toast.success('Negócio parceiro ativado! 💼', { position: 'top-center' });
      onLoginSuccess();
    } catch (error) {
      toast.error('Erro ao cadastrar negócio.', { position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
      
      {/* LEFT PANEL - Elegant Image Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1400&auto=format&fit=crop" 
          alt="Elegant Wedding Celebration" 
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/70 z-10" />
        
        <div className="absolute bottom-12 left-12 z-20 text-white space-y-4">
          <div className="flex items-center gap-3">
            <AnimatedLogo />
          </div>
          <p className="text-white/80 text-lg max-w-md font-medium">
            A plataforma definitiva de alta costura para gerenciar festas inesquecíveis e momentos únicos.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - Minimalist Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background relative">
        
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-sm space-y-8 relative z-10">
          
          <div className="text-center lg:text-left space-y-2 mb-6">
            <div className="flex justify-center lg:justify-start mx-auto lg:mx-0 mb-4 lg:hidden">
              <AnimatedLogo />
            </div>
            
            {/* Mode Toggle */}
            <div className="flex bg-muted rounded-xl p-1 mb-6">
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${isLoginMode ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setIsLoginMode(true)}
              >
                Entrar
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${!isLoginMode ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setIsLoginMode(false)}
              >
                Criar Conta
              </button>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {isLoginMode ? 'Acesse seu Painel' : (isSupplierSignup ? 'Seu Negócio' : 'Criar Conta')}
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              {isLoginMode 
                ? 'Insira seus dados de acesso.' 
                : (isSupplierSignup ? 'Cadastre-se como fornecedor parceiro.' : 'Insira seus dados para planejar seu próximo evento.')}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {isLoginMode ? (
              <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <form onSubmit={handleDirectLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">E-mail</label>
                    <div className="relative">
                      <Mail size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={e => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-card border border-border rounded-xl px-4 py-3.5 pl-12 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data de Nascimento (Senha)</label>
                    <div className="relative">
                      <Calendar size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="date"
                        value={loginForm.birthDate}
                        onChange={e => setLoginForm(prev => ({ ...prev, birthDate: e.target.value }))}
                        className="w-full bg-card border border-border rounded-xl px-4 py-3.5 pl-12 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 mt-4 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-premium-hover transition-all cursor-pointer"
                  >
                    <span>Entrar no Painel</span>
                    <ArrowRight size={16} strokeWidth={2} />
                  </button>
                </form>
              </motion.div>
            ) : !isSupplierSignup ? (
              <motion.div key="organizer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <form onSubmit={handleOrganizerLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome Completo</label>
                    <div className="relative">
                      <User size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={organizerForm.name}
                        onChange={e => setOrganizerForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-card border border-border rounded-xl px-4 py-3.5 pl-12 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder="Ex: Maria Silva"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">E-mail Pessoal</label>
                    <div className="relative">
                      <Mail size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        value={organizerForm.email}
                        onChange={e => setOrganizerForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-card border border-border rounded-xl px-4 py-3.5 pl-12 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder="maria@exemplo.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data de Aniversário</label>
                    <div className="relative">
                      <Calendar size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="date"
                        value={organizerForm.birthDate}
                        onChange={e => setOrganizerForm(prev => ({ ...prev, birthDate: e.target.value }))}
                        className="w-full bg-card border border-border rounded-xl px-4 py-3.5 pl-12 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 mt-4 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-premium-hover transition-all cursor-pointer"
                  >
                    <span>Acessar Painel</span>
                    <ArrowRight size={16} strokeWidth={2} />
                  </button>
                </form>

                <div className="pt-6 border-t border-border">
                  <button 
                    onClick={() => setIsSupplierSignup(true)}
                    className="w-full p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Briefcase size={16} strokeWidth={1.5} className="text-secondary" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-foreground">Sou Fornecedor</p>
                        <p className="text-[10px] font-semibold text-muted-foreground">Cadastrar negócio parceiro</p>
                      </div>
                    </div>
                    <ArrowRight size={16} strokeWidth={1.5} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="supplier" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                
                <form onSubmit={handleSupplierLogin} className="space-y-4">
                  {/* Supplier Form simplified for Elegance */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sua Empresa</label>
                    <div className="relative">
                      <Building size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={supplierForm.companyName}
                        onChange={e => setSupplierForm(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full bg-card border border-border rounded-xl px-4 py-3.5 pl-12 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder="Nome Fantasia"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Categoria</label>
                    <Select value={supplierForm.category} onValueChange={(value) => setSupplierForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm h-12">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {supplierForm.category === 'Outros' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Qual categoria?</label>
                      <input
                        type="text"
                        value={supplierForm.otherCategory}
                        onChange={e => setSupplierForm(prev => ({ ...prev, otherCategory: e.target.value }))}
                        className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder="Especifique a categoria"
                        required
                      />
                    </motion.div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Seu Nome</label>
                    <input
                      type="text"
                      value={supplierForm.name}
                      onChange={e => setSupplierForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                      placeholder="Nome do responsável"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">E-mail</label>
                    <input
                      type="email"
                      value={supplierForm.email}
                      onChange={e => setSupplierForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                      placeholder="contato@empresa.com"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nascimento</label>
                    <input
                      type="date"
                      value={supplierForm.birthDate}
                      onChange={e => setSupplierForm(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm cursor-pointer"
                      required
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsSupplierSignup(false)}
                      className="w-1/3 py-4 bg-card border border-border hover:bg-muted text-foreground font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center transition-all cursor-pointer"
                    >
                      <ChevronLeft size={16} strokeWidth={2} /> Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-2/3 py-4 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center shadow-premium-hover transition-all cursor-pointer"
                    >
                      Registrar
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
