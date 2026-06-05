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
      name: g.name,
      whatsappUrl: `https://api.whatsapp.com/send?phone=${g.phone}&text=${text}`
    };
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl border bg-card/95 backdrop-blur-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Enviar Convites em Lote</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-60 overflow-auto py-2">
          {messages.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/60 transition">
              <span className="font-semibold text-sm text-foreground/90">{m.name}</span>
              <Button asChild size="sm" className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-lg shadow-sm">
                <a href={m.whatsappUrl} target="_blank" rel="noreferrer">
                  Enviar via WhatsApp
                </a>
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose} className="rounded-lg font-semibold">
            Fechar
          </Button>
        </DialogFooter>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-1 hover:bg-muted transition text-muted-foreground"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </DialogContent>
    </Dialog>
  );
}
