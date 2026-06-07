import React, { useState, useRef } from 'react';
import { useGuests } from './GuestContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useParty } from '../../contexts/PartyContext.jsx';
import { ReportPDFGenerator } from '../Reports/ReportPDFGenerator.js';
import { toast } from 'sonner';
import GuestForm from './GuestForm.jsx';
import SendInviteModal from './SendInviteModal.jsx';
import BulkInviteModal from './BulkInviteModal.jsx';
import GateDesk from './GateDesk.jsx';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Users,
  Clock,
  Trash2,
  Edit3,
  Mail,
  Plus,
  CheckCircle2,
  XCircle,
  Upload,
  CheckSquare,
  ArrowLeft,
  UserCheck,
  UserX,
  Phone,
  FileText,
  Hash,
  MoreVertical,
  X
} from 'lucide-react';

export default function GuestList({ onBack, onGoToSubscription }) {
  const { guests, removeGuest, updateGuest, addGuestsBulk } = useGuests();
  const { user } = useAuth();
  const { currentParty } = useParty();

  const [filter, setFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingGuest, setEditingGuest] = useState(null);
  const [invitingGuest, setInvitingGuest] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isBulkInviteOpen, setIsBulkInviteOpen] = useState(false);
  const [isGateDeskActive, setIsGateDeskActive] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const handleGeneratePDF = async () => {
    if (!currentParty) {
      toast.error('Nenhuma festa ativa para gerar o relatório.');
      return;
    }
    toast.info('Gerando PDF de convidados com QR Codes... Aguarde.');
    try {
      await ReportPDFGenerator.generateGuestListPDF(currentParty, guests);
      toast.success('Relatório PDF baixado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar relatório PDF.');
    }
  };

  const totalGuests = guests.length;
  const confirmedCount = guests.filter(g => g.status === 'confirmed').length;
  const notConfirmedCount = totalGuests - confirmedCount;

  const filteredGuests = guests.filter(g =>
    filter === 'all' ? true : g.status === filter
  );

  const toggleSelect = id => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };
  const selectedGuests = guests.filter(g => selectedIds.includes(g.id));

  const handleCsvImportClick = () => {
    if (user?.plan !== 'MASTER' && user?.role !== 'ADMIN') {
      toast.error('Recurso do Plano MASTER', {
        description: 'A importação de convidados via CSV é um recurso exclusivo do Plano MASTER (corporativo).',
        action: {
          label: 'Fazer Upgrade',
          onClick: () => onGoToSubscription && onGoToSubscription()
        },
        duration: 8000,
        position: 'top-center'
      });
      return;
    }
    document.getElementById('csv-file-input').click();
  };

  const handleGateDeskClick = () => {
    if (user?.plan !== 'MASTER' && user?.role !== 'ADMIN') {
      toast.error('Recurso do Plano MASTER', {
        description: 'O Modo Portaria (Gate Desk) é um recurso exclusivo do Plano MASTER (corporativo).',
        action: {
          label: 'Fazer Upgrade',
          onClick: () => onGoToSubscription && onGoToSubscription()
        },
        duration: 8000,
        position: 'top-center'
      });
      return;
    }
    setIsGateDeskActive(true);
  };

  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/);
      
      const importedGuests = [];
      let headerSkipped = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (!headerSkipped && (trimmed.toLowerCase().includes('nome') || trimmed.toLowerCase().includes('name') || trimmed.toLowerCase().includes('telefone') || trimmed.toLowerCase().includes('phone'))) {
          headerSkipped = true;
          continue;
        }
        headerSkipped = true;

        const cols = trimmed.split(/,|;/);
        if (cols.length >= 1) {
          const name = cols[0]?.replace(/^["']|["']$/g, '').trim();
          const phone = cols[1]?.replace(/^["']|["']$/g, '').trim() || '';
          const accompany = parseInt(cols[2]?.replace(/^["']|["']$/g, '').trim()) || 0;
          
          if (name) {
            importedGuests.push({
              name,
              phone,
              accompany,
              status: 'pending'
            });
          }
        }
      }

      if (importedGuests.length === 0) {
        toast.error('Nenhum convidado encontrado', {
          description: 'Certifique-se de que o arquivo está no formato correto: Nome, Telefone, Acompanhantes.',
          position: 'top-center',
          duration: 5000
        });
        return;
      }

      if (confirm(`Deseja realmente importar ${importedGuests.length} convidados do arquivo CSV?`)) {
        try {
          await addGuestsBulk(importedGuests);
          toast.success('Importação bem sucedida', {
            description: `${importedGuests.length} convidados importados com sucesso! 🎉`,
            position: 'top-center'
          });
        } catch (error) {
          console.error(error);
          toast.error('Erro ao importar', {
            description: error.message || 'Erro ao importar convidados. Tente novamente.',
            position: 'top-center'
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = (guest) => {
    if (window.confirm(`Tem certeza que deseja excluir ${guest.name}?`)) {
      removeGuest(guest.id);
      toast.success(`${guest.name} foi removido com sucesso.`, {
        position: 'top-center',
        className: 'rounded-xl font-semibold'
      });
    }
  };

  const handleStatusChange = (guest, newStatus) => {
    updateGuest({ ...guest, status: newStatus });
    toast.success(`Status de ${guest.name} atualizado!`, {
      position: 'top-center',
      className: 'rounded-xl font-semibold'
    });
  };

  if (isGateDeskActive) {
    return <GateDesk onBack={() => setIsGateDeskActive(false)} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 max-w-5xl mx-auto space-y-5 transition-colors duration-300">
      {/* Input oculto para importação CSV */}
      <input type="file" id="csv-file-input" accept=".csv" className="hidden" onChange={handleCsvFileChange} />

      {/* Modais */}
      {editingGuest && <GuestForm existingGuest={editingGuest} onClose={() => setEditingGuest(null)} />}
      {isAdding && <GuestForm onClose={() => setIsAdding(false)} />}
      {isBulkInviteOpen && (
        <BulkInviteModal
          guests={filteredGuests.length && selectedIds.length === 0 ? filteredGuests : guests.filter(g => selectedIds.includes(g.id))}
          onClose={() => setIsBulkInviteOpen(false)}
        />
      )}

      {/* ── CABEÇALHO ── */}
      <div className="flex items-start justify-between gap-3 pt-1">
        {/* Título + stats */}
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full md:hidden text-foreground shrink-0 -ml-1">
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Convidados</h1>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-2 bg-card/60 backdrop-blur-md p-3 rounded-2xl border border-border/50 shadow-sm max-w-xs">
            <div className="text-center">
              <p className="text-lg sm:text-xl font-extrabold text-primary">{totalGuests}</p>
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-xl font-extrabold text-emerald-500">{confirmedCount}</p>
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Confirmados</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-xl font-extrabold text-rose-500">{notConfirmedCount}</p>
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </div>

        {/* ── AÇÕES (mobile: botão + menu; desktop: todos visíveis) ── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Adicionar — sempre visível */}
          <Button
            onClick={() => setIsAdding(true)}
            className="rounded-xl h-10 px-3 sm:px-4 bg-primary text-primary-foreground font-semibold flex items-center gap-1.5 shadow-md shadow-primary/10 text-xs"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Adicionar</span>
          </Button>

          {/* Convidar selecionados — visível se há seleção */}
          {selectedIds.length > 0 && (
            <Button
              onClick={() => setIsBulkInviteOpen(true)}
              className="rounded-xl h-10 px-3 text-xs font-semibold flex items-center gap-1.5"
            >
              <Mail size={14} />
              <span>Convidar ({selectedIds.length})</span>
            </Button>
          )}

          {/* Menu de ações extras — mobile: ícone ⋯; desktop: botões visíveis */}
          <div className="relative">
            {/* Mobile: botão ⋯ */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActionsOpen(prev => !prev)}
              className="rounded-xl h-10 w-10 border-border/70 md:hidden"
            >
              {actionsOpen ? <X size={16} /> : <MoreVertical size={16} />}
            </Button>

            {/* Mobile dropdown */}
            <AnimatePresence>
              {actionsOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-50 w-52 bg-card/98 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl p-2 space-y-0.5"
                >
                  <button onClick={() => { setActionsOpen(false); setSelectedIds([]); setIsBulkInviteOpen(true); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted/70 transition-colors">
                    <Mail size={16} className="text-primary" />
                    Convidar Todos
                  </button>
                  <button onClick={() => { setActionsOpen(false); handleGeneratePDF(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted/70 transition-colors">
                    <FileText size={16} className="text-emerald-500" />
                    Gerar PDF
                  </button>
                  <button onClick={() => { setActionsOpen(false); handleCsvImportClick(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted/70 transition-colors">
                    <Upload size={16} className="text-blue-500" />
                    Importar CSV
                  </button>
                  <button onClick={() => { setActionsOpen(false); handleGateDeskClick(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted/70 transition-colors">
                    <CheckSquare size={16} className="text-amber-500" />
                    Portaria (Gate)
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop: botões inline */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="secondary" onClick={() => { setSelectedIds([]); setIsBulkInviteOpen(true); }} className="rounded-xl px-4 py-2.5 font-semibold text-xs flex items-center gap-1.5">
                <Mail size={14} /><span>Convidar Todos</span>
              </Button>
              <Button variant="outline" onClick={handleGeneratePDF} className="rounded-xl px-4 py-2.5 font-semibold text-xs flex items-center gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10">
                <FileText size={14} /><span>PDF</span>
              </Button>
              <Button variant="outline" onClick={handleCsvImportClick} className="rounded-xl px-4 py-2.5 font-semibold text-xs flex items-center gap-1.5">
                <Upload size={14} /><span>CSV</span>
              </Button>
              <Button variant="outline" onClick={handleGateDeskClick} className="rounded-xl px-4 py-2.5 font-semibold text-xs flex items-center gap-1.5">
                <CheckSquare size={14} /><span>Portaria</span>
              </Button>
              <Button variant="outline" onClick={onBack} className="rounded-xl px-4 py-2.5 font-semibold text-xs">
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para fechar menu */}
      {actionsOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setActionsOpen(false)} />
      )}

      <Separator className="opacity-60" />

      {/* ── FILTROS — scroll horizontal no mobile ── */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="inline-flex rounded-xl p-1 bg-muted/60 border font-semibold whitespace-nowrap min-w-full sm:min-w-0">
            <TabsTrigger value="all" className="flex items-center gap-1.5 rounded-lg py-2 px-3 text-xs transition-all">
              <Users size={13} /><span>Todos ({totalGuests})</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-1.5 rounded-lg py-2 px-3 text-xs transition-all">
              <Clock size={13} className="text-amber-500" /><span>Pendentes</span>
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex items-center gap-1.5 rounded-lg py-2 px-3 text-xs transition-all">
              <CheckCircle2 size={13} className="text-emerald-500" /><span>Confirmados</span>
            </TabsTrigger>
            <TabsTrigger value="declined" className="flex items-center gap-1.5 rounded-lg py-2 px-3 text-xs transition-all">
              <XCircle size={13} className="text-rose-500" /><span>Recusados</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Lista de convidados */}
      {filteredGuests.length === 0 ? (
        <div className="border border-dashed p-16 text-center rounded-3xl shadow-sm bg-card/20">
          <Users className="mx-auto text-zinc-300 dark:text-zinc-700 h-16 w-16 mb-4" />
          <h3 className="text-lg font-bold text-foreground/80">Nenhum convidado nesta categoria</h3>
          <p className="text-sm text-muted-foreground mt-1.5">Comece adicionando novos nomes à sua lista de comemoração.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredGuests.map(guest => (
            <li
              key={guest.id}
              className={`bg-card/75 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-border/50 shadow-md shadow-black/[0.01] hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-4`}
            >
              {/* Conteúdo do convidado */}
              <div className="flex items-center gap-4 w-full">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(guest.id)}
                  onChange={() => toggleSelect(guest.id)}
                  className="w-5 h-5 rounded-md border-border bg-background focus:ring-2 focus:ring-primary cursor-pointer text-primary transition flex-shrink-0"
                />
                
                <div className="space-y-1.5 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-base text-foreground tracking-tight">{guest.name}</p>
                    {guest.accompany > 0 && (
                      <span className="text-[10px] font-extrabold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        +{guest.accompany} Acomp.
                      </span>
                    )}
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(guest.id);
                        toast.success('ID do convidado copiado!');
                      }}
                      className="text-[9px] font-mono bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 px-1.5 py-0.5 rounded cursor-pointer transition-all"
                      title="Clique para copiar o ID do convidado"
                    >
                      ID: {guest.id}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone size={12} />
                      {guest.phone}
                    </span>
                    {guest.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} />
                        {guest.email}
                      </span>
                    )}
                    {(guest.tableNumber || guest.sector) && (
                      <span className="flex items-center gap-1 text-primary">
                        <Hash size={12} />
                        {guest.tableNumber ? `Mesa ${guest.tableNumber}` : ''}
                        {guest.tableNumber && guest.sector ? ' • ' : ''}
                        {guest.sector ? `Setor ${guest.sector}` : ''}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      {guest.status === 'confirmed' ? (
                        <span className="flex items-center gap-1 text-emerald-500 font-bold">
                          <CheckCircle2 size={12} /> Confirmou
                        </span>
                      ) : guest.status === 'declined' ? (
                        <span className="flex items-center gap-1 text-rose-500 font-bold">
                          <XCircle size={12} /> Recusou
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Clock size={12} /> Pendente
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex items-center justify-end gap-1.5 border-t md:border-none pt-3 md:pt-0">
                {/* Confirmar status rápido */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleStatusChange(guest, guest.status === 'confirmed' ? 'pending' : 'confirmed')}
                  className={`w-10 h-10 rounded-xl hover:bg-muted/80 ${guest.status === 'confirmed' ? 'text-emerald-500' : 'text-muted-foreground/60'}`}
                >
                  <UserCheck size={18} />
                </Button>

                {/* Recusar status rápido */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleStatusChange(guest, guest.status === 'declined' ? 'pending' : 'declined')}
                  className={`w-10 h-10 rounded-xl hover:bg-muted/80 ${guest.status === 'declined' ? 'text-rose-500' : 'text-muted-foreground/60'}`}
                >
                  <UserX size={18} />
                </Button>

                {/* Editar */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingGuest(guest)}
                  className="w-10 h-10 rounded-xl hover:bg-muted/80 text-muted-foreground"
                >
                  <Edit3 size={18} />
                </Button>

                {/* WhatsApp Modal */}
                {invitingGuest === guest ? (
                  <SendInviteModal guest={guest} onClose={() => setInvitingGuest(null)} />
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setInvitingGuest(guest)}
                    className="w-10 h-10 rounded-xl hover:bg-muted/80 text-primary"
                  >
                    <Mail size={18} />
                  </Button>
                )}

                {/* Deletar */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(guest)}
                  className="w-10 h-10 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
