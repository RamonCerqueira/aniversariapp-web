import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useParty } from '../contexts/PartyContext';
import { AnimatedHeader } from '../components/AnimatedHeader';
import { StatusCard, QuickActionCard, ProgressCard } from '../components/Cards';

const HomeScreen = ({ onCreateParty, onViewParty, onQuickAction }) => {
  const { user } = useAuth();
  const { parties, loadParties } = useParty();

  useEffect(() => {
    loadParties();
  }, [loadParties]);

  const handleNotificationPress = () => {
    alert('Nenhuma notificação no momento');
  };

  const handleCreateParty = () => {
    onCreateParty();
  };

  const handleQuick = (action) => {
    switch (action) {
      case 'guests':
        onQuickAction('guests');
        break;
      case 'consumption':
        onQuickAction('consumption');
        break;
      case 'checklist':
        onQuickAction('checklist');
        break;
      case 'suppliers':
        onQuickAction('suppliers');
        break;
      default:
        console.warn(`Ação desconhecida: ${action}`);
    }
  };

  // Calcula progresso do planejamento
  const calculateProgress = () => {
    const hasParties = parties.length > 0;
    const hasCompleteParty = parties.some(party => party.name && party.type && party.date && party.location);

    return [
      { title: 'Detalhes da festa', progress: hasCompleteParty ? 100 : hasParties ? 50 : 0 },
      { title: 'Lista de convidados', progress: hasParties ? 25 : 0 },
      { title: 'Fornecedores', progress: 0 },
      { title: 'Checklist', progress: 0 },
    ];
  };

  // Pega próxima festa futura
  const getNextParty = () => {
    const now = new Date();
    const upcoming = parties
      .filter(p => new Date(p.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcoming[0];
  };

  const nextParty = getNextParty();
  const progressData = calculateProgress();

  return (
    <div className="min-h-screen bg-background">
      <AnimatedHeader
        userName={user?.name || 'Usuário'}
        onNotificationPress={handleNotificationPress}
      />

      <div className="px-6 -mt-4 max-w-6xl mx-auto">
        {/* Status da Próxima Festa */}
        <StatusCard
          title={nextParty ? nextParty.name : 'Sua Próxima Festa'}
          subtitle={
            nextParty
              ? `${new Date(nextParty.date).toLocaleDateString('pt-BR')} - ${nextParty.location}`
              : 'Planeje sua celebração perfeita'
          }
          icon="calendar"
          iconColor="#FFD700"
          buttonText={nextParty ? 'Ver Detalhes' : 'Criar Nova Festa'}
          onPress={() => (nextParty ? onViewParty(nextParty.id) : handleCreateParty())}
          delay={200}
        />

        {/* Estatísticas Rápidas */}
        {parties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-6 mt-6"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">Suas Festas</h2>
            <div className="bg-card rounded-xl p-4 shadow-lg">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.6, damping: 15 }}
                    className="text-2xl font-bold text-primary-custom"
                  >
                    {parties.length}
                  </motion.div>
                  <p className="text-muted-foreground text-sm">Total de Festas</p>
                </div>
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.7, damping: 15 }}
                    className="text-2xl font-bold text-secondary-custom"
                  >
                    {parties.filter(p => new Date(p.date) > new Date()).length}
                  </motion.div>
                  <p className="text-muted-foreground text-sm">Próximas</p>
                </div>
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.8, damping: 15 }}
                    className="text-2xl font-bold text-accent-custom"
                  >
                    {parties.reduce((sum, p) => sum + (p.guestCount || 0), 0)}
                  </motion.div>
                  <p className="text-muted-foreground text-sm">Convidados</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Ações Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-6 mt-6  "
        >
          <h2 className="text-xl font-bold text-foreground mb-4">
            Ações Rápidas
          </h2>
          <div className="flex md:flex-1/4 lg:flex-nowrap gap-4">
            <QuickActionCard
              icon="users"
              title="Convidados"
              subtitle="Gerenciar lista"
              color="#4169E1"
              onPress={() => handleQuick('guests')}
              delay={600}
            />
            <QuickActionCard
              icon="utensils"
              title="Consumo"
              subtitle="Calcular quantidades"
              color="#FF1493"
              onPress={() => handleQuick('consumption')}
              delay={700}
            />
            <QuickActionCard
              icon="check-circle"
              title="Tarefas"
              subtitle="Lista de afazeres"
              color="#FFD700"
              onPress={() => handleQuick('checklist')}
              delay={800}
            />
            <QuickActionCard
              icon="building"
              title="Fornecedores"
              subtitle="Encontrar serviços"
              color="#32CD32"
              onPress={() => handleQuick('suppliers')}
              delay={900}
            />
          </div>
        </motion.div>

        {/* Progresso */}
        <ProgressCard title="Progresso do Planejamento" items={progressData} delay={1000} />

        <div className="h-6" />
      </div>
    </div>
  );
};

export default HomeScreen;