import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SendInviteModal({ guest, onClose }) {
  const { name, phone, partyId } = guest;
  const isMarcelleParty = partyId === '6e021c38-96c8-4743-b4c9-65bad7772fb0';
  const inviteLink = isMarcelleParty
    ? `${window.location.origin}/marcelle15anos?guestId=${guest.id}`
    : `${window.location.origin}/rsvp/${guest.id}`;
  const messageText = isMarcelleParty
    ? `👑 *O CONTO DE FADAS REAL* 👑\n\nOlá, *${name}*!\nVocê foi convidado para o inesquecível Baile de 15 Anos de *Marcelle Dias*. 👸✨\n\nPara garantir sua entrada no castelo, por favor confirme sua presença real no link abaixo:\n🔗 ${inviteLink}\n\nEstamos ansiosos para celebrar este momento mágico com você! 💫`
    : `🎉 *CONVITE ESPECIAL* 🎉\n\nOlá, *${name}*!\nVocê foi convidado para celebrar um momento muito especial conosco! 🥳✨\n\nPor favor, confirme sua presença no link abaixo:\n🔗 ${inviteLink}\n\nEsperamos você para comemorarmos juntos! 🥂`;

  const message = encodeURIComponent(messageText);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md w-11/12 mx-auto rounded-2xl bg-card border border-border/60 shadow-xl overflow-hidden p-0">
        <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white relative">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-extrabold flex items-center gap-1.5">
              <Sparkles size={18} className="animate-pulse text-yellow-300 fill-yellow-300" /> Enviar Convite Digital
            </DialogTitle>
          </DialogHeader>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 rounded-xl p-1.5 bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="space-y-3 bg-muted/40 p-4 rounded-2xl border border-border/20">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="font-bold text-muted-foreground/80">Convidado:</span>
              <strong className="text-foreground font-extrabold">{name}</strong>
            </div>
            
            <div className="flex justify-between items-center text-xs sm:text-sm border-t border-border/30 pt-2.5">
              <span className="font-bold text-muted-foreground/80">Telefone:</span>
              <strong className="text-foreground font-extrabold">{phone || 'Não informado'}</strong>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-border/30 pt-2.5">
              <span className="text-xs font-bold text-muted-foreground/80">Link do RSVP Digital:</span>
              <a 
                href={inviteLink} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs font-semibold text-primary underline break-all hover:text-primary/80 transition-colors whitespace-normal"
              >
                {inviteLink}
              </a>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 p-5 border-t border-border/40 bg-muted/10">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 rounded-xl py-5 border-border font-bold text-xs"
          >
            Cancelar
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 w-full">
            <Button 
              asChild 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl py-5 text-xs shadow-md shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <Send size={13} /> Enviar via WhatsApp
              </a>
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
