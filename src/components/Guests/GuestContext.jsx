import React, { createContext, useContext, useEffect, useReducer } from 'react';

// Ações disponíveis no reducer
const ACTIONS = {
  LOAD: 'load_guests',
  ADD: 'add_guest',
  UPDATE: 'update_guest',
  REMOVE: 'remove_guest',
  IMPORT: 'import_guests'
};

// Estado inicial
const initialState = {
  guests: [] // array de objetos { id, name, phone, status, companions, notes }
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
    case ACTIONS.IMPORT:
      // mescla e remove duplicatas por telefone
      const merged = [...state.guests];
      action.payload.forEach(newG => {
        if (!merged.some(g => g.phone === newG.phone)) merged.push(newG);
      });
      return { ...state, guests: merged };
    default:
      return state;
  }
}

const GuestContext = createContext();

export function GuestProvider({ children }) {
  const [state, dispatch] = useReducer(guestReducer, initialState);

  // Carregar do localStorage ao montar
  useEffect(() => {
    const data = localStorage.getItem('guests');
    if (data) dispatch({ type: ACTIONS.LOAD, payload: JSON.parse(data) });
  }, []);

  // Persistir no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('guests', JSON.stringify(state.guests));
  }, [state.guests]);

  // Funções do contexto
  const addGuest = guest => dispatch({ type: ACTIONS.ADD, payload: guest });
  const updateGuest = guest => dispatch({ type: ACTIONS.UPDATE, payload: guest });
  const removeGuest = id => dispatch({ type: ACTIONS.REMOVE, payload: id });
  const importGuests = list => dispatch({ type: ACTIONS.IMPORT, payload: list });

  return (
    <GuestContext.Provider value={{ ...state, addGuest, updateGuest, removeGuest, importGuests }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuests() {
  return useContext(GuestContext);
}