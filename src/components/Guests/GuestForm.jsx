import React, { useState, useEffect } from 'react';
import { useGuests } from './GuestContext.jsx';
import { useParty } from '../../contexts/PartyContext.jsx';
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

export default function GuestForm({ existingGuest, onClose }) {
  const { addGuest, updateGuest } = useGuests();
  const { currentParty } = useParty();

  const isEditing = !!existingGuest;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    accompany: '0',
    status: 'pending',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingGuest) {
      setForm({
        name: existingGuest.name || '',
        phone: existingGuest.phone || '',
        accompany: existingGuest.accompany?.toString() || '0',
        status: existingGuest.status || 'pending',
      });
    }
  }, [existingGuest]);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!form.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (isNaN(parseInt(form.accompany)) || parseInt(form.accompany) < 0) {
      newErrors.accompany = 'Acompanhantes inválidos';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const guestData = {
      id: isEditing ? existingGuest.id : Date.now().toString(),
      partyId: currentParty?.id || 'default',
      name: form.name.trim(),
      phone: form.phone.trim(),
      accompany: parseInt(form.accompany) || 0,
      status: form.status,
    };

    if (isEditing) {
      updateGuest(guestData);
    } else {
      addGuest(guestData);
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md w-11/12 mx-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Convidado' : 'Novo Convidado'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Nome */}
          <div>
            <Label htmlFor="guest-name">Nome do Convidado</Label>
            <Input
              id="guest-name"
              placeholder="Ex: João Silva"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={errors.name ? 'border-destructive' : ''}
              required
            />
            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Telefone */}
          <div>
            <Label htmlFor="guest-phone">Telefone (com DDD)</Label>
            <Input
              id="guest-phone"
              placeholder="Ex: 11999999999"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={errors.phone ? 'border-destructive' : ''}
              required
            />
            {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Acompanhantes */}
          <div>
            <Label htmlFor="guest-accompany">Quantidade de Acompanhantes</Label>
            <Input
              id="guest-accompany"
              type="number"
              min="0"
              placeholder="0"
              value={form.accompany}
              onChange={(e) => setForm({ ...form, accompany: e.target.value })}
              className={errors.accompany ? 'border-destructive' : ''}
            />
            {errors.accompany && <p className="text-destructive text-sm mt-1">{errors.accompany}</p>}
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="guest-status">Status de Confirmação</Label>
            <select
              id="guest-status"
              className="w-full border rounded-md px-3 py-2 bg-background border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="declined">Recusado</option>
            </select>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-primary-custom hover:bg-primary-custom/90">
              {isEditing ? 'Salvar Alterações' : 'Adicionar Convidado'}
            </Button>
          </DialogFooter>
        </form>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-1 hover:bg-muted"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </DialogContent>
    </Dialog>
  );
}
