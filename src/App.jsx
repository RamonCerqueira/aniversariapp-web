import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PartyProvider, useParty } from './contexts/PartyContext';
import { GuestProvider } from './components/Guests/GuestContext';
import WhatsAppIntegrationScreen from './components/WhatsAppIntegrationScreen';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import PartyDetailsScreen from './components/PartyDetailsScreen';
import GuestList from './components/Guests/GuestList';
import TaskList from './components/Task/TaskList';
import RSVPPage from './components/Guests/RSVPPage';
import Marcelle15AnosPage from './components/Marcelle15Anos/Marcelle15AnosPage';
import CheckInScreen from './components/CheckInScreen';
import SubscriptionScreen from './components/SubscriptionScreen';
import { Toaster } from './components/ui/sonner';
import SupplierPortalScreen from './components/SupplierPortalScreen';
import SupplierSearchScreen from './components/SupplierSearchScreen';
import ConsumoCalculator from './components/ConsumoCalculator';
import FinanceScreen from './components/FinanceScreen';
import SplashScreen from './components/SplashScreen';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  Wallet,
  Briefcase,
  Gift,
  LogOut,
  Cake,
  Flame,
  MessageSquare,
  MessageCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  QrCode,
  MoreHorizontal,
  X,
  UtensilsCrossed,
  Crown
} from 'lucide-react';
import ChatModule from './components/ChatModule';
import AnimatedLogo from './components/AnimatedLogo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { toast } from 'sonner';
import './App.css';

