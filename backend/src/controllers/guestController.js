import { prisma } from '../server.js';

// Obter todos os convidados (opcionalmente filtrado por partyId)
export const getGuests = async (req, res) => {
  const { partyId } = req.query;

  try {
    const whereClause = partyId 
      ? { partyId, party: { userId: req.user.id } }
      : { party: { userId: req.user.id } };

    const guests = await prisma.guest.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
    res.json(guests);
  } catch (error) {
    console.error('Erro ao buscar convidados:', error);
    res.status(500).json({ error: 'Erro ao buscar convidados' });
  }
};

// Obter dados de um único convidado (Público - para o RSVPPage)
export const getGuestPublic = async (req, res) => {
  const { id } = req.params;

  try {
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        party: {
          select: {
            name: true,
            date: true,
            location: true,
          }
        }
      }
    });

    if (!guest) {
      return res.status(404).json({ error: 'Convite não encontrado' });
    }

    res.json(guest);
  } catch (error) {
    console.error('Erro ao buscar convidado público:', error);
    res.status(500).json({ error: 'Erro ao processar convite' });
  }
};

// Criar novo convidado
export const createGuest = async (req, res) => {
  const { partyId, name, phone, companions, status, whatsappInvite } = req.body;

  try {
    if (!partyId || !name || !phone) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    // Verifica se a festa pertence ao usuário autenticado
    const party = await prisma.party.findFirst({
      where: { id: partyId, userId: req.user.id }
    });

    if (!party) {
      return res.status(404).json({ error: 'Festa não encontrada ou acesso negado' });
    }

    const guest = await prisma.guest.create({
      data: {
        partyId,
        name,
        phone,
        companions: parseInt(companions) || 0,
        status: status || 'pending',
        whatsappInvite: !!whatsappInvite,
      }
    });

    res.status(201).json(guest);
  } catch (error) {
    console.error('Erro ao criar convidado:', error);
    res.status(500).json({ error: 'Erro ao criar convidado' });
  }
};

// Atualizar convidado (Administrativo)
export const updateGuest = async (req, res) => {
  const { id } = req.params;
  const { name, phone, companions, status, whatsappInvite } = req.body;

  try {
    // Verifica propriedade do convidado através da festa
    const existingGuest = await prisma.guest.findFirst({
      where: { id, party: { userId: req.user.id } }
    });

    if (!existingGuest) {
      return res.status(404).json({ error: 'Convidado não encontrado ou acesso negado' });
    }

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: {
        name,
        phone,
        companions: companions !== undefined ? parseInt(companions) : undefined,
        status,
        whatsappInvite: whatsappInvite !== undefined ? !!whatsappInvite : undefined,
      }
    });

    res.json(updatedGuest);
  } catch (error) {
    console.error('Erro ao atualizar convidado:', error);
    res.status(500).json({ error: 'Erro ao atualizar convidado' });
  }
};

// Excluir convidado
export const deleteGuest = async (req, res) => {
  const { id } = req.params;

  try {
    const existingGuest = await prisma.guest.findFirst({
      where: { id, party: { userId: req.user.id } }
    });

    if (!existingGuest) {
      return res.status(404).json({ error: 'Convidado não encontrado ou acesso negado' });
    }

    await prisma.guest.delete({
      where: { id }
    });

    res.json({ message: 'Convidado excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir convidado:', error);
    res.status(500).json({ error: 'Erro ao excluir convidado' });
  }
};

// RSVP Público (Convidado confirma presença sem estar logado)
export const rsvpResponse = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'confirmed' ou 'declined'

  try {
    if (!status || !['confirmed', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Status de RSVP inválido' });
    }

    const guest = await prisma.guest.findUnique({
      where: { id }
    });

    if (!guest) {
      return res.status(404).json({ error: 'Convidado não encontrado' });
    }

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: { status }
    });

    res.json({
      message: 'RSVP respondido com sucesso!',
      guest: {
        id: updatedGuest.id,
        name: updatedGuest.name,
        status: updatedGuest.status
      }
    });
  } catch (error) {
    console.error('Erro ao responder RSVP público:', error);
    res.status(500).json({ error: 'Erro ao responder RSVP' });
  }
};

// Criar convidados em lote (CSV/Excel) - Exclusivo Plano MASTER
export const createGuestsBulk = async (req, res) => {
  const { partyId, guests } = req.body;

  try {
    if (!partyId || !Array.isArray(guests)) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes ou inválidos' });
    }

    // Busca o plano do usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { plan: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Apenas Plano MASTER ou ADMIN pode fazer importação em lote
    if (user.plan !== 'MASTER' && user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Recurso Exclusivo do Plano MASTER',
        message: 'A importação de convidados em lote (CSV/Excel) é uma funcionalidade exclusiva do plano MASTER. Faça o upgrade para utilizá-la!'
      });
    }

    // Verifica se a festa pertence ao usuário autenticado
    const party = await prisma.party.findFirst({
      where: { id: partyId, userId: req.user.id }
    });

    if (!party) {
      return res.status(404).json({ error: 'Festa não encontrada ou acesso negado' });
    }

    // Formata os dados dos convidados
    const guestData = guests.map(g => ({
      partyId,
      name: g.name || 'Convidado',
      phone: g.phone || '',
      companions: parseInt(g.accompany !== undefined ? g.accompany : g.companions) || 0,
      status: g.status || 'pending',
    }));

    // Cria em lote
    await prisma.guest.createMany({
      data: guestData,
    });

    // Retorna todos os convidados atuais da festa para atualizar a tela
    const allGuests = await prisma.guest.findMany({
      where: { partyId },
      orderBy: { name: 'asc' },
    });

    res.status(201).json(allGuests);
  } catch (error) {
    console.error('Erro ao importar convidados em lote:', error);
    res.status(500).json({ error: 'Erro ao importar convidados em lote' });
  }
};
