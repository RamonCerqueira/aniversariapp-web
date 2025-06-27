import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PartyProvider } from './contexts/PartyContext';
import { GuestProvider, useGuests } from './components/Guests/GuestContext';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import PartyDetailsScreen from './components/PartyDetailsScreen';
import GuestList from './components/Guests/GuestList';
import TaskList from './components/Task/TaskList'
import './App.css';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedPartyId, setSelectedPartyId] = useState(null);

  const handleLoginSuccess = () => {
    setCurrentScreen('home');
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

  // 1) Nova função para QuickActions
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
      case 'suppliers':
        setCurrentScreen('suppliers');
        break;
      default:
        setCurrentScreen('home');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-custom mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 2) Envolvemos todas as telas do party/app dentro do GuestProvider
return (
  <GuestProvider>
    {(() => {
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

        case 'checklist': // ✅ <-- Adicione este case aqui
          return <TaskList onBack={handleBackToHome} />;

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
  </GuestProvider>
);

}

export default function App() {
  return (
    <AuthProvider>
      <PartyProvider>
        <AppContent />
      </PartyProvider>
    </AuthProvider>
  );
}
