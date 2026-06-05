import { prisma } from '../server.js';

export const getTasks = async (req, res) => {
  const { partyId } = req.query;

  try {
    const whereClause = partyId
      ? { partyId, party: { userId: req.user.id } }
      : { party: { userId: req.user.id } };

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });
    res.json(tasks);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
};

export const createTask = async (req, res) => {
  const { partyId, name, date, categoria, prioridade, done } = req.body;

  try {
    if (!partyId || !name || !date || !categoria || !prioridade) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const party = await prisma.party.findFirst({
      where: { id: partyId, userId: req.user.id }
    });

    if (!party) {
      return res.status(404).json({ error: 'Festa não encontrada ou acesso negado' });
    }

    const task = await prisma.task.create({
      data: {
        partyId,
        name,
        date: new Date(date),
        categoria,
        prioridade,
        done: done || false,
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { name, date, categoria, prioridade, done } = req.body;

  try {
    const existingTask = await prisma.task.findFirst({
      where: { id, party: { userId: req.user.id } }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Tarefa não encontrada ou acesso negado' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        name,
        date: date ? new Date(date) : undefined,
        categoria,
        prioridade,
        done,
      }
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const existingTask = await prisma.task.findFirst({
      where: { id, party: { userId: req.user.id } }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Tarefa não encontrada ou acesso negado' });
    }

    await prisma.task.delete({
      where: { id }
    });

    res.json({ message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    res.status(500).json({ error: 'Erro ao excluir tarefa' });
  }
};
