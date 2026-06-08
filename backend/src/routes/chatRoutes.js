import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../server.js';
import { createNotification } from '../controllers/notificationController.js';

const router = express.Router();

// 1. Iniciar ou Buscar Sala de Chat
router.post('/', requireAuth, async (req, res) => {
  try {
    const { partyId, supplierId } = req.body;
    if (!partyId || !supplierId) {
      return res.status(400).json({ error: 'partyId e supplierId são obrigatórios' });
    }

    // Verifica se já existe uma sala para essa festa e esse fornecedor
    let room = await prisma.chatRoom.findFirst({
      where: { partyId, supplierId },
      include: {
        party: { select: { name: true } },
        supplier: { select: { companyName: true, images: true } }
      }
    });

    if (!room) {
      const supplier = await prisma.supplierProfile.findUnique({
        where: { id: supplierId },
        include: {
          user: { select: { plan: true } }
        }
      });

      if (!supplier) {
        return res.status(404).json({ error: 'Fornecedor não encontrado.' });
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

      room = await prisma.chatRoom.create({
        data: { partyId, supplierId },
        include: {
          party: { select: { name: true } },
          supplier: { select: { companyName: true, images: true } }
        }
      });
    }

    res.json(room);
  } catch (error) {
    console.error('Erro ao iniciar chat:', error);
    res.status(500).json({ error: 'Erro interno ao iniciar chat.' });
  }
});

// 2. Listar Salas de Chat do Usuário Logado
router.get('/', requireAuth, async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    let rooms = [];

    if (role === 'SUPPLIER') {
      const profile = await prisma.supplierProfile.findUnique({
        where: { userId }
      });
      if (!profile) return res.json([]);
      
      rooms = await prisma.chatRoom.findMany({
        where: { supplierId: profile.id },
        include: {
          party: {
            select: { name: true, date: true, user: { select: { name: true } } }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
    } else {
      // Cliente (Organizer)
      const parties = await prisma.party.findMany({
        where: { userId },
        select: { id: true }
      });
      const partyIds = parties.map(p => p.id);

      rooms = await prisma.chatRoom.findMany({
        where: { partyId: { in: partyIds } },
        include: {
          party: { select: { name: true } },
          supplier: { select: { companyName: true, images: true, category: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
    }

    res.json(rooms);
  } catch (error) {
    console.error('Erro ao listar chats:', error);
    res.status(500).json({ error: 'Erro interno ao listar chats.' });
  }
});

// 3. Buscar mensagens de uma sala
router.get('/:id/messages', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificação de segurança: checar se o usuário tem acesso à sala
    const room = await prisma.chatRoom.findUnique({
      where: { id },
      include: { party: true, supplier: true }
    });

    if (!room) return res.status(404).json({ error: 'Sala não encontrada.' });

    const messages = await prisma.message.findMany({
      where: { roomId: id },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ room, messages });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro interno ao buscar mensagens.' });
  }
});

// 4. Enviar nova mensagem
router.post('/:id/messages', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const { role, id: userId } = req.user;

    const room = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        party: { select: { userId: true, name: true } },
        supplier: { select: { userId: true, companyName: true } }
      }
    });
    if (!room) return res.status(404).json({ error: 'Sala não encontrada.' });

    // Bloqueio do Cliente
    if (room.isClosed && role === 'SUPPLIER') {
      return res.status(403).json({ error: 'O cliente encerrou esta conversa. Você não pode mais enviar mensagens.' });
    }

    const message = await prisma.message.create({
      data: {
        roomId: id,
        senderId: userId,
        senderRole: role,
        content
      }
    });

    // Atualiza o updatedAt da sala para ordenar a lista
    await prisma.chatRoom.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    // Notificar o destinatário da mensagem
    const recipientId = role === 'SUPPLIER' ? room.party.userId : room.supplier.userId;
    const senderName = role === 'SUPPLIER' ? room.supplier.companyName : room.party.name;
    createNotification(
      recipientId,
      `Mensagem de ${senderName}`,
      content.length > 65 ? `${content.substring(0, 65)}...` : content,
      'chat'
    ).catch(err => console.error('Erro ao gerar notificação de chat:', err));

    res.json(message);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro interno ao enviar mensagem.' });
  }
});

// 5. Encerrar Chat (Apenas Cliente/Organizador)
router.patch('/:id/close', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    if (role !== 'ORGANIZER') {
      return res.status(403).json({ error: 'Apenas organizadores podem encerrar conversas.' });
    }

    const room = await prisma.chatRoom.update({
      where: { id },
      data: { isClosed: true }
    });

    res.json(room);
  } catch (error) {
    console.error('Erro ao encerrar chat:', error);
    res.status(500).json({ error: 'Erro interno ao encerrar chat.' });
  }
});

export default router;
