import { prisma } from '../server.js';
import { createNotification } from './notificationController.js';

// Criar um novo lead (Solicitar orçamento de uma festa específica)
export const createLead = async (req, res) => {
  const { partyId, supplierId } = req.body;

  try {
    if (!partyId || !supplierId) {
      return res.status(400).json({ error: 'Campos partyId e supplierId são obrigatórios' });
    }

    // Valida se a festa pertence ao organizador logado
    const party = await prisma.party.findFirst({
      where: { id: partyId, userId: req.user.id }
    });

    if (!party) {
      return res.status(404).json({ error: 'Festa não encontrada ou acesso negado' });
    }

    // Valida se o fornecedor existe
    const supplier = await prisma.supplierProfile.findUnique({
      where: { id: supplierId },
      include: {
        user: { select: { plan: true } }
      }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    if (supplier.user?.plan === 'FREE') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      const leads = await prisma.lead.findMany({
        where: {
          supplierId: supplier.id,
          createdAt: { gte: startOfMonth, lte: endOfMonth }
        },
        select: { partyId: true }
      });

      const chatRooms = await prisma.chatRoom.findMany({
        where: {
          supplierId: supplier.id,
          createdAt: { gte: startOfMonth, lte: endOfMonth }
        },
        select: { partyId: true }
      });

      const uniqueParties = new Set([
        ...leads.map(l => l.partyId),
        ...chatRooms.map(c => c.partyId)
      ]);

      if (!uniqueParties.has(partyId) && uniqueParties.size >= 3) {
        return res.status(403).json({
          error: 'Este fornecedor atingiu o limite mensal de contatos do plano Grátis.'
        });
      }
    }

    // Cria o Lead no banco de dados
    const lead = await prisma.lead.create({
      data: {
        partyId,
        supplierId,
        status: 'pending'
      },
      include: {
        party: true,
        supplier: true
      }
    });

    // Notificar o fornecedor sobre o novo lead
    if (lead.supplier?.userId) {
      createNotification(
        lead.supplier.userId,
        'Novo Orçamento Solicitado!',
        `A festa "${lead.party?.name || 'Cliente'}" solicitou um orçamento de você.`,
        'lead'
      ).catch(err => console.error('Erro ao gerar notificação de lead:', err));
    }

    res.status(201).json(lead);
  } catch (error) {
    console.error('Erro ao registrar lead de orçamento:', error);
    res.status(500).json({ error: 'Erro ao registrar solicitação de orçamento' });
  }
};

// Obter os Leads recebidos pelo FORNECEDOR logado
export const getSupplierLeads = async (req, res) => {
  try {
    const supplier = await prisma.supplierProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!supplier) {
      return res.status(403).json({ error: 'Acesso negado. Perfil de fornecedor inexistente.' });
    }

    const leads = await prisma.lead.findMany({
      where: { supplierId: supplier.id },
      include: {
        party: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(leads);
  } catch (error) {
    console.error('Erro ao buscar leads do fornecedor:', error);
    res.status(500).json({ error: 'Erro ao buscar solicitações de orçamento' });
  }
};

// Obter os Leads enviados pelo ORGANIZADOR logado
export const getOrganizerLeads = async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      where: { party: { userId: req.user.id } },
      include: {
        supplier: true,
        party: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(leads);
  } catch (error) {
    console.error('Erro ao buscar leads do organizador:', error);
    res.status(500).json({ error: 'Erro ao buscar solicitações enviadas' });
  }
};

// Alterar o status do lead (Fornecedor atualiza se já contatou ou fechou contrato)
export const updateLeadStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'contacted' | 'closed'

  try {
    if (!status || !['pending', 'contacted', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Status de lead inválido' });
    }

    // Garante que o lead pertence ao fornecedor logado
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        supplier: { userId: req.user.id }
      }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Solicitação não encontrada ou acesso negado' });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { status }
    });

    res.json(updatedLead);
  } catch (error) {
    console.error('Erro ao atualizar status do lead:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do lead' });
  }
};
