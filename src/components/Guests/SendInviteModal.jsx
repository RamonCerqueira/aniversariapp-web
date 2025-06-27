import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function SendInviteModal({ guest, onClose }) {
  const { name, phone } = guest;
  const inviteLink = `${window.location.origin}/rsvp/${guest.id}`;
  const message = encodeURIComponent(
    `Olá ${name}! Você está convidado para a festa! Confirme aqui: ${inviteLink}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Convite</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            Convidado: <strong>{name}</strong>
          </p>
          <p>
            Telefone: <strong>{phone}</strong>
          </p>
          <p>
            Link de RSVP: 
            <a href={inviteLink} target="_blank" rel="noreferrer" className="text-primary-custom underline ml-1">
              {inviteLink}
            </a>
          </p>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button asChild>
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              Enviar via WhatsApp
            </a>
          </Button>
        </DialogFooter>
        {/* Botão de fechar no canto */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-1 hover:bg-muted"
        >
          <X size={16} />
        </button>
      </DialogContent>
    </Dialog>
  );
}
