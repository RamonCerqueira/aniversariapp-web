import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const PartyContext = createContext();

export const PartyProvider = ({ children }) => {
  const [parties, setParties] = useState([]);
  const [currentParty, setCurrentParty] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const loadParties = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const storedParties = localStorage.getItem(`aniversariapp_parties_${user.id}`);
      if (storedParties) {
        const parsedParties = JSON.parse(storedParties).map((party) => ({
          ...party,
          date: new Date(party.date),
          createdAt: new Date(party.createdAt),
          updatedAt: new Date(party.updatedAt),
        }));
        setParties(parsedParties);
      }
    } catch (error) {
      console.error('Erro ao carregar festas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveParties = async (updatedParties) => {
    if (!user) return;
    
    try {
      localStorage.setItem(`aniversariapp_parties_${user.id}`, JSON.stringify(updatedParties));
    } catch (error) {
      console.error('Erro ao salvar festas:', error);
      throw error;
    }
  };

  const createParty = async (partyData) => {
    if (!user) throw new Error('Usuário não autenticado');

    const newParty = {
      ...partyData,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedParties = [...parties, newParty];
    setParties(updatedParties);
    await saveParties(updatedParties);
    
    return newParty;
  };

  const updateParty = async (partyId, partyData) => {
    const updatedParties = parties.map(party =>
      party.id === partyId
        ? { ...party, ...partyData, updatedAt: new Date() }
        : party
    );
    
    setParties(updatedParties);
    await saveParties(updatedParties);

    if (currentParty?.id === partyId) {
      setCurrentParty(updatedParties.find(p => p.id === partyId) || null);
    }
  };

  const deleteParty = async (partyId) => {
    const updatedParties = parties.filter(party => party.id !== partyId);
    setParties(updatedParties);
    await saveParties(updatedParties);

    if (currentParty?.id === partyId) {
      setCurrentParty(null);
    }
  };

  const getParty = (partyId) => {
    return parties.find(party => party.id === partyId);
  };

  const value = {
    parties,
    currentParty,
    isLoading,
    createParty,
    updateParty,
    deleteParty,
    getParty,
    setCurrentParty,
    loadParties,
  };

  return (
    <PartyContext.Provider value={value}>
      {children}
    </PartyContext.Provider>
  );
};

export const useParty = () => {
  const context = useContext(PartyContext);
  if (context === undefined) {
    throw new Error('useParty deve ser usado dentro de um PartyProvider');
  }
  return context;
};

