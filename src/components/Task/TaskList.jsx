import React, { useState } from 'react';
import dayjs from 'dayjs';
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
    if (!form.name.trim() || !form.date) return;

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

  // Progresso: 0 (criado) a 1 (data limite)
  const getProgress = (task) => {
    const start = dayjs(task.createdAt).startOf('day');
    const end = dayjs(task.date).startOf('day');
    const totalDays = end.diff(start, 'day');
    const elapsed = dayjs().startOf('day').diff(start, 'day');

    if (totalDays <= 0) return 1;
    return Math.min(Math.max(elapsed / totalDays, 0), 1);
  };

  // Cores corrigidas para dias restantes:
  const getColor = (task) => {
    const today = dayjs().startOf('day');
    const deadline = dayjs(task.date).startOf('day');
    const daysLeft = deadline.diff(today, 'day');

    if (task.done) return 'bg-green-500';      // ✅ Concluído
    if (daysLeft < 0) return 'bg-red-500';    // ❌ Vencido
    if (daysLeft === 0) return 'bg-yellow-500'; // ⚠️ Prazo hoje
    if (daysLeft === 1) return 'bg-yellow-400'; // ⚠️ 1 dia restante
    return 'bg-blue-400';                      // 🔵 2+ dias restantes
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Minhas Tarefas</h1>
        <Button onClick={onBack} variant="secondary" size="sm">← Voltar</Button>
      </div>

      <div className="mb-6">
        <Button onClick={() => handleOpenForm()} size="md">+ Nova Tarefa</Button>
      </div>

      {tasks.length === 0 && (
        <p className="text-center text-gray-500 italic">Nenhuma tarefa adicionada.</p>
      )}

      <div className="space-y-4">
        {tasks.map((task) => {
          const progress = getProgress(task);
          const progressColor = getColor(task);

          return (
            <div
              key={task.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => toggleDone(task.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') toggleDone(task.id); }}
            >
              <div className="flex justify-between items-center">
                <div
                  className={`font-semibold text-lg ${task.done ? 'line-through text-green-700' : 'text-gray-900'}`}
                >
                  {task.name}
                </div>
                <div className="text-sm text-gray-600">
                  até {dayjs(task.date).format('DD/MM/YYYY')}
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="relative mt-4 h-4 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-in-out ${progressColor}`}
                  style={{ width: `${progress * 100}%` }}
                ></div>
                <div
                  className="absolute top-[-6px] h-6 w-6 rounded-full border-2 border-gray-400 bg-white shadow-md"
                  style={{ left: `calc(${progress * 100}% - 12px)` }}
                ></div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleOpenForm(task); }}>
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); removeTask(task.id); }}>
                  Remover
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de formulário */}
      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="task-name">Nome da Tarefa</Label>
              <Input
                id="task-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
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
                min={dayjs().format('YYYY-MM-DD')}
              />
            </div>
            <DialogFooter className="flex justify-between">
              <Button type="button" variant="secondary" onClick={handleCloseForm}>Cancelar</Button>
              <Button type="submit">{editingTask ? 'Salvar' : 'Adicionar'}</Button>
            </DialogFooter>
          </form>

          <button
            onClick={handleCloseForm}
            className="absolute top-3 right-3 rounded-full p-1 hover:bg-gray-200 transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
