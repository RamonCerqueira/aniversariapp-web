import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export default function SubscriptionScreen({ onBack }) {
  const { user, subscribeToPlan } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const currentPlan = user?.plan || 'FREE';

  const plans = [
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
      color: 'border-primary ring-4 ring-primary/10 shadow-primary/20 scale-105 relative z-10',
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

  const handleUpgrade = async (planId) => {
    if (planId === currentPlan) return;
    setLoadingPlan(planId);
    try {
      await subscribeToPlan(planId);
      alert(`Parabéns! Você assinou o plano ${planId} com sucesso via Stripe Test! 🎉`);
      onBack();
    } catch (error) {
      console.error('Erro ao fazer upgrade:', error);
      alert('Ocorreu um erro ao processar sua assinatura. Tente novamente.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 relative overflow-hidden transition-colors duration-300">
      {/* Mesh aurorais de fundo */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary/20 dark:bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-secondary/20 dark:bg-secondary/10 blur-[100px] pointer-events-none" />

      {/* Header Container with Beautiful Themed Background Image */}
      <div className="relative overflow-hidden text-white pt-14 pb-12 px-6 shadow-xl border-b border-zinc-800/80">
        {/* Background Image with dark blurred overlay for maximum premium feel */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop" 
            alt="Subscription Background" 
            className="w-full h-full object-cover scale-105 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-zinc-950/80 bg-gradient-to-r from-zinc-950/95 via-zinc-950/75 to-zinc-950/50" />
          <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:16px_16px]" />
        </div>

        <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20 rounded-full w-10 h-10 border border-white/10 backdrop-blur-sm"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xs font-bold uppercase tracking-widest text-white/90">Celebrate!</h1>
          <div className="w-10 h-10" />
        </div>
        
        <div className="max-w-3xl mx-auto mt-8 text-center z-10 relative space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Assinaturas Celebrate!
          </h2>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-white/80 leading-relaxed font-semibold">
            De pequenas reuniões familiares a mega eventos de gala. Economize tempo de preparo, aumente limites e otimize cada centavo.
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-6 mt-12 space-y-8 relative z-10">
        
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          {plans.map((plan, idx) => {
            const Icon = plan.icon;
            const isCurrent = plan.id === currentPlan;
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex"
              >
                <Card className={`flex flex-col justify-between w-full shadow-xl border-2 bg-card/65 backdrop-blur-md rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 ${plan.color}`}>
                  {plan.highlighted && (
                    <div className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-extrabold uppercase tracking-wider py-2 text-center absolute top-0 left-0 right-0">
                      Recomendado Festeiro ✨
                    </div>
                  )}

                  <CardHeader className={plan.highlighted ? 'pt-10' : ''}>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl font-bold tracking-tight">{plan.name}</CardTitle>
                      <div className={`p-2.5 rounded-xl ${plan.highlighted ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Icon size={20} />
                      </div>
                    </div>
                    <div className="flex items-baseline mt-2">
                      <span className="text-4xl font-extrabold tracking-tight text-foreground">{price}</span>
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
                            : plan.highlighted
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
                            : 'bg-foreground text-background hover:bg-foreground/90 shadow-foreground/5'
                        }`}
                      >
                        {loadingPlan === plan.id ? (
                          <span className="animate-pulse">Processando Stripe...</span>
                        ) : isCurrent ? (
                          'Plano Ativo'
                        ) : plan.id === 'FREE' ? (
                          'Voltar para Grátis'
                        ) : (
                          `Escolher ${plan.name}`
                        )}
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
