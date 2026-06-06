import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api.js';
import { useParty } from '../contexts/PartyContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  Plus, 
  CheckCircle, 
  Trash2, 
  X, 
  Loader2, 
  Sparkles,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { toast } from 'sonner';

export default function FinanceScreen({ onBack }) {
  const { parties, currentParty } = useParty();
  const [selectedPartyId, setSelectedPartyId] = useState(currentParty?.id || '');
  
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  
  // Deletion Confirmation States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    amount: '',
    category: 'Comida',
    otherCategory: '',
    paid: false,
  });

  const categories = ['Comida', 'Bebida', 'Decoração', 'DJ & Som', 'Espaço / Salão', 'Outros'];

  const activeParty = parties.find(p => p.id === selectedPartyId) || null;

  useEffect(() => {
    if (selectedPartyId) {
      loadExpensesOfParty();
    } else {
      setExpenses([]);
      setIsLoading(false);
    }
  }, [selectedPartyId]);

  const loadExpensesOfParty = async () => {
    setIsLoading(true);
    try {
      const data = await api.expenses.getAll(selectedPartyId);
      setExpenses(data);
    } catch (error) {
      console.error('Erro ao buscar despesas da API:', error);
      toast.error('Não foi possível carregar as despesas da festa.', { position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = () => {
    setForm({ name: '', amount: '', category: 'Comida', otherCategory: '', paid: false });
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.amount || !selectedPartyId) return;

    const finalCategory = form.category === 'Outros' && form.otherCategory.trim() 
      ? form.otherCategory.trim() 
      : form.category;

    setIsSubmitting(true);
    try {
      const created = await api.expenses.create({
        partyId: selectedPartyId,
        name: form.name.trim(),
        amount: parseFloat(form.amount),
        category: finalCategory,
        paid: form.paid,
      });

      setExpenses([created, ...expenses]);
      handleCloseForm();
      toast.success('Despesa lançada com sucesso! 💰', { position: 'top-center' });
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      toast.error('Não foi possível salvar a despesa. Tente novamente.', { position: 'top-center' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePaid = async (expense) => {
    try {
      const updated = await api.expenses.update(expense.id, { paid: !expense.paid });
      setExpenses(prev => prev.map(e => e.id === expense.id ? updated : e));
      toast.success(
        updated.paid 
          ? `Despesa "${expense.name}" paga! ✅` 
          : `Status de "${expense.name}" alterado para pendente! ⏳`, 
        { position: 'top-center' }
      );
    } catch (error) {
      console.error('Erro ao alternar status de pagamento:', error);
      toast.error('Erro ao atualizar o status de pagamento.', { position: 'top-center' });
    }
  };

  const triggerDeleteConfirm = (expense) => {
    setExpenseToDelete(expense);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await api.expenses.delete(expenseToDelete.id);
      setExpenses(prev => prev.filter(e => e.id !== expenseToDelete.id));
      toast.success('Despesa excluída com sucesso! 🗑️', { position: 'top-center' });
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      toast.error('Não foi possível excluir a despesa.', { position: 'top-center' });
    } finally {
      setDeleteConfirmOpen(false);
      setExpenseToDelete(null);
    }
  };

  // Cálculos financeiros
  const totalBudget = activeParty?.budget || 0;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBalance = totalBudget - totalSpent;
  const progressPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  // Agrupamento por categoria para o gráfico
  const categorySummary = categories.map(cat => {
    const totalCat = expenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
    return { name: cat, value: totalCat };
  }).filter(item => item.value > 0);

  const COLORS = ['#6366F1', '#EC4899', '#EAB308', '#10B981', '#3B82F6', '#F97316'];

  return (
    <div className="min-h-screen bg-background pb-16 transition-colors duration-300 relative overflow-hidden">
      {/* Dynamic Background Glowing Auroras */}
      <div className="absolute top-[-20%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-primary/10 dark:bg-primary/5 blur-[80px] md:blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] rounded-full bg-secondary/10 dark:bg-secondary/5 blur-[80px] md:blur-[150px] pointer-events-none z-0" />

      {/* Header Container */}
      <div className="relative z-10 pt-10 pb-10 px-6 border-b border-border/40 shadow-sm overflow-hidden">
        {/* Subtle Background Image & Texture */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop" 
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
            <DollarSign size={16} strokeWidth={2.5} className="text-primary" />
            <h1 className="text-[10px] font-black uppercase tracking-widest text-primary">Financeiro</h1>
          </div>
          <div className="w-10 h-10" />
        </div>
        
        <div className="max-w-3xl mx-auto mt-6 text-center z-10 relative">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-black tracking-tight text-foreground"
          >
            Planejador Financeiro & Custos
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-3 text-sm font-semibold text-muted-foreground max-w-lg mx-auto"
          >
            Acompanhe seu orçamento em tempo real, gerencie transações e celebre sem surpresas financeiras!
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-6 relative z-10">
        {/* Escolha de Festa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-lg shadow-black/[0.02] border border-border/50 bg-card/85 backdrop-blur-md rounded-2xl">
            <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-bold flex items-center justify-center sm:justify-start gap-1.5 text-primary text-sm uppercase tracking-wider">
                  <Sparkles size={16} className="text-secondary animate-spin-slow" /> Festa Monitorada
                </h4>
                <p className="text-xs text-muted-foreground">
                  Selecione a comemoração cujas despesas você deseja acompanhar.
                </p>
              </div>
              
              {parties.length === 0 ? (
                <span className="text-xs text-destructive font-semibold">Nenhuma festa cadastrada.</span>
              ) : (
                <div className="w-full sm:w-72">
                  <Select value={selectedPartyId} onValueChange={setSelectedPartyId}>
                    <SelectTrigger className="w-full border border-border/60 rounded-xl px-4 py-2.5 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner font-medium h-[42px]">
                      <SelectValue placeholder="Selecione uma festa..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" disabled>Selecione uma festa...</SelectItem>
                      {parties.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} (Orc: R$ {p.budget?.toLocaleString('pt-BR') || '0,00'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {selectedPartyId ? (
          <>
            {/* Cards de Indicadores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Orçamento */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <Card className="shadow-md border border-border/50 bg-card/85 backdrop-blur-md rounded-2xl overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Orçamento</p>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-foreground leading-none">
                        R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className="p-3 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary rounded-2xl transition-colors duration-300 group-hover:bg-primary/20">
                      <Wallet size={20} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Total Gasto */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <Card className="shadow-md border border-border/50 bg-card/85 backdrop-blur-md rounded-2xl overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-destructive" />
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Gasto</p>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-destructive leading-none">
                        R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className="p-3 bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive rounded-2xl transition-colors duration-300 group-hover:bg-destructive/20">
                      <TrendingUp size={20} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Saldo Restante */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <Card className="shadow-md border border-border/50 bg-card/85 backdrop-blur-md rounded-2xl overflow-hidden relative group">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${remainingBalance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Saldo Restante</p>
                      <h3 className={`text-xl sm:text-2xl font-extrabold leading-none ${remainingBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        R$ {remainingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className={`p-3 rounded-2xl transition-colors duration-300 ${
                      remainingBalance >= 0 
                        ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20'
                    }`}>
                      <PiggyBank size={20} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Barra de Progresso Visual de Orçamento */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
            >
              <Card className="shadow-md border border-border/50 bg-card/85 backdrop-blur-md rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                    <span className="text-foreground/90 uppercase tracking-wider text-[11px]">Consumo do Orçamento</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${progressPercent >= 90 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                      {progressPercent.toFixed(1)}% utilizado
                    </span>
                  </div>
                  
                  <div className="w-full bg-muted h-3 rounded-full overflow-hidden p-[2px] border border-border/30">
                    <motion.div
                      className={`h-full rounded-full ${
                        progressPercent >= 90 
                          ? 'bg-gradient-to-r from-destructive to-red-500' 
                          : 'bg-gradient-to-r from-primary to-secondary'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  
                  <AnimatePresence>
                    {progressPercent >= 100 && (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2.5"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                        </span>
                        <span>⚠️ Atenção: O orçamento total planejado para a festa foi ultrapassado!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Distribuição por Categoria (Gráfico Recharts) */}
            {expenses.length > 0 && categorySummary.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="shadow-lg border border-border/50 bg-card/85 backdrop-blur-md rounded-2xl">
                  <CardHeader className="pb-0 pt-6 px-6">
                    <CardTitle className="text-base sm:text-lg font-extrabold flex items-center gap-2 text-primary">
                      <TrendingUp size={20} className="text-secondary animate-pulse" /> Distribuição de Gastos
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Visualização proporcional dos custos do evento agrupados por categoria
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 flex flex-col items-center justify-center">
                    <div className="w-full h-64 md:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categorySummary}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categorySummary.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                            contentStyle={{ 
                              backgroundColor: 'var(--card)', 
                              borderColor: 'var(--border)', 
                              color: 'var(--foreground)',
                              borderRadius: '12px', 
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                              fontSize: '12px'
                            }}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            iconType="circle" 
                            iconSize={8} 
                            wrapperStyle={{ fontSize: '11px', paddingTop: '15px', color: 'var(--foreground)' }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Ações da Lista */}
            <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md pt-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 shadow-[0_10px_20px_-15px_rgba(0,0,0,0.1)] -mx-6 px-6 mt-6 mb-2">
              <div className="space-y-0.5">
                <h3 className="text-lg sm:text-xl font-extrabold text-foreground">Histórico de Custos</h3>
                <p className="text-xs text-muted-foreground">Veja e edite os lançamentos financeiros da comemoração</p>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={handleOpenForm} 
                  className="bg-primary hover:bg-primary/95 text-white flex items-center justify-center gap-1.5 py-5 px-5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-primary/20 w-full sm:w-auto"
                >
                  <Plus size={16} /> Lançar Despesa
                </Button>
              </motion.div>
            </div>

            {/* Lista de Transações */}
            {isLoading ? (
              <div className="text-center py-16 bg-card/40 border border-border/30 rounded-2xl">
                <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-3" />
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Buscando histórico financeiro...</p>
              </div>
            ) : expenses.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="border-dashed border-2 border-border/60 p-12 text-center bg-card/30 rounded-2xl shadow-inner"
              >
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border/30 text-muted-foreground/60">
                  <Wallet size={24} />
                </div>
                <h4 className="text-sm font-bold text-foreground/80 mb-1">Nenhuma despesa lançada</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Aproveite e lance sua primeira despesa de comemoração clicando no botão "Lançar Despesa" acima.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3.5">
                <AnimatePresence initial={false}>
                  {expenses.map(expense => (
                    <motion.div 
                      key={expense.id} 
                      initial={{ opacity: 0, y: 15 }} 
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: 1.01, y: -1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className={`shadow-sm border border-border/50 bg-card/90 backdrop-blur-sm rounded-xl overflow-hidden relative transition-shadow hover:shadow-md ${
                        expense.paid ? 'bg-emerald-500/[0.01]' : ''
                      }`}>
                        <div className={`absolute top-0 left-0 w-1 h-full ${expense.paid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  expense.category === 'Comida' ? 'bg-indigo-500/10 text-indigo-500' :
                                  expense.category === 'Bebida' ? 'bg-pink-500/10 text-pink-500' :
                                  expense.category === 'Decoração' ? 'bg-amber-500/10 text-amber-500' :
                                  expense.category === 'DJ & Som' ? 'bg-blue-500/10 text-blue-500' :
                                  expense.category === 'Espaço / Salão' ? 'bg-purple-500/10 text-purple-500' :
                                  'bg-slate-500/10 text-slate-500'
                                }`}>
                                  {expense.category}
                                </span>
                                
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  expense.paid 
                                    ? 'bg-emerald-500/10 text-emerald-500' 
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                }`}>
                                  <span className={`w-1 h-1 rounded-full ${expense.paid ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                  {expense.paid ? 'Pago' : 'Pendente'}
                                </span>
                              </div>
                              
                              <h4 className={`text-sm sm:text-base font-bold ${expense.paid ? 'line-through text-muted-foreground/60' : 'text-foreground'}`}>
                                {expense.name}
                              </h4>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
                            <strong className="text-base sm:text-lg font-black text-foreground">
                              R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </strong>
                            
                            <div className="flex items-center gap-1.5">
                              {/* Toggle Pago */}
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleTogglePaid(expense)}
                                  className={`rounded-xl w-9 h-9 border ${
                                    expense.paid 
                                      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' 
                                      : 'text-muted-foreground/60 bg-muted/50 border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/20'
                                  }`}
                                >
                                  <CheckCircle size={18} />
                                </Button>
                              </motion.div>
                              
                              {/* Excluir */}
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => triggerDeleteConfirm(expense)}
                                  className="text-muted-foreground/60 bg-muted/50 border border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 rounded-xl w-9 h-9"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-dashed border-2 border-border/60 p-12 text-center bg-card/30 rounded-2xl max-w-md mx-auto shadow-inner"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-5 border border-border/30 text-muted-foreground/50">
              <Wallet size={30} />
            </div>
            <h3 className="text-base font-extrabold text-foreground/90">Selecione uma festa para começar</h3>
            <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
              É necessário ter uma festa ativa selecionada para lançar despesas e acompanhar orçamentos planejados.
            </p>
          </motion.div>
        )}
      </div>

      {/* Modal Lançar Despesa */}
      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-md w-11/12 mx-auto rounded-2xl bg-card border border-border/60 shadow-xl overflow-hidden p-0">
          <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white relative">
            <DialogHeader>
              <DialogTitle className="text-white text-lg font-extrabold flex items-center gap-1.5">
                <Plus size={18} /> Lançar Nova Despesa
              </DialogTitle>
            </DialogHeader>
            <button 
              onClick={handleCloseForm} 
              className="absolute top-4 right-4 rounded-xl p-1.5 bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X size={16} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <div className="space-y-1.5">
              <Label htmlFor="expense-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição / Nome da Despesa</Label>
              <Input
                id="expense-name"
                placeholder="Ex: Aluguel de Brinquedos, Bolo Gourmet"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="expense-amount" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Valor (R$)</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Ex: 350.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expense-cat" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoria</Label>
                <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                  <SelectTrigger className="w-full h-[42px] border rounded-xl px-3 bg-background border-border/80 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium shadow-sm transition-all">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.category === 'Outros' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1.5"
              >
                <Label htmlFor="other-category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Qual categoria?</Label>
                <Input
                  id="other-category"
                  placeholder="Ex: Transporte, Lembrancinhas"
                  value={form.otherCategory}
                  onChange={(e) => setForm({ ...form, otherCategory: e.target.value })}
                  required
                  className="rounded-xl border-border/80 focus-visible:ring-primary/40 focus-visible:ring-2 py-5"
                />
              </motion.div>
            )}

            <div className="flex items-center gap-2.5 pt-2">
              <input
                id="expense-paid"
                type="checkbox"
                checked={form.paid}
                onChange={(e) => setForm({ ...form, paid: e.target.checked })}
                className="h-4 w-4 rounded-md border-border/80 text-primary focus:ring-primary/40 cursor-pointer"
              />
              <Label htmlFor="expense-paid" className="text-xs font-bold text-foreground/80 cursor-pointer uppercase tracking-wider">Despesa já está paga</Label>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t border-border/40">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseForm} 
                className="flex-1 rounded-xl py-5 border-border font-bold text-xs"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl py-5 text-xs shadow-md shadow-primary/10"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5 justify-center">
                    <Loader2 className="animate-spin h-3.5 w-3.5" />
                    Salvando...
                  </span>
                ) : 'Lançar Despesa'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão (Substitui confirm nativo) */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm w-11/12 mx-auto rounded-2xl bg-card border border-border/60 shadow-xl p-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center border border-destructive/20">
              <AlertTriangle size={22} className="animate-bounce" />
            </div>
            
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base font-extrabold text-foreground">Excluir Despesa?</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground max-w-[250px]">
                Você tem certeza que quer excluir a despesa "{expenseToDelete?.name}"? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex w-full gap-2.5 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirmOpen(false)} 
                className="flex-1 rounded-xl font-bold text-xs py-5"
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={handleConfirmDelete}
                className="flex-1 font-bold text-xs py-5 rounded-xl shadow-md shadow-destructive/10"
              >
                Excluir
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
