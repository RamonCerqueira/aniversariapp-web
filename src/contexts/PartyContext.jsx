import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

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
      const dbParties = await api.parties.getAll();
      const parsedParties = dbParties.map((party) => ({
        ...party,
        date: new Date(party.date),
        createdAt: new Date(party.createdAt),
        updatedAt: new Date(party.updatedAt),
      }));
      setParties(parsedParties);
      
      // Seta a primeira festa como atual se não houver nenhuma setada
      if (parsedParties.length > 0 && !currentParty) {
        setCurrentParty(parsedParties[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar festas da API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createParty = async (partyData) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const created = await api.parties.create(partyData);
      const parsedParty = {
        ...created,
        date: new Date(created.date),
        createdAt: new Date(created.createdAt),
        updatedAt: new Date(created.updatedAt),
      };

      const updatedParties = [...parties, parsedParty];
      setParties(updatedParties);
      
      if (!currentParty) {
        setCurrentParty(parsedParty);
      }
      
      return parsedParty;
    } catch (error) {
      console.error('Erro ao criar festa na API:', error);
      throw error;
    }
  };

  const updateParty = async (partyId, partyData) => {
    try {
      const updated = await api.parties.update(partyId, partyData);
      const parsedParty = {
        ...updated,
        date: new Date(updated.date),
        createdAt: new Date(updated.createdAt),
        updatedAt: new Date(updated.updatedAt),
      };

      const updatedParties = parties.map(party =>
        party.id === partyId ? parsedParty : party
      );
      
      setParties(updatedParties);

      if (currentParty?.id === partyId) {
        setCurrentParty(parsedParty);
      }
    } catch (error) {
      console.error('Erro ao atualizar festa na API:', error);
      throw error;
    }
  };

  const deleteParty = async (partyId) => {
    try {
      await api.parties.delete(partyId);
      const updatedParties = parties.filter(party => party.id !== partyId);
      setParties(updatedParties);

      if (currentParty?.id === partyId) {
        setCurrentParty(updatedParties.length > 0 ? updatedParties[0] : null);
      }
    } catch (error) {
      console.error('Erro ao excluir festa na API:', error);
      throw error;
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
