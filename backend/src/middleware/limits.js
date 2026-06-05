import { prisma } from '../server.js';

export const checkPartyLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Busca o plano do usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const currentPlan = user.plan;

    // Plano MASTER tem festas ilimitadas
    if (currentPlan === 'MASTER') {
      return next();
    }

    // Conta a quantidade de festas ativas do usuário
    const partyCount = await prisma.party.count({
      where: { userId }
    });

    if (currentPlan === 'FREE' && partyCount >= 1) {
      return res.status(403).json({
        error: 'Limite de plano atingido',
        message: 'No plano gratuito você pode criar no máximo 1 festa. Faça upgrade para o plano Premium ou Master!',
        code: 'LIMIT_REACHED'
      });
    }

    if (currentPlan === 'PREMIUM' && partyCount >= 5) {
      return res.status(403).json({
        error: 'Limite de plano atingido',
        message: 'No plano Premium você pode criar no máximo 5 festas. Faça upgrade para o plano Master!',
        code: 'LIMIT_REACHED'
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar limite de festas:', error);
    res.status(500).json({ error: 'Erro interno ao validar limites de festas' });
  }
};
