import { prisma } from '../server.js';
import { createNotification } from './notificationController.js';

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
            type: true,
            theme: true,
            dressCode: true,
            giftListUrl: true,
            timeline: true,
            hotels: true,
            playlistUrl: true,
            gallery: true,
            coverPhoto: true,
            coverVideo: true,
            teaserVideo: true,
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
  const { partyId, name, phone, companions, status, whatsappInvite, email, tableNumber, sector } = req.body;

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
        email: email || null,
        tableNumber: tableNumber || null,
        sector: sector || null
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
  const { name, phone, companions, status, whatsappInvite, email, tableNumber, sector } = req.body;

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
        email: email !== undefined ? email : undefined,
        tableNumber: tableNumber !== undefined ? tableNumber : undefined,
        sector: sector !== undefined ? sector : undefined
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
  const { 
    status, 
    companionNames,
    email,
    dietaryRestrictions,
    favoriteSong,
    photoUrl,
    messageToHost
  } = req.body; // 'confirmed' ou 'declined' + novos dados ricos do RSVP

  try {
    if (!status || !['confirmed', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Status de RSVP inválido' });
    }

    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        party: { select: { userId: true, name: true } }
      }
    });

    if (!guest) {
      return res.status(404).json({ error: 'Convidado não encontrado' });
    }

    const updateData = { 
      status,
      email: email || undefined,
      favoriteSong: favoriteSong || undefined,
      photoUrl: photoUrl || undefined,
      messageToHost: messageToHost || undefined
    };
    
    if (status === 'confirmed' && Array.isArray(companionNames)) {
      updateData.companionNames = companionNames.filter(n => n && n.trim());
    }
    
    if (Array.isArray(dietaryRestrictions)) {
      updateData.dietaryRestrictions = dietaryRestrictions;
    }

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: updateData
    });

    // Notificar o organizador da festa
    if (guest.party?.userId) {
      const statusText = status === 'confirmed' ? 'confirmou presença' : 'declinou o convite';
      const companionsCount = updateData.companionNames?.length || 0;
      const companionText = companionsCount > 0
        ? ` (+${companionsCount} acompanhante${companionsCount > 1 ? 's' : ''})`
        : '';

      createNotification(
        guest.party.userId,
        'Novo RSVP Recebido! 📩',
        `${guest.name} ${statusText}${companionText} para o evento "${guest.party.name}".`,
        'guest'
      ).catch(err => console.error('Erro ao gerar notificação de RSVP:', err));
    }

    res.json({
      message: 'RSVP respondido com sucesso!',
      guest: {
        id: updatedGuest.id,
        name: updatedGuest.name,
        status: updatedGuest.status,
        companionNames: updatedGuest.companionNames,
        email: updatedGuest.email,
        dietaryRestrictions: updatedGuest.dietaryRestrictions,
        favoriteSong: updatedGuest.favoriteSong,
        photoUrl: updatedGuest.photoUrl,
        messageToHost: updatedGuest.messageToHost,
        tableNumber: updatedGuest.tableNumber,
        sector: updatedGuest.sector
      }
    });
  } catch (error) {
    console.error('Erro ao responder RSVP público:', error);
    res.status(500).json({ error: 'Erro ao responder RSVP' });
  }
};

// Check-in de convidado via QR Code (Administrativo)
export const checkInGuest = async (req, res) => {
  const { id } = req.params;

  try {
    const guest = await prisma.guest.findFirst({
      where: { id, party: { userId: req.user.id } },
      include: { party: { select: { name: true } } }
    });

    if (!guest) {
      return res.status(404).json({ error: 'Convidado não encontrado ou acesso negado' });
    }

    if (guest.checkedIn) {
      return res.status(409).json({
        error: 'Já registrado',
        message: `${guest.name} já realizou check-in anteriormente.`,
        guest: { id: guest.id, name: guest.name, status: guest.status, companionNames: guest.companionNames, checkedIn: guest.checkedIn, checkedInAt: guest.checkedInAt }
      });
    }

    if (guest.status !== 'confirmed') {
      return res.status(400).json({
        error: 'Não confirmado',
        message: `${guest.name} não confirmou presença via RSVP.`,
        guest: { id: guest.id, name: guest.name, status: guest.status }
      });
    }

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: { checkedIn: true, checkedInAt: new Date() }
    });

    // Notificar o organizador sobre o check-in na portaria
    createNotification(
      req.user.id,
      'Portaria: Check-in Realizado 🎟️',
      `${updatedGuest.name} acabou de entrar na festa "${guest.party.name}".`,
      'guest'
    ).catch(err => console.error('Erro ao gerar notificação de check-in:', err));

    res.json({
      message: 'Check-in realizado com sucesso!',
      guest: {
        id: updatedGuest.id,
        name: updatedGuest.name,
        status: updatedGuest.status,
        companions: updatedGuest.companions,
        companionNames: updatedGuest.companionNames,
        checkedIn: updatedGuest.checkedIn,
        checkedInAt: updatedGuest.checkedInAt
      }
    });
  } catch (error) {
    console.error('Erro ao fazer check-in:', error);
    res.status(500).json({ error: 'Erro ao processar check-in' });
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

// Busca pública de convidados por nome em uma determinada festa (integração externa)
export const searchExternalGuests = async (req, res) => {
  const { partyId, q } = req.query;

  try {
    if (!partyId || !q || q.trim().length < 3) {
      return res.json([]);
    }

    const guests = await prisma.guest.findMany({
      where: {
        partyId,
        name: { contains: q.trim(), mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true,
        status: true,
        companions: true,
      },
      take: 10
    });

    res.json(guests);
  } catch (error) {
    console.error('Erro ao buscar convidados externos:', error);
    res.status(500).json({ error: 'Erro ao buscar convidados externos' });
  }
};
