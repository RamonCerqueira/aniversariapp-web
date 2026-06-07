import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionScreen({ onBack }) {
  const { user, createStripeSession, subscribeToPlan } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const currentPlan = user?.plan || 'FREE';

  const isSupplier = user?.role === 'SUPPLIER';

  const organizerPlans = [
    {
      id: 'FREE',
      name: 'Free / Básico',
      priceMonthly: 'R$ 0,00',
      priceAnnual: 'R$ 0,00',
      period: 'para sempre',
      description: 'Perfeito para quem quer organizar uma festa única de aniversário de forma simples.',
      features: [
        'Organização de até 1 festa ativa',
        'Checklist de tarefas completo',
        'Lista de convidados simples',
        'Envio de convites via WhatsApp',
        'Confirmação de presença (RSVP)'
      ],
      icon: Zap,
      color: 'border-border bg-card/60'
    },
    {
      id: 'PREMIUM',
      name: 'Premium Celebre',
      priceMonthly: 'R$ 19,90',
      priceAnnual: 'R$ 15,90',
      period: 'por mês',
      description: 'Ideal para famílias grandes ou organizadores frequentes com festas paralelas.',
      features: [
        'Organização de até 5 festas ativas',
        'Acesso total ao Diretório de Fornecedores',
        'Calculadora de Consumo (Churrascômetro)',
        'Controle Financeiro avançado (Budget Tracker)',
        'Todas as funções do plano Free'
      ],
      icon: Sparkles,
      color: 'border-primary md:ring-4 md:ring-primary/10 shadow-primary/20 md:scale-105 relative z-10',
      highlighted: true
    },
    {
      id: 'MASTER',
      name: 'Master / Pro',
      priceMonthly: 'R$ 49,90',
      priceAnnual: 'R$ 39,90',
      period: 'por mês',
      description: 'Perfeito para grandes marcas de eventos, cerimonialistas e festas gigantescas.',
      features: [
        'Organização de festas ilimitadas',
        'Importação de convidados via planilha CSV',
        'Interface rápida de Check-in de Portaria',
        'Exibição em destaque no Diretório de busca',
        'Suporte prioritário 24/7'
      ],
      icon: ShieldCheck,
      color: 'border-zinc-700 bg-card/60'
    }
  ];

  const supplierPlans = [
    {
      id: 'FREE',
      name: 'Grátis',
      priceMonthly: 'R$ 0,00',
      priceAnnual: 'R$ 0,00',
      period: 'para sempre',
      description: 'Ideal para fornecedores iniciantes que querem testar a plataforma.',
      features: [
        'Perfil simples no diretório',
        'Máximo de 3 leads (contatos) por mês',
        'Catálogo bloqueado (0 produtos)',
        'Receba avaliações de clientes'
      ],
      icon: Zap,
      color: 'border-border bg-card/60'
    },
    {
      id: 'SUPPLIER_BASIC',
      name: 'Essencial / Bronze',
      priceMonthly: 'R$ 49,90',
      priceAnnual: 'R$ 39,90',
      period: 'por mês',
      description: 'Ótimo para fornecedores ativos que querem começar a vender seus serviços.',
      features: [
        'Perfil completo no diretório',
        'Até 1 produto/serviço no catálogo',
        'Leads e contatos ilimitados',
        'Chat integrado com organizadores'
      ],
      icon: ShieldCheck,
      color: 'border-zinc-700 bg-card/60'
    },
    {
      id: 'SUPPLIER_PREMIUM',
      name: 'Destaque Ouro',
      priceMonthly: 'R$ 69,90',
      priceAnnual: 'R$ 55,90',
      period: 'por mês',
      description: 'Para quem busca destaque absoluto, exibição automatizada e catálogo ilimitado.',
      features: [
        'Exibição no topo das pesquisas',
        'Sugestão automática na Calculadora',
        'Catálogo de serviços ilimitado',
        'Selo de verificação em destaque',
        'Leads e contatos ilimitados',
        'Relatórios de visualizações e cliques'
      ],
      icon: Sparkles,
      color: 'border-primary md:ring-4 md:ring-primary/10 shadow-primary/20 md:scale-105 relative z-10',
      highlighted: true
    }
  ];

  const plans = isSupplier ? supplierPlans : organizerPlans;

  const getPlanDisplayName = (plan) => {
    switch(plan) {
      case 'PREMIUM': return 'Celebrate Premium';
      case 'MASTER': return 'Celebrate Master / Pro';
      case 'SUPPLIER_BASIC': return 'Essencial / Bronze';
      case 'SUPPLIER_PREMIUM': return 'Destaque Ouro';
      case 'SUPPLIER_MONTHLY': return 'Fornecedor Mensal (Legado)';
      default: return 'Celebrate Grátis';
    }
  };

  const handleUpgrade = async (planId) => {
    if (planId === currentPlan) return;
    setLoadingPlan(planId);
    try {
      const session = await createStripeSession(planId);
      if (session && session.url) {
        toast.info('Redirecionando...', {
          description: 'Estamos te redirecionando para a página de pagamento segura do Stripe.',
          position: 'top-center'
        });
        window.location.href = session.url;
      } else {
        throw new Error('URL de checkout do Stripe não foi retornada.');
      }
    } catch (error) {
      console.warn('Erro ao criar checkout do Stripe. Ativando plano via API direta (Modo Desenvolvimento):', error);
      try {
        await subscribeToPlan(planId);
        toast.success('Assinatura Atualizada!', {
          description: `Seu plano foi atualizado para ${
            planId === 'MASTER' ? 'Master' : 
            planId === 'PREMIUM' ? 'Premium' : 
            planId === 'SUPPLIER_PREMIUM' ? 'Destaque Ouro' : 
            planId === 'SUPPLIER_BASIC' ? 'Essencial' : 'Básico'
          } com sucesso!`,
          position: 'top-center'
        });
      } catch (subErr) {
        console.error('Erro na assinatura direta:', subErr);
        toast.error('Erro na Assinatura', {
          description: 'Ocorreu um erro ao processar sua assinatura. Tente novamente.',
          position: 'top-center'
        });
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 relative overflow-hidden transition-colors duration-300">
      {/* Mesh aurorais de fundo */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary/20 dark:bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-secondary/20 dark:bg-secondary/10 blur-[100px] pointer-events-none" />

      {/* Header Container */}
      <div className="relative z-10 pt-10 pb-10 px-6 border-b border-border/40 shadow-sm overflow-hidden">
        {/* Subtle Background Image & Texture */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop" 
            alt="Background" 
            className="w-full h-full object-cover opacity-[0.08] mix-blend-multiply dark:mix-blend-lighten dark:opacity-[0.15]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background/95 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-[60px] pointer-events-none z-0" />

        <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-foreground hover:bg-muted rounded-full w-10 h-10 border border-border/50 bg-background/50 backdrop-blur-sm"
            >
              <ArrowLeft size={20} />
            </Button>
          </motion.div>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full">
            <Sparkles size={16} strokeWidth={2.5} className="text-primary" />
            <h1 className="text-[10px] font-black uppercase tracking-widest text-primary">Assinatura</h1>
          </div>
          <div className="w-10 h-10" />
        </div>
        
        <div className="max-w-3xl mx-auto mt-6 text-center z-10 relative space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-black tracking-tight sm:text-4xl text-foreground"
          >
            Assinaturas Celebrate!
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl mx-auto text-xs sm:text-sm font-semibold text-muted-foreground leading-relaxed"
          >
            {isSupplier 
              ? 'Conecte-se com organizadores de festas na sua região, divulgue seus serviços no catálogo e impulsione suas vendas com nossos planos dedicados.'
              : 'De pequenas reuniões familiares a mega eventos de gala. Economize tempo de preparo, aumente limites e otimize cada centavo.'}
          </motion.p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-12 space-y-8 relative z-10">
        
        {/* Se for assinante, mostra os detalhes da assinatura atual */}
        {currentPlan !== 'FREE' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/50 to-secondary/5 backdrop-blur-xl shadow-xl space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${
                  currentPlan === 'MASTER' || currentPlan === 'SUPPLIER_PREMIUM' 
                    ? 'bg-zinc-800 text-amber-400' 
                    : 'bg-primary/20 text-primary'
                }`}>
                  {currentPlan === 'MASTER' || currentPlan === 'SUPPLIER_PREMIUM' ? <ShieldCheck size={32} /> : <Sparkles size={32} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-extrabold text-foreground">
                      {getPlanDisplayName(currentPlan)}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                      Assinatura Ativa ✨
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Vinculada à conta: <span className="font-bold text-foreground">{user?.email || 'usuario@celebrate.com'}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-1">
                <span className="text-xs text-muted-foreground font-bold">Faturamento via Stripe</span>
                <span className="text-sm text-foreground font-extrabold">
                  Próxima renovação: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Se for plano médio (PREMIUM ou SUPPLIER_BASIC), oferece o Upgrade */}
            {((currentPlan === 'PREMIUM' && !isSupplier) || (currentPlan === 'SUPPLIER_BASIC' && isSupplier)) && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="text-sm font-extrabold text-amber-500 dark:text-amber-400 flex items-center justify-center md:justify-start gap-1">
                    <Sparkles size={16} /> UPGRADE DISPONÍVEL
                  </h4>
                  <p className="text-xs text-foreground/80 font-medium max-w-xl">
                    {isSupplier 
                      ? <span>Eleve o faturamento do seu negócio! Migre para o plano <strong>Destaque Ouro</strong> e apareça automaticamente nas recomendações de bebidas e comidas da calculadora, fique no topo do diretório e tenha catálogo ilimitado.</span>
                      : <span>Eleve o nível dos seus eventos! Migre para o plano <strong>Master / Pro</strong> e obtenha festas ilimitadas, importação de planilhas de convidados, check-in inteligente e suporte prioritário 24/7.</span>}
                  </p>
                </div>
                <Button
                  onClick={() => handleUpgrade(isSupplier ? 'SUPPLIER_PREMIUM' : 'MASTER')}
                  disabled={loadingPlan !== null}
                  className="bg-gradient-to-r from-amber-500 to-primary hover:from-amber-600 hover:to-primary/95 text-white font-extrabold text-xs py-5 px-6 rounded-xl shadow-lg shadow-amber-500/10 transition-all duration-300 w-full md:w-auto cursor-pointer"
                >
                  {loadingPlan === (isSupplier ? 'SUPPLIER_PREMIUM' : 'MASTER') 
                    ? 'Processando...' 
                    : isSupplier ? 'Fazer Upgrade para Ouro 🚀' : 'Fazer Upgrade para Master 🚀'}
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Toggle de Faturamento Mensal / Anual */}
        <div className="flex justify-center items-center gap-3">
          <span className={`text-sm font-bold transition-all duration-200 ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Mensal</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-8 bg-primary rounded-full relative p-1 transition-colors duration-200 cursor-pointer shadow-inner"
          >
            <motion.div
              layout
              className="w-6 h-6 bg-white rounded-full shadow-md"
              animate={{ x: isAnnual ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Anual 
            <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse-custom">
              Economize 20%
            </span>
          </span>
        </div>

        {/* Grid de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch pt-4">
          {plans.map((plan, idx) => {
            const Icon = plan.icon;
            const isCurrent = plan.id === currentPlan;
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;

            // Determinar o destaque dinâmico
            let isHighlighted = plan.highlighted;
            let cardColor = plan.color;
            let badgeText = plan.highlighted ? (isSupplier ? "Melhor Opção Ouro 🔥" : "Recomendado Festeiro ✨") : null;

            if (currentPlan === 'PREMIUM' || currentPlan === 'SUPPLIER_BASIC') {
              const targetUpgrade = isSupplier ? 'SUPPLIER_PREMIUM' : 'MASTER';
              const targetMedium = isSupplier ? 'SUPPLIER_BASIC' : 'PREMIUM';
              if (plan.id === targetUpgrade) {
                isHighlighted = true;
                cardColor = 'border-amber-500/50 md:ring-4 md:ring-amber-500/10 shadow-amber-500/20 md:scale-105 relative z-10';
                badgeText = 'Upgrade Recomendado ⚡';
              } else if (plan.id === targetMedium) {
                isHighlighted = false;
                cardColor = 'border-primary bg-primary/5';
                badgeText = 'Seu Plano Atual 🌟';
              }
            } else if (currentPlan === 'MASTER' || currentPlan === 'SUPPLIER_PREMIUM') {
              const targetUpgrade = isSupplier ? 'SUPPLIER_PREMIUM' : 'MASTER';
              if (plan.id === targetUpgrade) {
                isHighlighted = true;
                cardColor = 'border-amber-500 md:ring-4 md:ring-amber-500/10 shadow-amber-500/20 md:scale-105 relative z-10';
                badgeText = 'Seu Plano Atual 🏆';
              } else {
                isHighlighted = false;
                cardColor = 'border-border bg-card/40 opacity-70';
              }
            }

            // Definir o texto do botão
            let buttonText = `Escolher ${plan.name}`;
            if (isCurrent) {
              buttonText = 'Plano Ativo';
            } else if (isSupplier) {
              if (currentPlan === 'SUPPLIER_BASIC') {
                if (plan.id === 'SUPPLIER_PREMIUM') {
                  buttonText = 'Upgrade para Ouro 🚀';
                } else if (plan.id === 'FREE') {
                  buttonText = 'Mudar para Grátis';
                }
              } else if (currentPlan === 'SUPPLIER_PREMIUM') {
                if (plan.id === 'SUPPLIER_BASIC') {
                  buttonText = 'Mudar para Essencial';
                } else if (plan.id === 'FREE') {
                  buttonText = 'Mudar para Grátis';
                }
              }
            } else {
              if (currentPlan === 'PREMIUM') {
                if (plan.id === 'MASTER') {
                  buttonText = 'Upgrade para Master 🚀';
                } else if (plan.id === 'FREE') {
                  buttonText = 'Downgrade para Básico';
                }
              } else if (currentPlan === 'MASTER') {
                if (plan.id === 'PREMIUM') {
                  buttonText = 'Downgrade para Premium';
                } else if (plan.id === 'FREE') {
                  buttonText = 'Downgrade para Básico';
                }
              }
            }

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex"
              >
                <Card className={`flex flex-col justify-between w-full shadow-xl border-2 bg-card/65 backdrop-blur-md rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 relative ${cardColor}`}>
                  {badgeText && (
                    <div className={`${
                      badgeText.includes('Upgrade') 
                        ? 'bg-gradient-to-r from-amber-500 to-primary' 
                        : badgeText.includes('Atual') 
                        ? 'bg-emerald-600' 
                        : 'bg-gradient-to-r from-primary to-secondary'
                    } text-white text-xs font-extrabold uppercase tracking-wider py-2 text-center absolute top-0 left-0 right-0`}>
                      {badgeText}
                    </div>
                  )}

                  <CardHeader className={badgeText ? 'pt-10' : ''}>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl font-bold tracking-tight">{plan.name}</CardTitle>
                      <div className={`p-2.5 rounded-xl ${isHighlighted ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Icon size={20} />
                      </div>
                    </div>
                    <div className="flex items-baseline mt-2">
                      <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">{price}</span>
                      <span className="ml-1.5 text-xs font-bold text-muted-foreground">/{plan.period}</span>
                    </div>
                    <CardDescription className="mt-3 text-xs leading-relaxed font-medium">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 py-4">
                    <div className="border-t border-border/60 my-4" />
                    <ul className="space-y-3.5">
                      {plan.features.map((feature, featureIdx) => (
                        <li key={featureIdx} className="flex items-start text-xs font-semibold text-foreground/80">
                          <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-500 mr-3 mt-0.5 flex-shrink-0">
                            <Check size={14} />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <div className="p-6 border-t bg-muted/10">
                    <motion.div whileHover={{ scale: isCurrent ? 1 : 1.01 }} whileTap={{ scale: isCurrent ? 1 : 0.98 }}>
                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isCurrent || loadingPlan !== null}
                        className={`w-full py-6 font-bold tracking-tight rounded-xl shadow-md cursor-pointer ${
                          isCurrent
                            ? 'bg-muted text-muted-foreground cursor-not-allowed border'
                            : isHighlighted
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
                            : 'bg-foreground text-background hover:bg-foreground/90 shadow-foreground/5'
                        }`}
                      >
                        {loadingPlan === plan.id ? (
                          <span className="animate-pulse">Processando...</span>
                        ) : buttonText}
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
