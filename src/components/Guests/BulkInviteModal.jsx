import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function BulkInviteModal({ guests, onClose }) {
  // prepara os links
  const messages = guests.map(g => {
    const link = `${window.location.origin}/rsvp/${g.id}`;
    const text = encodeURIComponent(
      `Olá ${g.name}! Você está convidado para a festa! Confirme aqui: ${link}`
    );
    return {
      id: g.id,
      whatsappUrl: `https://api.whatsapp.com/send?phone=${g.phone}&text=${text}`
    };
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Convites em Lote</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-60 overflow-auto">
          {messages.map(m => (
            <div key={m.id} className="flex items-center justify-between">
              <span>{m.id}</span>
              <Button asChild size="sm">
                <a href={m.whatsappUrl} target="_blank" rel="noreferrer">
                  Enviar
                </a>
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>

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
