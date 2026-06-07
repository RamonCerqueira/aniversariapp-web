'use client';

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api.js';
import { useParty } from '../../contexts/PartyContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { X, PlusCircle, Loader2, ArrowLeft, Check, Calendar, Tag, Trash2, Edit3, CheckCircle2, FileText } from 'lucide-react';
import { ReportPDFGenerator } from '../Reports/ReportPDFGenerator.js';

const prioridades = ['Alta', 'Média', 'Baixa'];

export default function TaskList({ onBack }) {
  const { currentParty } = useParty();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    name: '',
    date: '',
    categoria: '',
    prioridade: 'Média',
  });

  useEffect(() => {
    if (currentParty?.id) {
      loadTasksOfParty();
    } else {
      setTasks([]);
      setIsLoading(false);
    }
  }, [currentParty]);

  const loadTasksOfParty = async () => {
    setIsLoading(true);
    try {
      const data = await api.tasks.getAll(currentParty.id);
      setTasks(data);
    } catch (error) {
      console.error('Erro ao carregar tarefas da API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePDF = () => {
    if (!currentParty) {
      toast.error('Nenhuma festa ativa.');
      return;
    }
    toast.info('Gerando PDF de tarefas...');
    try {
      ReportPDFGenerator.generateTaskListPDF(currentParty, tasks);
      toast.success('Relatório PDF baixado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar relatório PDF.');
    }
  };

  const handleOpenForm = (task = null) => {
    setEditingTask(task);
    setForm(
      task
        ? {
            name: task.name,
            date: dayjs(task.date).format('YYYY-MM-DD'),
            categoria: task.categoria,
            prioridade: task.prioridade,
          }
        : {
            name: '',
            date: '',
            categoria: '',
            prioridade: 'Média',
          }
    );
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingTask(null);
    setForm({ name: '', date: '', categoria: '', prioridade: 'Média' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date || !form.categoria.trim() || !currentParty) return;

    try {
      if (editingTask) {
        const updated = await api.tasks.update(editingTask.id, {
          name: form.name.trim(),
          date: form.date,
          categoria: form.categoria.trim(),
          prioridade: form.prioridade,
        });
        setTasks(tasks.map((t) => (t.id === editingTask.id ? updated : t)));
        toast.success('Tarefa atualizada com sucesso! 🎉', { position: 'top-center' });
      } else {
        const created = await api.tasks.create({
          partyId: currentParty.id,
          name: form.name.trim(),
          date: form.date,
          categoria: form.categoria.trim(),
          prioridade: form.prioridade,
        });
        setTasks([...tasks, created]);
        toast.success('Tarefa adicionada com sucesso! 🎈', { position: 'top-center' });
      }
      handleCloseForm();
    } catch (error) {
      console.error('Erro ao salvar tarefa na API:', error);
      toast.error('Não foi possível salvar a tarefa. Tente novamente.', { position: 'top-center' });
    }
  };

  const toggleDone = async (id, e) => {
    e?.stopPropagation();
    
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      const updated = await api.tasks.update(id, { done: !task.done });
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
      
      if (!task.done) {
        toast.success('Tarefa concluída! Excelente trabalho! 🌟', {
          position: 'top-center',
          className: 'rounded-xl font-bold'
        });
      }
    } catch (error) {
      console.error('Erro ao alternar status da tarefa:', error);
    }
  };

  const removeTask = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    
    try {
      await api.tasks.delete(id);
      setTasks(tasks.filter((t) => t.id !== id));
      toast.success('Tarefa excluída com sucesso.', { position: 'top-center' });
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  };

  const getProgress = (task) => {
    if (task.done) return 1;

    const start = dayjs(task.createdAt).startOf('day');
    const end = dayjs(task.date).startOf('day');
    const totalDays = end.diff(start, 'day');
    const elapsed = dayjs().startOf('day').diff(start, 'day');

    if (totalDays <= 0) return 1;
    return Math.min(Math.max(elapsed / totalDays, 0), 1);
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'Alta':
        return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
      case 'Média':
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
      case 'Baixa':
      default:
        return 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
    }
  };

  const categoriasUnicas = [...new Set(tasks.map((t) => t.categoria))];
  const groupedByCategoria = categoriasUnicas.map((cat) => ({
    nome: cat,
    tarefas: tasks.filter((t) => t.categoria === cat),
  }));

  const countDone = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const totalProgress = total === 0 ? 0 : (countDone / total) * 100;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-10 w-10 text-primary mb-4" />
        <p className="text-sm text-muted-foreground font-semibold">Carregando tarefas da festa...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-8 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">🎉 Checklist da Festa</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleGeneratePDF}
            variant="outline"
            size="sm"
            className="rounded-xl font-semibold flex items-center gap-1.5 shadow-sm border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-700 h-9 px-3"
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Relatório PDF</span>
          </Button>
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="rounded-xl font-bold flex items-center gap-1 shadow-sm border-border/80 hover:bg-muted h-9 px-3"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <Button
            onClick={() => handleOpenForm()}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-9 px-3 shadow-md shadow-primary/10 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tarefa</span>
          </Button>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-lg shadow-black/[0.01] space-y-4">
        <div className="flex justify-between items-center text-sm md:text-base font-bold">
          <span className="text-foreground">Progresso do Planejamento</span>
          <span className="text-primary">{countDone} de {total} concluídas ({totalProgress.toFixed(0)}%)</span>
        </div>
        
        <div className="w-full bg-muted h-3.5 rounded-full overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-primary to-secondary h-full"
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-foreground/80">Lista de Afazeres</h2>
        <Button onClick={() => handleOpenForm()} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl py-5 shadow-md shadow-primary/10 flex items-center gap-1.5 cursor-pointer text-sm">
          <PlusCircle className="w-4 h-4" /> <span className="hidden sm:inline">Adicionar </span>Tarefa
        </Button>
      </div>

      {groupedByCategoria.length === 0 ? (
        <div className="border border-dashed p-16 text-center rounded-3xl shadow-sm bg-card/20">
          <CheckCircle2 className="mx-auto text-zinc-300 dark:text-zinc-700 h-16 w-16 mb-4" />
          <h3 className="text-lg font-bold text-foreground/80">Sem tarefas pendentes</h3>
          <p className="text-sm text-muted-foreground mt-1.5">Clique no botão acima para lançar sua primeira pendência.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByCategoria.map((grupo) => (
            <div key={grupo.nome} className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mt-2 px-1">
                🏷️ {grupo.nome}
              </h3>
              
              <div className="space-y-3">
                {grupo.tarefas.map((task) => {
                  const progress = getProgress(task);
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 md:p-5 border border-border/50 bg-card/75 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                      onClick={(e) => toggleDone(task.id, e)}
                    >
                      <div className="flex items-start gap-3.5 flex-grow">
                        <div
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition flex-shrink-0 cursor-pointer ${
                            task.done 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-border bg-background hover:border-primary/50'
                          }`}
                        >
                          {task.done && <Check size={14} strokeWidth={3} />}
                        </div>
                        
                        <div className="space-y-1 flex-grow">
                          <p className={`font-bold text-base tracking-tight text-foreground transition ${task.done ? 'line-through text-muted-foreground/60' : ''}`}>
                            {task.name}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-muted-foreground">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${getPriorityBadge(task.prioridade)}`}>
                              {task.prioridade}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar size={12} />
                              Deadline: {dayjs(task.date).format('DD/MM/YYYY')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-1.5 border-t sm:border-none pt-3 sm:pt-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenForm(task)}
                          className="w-10 h-10 rounded-xl hover:bg-muted/80 text-muted-foreground"
                        >
                          <Edit3 size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeTask(task.id)}
                          className="w-10 h-10 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-md w-11/12 mx-auto rounded-2xl border bg-card/95 backdrop-blur-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <Label className="text-sm font-semibold mb-2 block" htmlFor="task-name">Descrição / O que fazer</Label>
              <Input
                id="task-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Comprar balões, Encomendar salgadinhos"
                className="py-6 px-4 rounded-xl border focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-2 block" htmlFor="task-date">Data Limite (Deadline)</Label>
              <Input
                id="task-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="py-6 px-4 rounded-xl border focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-2 block" htmlFor="task-cat">Categoria</Label>
              <Input
                id="task-cat"
                placeholder="Ex: Buffet, Decoração, Espaço"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="py-6 px-4 rounded-xl border focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-2 block" htmlFor="task-prio">Prioridade</Label>
              <Select value={form.prioridade} onValueChange={(value) => setForm({ ...form, prioridade: value })}>
                <SelectTrigger className="w-full border rounded-xl px-4 h-[50px] bg-background border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {prioridades.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter className="flex gap-2 pt-4">
              <Button className="flex-1 py-6 rounded-xl font-bold" type="button" variant="outline" onClick={handleCloseForm}>
                Cancelar
              </Button>
              <Button className="flex-1 py-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground" type="submit">
                {editingTask ? 'Salvar Alterações' : 'Adicionar Tarefa'}
              </Button>
            </DialogFooter>
          </form>

          <button
            onClick={handleCloseForm}
            className="absolute top-3 right-3 rounded-full p-1 hover:bg-muted transition text-muted-foreground"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
