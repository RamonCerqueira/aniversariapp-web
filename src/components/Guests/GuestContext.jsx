import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { api } from '../../services/api.js';
import { useParty } from '../../contexts/PartyContext.jsx';

// Ações disponíveis no reducer
const ACTIONS = {
  LOAD: 'load_guests',
  ADD: 'add_guest',
  UPDATE: 'update_guest',
  REMOVE: 'remove_guest'
};

// Estado inicial
const initialState = {
  guests: [] // array de convidados compatíveis com o frontend { id, name, phone, status, accompany }
};

// Reducer para gerenciar ações de convidados
function guestReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD:
      return { ...state, guests: action.payload };
    case ACTIONS.ADD:
      return { ...state, guests: [...state.guests, action.payload] };
    case ACTIONS.UPDATE:
      return {
        ...state,
        guests: state.guests.map(g => g.id === action.payload.id ? action.payload : g)
      };
    case ACTIONS.REMOVE:
      return {
        ...state,
        guests: state.guests.filter(g => g.id !== action.payload)
      };
    default:
      return state;
  }
}

const GuestContext = createContext();

export function GuestProvider({ children }) {
  const [state, dispatch] = useReducer(guestReducer, initialState);
  const { currentParty } = useParty();

  // Carrega convidados toda vez que a festa selecionada mudar
  useEffect(() => {
    if (currentParty?.id) {
      loadGuestsOfParty(currentParty.id);
    } else {
      dispatch({ type: ACTIONS.LOAD, payload: [] });
    }
  }, [currentParty]);

  const loadGuestsOfParty = async (partyId) => {
    try {
      const dbGuests = await api.guests.getAll(partyId);
      // Mapeia de 'companions' (banco) para 'accompany' (frontend) para manter compatibilidade total
      const parsedGuests = dbGuests.map(g => ({
        id: g.id,
        partyId: g.partyId,
        name: g.name,
        phone: g.phone,
        accompany: g.companions,
        companionNames: g.companionNames,
        status: g.status,
        checkedIn: g.checkedIn,
        checkedInAt: g.checkedInAt,
        email: g.email || '',
        dietaryRestrictions: g.dietaryRestrictions || [],
        favoriteSong: g.favoriteSong || '',
        photoUrl: g.photoUrl || '',
        messageToHost: g.messageToHost || '',
        tableNumber: g.tableNumber || '',
        sector: g.sector || ''
      }));
      dispatch({ type: ACTIONS.LOAD, payload: parsedGuests });
    } catch (error) {
      console.error('Erro ao buscar convidados do banco:', error);
    }
  };

  const addGuest = async (guestData) => {
    if (!currentParty) return;
    try {
      const created = await api.guests.create({
        partyId: currentParty.id,
        name: guestData.name,
        phone: guestData.phone,
        companions: guestData.accompany,
        status: guestData.status,
        email: guestData.email,
        tableNumber: guestData.tableNumber,
        sector: guestData.sector
      });

      const parsedGuest = {
        id: created.id,
        partyId: created.partyId,
        name: created.name,
        phone: created.phone,
        accompany: created.companions,
        companionNames: created.companionNames,
        status: created.status,
        checkedIn: created.checkedIn,
        checkedInAt: created.checkedInAt,
        email: created.email || '',
        dietaryRestrictions: created.dietaryRestrictions || [],
        favoriteSong: created.favoriteSong || '',
        photoUrl: created.photoUrl || '',
        messageToHost: created.messageToHost || '',
        tableNumber: created.tableNumber || '',
        sector: created.sector || ''
      };

      dispatch({ type: ACTIONS.ADD, payload: parsedGuest });
    } catch (error) {
      console.error('Erro ao criar convidado na API:', error);
      throw error;
    }
  };

  const addGuestsBulk = async (guestsList) => {
    if (!currentParty) return;
    try {
      const dbGuests = await api.guests.createBulk(currentParty.id, guestsList);
      const parsedGuests = dbGuests.map(g => ({
        id: g.id,
        partyId: g.partyId,
        name: g.name,
        phone: g.phone,
        accompany: g.companions,
        companionNames: g.companionNames,
        status: g.status,
        checkedIn: g.checkedIn,
        checkedInAt: g.checkedInAt,
        email: g.email || '',
        dietaryRestrictions: g.dietaryRestrictions || [],
        favoriteSong: g.favoriteSong || '',
        photoUrl: g.photoUrl || '',
        messageToHost: g.messageToHost || '',
        tableNumber: g.tableNumber || '',
        sector: g.sector || ''
      }));
      dispatch({ type: ACTIONS.LOAD, payload: parsedGuests });
    } catch (error) {
      console.error('Erro ao importar convidados em lote na API:', error);
      throw error;
    }
  };

  const updateGuest = async (guestData) => {
    try {
      const updated = await api.guests.update(guestData.id, {
        name: guestData.name,
        phone: guestData.phone,
        companions: guestData.accompany,
        status: guestData.status,
        email: guestData.email,
        tableNumber: guestData.tableNumber,
        sector: guestData.sector
      });

      const parsedGuest = {
        id: updated.id,
        partyId: updated.partyId,
        name: updated.name,
        phone: updated.phone,
        accompany: updated.companions,
        companionNames: updated.companionNames,
        status: updated.status,
        checkedIn: updated.checkedIn,
        checkedInAt: updated.checkedInAt,
        email: updated.email || '',
        dietaryRestrictions: updated.dietaryRestrictions || [],
        favoriteSong: updated.favoriteSong || '',
        photoUrl: updated.photoUrl || '',
        messageToHost: updated.messageToHost || '',
        tableNumber: updated.tableNumber || '',
        sector: updated.sector || ''
      };

      dispatch({ type: ACTIONS.UPDATE, payload: parsedGuest });
    } catch (error) {
      console.error('Erro ao atualizar convidado na API:', error);
      throw error;
    }
  };

  const removeGuest = async (id) => {
    try {
      await api.guests.delete(id);
      dispatch({ type: ACTIONS.REMOVE, payload: id });
    } catch (error) {
      console.error('Erro ao remover convidado na API:', error);
      throw error;
    }
  };

  return (
    <GuestContext.Provider value={{ ...state, addGuest, addGuestsBulk, updateGuest, removeGuest }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuests() {
  return useContext(GuestContext);
}