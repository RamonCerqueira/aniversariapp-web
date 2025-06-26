import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PartyProvider } from './contexts/PartyContext';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import PartyDetailsScreen from './components/PartyDetailsScreen';
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

  switch (currentScreen) {
    case 'party-details':
      return (
        <PartyDetailsScreen
          partyId={selectedPartyId}
          onBack={handleBackToHome}
        />
      );
    case 'home':
    default:
      return (
        <HomeScreen
          onCreateParty={handleCreateParty}
          onViewParty={handleViewParty}
        />
      );
  }
}

function App() {
  return (
    <AuthProvider>
      <PartyProvider>
        <AppContent />
      </PartyProvider>
    </AuthProvider>
  );
}

export default App;