function AppContent() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { parties, currentParty, setCurrentParty } = useParty();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedPartyId, setSelectedPartyId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const location = useLocation();
  const isMarcellePage = location.pathname === '/marcelle15anos';
  const isRsvpPage = location.pathname.startsWith('/rsvp/');

  if (isMarcellePage) {
    return <Marcelle15AnosPage />;
  }

  if (isRsvpPage) {
    return (
      <GuestProvider>
        <div className="min-h-screen bg-background transition-colors duration-300">
          <Routes>
            <Route path="/rsvp/:id" element={<RSVPPage />} />
          </Routes>
        </div>
      </GuestProvider>
    );
  }

  // Roteamento baseado em Role ao carregar ou autenticar
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'SUPPLIER') {
        setCurrentScreen('supplier-portal');
      } else {
        setCurrentScreen('home');
      }
    }
  }, [isAuthenticated, user]);

  // Helper: navega e rola para o topo
  const navigateTo = (screen) => {
    setCurrentScreen(screen);
    setMoreMenuOpen(false);
    try {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  };

  const handleLoginSuccess = () => {
    if (user?.role === 'SUPPLIER') {
      navigateTo('supplier-portal');
    } else {
      navigateTo('home');
    }
  };

  const handleCreateParty = () => {
    if (user?.role !== 'ADMIN') {
      const plan = user?.plan || 'FREE';
      if (plan === 'FREE' && parties.length >= 1) {
        toast.error('Limite de Festas Atingido', {
          description: 'O plano Básico/Free permite apenas 1 festa ativa. Faça upgrade para criar mais!',
          action: {
            label: 'Upgrade',
            onClick: () => navigateTo('subscription')
          },
          duration: 6000,
          position: 'top-center'
        });
        return;
      }
      if (plan === 'PREMIUM' && parties.length >= 5) {
        toast.error('Limite de Festas Atingido', {
          description: 'O plano Premium permite até 5 festas ativas. Faça upgrade para o plano Master para festas ilimitadas!',
          action: {
            label: 'Upgrade',
            onClick: () => navigateTo('subscription')
          },
          duration: 6000,
          position: 'top-center'
        });
        return;
      }
    }
    setSelectedPartyId(null);
    navigateTo('party-details');
  };

  const handleViewParty = (partyId) => {
    setSelectedPartyId(partyId);
    navigateTo('party-details');
  };

  const handleBackToHome = () => {
    navigateTo('home');
    setSelectedPartyId(null);
  };

  const handleQuickAction = (action) => {
    const isFree = (user?.plan === 'FREE' || !user?.plan) && user?.role !== 'ADMIN';

    switch (action) {
      case 'guests':
        navigateTo('guests');
        break;
      case 'consumption':
        if (isFree) {
          toast.error('Recurso Premium', {
            description: 'A Calculadora de Consumo é exclusiva dos planos Premium e Master.',
            action: { label: 'Fazer Upgrade', onClick: () => navigateTo('subscription') },
            duration: 6000,
            position: 'top-center'
          });
          return;
        }
        navigateTo('consumption');
        break;
      case 'checklist':
        navigateTo('checklist');
        break;
      case 'finance':
        if (isFree) {
          toast.error('Recurso Premium', {
            description: 'O controle financeiro avançado é exclusivo dos planos Premium e Master.',
            action: { label: 'Fazer Upgrade', onClick: () => navigateTo('subscription') },
            duration: 6000,
            position: 'top-center'
          });
          return;
        }
        navigateTo('finance');
        break;
      case 'suppliers':
        if (user?.role === 'SUPPLIER') {
          navigateTo('supplier-portal');
        } else {
          if (isFree) {
            toast.error('Recurso Premium', {
              description: 'A busca de fornecedores parceiros é exclusiva dos planos Premium e Master.',
              action: { label: 'Fazer Upgrade', onClick: () => navigateTo('subscription') },
              duration: 6000,
              position: 'top-center'
            });
            return;
          }
          navigateTo('suppliers');
        }
        break;
      case 'subscription':
        navigateTo('subscription');
        break;
      case 'messages':
        navigateTo('messages');
        break;
      case 'whatsapp':
        navigateTo('whatsapp');
        break;
      default:
        navigateTo('home');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm font-semibold text-zinc-400">Carregando Celebrate!...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Abas de navegação
  const tabs = user?.role === 'SUPPLIER'
    ? [
      { id: 'supplier-portal', label: 'Meu Negócio', icon: Briefcase }
    ]
    : [
      { id: 'home', label: 'Painel', icon: LayoutDashboard },
      { id: 'guests', label: 'Convidados', icon: Users },
      { id: 'checklist', label: 'Tarefas', icon: CheckCircle },
      { id: 'finance', label: 'Finanças', icon: Wallet },
      { id: 'messages', label: 'Mensagens', icon: MessageSquare },
      { id: 'consumption', label: 'Calculadora', icon: UtensilsCrossed },
      { id: 'whatsapp', label: 'Convites', icon: MessageCircle },
      { id: 'checkin', label: 'Check-in', icon: QrCode },
      { id: 'suppliers', label: 'Serviços', icon: Briefcase },
      { id: 'subscription', label: 'Assinatura', icon: Crown }
    ];

  const getActiveTab = () => {
    if (currentScreen === 'home' || currentScreen === 'party-details') return 'home';
    if (currentScreen === 'messages') return 'messages';
    if (currentScreen === 'guests') return 'guests';
    if (currentScreen === 'checklist') return 'checklist';
    if (currentScreen === 'finance') return 'finance';
    if (currentScreen === 'consumption') return 'consumption';
    if (currentScreen === 'whatsapp') return 'whatsapp';
    if (currentScreen === 'checkin') return 'checkin';
    if (currentScreen === 'suppliers' || currentScreen === 'supplier-portal') return 'suppliers';
    if (currentScreen === 'subscription') return 'subscription';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tabId) => {
    const isFree = (user?.plan === 'FREE' || !user?.plan) && user?.role !== 'ADMIN';
    const isNotMaster = user?.plan !== 'MASTER' && user?.role !== 'ADMIN';

    if (tabId === 'home') {
      setSelectedPartyId(null);
      navigateTo('home');
    } else if (tabId === 'guests') {
      navigateTo('guests');
    } else if (tabId === 'messages') {
      navigateTo('messages');
    } else if (tabId === 'checklist') {
      navigateTo('checklist');
    } else if (tabId === 'finance') {
      if (isFree) {
        toast.error('Recurso Premium', {
          description: 'O controle financeiro avançado é exclusivo dos planos Premium e Master.',
          action: { label: 'Fazer Upgrade', onClick: () => navigateTo('subscription') },
          duration: 6000,
          position: 'top-center'
        });
        return;
      }
      navigateTo('finance');
    } else if (tabId === 'whatsapp') {
      navigateTo('whatsapp');
    } else if (tabId === 'consumption') {
      if (isFree) {
        toast.error('Recurso Premium', {
          description: 'A Calculadora de Consumo (Churrascômetro) é exclusiva dos planos Premium e Master.',
          action: { label: 'Fazer Upgrade', onClick: () => navigateTo('subscription') },
          duration: 6000,
          position: 'top-center'
        });
        return;
      }
      navigateTo('consumption');
    } else if (tabId === 'checkin') {
      if (isNotMaster) {
        toast.error('Recurso do Plano MASTER', {
          description: 'O Check-in de Portaria (Gate Desk) é um recurso exclusivo do Plano MASTER (corporativo).',
          action: { label: 'Fazer Upgrade', onClick: () => navigateTo('subscription') },
          duration: 6000,
          position: 'top-center'
        });
        return;
      }
      navigateTo('checkin');
    } else if (tabId === 'subscription') {
      navigateTo('subscription');
    } else if (tabId === 'suppliers') {
      if (user?.role === 'SUPPLIER') {
        navigateTo('supplier-portal');
      } else {
        if (isFree) {
          toast.error('Recurso Premium', {
            description: 'A busca de fornecedores parceiros é exclusiva dos planos Premium e Master.',
            action: { label: 'Fazer Upgrade', onClick: () => navigateTo('subscription') },
            duration: 6000,
            position: 'top-center'
          });
          return;
        }
        navigateTo('suppliers');
      }
    }
  };

  // Separação das abas: 5 primárias no dock + extras no menu "Mais"
  const primaryTabIds = ['home', 'guests', 'checklist', 'finance', 'messages'];
  const primaryTabs = tabs.filter(t => primaryTabIds.includes(t.id));
  const extraTabs = tabs.filter(t => !primaryTabIds.includes(t.id));

  const isExtraTabActive = extraTabs.some(t => t.id === activeTab);

  return (
    <GuestProvider>
      {/* SPLASH SCREEN */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Overlay para fechar menu "Mais" ao clicar fora */}
      {moreMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMoreMenuOpen(false)}
        />
      )}

      <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col lg:flex-row relative">

        {/* MOBILE FLOATING THEME TOGGLE — left side, não conflita com sino */}
        <button
          onClick={toggleTheme}
          className="fixed top-4 left-4 z-50 lg:hidden w-11 h-11 rounded-2xl glass-panel border border-border/45 flex items-center justify-center shadow-premium transition-all hover:scale-105 active:scale-95 text-primary"
          title={isDarkMode ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          aria-label="Alternar Tema"
        >
          {isDarkMode ? (
            <div className="relative flex items-center justify-center mt-1">
              <Cake size={20} className="text-zinc-500" strokeWidth={1.5} />
              <div className="absolute -top-1.5 w-[2px] h-1.5 bg-zinc-600 rounded-sm" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center mt-1">
              <Cake size={20} className="text-primary" strokeWidth={1.5} />
              <motion.div
                animate={{ scale: [1, 1.2, 0.95, 1.15, 1], opacity: [0.9, 1, 0.85, 1, 0.9], y: [0, -0.8, 0.2, -0.4, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                className="absolute -top-2 flex flex-col items-center"
              >
                <Flame size={11} className="text-amber-500 fill-amber-400 stroke-[1.5]" />
              </motion.div>
            </div>
          )}
        </button>

        {/* DESKTOP SIDEBAR */}
        {user?.role !== 'SUPPLIER' && (
          <aside className={`hidden lg:flex ${isSidebarCollapsed ? 'w-[90px]' : 'w-[280px]'} transition-all duration-300 ease-in-out bg-gradient-to-b from-[#fcebea] dark:from-orange-950/40 via-background to-background border-r border-border/40 flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]`}>

            {/* Toggle Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute -right-3 top-8 bg-card border border-border/60 rounded-full p-1 shadow-md hover:scale-110 transition-transform z-30"
            >
              {isSidebarCollapsed ? <ChevronRight size={14} className="text-muted-foreground" /> : <ChevronLeft size={14} className="text-muted-foreground" />}
            </button>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto no-scrollbar">

              {/* Brand Header */}
              <div className={`mb-0 flex items-center justify-center`}>
                {isSidebarCollapsed ? (
                  <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500">
                    <Gift size={24} className="text-primary-foreground" />
                  </div>
                ) : (
                  <div className="py-2 w-full flex justify-center">
                    <AnimatedLogo />
                  </div>
                )}
              </div>

              {/* Compact User Profile + Controls */}
              <div className={`relative overflow-hidden p-2 rounded-2xl bg-gradient-to-br from-card to-muted border border-border/60 shadow-sm transition-all duration-500 ${isSidebarCollapsed ? 'flex flex-col items-center gap-3' : 'flex items-center gap-3'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
                <div className="relative z-10 w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-primary to-secondary shrink-0">
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-foreground text-xs font-black shadow-inner">
                    {user?.name?.substring(0, 2).toUpperCase() || 'UC'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card shadow-sm" />
                </div>

                {!isSidebarCollapsed && (
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-black text-xs truncate uppercase tracking-tight text-foreground">{user?.name || 'Usuário'}</span>
                    <button
                      onClick={() => navigateTo('subscription')}
                      className="flex items-center gap-1 mt-0.5 text-primary hover:opacity-85 transition-opacity bg-transparent border-0 p-0 cursor-pointer text-left w-fit"
                      title="Gerenciar Assinatura"
                    >
                      <Sparkles size={8} className="text-primary shrink-0" />
                      <span className="text-[8px] font-black uppercase tracking-widest leading-none">Plano {user?.plan || 'FREE'}</span>
                      <span className="text-[8px] text-muted-foreground leading-none font-bold hover:underline ml-1">(Alterar)</span>
                    </button>
                  </div>
                )}

                <div className={`flex items-center gap-1 relative z-10 ${isSidebarCollapsed ? 'flex-col' : ''}`}>
                  <button onClick={() => navigateTo('subscription')} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-colors" title="Assinaturas / Planos">
                    <Sparkles size={14} className="text-primary animate-pulse" />
                  </button>
                  <button onClick={toggleTheme} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Tema">
                    {isDarkMode ? <Cake size={14} /> : <Flame size={14} className="text-amber-500" />}
                  </button>
                  <button onClick={logout} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" title="Sair">
                    <LogOut size={14} />
                  </button>
                </div>
              </div>

              {/* Party Switcher */}
              {!isSidebarCollapsed && user?.role !== 'SUPPLIER' && (
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1 ml-1">Festa Atual</span>
                  <div className="relative group">
                    <Select value={currentParty?.id || ''} onValueChange={(value) => {
                      const party = parties.find(p => p.id === value);
                      if (party) setCurrentParty(party);
                    }}>
                      <SelectTrigger className="w-full bg-card hover:bg-muted/50 border border-border/50 text-foreground text-xs font-bold rounded-xl px-3 py-2 shadow-sm group-hover:shadow-md transition-all h-9">
                        <SelectValue placeholder="Nenhuma festa" />
                      </SelectTrigger>
                      <SelectContent>
                        {parties.length === 0 && <SelectItem value="none" disabled>Nenhuma festa</SelectItem>}
                        {parties.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Nav Items */}
              <nav className="space-y-1 pt-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      title={isSidebarCollapsed ? tab.label : ''}
                      className={`relative w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3 rounded-xl' : 'gap-3 px-3 py-2 rounded-xl'} text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer overflow-hidden group ${isActive
                        ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
                        }`}
                    >
                      {isActive && !isSidebarCollapsed && (
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_infinite]" />
                      )}
                      <div className={`relative z-10 transition-colors ${isActive ? (isSidebarCollapsed ? 'text-primary-foreground' : 'p-1.5 rounded-lg bg-black/10') : 'bg-transparent group-hover:text-primary'}`}>
                        <Icon size={isSidebarCollapsed ? 20 : 16} strokeWidth={isActive ? 2 : 1.5} />
                      </div>
                      {!isSidebarCollapsed && <span className="relative z-10">{tab.label}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}

        {/* MAIN APP VIEWPORT */}
        <div className="flex-grow min-w-0 pb-28 lg:pb-0">
          <Routes>
            <Route path="/rsvp/:id" element={<RSVPPage />} />
            <Route
              path="*"
              element={(() => {
                switch (currentScreen) {
                  case 'guests':
                    return <GuestList onBack={handleBackToHome} onGoToSubscription={() => navigateTo('subscription')} />;

                  case 'party-details':
                    return (
                      <PartyDetailsScreen
                        partyId={selectedPartyId}
                        onBack={handleBackToHome}
                      />
                    );

                  case 'checklist':
                    return <TaskList onBack={handleBackToHome} />;

                  case 'consumption':
                    return <ConsumoCalculator onBack={handleBackToHome} />;

                  case 'finance':
                    return <FinanceScreen onBack={handleBackToHome} />;

                  case 'whatsapp':
                    return <WhatsAppIntegrationScreen onBack={handleBackToHome} />;

                  case 'checkin':
                    return <CheckInScreen onBack={handleBackToHome} />;

                  case 'subscription':
                    return <SubscriptionScreen onBack={handleBackToHome} />;

                  case 'supplier-portal':
                    return <SupplierPortalScreen onBack={handleBackToHome} />;

                  case 'suppliers':
                    return <SupplierSearchScreen onBack={handleBackToHome} onGoToMessages={() => navigateTo('messages')} />;

                  case 'messages':
                    return (
                      <div className="p-4 md:p-8 h-full flex flex-col">
                        <div className="mb-6 flex flex-col gap-2">
                          <h1 className="text-3xl font-black tracking-tight text-foreground">Mensagens</h1>
                          <p className="text-sm font-medium text-muted-foreground">Comunique-se diretamente com seus fornecedores.</p>
                        </div>
                        <div className="flex-1 min-h-[500px]">
                          <ChatModule userRole="ORGANIZER" />
                        </div>
                      </div>
                    );

                  case 'home':
                  default:
                    return (
                      <HomeScreen
                        onCreateParty={handleCreateParty}
                        onViewParty={handleViewParty}
                        onQuickAction={handleQuickAction}
                      />
                    );
                }
              })()}
            />
          </Routes>
        </div>

        {/* MOBILE FLOATING TAB DOCK — 5 primárias + menu "Mais" */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-md z-50 lg:hidden">

          {/* Drawer "Mais" — aparece acima do dock */}
          <AnimatePresence>
            {moreMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute bottom-full mb-2 right-0 w-52 bg-card/98 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl shadow-black/[0.15] p-2 space-y-0.5"
              >
                {extraTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                        }`}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                      <span className="text-xs font-bold uppercase tracking-wide">{tab.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <nav className="bg-card/80 backdrop-blur-2xl border border-border/40 px-2 py-1.5 rounded-2xl shadow-xl shadow-black/[0.1] flex items-center justify-around gap-0.5">
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className="flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-all relative cursor-pointer group min-w-0"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      transition={{ type: 'spring', duration: 0.4 }}
                      className="absolute inset-0 bg-primary/10 rounded-xl z-0"
                    />
                  )}
                  <div className={`relative z-10 transition-all duration-200 ${isActive ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    <Icon size={21} strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  <span className={`relative z-10 text-[9px] font-extrabold uppercase tracking-wide leading-none truncate max-w-full ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}

            {/* Botão "Mais" */}
            {extraTabs.length > 0 && (
              <button
                onClick={() => setMoreMenuOpen(prev => !prev)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-all relative cursor-pointer group min-w-0 ${moreMenuOpen || isExtraTabActive ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {isExtraTabActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    transition={{ type: 'spring', duration: 0.4 }}
                    className="absolute inset-0 bg-primary/10 rounded-xl z-0"
                  />
                )}
                <div className="relative z-10">
                  {moreMenuOpen
                    ? <X size={21} strokeWidth={2} />
                    : <MoreHorizontal size={21} strokeWidth={1.5} />
                  }
                </div>
                <span className="relative z-10 text-[9px] font-extrabold uppercase tracking-wide leading-none">
                  Mais
                </span>
              </button>
            )}
          </nav>
        </div>

      </div>
    </GuestProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PartyProvider>
          <AppContent />
          <Toaster />
        </PartyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
