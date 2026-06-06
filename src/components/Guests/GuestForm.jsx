import React, { useState, useEffect } from 'react';
import { useGuests } from './GuestContext.jsx';
import { useParty } from '../../contexts/PartyContext.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, X, User, Phone, Users, PlusCircle, Trash2, Mail, Hash, Layers } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

export default function GuestForm({ existingGuest, onClose }) {
  const { addGuest, updateGuest } = useGuests();
  const { currentParty } = useParty();

  const isEditing = !!existingGuest;

  const [addMultiple, setAddMultiple] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    accompany: '0',
    status: 'pending',
    whatsappInvite: false,
    email: '',
    tableNumber: '',
    sector: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingGuest) {
      setForm({
        name: existingGuest.name || '',
        phone: existingGuest.phone || '',
        accompany: existingGuest.accompany?.toString() || '0',
        status: existingGuest.status || 'pending',
        whatsappInvite: !!existingGuest.whatsappInvite,
        email: existingGuest.email || '',
        tableNumber: existingGuest.tableNumber || '',
        sector: existingGuest.sector || '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);

    const guestData = {
      id: isEditing ? existingGuest.id : Date.now().toString(),
      partyId: currentParty?.id || 'default',
      name: form.name.trim(),
      phone: form.phone.trim(),
      accompany: parseInt(form.accompany) || 0,
      status: form.status,
      whatsappInvite: form.whatsappInvite,
      email: form.email.trim(),
      tableNumber: form.tableNumber.trim(),
      sector: form.sector.trim(),
    };

    try {
      if (isEditing) {
        await updateGuest(guestData);
        toast.success('Convidado atualizado!');
        onClose();
      } else {
        await addGuest(guestData);
        toast.success('Convidado adicionado!');
        if (addMultiple) {
            setForm({
              name: '',
              phone: '',
              accompany: '0',
              status: 'pending',
              whatsappInvite: form.whatsappInvite,
              email: '',
              tableNumber: '',
              sector: '',
            });
        } else {
          onClose();
        }
      }
    } catch (error) {
      toast.error('Erro ao salvar convidado. Verifique os dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md w-11/12 mx-auto rounded-3xl border-none shadow-2xl bg-background p-0 overflow-hidden [&>button:last-child]:hidden max-h-[90vh] overflow-y-auto">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="p-5 sm:p-6 relative z-10 space-y-4">
          <DialogHeader className="text-left space-y-1">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
              <User size={20} strokeWidth={1.5} className="text-primary" />
            </div>
            <DialogTitle className="text-xl font-black tracking-tight text-foreground">
              {isEditing ? 'Editar Convidado' : 'Novo Convidado'}
            </DialogTitle>
            <p className="text-xs text-muted-foreground font-medium">
              {isEditing ? 'Atualize as informações do seu convidado.' : 'Adicione um novo convidado à sua lista.'}
            </p>
            {isEditing && existingGuest && (
              <div 
                onClick={() => {
                  navigator.clipboard.writeText(existingGuest.id);
                  toast.success('ID do convidado copiado!');
                }}
                className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 text-[10px] font-mono px-2 py-1 rounded-lg cursor-pointer transition-all self-start mt-1.5 border border-border/40"
                title="Clique para copiar o ID do convidado"
              >
                <span>ID: {existingGuest.id}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </div>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Nome do Convidado</label>
              <div className="relative">
                <User size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="guest-name"
                  placeholder="Ex: João Silva"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full bg-card border ${errors.name ? 'border-destructive' : 'border-border'} rounded-xl px-3.5 py-2.5 pl-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm`}
                  required
                />
              </div>
              {errors.name && <p className="text-destructive text-xs mt-1 font-medium">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">E-mail</label>
              <div className="relative">
                <Mail size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="guest-email"
                  type="email"
                  placeholder="Ex: joao@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full bg-card border border-border rounded-xl px-3.5 py-2.5 pl-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm h-11`}
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Telefone</label>
              <div className="relative">
                <Phone size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="guest-phone"
                  placeholder="Ex: 11999999999"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={`w-full bg-card border ${errors.phone ? 'border-destructive' : 'border-border'} rounded-xl px-3.5 py-2.5 pl-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm`}
                  required
                />
              </div>
              {errors.phone && <p className="text-destructive text-xs mt-1 font-medium">{errors.phone}</p>}
            </div>

            {/* Acompanhantes e Mesa/Setor */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Acompanhantes</label>
                <div className="relative">
                  <Users size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="guest-accompany"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.accompany}
                    onChange={(e) => setForm({ ...form, accompany: e.target.value })}
                    className={`w-full bg-card border ${errors.accompany ? 'border-destructive' : 'border-border'} rounded-xl px-3.5 py-2.5 pl-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Mesa</label>
                <div className="relative">
                  <Hash size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="guest-table"
                    placeholder="Mesa"
                    value={form.tableNumber}
                    onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
                    className={`w-full bg-card border border-border rounded-xl px-3.5 py-2.5 pl-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm h-11`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Setor / Área</label>
                <div className="relative">
                  <Layers size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="guest-sector"
                    placeholder="Ex: VIP"
                    value={form.sector}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                    className={`w-full bg-card border border-border rounded-xl px-3.5 py-2.5 pl-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm h-11`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Status</label>
                <div className="relative">
                  <CheckCircle size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                    <SelectTrigger className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 pl-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="declined">Recusado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className={`grid gap-2 mt-2 ${!isEditing ? 'grid-cols-2' : 'grid-cols-1'}`}>
              
              {/* Toggle WhatsApp Invite */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/60 shadow-sm h-full">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-foreground tracking-tight leading-none mb-0.5">Whats</span>
                    <span className="text-[8px] font-medium text-muted-foreground leading-none">Disparo Rápido</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-1">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={form.whatsappInvite}
                    onChange={(e) => setForm({ ...form, whatsappInvite: e.target.checked })}
                  />
                  <div className="w-7 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              {/* Adicionar Vários */}
              {!isEditing && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/60 shadow-sm h-full">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Users size={14} className="text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-foreground tracking-tight leading-none mb-0.5">Modo Contínuo</span>
                      <span className="text-[8px] font-medium text-muted-foreground leading-none">Cadastrar Vários</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-1">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={addMultiple}
                      onChange={(e) => setAddMultiple(e.target.checked)}
                    />
                    <div className="w-7 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              )}

            </div>

            {/* RSVP DETAILS SECTION (Read-only display for Organizer) */}
            {isEditing && existingGuest && existingGuest.status === 'confirmed' && (
              <div className="bg-muted/40 p-4 rounded-2xl border border-border/40 space-y-3.5 mt-4 text-xs font-semibold">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  ✨ Respostas do RSVP
                </h4>
                
                {existingGuest.dietaryRestrictions?.length > 0 && (
                  <div>
                    <span className="text-[8px] font-black uppercase text-muted-foreground block">Restrições Alimentares</span>
                    <span className="text-foreground text-xs mt-0.5 block">{existingGuest.dietaryRestrictions.join(', ')}</span>
                  </div>
                )}

                {existingGuest.favoriteSong && (
                  <div>
                    <span className="text-[8px] font-black uppercase text-muted-foreground block">Música Favorita</span>
                    <span className="text-foreground text-xs mt-0.5 block italic">"{existingGuest.favoriteSong}"</span>
                  </div>
                )}

                {existingGuest.messageToHost && (
                  <div>
                    <span className="text-[8px] font-black uppercase text-muted-foreground block">Recado para os Anfitriões</span>
                    <p className="text-foreground text-xs mt-1 bg-background/50 p-2.5 rounded-lg border border-border/40 whitespace-pre-wrap leading-relaxed font-medium">
                      {existingGuest.messageToHost}
                    </p>
                  </div>
                )}

                {existingGuest.photoUrl && (
                  <div>
                    <span className="text-[8px] font-black uppercase text-muted-foreground block mb-1">Selfie Enviada</span>
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-border/50 shadow-inner">
                      <img src={existingGuest.photoUrl} alt="Selfie do Convidado" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {existingGuest.companionNames?.length > 0 && (
                  <div>
                    <span className="text-[8px] font-black uppercase text-muted-foreground block">Acompanhantes Cadastrados</span>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-xs text-foreground/80 font-medium">
                      {existingGuest.companionNames.map((name, i) => (
                        <li key={i}>{name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-black uppercase tracking-wider hover:bg-muted transition-colors text-muted-foreground"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar' : 'Adicionar')}
              </button>
            </div>
          </form>

        </div>

        {/* Custom Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 bg-background/50 hover:bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground transition-all z-20 cursor-pointer"
          aria-label="Fechar"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </DialogContent>
    </Dialog>
  );
}
