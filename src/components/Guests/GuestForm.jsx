import React, { useState } from 'react';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

export default function TaskList({ onBack }) {
  const [tasks, setTasks] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ name: '', date: '' });

  const handleOpenForm = (task = null) => {
    setEditingTask(task);
    setForm(task ? { name: task.name, date: task.date } : { name: '', date: '' });
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingTask(null);
    setForm({ name: '', date: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.date) return;

    const newTask = {
      id: editingTask ? editingTask.id : crypto.randomUUID(),
      name: form.name.trim(),
      date: form.date,
      done: editingTask ? editingTask.done : false,
      createdAt: editingTask?.createdAt || dayjs().format('YYYY-MM-DD'),
    };

    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === editingTask.id ? newTask : t)));
    } else {
      setTasks([...tasks, newTask]);
    }

    handleCloseForm();
  };

  const toggleDone = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const removeTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const getProgress = (task) => {
    const start = dayjs(task.createdAt).startOf('day');
    const end = dayjs(task.date).startOf('day');
    const totalDays = end.diff(start, 'day');
    const elapsed = dayjs().startOf('day').diff(start, 'day');

    if (totalDays <= 0) return 1;
    return Math.min(Math.max(elapsed / totalDays, 0), 1);
  };

  const getColor = (task) => {
    const today = dayjs().startOf('day');
    const deadline = dayjs(task.date).startOf('day');
    const daysLeft = deadline.diff(today, 'day');

    if (task.done) return 'bg-green-500';
    if (daysLeft < 0) return 'bg-red-500';
    if (daysLeft === 0) return 'bg-green-500';
    if (daysLeft === 1) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="px-6 max-w-4xl mx-auto mt-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-foreground">Tarefas</h1>
        <Button onClick={onBack} variant="secondary">← Voltar</Button>
      </div>

      <Button onClick={() => handleOpenForm()} className="mb-4">+ Nova Tarefa</Button>

      {tasks.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground text-sm"
        >
          Nenhuma tarefa adicionada.
        </motion.p>
      )}

      {tasks.map((task, index) => {
        const progress = getProgress(task);
        const progressColor = getColor(task);

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl shadow p-4 mb-4"
          >
            <div className="flex justify-between">
              <h2 className="font-semibold text-lg text-foreground">{task.name}</h2>
              <span className="text-sm text-muted-foreground">
                até {dayjs(task.date).format('DD/MM/YYYY')}
              </span>
            </div>

            {/* Barra de progresso */}
            <div className="relative mt-3">
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-in-out ${progressColor}`}
                  style={{ width: `${progress * 100}%` }}
                ></div>
              </div>
              <div
                className="absolute top-[-6px] h-5 w-5 rounded-full border border-gray-500 bg-white shadow"
                style={{ left: `calc(${progress * 100}% - 10px)` }}
              ></div>
            </div>

            <div className="mt-4 flex gap-3 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleDone(task.id)}
                />
                <span className="text-sm">Feito</span>
              </label>
              <Button size="sm" variant="outline" onClick={() => handleOpenForm(task)}>
                Editar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => removeTask(task.id)}>
                Remover
              </Button>
            </div>
          </motion.div>
        );
      })}

      {/* Modal de formulário */}
      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="task-name">Nome da Tarefa</Label>
              <Input
                id="task-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="task-date">Data Limite</Label>
              <Input
                id="task-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <DialogFooter className="flex justify-between">
              <Button type="button" variant="secondary" onClick={handleCloseForm}>Cancelar</Button>
              <Button type="submit">{editingTask ? 'Salvar' : 'Adicionar'}</Button>
            </DialogFooter>
          </form>

          <button
            onClick={handleCloseForm}
            className="absolute top-3 right-3 rounded-full p-1 hover:bg-muted"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
