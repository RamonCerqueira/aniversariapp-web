const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3101/api';

// Auxiliar para fazer requisições HTTP e injetar automaticamente o token JWT
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('Celebrate_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisição');
  }

  return data;
}

export const api = {
  // Autenticação
  auth: {
    login: (email, password) =>
      request('/auth/login', { method: 'POST', body: { email, password } }),

    register: (name, email, password, birthDate, role, supplierProfile) =>
      request('/auth/register', { method: 'POST', body: { name, email, password, birthDate, role, supplierProfile } }),

    subscribe: (plan) =>
      request('/auth/subscribe', { method: 'POST', body: { plan } }),
  },

  // Festas
  parties: {
    getAll: () => request('/parties'),
    create: (data) => request('/parties', { method: 'POST', body: data }),
    update: (id, data) => request(`/parties/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/parties/${id}`, { method: 'DELETE' }),
  },

  // Convidados
  guests: {
    getAll: (partyId) => request(`/guests${partyId ? `?partyId=${partyId}` : ''}`),
    create: (data) => request('/guests', { method: 'POST', body: data }),
    createBulk: (partyId, guests) => request('/guests/bulk', { method: 'POST', body: { partyId, guests } }),
    update: (id, data) => request(`/guests/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/guests/${id}`, { method: 'DELETE' }),

    // RSVP Público (sem necessidade de token)
    publicGet: (id) => request(`/guests/public/${id}`),
    publicRsvp: (id, status) =>
      request(`/guests/public/${id}/rsvp`, { method: 'PATCH', body: { status } }),
  },

  // Tarefas (Checklist)
  tasks: {
    getAll: (partyId) => request(`/tasks${partyId ? `?partyId=${partyId}` : ''}`),
    create: (data) => request('/tasks', { method: 'POST', body: data }),
    update: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  },

  // Fornecedores
  suppliers: {
    getAll: (filters = {}) => {
      const query = new URLSearchParams(filters).toString();
      return request(`/suppliers${query ? `?${query}` : ''}`);
    },
    getDetails: (id) => request(`/suppliers/details/${id}`),
    getMyProfile: () => request('/suppliers/my-profile'),
    saveProfile: (data) => request('/suppliers/my-profile', { method: 'POST', body: data }),
    deleteProfile: () => request('/suppliers/my-profile', { method: 'DELETE' }),

    // Novas rotas (Avaliações e Visualizações)
    getReviews: (id) => request(`/suppliers/${id}/reviews`),
    addReview: (id, data) => request(`/suppliers/${id}/reviews`, { method: 'POST', body: data }),
    incrementView: (id) => request(`/suppliers/${id}/views`, { method: 'POST' }),
  },

  // Leads (Solicitações de Orçamentos)
  leads: {
    create: (partyId, supplierId) =>
      request('/leads', { method: 'POST', body: { partyId, supplierId } }),
    getSupplierLeads: () => request('/leads/supplier'),
    getOrganizerLeads: () => request('/leads/organizer'),
    updateStatus: (id, status) =>
      request(`/leads/${id}/status`, { method: 'PATCH', body: { status } }),
  },

  expenses: {
    getAll: (partyId) => request(`/expenses?partyId=${partyId}`),
    create: (data) => request('/expenses', { method: 'POST', body: data }),
    update: (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
  },

  upload: {
    file: async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('Celebrate_token');
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro no upload');
      return data;
    }
  },

  // Inteligência Artificial (Gemini)
  ai: {
    getChurrascoAdvice: (data) => request('/ai/churrasco', { method: 'POST', body: data }),
  },

  // Módulo de Chat
  chat: {
    list: () => request('/chats'),
    start: (partyId, supplierId) => request('/chats', { method: 'POST', body: { partyId, supplierId } }),
    getMessages: (roomId) => request(`/chats/${roomId}/messages`),
    sendMessage: (roomId, content) => request(`/chats/${roomId}/messages`, { method: 'POST', body: { content } }),
    closeChat: (roomId) => request(`/chats/${roomId}/close`, { method: 'PATCH' })
  },

  // Integração WhatsApp Web
  whatsapp: {
    status: () => request('/whatsapp/status'),
    connect: () => request('/whatsapp/connect', { method: 'POST' }),
    logout: () => request('/whatsapp/logout', { method: 'POST' }),
    sendBulk: (phoneNumbers, message, mediaUrl) => request('/whatsapp/send', {
      method: 'POST',
      body: { phoneNumbers, message, mediaUrl }
    })
  }
};
