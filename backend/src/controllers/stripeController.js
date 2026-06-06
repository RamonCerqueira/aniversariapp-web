import Stripe from 'stripe';
import { prisma } from '../server.js';

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  const { plan } = req.body;

  try {
    if (!plan || !['PREMIUM', 'MASTER'].includes(plan)) {
      return res.status(400).json({ error: 'Plano inválido para assinatura' });
    }

    // Mapeamento de preço em centavos
    const amount = plan === 'PREMIUM' ? 1990 : 4990;

    console.log(`Creating Stripe session for plan: ${plan}, user: ${req.user.email}`);

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Plano Celebrate - ${plan}`,
              description: `Acesso mensal completo às funcionalidades do plano ${plan}`,
            },
            unit_amount: amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3100'}/?payment=success&plan=${plan}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3100'}/?payment=cancel`,
      metadata: {
        userId: req.user.id,
        plan: plan,
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout do Stripe:', error);
    res.status(500).json({ error: 'Erro ao criar sessão de pagamento' });
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (endpointSecret && sig) {
      event = stripeInstance.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } else {
      // Se não houver segredo ou assinatura (ambiente de teste local simplificado)
      console.warn('⚠️ Stripe Webhook: Executando sem verificação de assinatura digital.');
      event = req.body;
    }
  } catch (err) {
    console.error(`❌ Erro no Webhook do Stripe: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Ouve evento de checkout concluído
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    if (userId && plan) {
      try {
        console.log(`🎉 Webhook: Atualizando plano do usuário ${userId} para ${plan}`);
        
        await prisma.user.update({
          where: { id: userId },
          data: { plan: plan }
        });
        
        console.log('User plan updated successfully in database.');
      } catch (dbError) {
        console.error('Erro ao atualizar plano do usuário no banco via webhook:', dbError);
        return res.status(500).json({ error: 'Erro ao salvar assinatura no banco' });
      }
    } else {
      console.warn('⚠️ Webhook recebido sem userId ou plan no metadata da sessão.');
    }
  }

  res.json({ received: true });
};
