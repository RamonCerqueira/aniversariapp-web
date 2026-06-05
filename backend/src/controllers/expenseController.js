import { prisma } from '../server.js';

// Listar despesas por partyId
export const getExpenses = async (req, res) => {
  const { partyId } = req.query;

  try {
    if (!partyId) {
      return res.status(400).json({ error: 'O parâmetro partyId é obrigatório' });
    }

    // Valida se a festa pertence ao organizador logado
    const party = await prisma.party.findFirst({
      where: { id: partyId, userId: req.user.id }
    });

    if (!party) {
      return res.status(404).json({ error: 'Festa não encontrada ou acesso negado' });
    }

    const expenses = await prisma.expense.findMany({
      where: { partyId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(expenses);
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    res.status(500).json({ error: 'Erro ao buscar despesas' });
  }
};

// Criar nova despesa
export const createExpense = async (req, res) => {
  const { partyId, name, amount, category, paid } = req.body;

  try {
    if (!partyId || !name || amount === undefined || !category) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    // Valida propriedade da festa
    const party = await prisma.party.findFirst({
      where: { id: partyId, userId: req.user.id }
    });

    if (!party) {
      return res.status(404).json({ error: 'Festa não encontrada ou acesso negado' });
    }

    const expense = await prisma.expense.create({
      data: {
        partyId,
        name,
        amount: parseFloat(amount) || 0,
        category,
        paid: paid || false,
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Erro ao lançar despesa:', error);
    res.status(500).json({ error: 'Erro ao lançar despesa' });
  }
};

// Atualizar despesa
export const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { name, amount, category, paid } = req.body;

  try {
    // Valida propriedade através da festa
    const existing = await prisma.expense.findFirst({
      where: {
        id,
        party: { userId: req.user.id }
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Despesa não encontrada ou acesso negado' });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        name,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        category,
        paid,
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    res.status(500).json({ error: 'Erro ao atualizar despesa' });
  }
};

// Excluir despesa
export const deleteExpense = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.expense.findFirst({
      where: {
        id,
        party: { userId: req.user.id }
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Despesa não encontrada ou acesso negado' });
    }

    await prisma.expense.delete({
      where: { id }
    });

    res.json({ message: 'Despesa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir despesa:', error);
    res.status(500).json({ error: 'Erro ao excluir despesa' });
  }
};
