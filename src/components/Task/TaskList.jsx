'use client';

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
import { X, PlusCircle } from 'lucide-react';

const prioridades = ['Alta', 'Média', 'Baixa'];

export default function TaskList({ onBack }) {
  const [tasks, setTasks] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    name: '',
    date: '',
    categoria: '',
    prioridade: 'Média',
  });

  const handleOpenForm = (task = null) => {
    setEditingTask(task);
    setForm(
      task
        ? {
            name: task.name,
            date: task.date,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date || !form.categoria.trim()) return;

    const newTask = {
      id: editingTask ? editingTask.id : crypto.randomUUID(),
      name: form.name.trim(),
      date: form.date,
      categoria: form.categoria.trim(),
      prioridade: form.prioridade,
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

  const categoriasUnicas = [...new Set(tasks.map((t) => t.categoria))];
  const groupedByCategoria = categoriasUnicas.map((cat) => ({
    nome: cat,
    tarefas: tasks.filter((t) => t.categoria === cat),
  }));

  const countDone = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const totalProgress = total === 0 ? 0 : (countDone / total) * 100;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold">🎉 Tarefas da Festa</h1>
        <Button onClick={onBack} variant="secondary">← Voltar</Button>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">{`✔️ ${countDone} de ${total} concluídas`}</h2>
        <Button onClick={() => handleOpenForm()} size="sm" className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Adicionar
        </Button>
      </div>

      <div className="w-full bg-zinc-200 h-4 rounded-full overflow-hidden">
        <motion.div
          className="bg-indigo-500 h-full"
          initial={{ width: 0 }}
          animate={{ width: `${totalProgress}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>

      {groupedByCategoria.map((grupo) => (
        <div key={grupo.nome} className="space-y-4">
          <h3 className="text-lg font-semibold mt-6">🎯 {grupo.nome}</h3>
          {grupo.tarefas.length === 0 ? (
            <p className="text-sm text-zinc-500 italic">Nenhuma tarefa nesta categoria.</p>
          ) : (
            grupo.tarefas.map((task) => {
              const progress = getProgress(task);
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 border rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => toggleDone(task.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${task.done ? 'line-through text-green-500' : ''}`}>{task.name}</span>
                    <span className="text-sm text-zinc-500">{task.prioridade} • {dayjs(task.date).format('DD/MM')}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-200 rounded mt-3">
                    <div
                      className="h-full bg-blue-500 rounded"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleOpenForm(task); }}>Editar</Button>
                    <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); removeTask(task.id); }}>Remover</Button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      ))}

      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="task-name">Nome</Label>
              <Input
                id="task-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="task-date">Data</Label>
              <Input
                id="task-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                min={dayjs().format('YYYY-MM-DD')}
              />
            </div>
            <div>
              <Label htmlFor="task-cat">Categoria</Label>
              <Input
                id="task-cat"
                placeholder="Ex: Buffet, Decoração"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="task-prio">Prioridade</Label>
              <select
                id="task-prio"
                className="w-full border rounded px-3 py-2"
                value={form.prioridade}
                onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
              >
                {prioridades.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <DialogFooter className="flex justify-between pt-2">
              <Button type="button" variant="ghost" onClick={handleCloseForm}>Cancelar</Button>
              <Button type="submit">{editingTask ? 'Salvar' : 'Adicionar'}</Button>
            </DialogFooter>
          </form>

          <button
            onClick={handleCloseForm}
            className="absolute top-3 right-3 rounded-full p-1 hover:bg-zinc-100 transition"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
