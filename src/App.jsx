import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import SubscriptionScreen from './components/SubscriptionScreen';
import SupplierPortalScreen from './components/SupplierPortalScreen';
import SupplierSearchScreen from './components/SupplierSearchScreen';
import ConsumoCalculator from './components/ConsumoCalculator';
import FinanceScreen from './components/FinanceScreen';
import { motion } from 'framer-motion';
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
  ChevronRight
} from 'lucide-react';
import ChatModule from './components/ChatModule';
import AnimatedLogo from './components/AnimatedLogo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import './App.css';

function AppContent() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { parties, currentParty, setCurrentParty } = useParty();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedPartyId, setSelectedPartyId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  const handleLoginSuccess = () => {
    if (user?.role === 'SUPPLIER') {
      setCurrentScreen('supplier-portal');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleCreateParty = () => {
    setSelectedPartyId(null);
    setCurrentScreen('party-details');
  };

  const handleViewParty = (partyId) => {
    setSelectedPartyId(partyId);
    setCurrentScreen('party-details');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setSelectedPartyId(null);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'guests':
        setCurrentScreen('guests');
        break;
      case 'consumption':
        setCurrentScreen('consumption');
        break;
      case 'checklist':
        setCurrentScreen('checklist');
        break;
      case 'finance':
        setCurrentScreen('finance');
        break;
      case 'suppliers':
        if (user?.role === 'SUPPLIER') {
          setCurrentScreen('supplier-portal');
        } else {
          setCurrentScreen('suppliers');
        }
        break;
      case 'subscription':
        setCurrentScreen('subscription');
        break;
      case 'messages':
        setCurrentScreen('messages');
        break;
      case 'whatsapp':
        setCurrentScreen('whatsapp');
        break;
      default:
        setCurrentScreen('home');
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

  // Abas de navegação para experiência híbrida
  const tabs = user?.role === 'SUPPLIER'
    ? [
      { id: 'supplier-portal', label: 'Meu Negócio', icon: Briefcase }
    ]
    : [
      { id: 'home', label: 'Painel', icon: LayoutDashboard },
      { id: 'messages', label: 'Mensagens', icon: MessageSquare },
      { id: 'guests', label: 'Convidados', icon: Users },
      { id: 'checklist', label: 'Tarefas', icon: CheckCircle },
      { id: 'finance', label: 'Finanças', icon: Wallet },
      { id: 'whatsapp', label: 'Convites', icon: MessageCircle },
      { id: 'suppliers', label: 'Serviços', icon: Briefcase }
    ];

  const getActiveTab = () => {
    if (currentScreen === 'home' || currentScreen === 'party-details' || currentScreen === 'subscription') return 'home';
    if (currentScreen === 'messages') return 'messages';
    if (currentScreen === 'guests') return 'guests';
    if (currentScreen === 'checklist') return 'checklist';
    if (currentScreen === 'finance') return 'finance';
    if (currentScreen === 'whatsapp') return 'whatsapp';
    if (currentScreen === 'suppliers' || currentScreen === 'supplier-portal') return 'suppliers';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tabId) => {
    if (tabId === 'home') {
      setCurrentScreen('home');
      setSelectedPartyId(null);
    } else if (tabId === 'guests') {
      setCurrentScreen('guests');
    } else if (tabId === 'messages') {
      setCurrentScreen('messages');
    } else if (tabId === 'checklist') {
      setCurrentScreen('checklist');
    } else if (tabId === 'finance') {
      setCurrentScreen('finance');
    } else if (tabId === 'whatsapp') {
      setCurrentScreen('whatsapp');
    } else if (tabId === 'suppliers') {
      if (user?.role === 'SUPPLIER') {
        setCurrentScreen('supplier-portal');
      } else {
        setCurrentScreen('suppliers');
      }
    }
  };

  return (
    <GuestProvider>
      <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col lg:flex-row relative">

        {/* MOBILE FLOATING THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="fixed top-4 right-4 z-50 lg:hidden w-11 h-11 rounded-2xl glass-panel border border-border/45 flex items-center justify-center shadow-premium transition-all hover:scale-105 active:scale-95 text-primary"
          title={isDarkMode ? 'Mudar para Tema Claro (Acender Vela)' : 'Mudar para Tema Escuro (Soprar Vela)'}
          aria-label="Alternar Tema"
        >
          {isDarkMode ? (
            <div className="relative flex items-center justify-center mt-1">
              <Cake size={20} className="text-zinc-500" strokeWidth={1.5} />
              {/* Unlit wick */}
              <div className="absolute -top-1.5 w-[2px] h-1.5 bg-zinc-600 rounded-sm" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center mt-1">
              <Cake size={20} className="text-primary" strokeWidth={1.5} />
              {/* Animated flame */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 0.95, 1.15, 1],
                  opacity: [0.9, 1, 0.85, 1, 0.9],
                  y: [0, -0.8, 0.2, -0.4, 0]
                }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                className="absolute -top-2 flex flex-col items-center"
              >
                <Flame size={11} className="text-amber-500 fill-amber-400 stroke-[1.5]" />
              </motion.div>
            </div>
          )}
        </button>

        {/* 1. DESKTOP SIDEBAR SHELL */}
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
              <div className={`mb-0 flex items-center justify-center ${isSidebarCollapsed ? '' : ''}`}>
                {isSidebarCollapsed ? (
                  <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
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
                    <span className="font-black text-xs truncate uppercase tracking-tight text-foreground">{user?.name || 'Olivia Chen'}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Sparkles size={8} className="text-primary" />
                      <span className="text-[8px] text-primary font-black uppercase tracking-widest">Premium</span>
                    </div>
                  </div>
                )}

                <div className={`flex items-center gap-1 relative z-10 ${isSidebarCollapsed ? 'flex-col' : ''}`}>
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
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
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

        {/* 2. MAIN APP VIEWPORT (Responsive Bottom Padding for mobile navigation) */}
        <div className="flex-grow min-w-0 pb-28 lg:pb-0">
          <Routes>
            <Route path="/rsvp/:id" element={<RSVPPage />} />
            <Route
              path="*"
              element={(() => {
                switch (currentScreen) {
                  case 'guests':
                    return <GuestList onBack={handleBackToHome} />;

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

                  case 'subscription':
                    return <SubscriptionScreen onBack={handleBackToHome} />;

                  case 'supplier-portal':
                    return <SupplierPortalScreen onBack={handleBackToHome} />;

                  case 'suppliers':
                    return <SupplierSearchScreen onBack={handleBackToHome} onGoToMessages={() => setCurrentScreen('messages')} />;

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

        {/* MOBILE FLOATING TAB DOCK: Visible only on small/medium mobile and tablet screens */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-50 lg:hidden">
          <nav className="bg-card/75 backdrop-blur-xl border border-border/40 p-2 rounded-2xl shadow-xl shadow-black/[0.08] flex items-center justify-around gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all relative cursor-pointer group"
                >
                  {/* Bouncy active background indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBackground"
                      transition={{ type: 'spring', duration: 0.5 }}
                      className="absolute inset-0 bg-primary/10 rounded-xl z-0"
                    />
                  )}

                  <div className={`relative z-10 transition-transform duration-300 group-hover:scale-105 ${isActive ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground'
                    }`}>
                    <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  </div>

                  <span className={`relative z-10 text-[9px] font-extrabold uppercase tracking-wide leading-none ${isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
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
        </PartyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
