import React, { useState, useEffect } from 'react';
import { useGuests } from './GuestContext.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

export default function GuestForm({ existingGuest = null, onClose }) {
  const { addGuest, updateGuest } = useGuests();

  // 1) Estado local para o formulário
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [accompany, setAccompany] = useState(0);
  const [notes, setNotes] = useState('');

  // 2) Se estivermos editando, pré-carrega os dados
  useEffect(() => {
    if (existingGuest) {
      setName(existingGuest.name);
      setPhone(existingGuest.phone);
      setAccompany(existingGuest.accompany);
      setNotes(existingGuest.notes);
    }
  }, [existingGuest]);

  // 3) Handler de submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const guestData = {
      id: existingGuest
        ? existingGuest.id
        : crypto.randomUUID(), // gera ID único sem uuid
      name: name.trim(),
      phone: phone.trim(),
      accompany: Number(accompany),
      notes: notes.trim(),
    };

    if (existingGuest) {
      updateGuest(guestData);
    } else {
      addGuest(guestData);
    }

    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingGuest ? 'Editar Convidado' : 'Novo Convidado'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <Label htmlFor="guest-name">Nome</Label>
            <Input
              id="guest-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Digite o nome"
            />
          </div>

          {/* Telefone */}
          <div>
            <Label htmlFor="guest-phone">Telefone (WhatsApp)</Label>
            <Input
              id="guest-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+55 (XX) XXXXX-XXXX"
            />
          </div>

          {/* Acompanhantes */}
          <div>
            <Label htmlFor="guest-accompany">Acompanhantes</Label>
            <Input
              id="guest-accompany"
              type="number"
              min={0}
              max={10}
              value={accompany}
              onChange={(e) => setAccompany(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="guest-notes">Observações</Label>
            <Input
              id="guest-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: restrição alimentar"
            />
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {existingGuest ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>

        {/* Botão de fechar */}
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
