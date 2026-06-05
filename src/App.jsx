import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PartyProvider } from './contexts/PartyContext';
import { GuestProvider } from './components/Guests/GuestContext';
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
  Flame
} from 'lucide-react';
import './App.css';

function AppContent() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedPartyId, setSelectedPartyId] = useState(null);

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

  // Abas de navegação para experiência híbrida (Sidebar no Desktop e Bottom Bar no Mobile)
  const tabs = [
    { id: 'home', label: 'Painel', icon: LayoutDashboard },
    { id: 'guests', label: 'Convidados', icon: Users },
    { id: 'checklist', label: 'Tarefas', icon: CheckCircle },
    { id: 'finance', label: 'Finanças', icon: Wallet },
    { id: 'suppliers', label: 'Serviços', icon: Briefcase }
  ];

  const getActiveTab = () => {
    if (currentScreen === 'home' || currentScreen === 'party-details' || currentScreen === 'subscription') return 'home';
    if (currentScreen === 'guests') return 'guests';
    if (currentScreen === 'checklist') return 'checklist';
    if (currentScreen === 'finance') return 'finance';
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
    } else if (tabId === 'checklist') {
      setCurrentScreen('checklist');
    } else if (tabId === 'finance') {
      setCurrentScreen('finance');
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
        
        {/* 1. DESKTOP SIDEBAR SHELL: Visible only on large screens */}
        <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-20">
          <div className="p-6 space-y-8">
            {/* Brand Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Gift size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight leading-none">CELEBRATE</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Party Planner</span>
              </div>
            </div>

            {/* User Profile Info */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-accent border border-border">
              <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] shadow-sm">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-primary text-xs font-black">
                  {user?.name?.substring(0, 2).toUpperCase() || 'UC'}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm truncate">{user?.name || 'Olivia Chen'}</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Premium Host</span>
              </div>
            </div>

            {/* Nav Items */}
            <nav className="space-y-1.5 pt-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-primary text-white shadow-md shadow-primary/10' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Minimalist Theme Toggle & Logout row at bottom */}
          <div className="p-6 border-t border-border flex items-center justify-between gap-3 select-none">
            <button 
              onClick={toggleTheme}
              className="flex-grow flex-shrink-0 w-28 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer text-xs font-black uppercase tracking-wider"
              title={isDarkMode ? 'Mudar para Tema Claro (Acender Vela)' : 'Mudar para Tema Escuro (Soprar Vela)'}
            >
              {isDarkMode ? (
                <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                  <Cake size={16} className="text-zinc-500" strokeWidth={1.5} />
                  <div className="absolute -top-1.5 w-[1.5px] h-1 bg-zinc-600 rounded-sm" />
                </div>
              ) : (
                <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                  <Cake size={16} className="text-primary" strokeWidth={1.5} />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 0.95, 1.15, 1], 
                      opacity: [0.9, 1, 0.85, 1, 0.9],
                      y: [0, -0.6, 0.15, -0.3, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="absolute -top-1.5 flex flex-col items-center"
                  >
                    <Flame size={9} className="text-amber-500 fill-amber-400 stroke-[1.5]" />
                  </motion.div>
                </div>
              )}
              <span className="ml-1">{isDarkMode ? 'Acender' : 'Apagar'}</span>
            </button>

            <button 
              onClick={logout}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-border transition-colors cursor-pointer text-xs font-black uppercase tracking-wider"
            >
              <LogOut size={15} strokeWidth={1.5} />
              <span>Sair</span>
            </button>
          </div>
        </aside>

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

                  case 'subscription':
                    return <SubscriptionScreen onBack={handleBackToHome} />;

                  case 'supplier-portal':
                    return <SupplierPortalScreen onBack={handleBackToHome} />;

                  case 'suppliers':
                    return <SupplierSearchScreen onBack={handleBackToHome} />;

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

                  <div className={`relative z-10 transition-transform duration-300 group-hover:scale-105 ${
                    isActive ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                    <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  
                  <span className={`relative z-10 text-[9px] font-extrabold uppercase tracking-wide leading-none ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
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
