import { prisma } from '../server.js';

export const getParties = async (req, res) => {
  try {
    const parties = await prisma.party.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'asc' },
    });
    res.json(parties);
  } catch (error) {
    console.error('Erro ao buscar festas:', error);
    res.status(500).json({ error: 'Erro ao buscar festas' });
  }
};

export const createParty = async (req, res) => {
  const { name, type, date, location, description, guestCount, budget, theme, dressCode, giftListUrl, timeline, hotels, playlistUrl, gallery, coverPhoto, coverVideo, teaserVideo } = req.body;

  try {
    if (!name || !type || !date || !location) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const party = await prisma.party.create({
      data: {
        userId: req.user.id,
        name,
        type,
        date: new Date(date),
        location,
        description,
        guestCount: parseInt(guestCount) || 0,
        budget: budget ? parseFloat(budget) : null,
        theme: theme || 'luxury-black',
        dressCode: dressCode || null,
        giftListUrl: giftListUrl || null,
        timeline: timeline || null,
        hotels: hotels || null,
        playlistUrl: playlistUrl || null,
        gallery: gallery || [],
        coverPhoto: coverPhoto || null,
        coverVideo: coverVideo || null,
        teaserVideo: teaserVideo || null
      }
    });

    res.status(201).json(party);
  } catch (error) {
    console.error('Erro ao criar festa:', error);
    res.status(500).json({ error: 'Erro ao criar festa' });
  }
};

export const updateParty = async (req, res) => {
  const { id } = req.params;
  const { name, type, date, location, description, guestCount, budget, theme, dressCode, giftListUrl, timeline, hotels, playlistUrl, gallery, coverPhoto, coverVideo, teaserVideo } = req.body;

  try {
    const existingParty = await prisma.party.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingParty) {
      return res.status(404).json({ error: 'Festa não encontrada ou acesso negado' });
    }

    const updatedParty = await prisma.party.update({
      where: { id },
      data: {
        name,
        type,
        date: date ? new Date(date) : undefined,
        location,
        description,
        guestCount: guestCount !== undefined ? parseInt(guestCount) : undefined,
        budget: budget !== undefined ? (budget ? parseFloat(budget) : null) : undefined,
        theme: theme !== undefined ? theme : undefined,
        dressCode: dressCode !== undefined ? dressCode : undefined,
        giftListUrl: giftListUrl !== undefined ? giftListUrl : undefined,
        timeline: timeline !== undefined ? timeline : undefined,
        hotels: hotels !== undefined ? hotels : undefined,
        playlistUrl: playlistUrl !== undefined ? playlistUrl : undefined,
        gallery: gallery !== undefined ? gallery : undefined,
        coverPhoto: coverPhoto !== undefined ? coverPhoto : undefined,
        coverVideo: coverVideo !== undefined ? coverVideo : undefined,
        teaserVideo: teaserVideo !== undefined ? teaserVideo : undefined
      }
    });

    res.json(updatedParty);
  } catch (error) {
    console.error('Erro ao atualizar festa:', error);
    res.status(500).json({ error: 'Erro ao atualizar festa' });
  }
};

export const deleteParty = async (req, res) => {
  const { id } = req.params;

  try {
    const existingParty = await prisma.party.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingParty) {
      return res.status(404).json({ error: 'Festa não encontrada ou acesso negado' });
    }

    await prisma.party.delete({
      where: { id }
    });

    res.json({ message: 'Festa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir festa:', error);
    res.status(500).json({ error: 'Erro ao excluir festa' });
  }
};
