import { prisma } from '../server.js';

// Listar todos os fornecedores cadastrados com filtros opcionais (Público/Organizador)
export const getSuppliers = async (req, res) => {
  const { category, city, capacity, recommendOnly } = req.query;

  try {
    const filters = {};

    if (category) {
      filters.category = category;
    }

    if (city) {
      filters.city = {
        contains: city,
        mode: 'insensitive',
      };
    }

    if (capacity) {
      const capVal = parseInt(capacity);
      if (!isNaN(capVal)) {
        filters.capacityMin = { lte: capVal };
        filters.capacityMax = { gte: capVal };
      }
    }

    if (recommendOnly === 'true') {
      filters.user = {
        plan: 'SUPPLIER_PREMIUM'
      };
    }

    const suppliers = await prisma.supplierProfile.findMany({
      where: filters,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            plan: true,
          }
        }
      },
    });

    const planOrder = {
      SUPPLIER_PREMIUM: 1,
      SUPPLIER_BASIC: 2,
      SUPPLIER_MONTHLY: 3,
      FREE: 4
    };

    suppliers.sort((a, b) => {
      const planA = a.user?.plan || 'FREE';
      const planB = b.user?.plan || 'FREE';
      const orderA = planOrder[planA] || 99;
      const orderB = planOrder[planB] || 99;

      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return (a.companyName || '').localeCompare(b.companyName || '');
    });

    res.json(suppliers);
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    res.status(500).json({ error: 'Erro ao buscar fornecedores' });
  }
};

// Obter o perfil de um fornecedor específico por ID (Público/Organizador)
export const getSupplierById = async (req, res) => {
  const { id } = req.params;

  try {
    const supplier = await prisma.supplierProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            plan: true,
          }
        }
      }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json(supplier);
  } catch (error) {
    console.error('Erro ao buscar fornecedor específico:', error);
    res.status(500).json({ error: 'Erro ao buscar fornecedor' });
  }
};

// Obter perfil do próprio fornecedor logado (Privado)
export const getMyProfile = async (req, res) => {
  try {
    const profile = await prisma.supplierProfile.findUnique({
      where: { userId: req.user.id }
    });
    
    res.json(profile || null);
  } catch (error) {
    console.error('Erro ao buscar meu perfil de fornecedor:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil de fornecedor' });
  }
};

// Criar ou atualizar perfil de portfólio (Privado - atualiza a role do usuário para SUPPLIER)
export const upsertProfile = async (req, res) => {
  const { 
    companyName, cnpj, category, capacityMin, capacityMax, phone, instagram, city, description, 
    images, services, blockedDates, logo, foundationYear, socials, differentials, portfolio, 
    packages, locationMap, pricing 
  } = req.body;

  try {
    if (!companyName || !category || !phone || !city || !description) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    const userPlan = user?.plan || 'FREE';
    const servicesList = services || [];

    if (userPlan === 'FREE' && servicesList.length > 0) {
      return res.status(400).json({ error: 'O plano Grátis não permite produtos/serviços no catálogo. Faça um upgrade para cadastrar itens.' });
    }

    if (userPlan === 'SUPPLIER_BASIC' && servicesList.length > 1) {
      return res.status(400).json({ error: 'O plano Essencial permite apenas 1 produto/serviço no catálogo. Faça um upgrade para o plano Ouro para catálogo ilimitado.' });
    }

    // Cria ou atualiza o perfil associado ao userId logado
    const profile = await prisma.supplierProfile.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        companyName,
        cnpj: cnpj || null,
        category,
        capacityMin: parseInt(capacityMin) || 0,
        capacityMax: parseInt(capacityMax) || 10000,
        phone,
        instagram,
        city,
        description,
        images: images || [],
        services: services || [],
        blockedDates: blockedDates || [],
        logo,
        foundationYear: foundationYear ? parseInt(foundationYear) : null,
        socials: socials || {},
        differentials: differentials || [],
        portfolio: portfolio || [],
        packages: packages || [],
        locationMap: locationMap || {},
        pricing: pricing || {},
      },
      update: {
        companyName,
        cnpj: cnpj || null,
        category,
        capacityMin: parseInt(capacityMin) || 0,
        capacityMax: parseInt(capacityMax) || 10000,
        phone,
        instagram,
        city,
        description,
        images: images || [],
        services: services || [],
        blockedDates: blockedDates || [],
        logo,
        foundationYear: foundationYear ? parseInt(foundationYear) : null,
        socials: socials || {},
        differentials: differentials || [],
        portfolio: portfolio || [],
        packages: packages || [],
        locationMap: locationMap || {},
        pricing: pricing || {},
      }
    });

    // Atualiza a ROLE do usuário para SUPPLIER
    await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        role: 'SUPPLIER'
      }
    });

    res.json(profile);
  } catch (error) {
    console.error('Erro ao salvar perfil de fornecedor:', error);
    res.status(500).json({ error: 'Erro ao salvar perfil de fornecedor' });
  }
};

// Deletar o próprio perfil de fornecedor
export const deleteProfile = async (req, res) => {
  try {
    const existing = await prisma.supplierProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Perfil de fornecedor não encontrado' });
    }

    await prisma.supplierProfile.delete({
      where: { userId: req.user.id }
    });

    // Retorna a role do usuário para organizador comum e plano FREE
    await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        role: 'ORGANIZER',
        plan: 'FREE'
      }
    });

    res.json({ message: 'Perfil de fornecedor excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir perfil de fornecedor:', error);
    res.status(500).json({ error: 'Erro ao excluir perfil de fornecedor' });
  }
};

// Adicionar avaliação (Review)
export const addReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment, authorName } = req.body;

  try {
    const review = await prisma.supplierReview.create({
      data: {
        supplierId: id,
        rating: parseInt(rating),
        comment,
        authorName: authorName || 'Cliente Anônimo'
      }
    });
    res.status(201).json(review);
  } catch (error) {
    console.error('Erro ao adicionar avaliação:', error);
    res.status(500).json({ error: 'Erro ao adicionar avaliação' });
  }
};

// Obter avaliações
export const getReviews = async (req, res) => {
  const { id } = req.params;

  try {
    const reviews = await prisma.supplierReview.findMany({
      where: { supplierId: id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({ error: 'Erro ao buscar avaliações' });
  }
};

// Incrementar visualização
export const incrementView = async (req, res) => {
  const { id } = req.params;

  try {
    const supplier = await prisma.supplierProfile.findUnique({
      where: { id },
      select: { viewStats: true }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    const currentStats = supplier.viewStats ? (typeof supplier.viewStats === 'string' ? JSON.parse(supplier.viewStats) : supplier.viewStats) : { totalViews: 0, clickToChat: 0, saveCount: 0 };
    
    currentStats.totalViews = (currentStats.totalViews || 0) + 1;

    await prisma.supplierProfile.update({
      where: { id },
      data: { viewStats: currentStats }
    });

    res.json({ success: true, viewStats: currentStats });
  } catch (error) {
    console.error('Erro ao incrementar visualização:', error);
    res.status(500).json({ error: 'Erro ao incrementar visualização' });
  }
};
