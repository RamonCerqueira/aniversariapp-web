import { prisma } from '../server.js';

// Obter notificações do usuário logado
export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ error: 'Erro ao carregar notificações' });
  }
};

// Marcar uma notificação como lida
export const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ error: 'Erro ao atualizar notificação' });
  }
};

// Marcar todas como lidas
export const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ success: true, message: 'Todas as notificações marcadas como lidas' });
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
    res.status(500).json({ error: 'Erro ao atualizar notificações' });
  }
};

// Limpar histórico (deletar todas)
export const clearAll = async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.id }
    });
    res.json({ success: true, message: 'Histórico de notificações limpo' });
  } catch (error) {
    console.error('Erro ao limpar notificações:', error);
    res.status(500).json({ error: 'Erro ao limpar notificações' });
  }
};

// Helper interno para gerar notificações por ações do sistema
export const createNotification = async (userId, title, content, type = 'info') => {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        content,
        type
      }
    });
  } catch (error) {
    console.error('Erro ao criar notificação em background:', error);
    return null;
  }
};
