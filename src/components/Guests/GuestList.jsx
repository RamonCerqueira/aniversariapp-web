import React, { useState } from 'react';
import { useGuests } from './GuestContext.jsx';
import GuestForm from './GuestForm.jsx';
import SendInviteModal from './SendInviteModal.jsx';
import BulkInviteModal from './BulkInviteModal.jsx';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  Clock,
  Trash2,
  Edit3,
  Mail,
  Plus,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function GuestList({ onBack }) {
  const { guests, deleteGuest, updateGuest } = useGuests();

  const [filter, setFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingGuest, setEditingGuest] = useState(null);
  const [invitingGuest, setInvitingGuest] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isBulkInviteOpen, setIsBulkInviteOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-background p-6 max-w-5xl mx-auto space-y-6">
      {/* Modal de edição */}
      {editingGuest && (
        <GuestForm
          existingGuest={editingGuest}
          onClose={() => setEditingGuest(null)}
        />
      )}

      {/* Modal de adição */}
      {isAdding && (
        <GuestForm
          onClose={() => setIsAdding(false)}
        />
      )}

      {/* Modal de envio em lote */}
      {isBulkInviteOpen && (
        <BulkInviteModal
          guests={filteredGuests.length && selectedIds.length === 0
            ? filteredGuests
            : guests.filter(g => selectedIds.includes(g.id))}
          onClose={() => setIsBulkInviteOpen(false)}
        />
      )}

      {/* Cabeçalho + Estatísticas + Ações */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Convidados</h1>
          <div className="flex flex-wrap gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalGuests}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
              <p className="text-sm text-muted-foreground">Confirmados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{notConfirmedCount}</p>
              <p className="text-sm text-muted-foreground">Não confirmados</p>
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap gap-2 justify-start md:justify-end">
          {/* Voltar */}
          <Button variant="outline" onClick={onBack}>
            <span className="sm:inline hidden">Voltar</span>
            <svg className="sm:hidden" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
          </Button>

          {/* Adicionar */}
          <Button onClick={() => setIsAdding(true)}>
            <Plus size={16} className="sm:inline hidden" />
            <span className="sm:ml-1 sm:inline hidden">Adicionar</span>
            <Plus size={16} className="sm:hidden" />
          </Button>

          {/* Convidar Todos */}
          <Button onClick={() => { setSelectedIds([]); setIsBulkInviteOpen(true); }}>
            <Mail size={16} className="sm:inline hidden" />
            <span className="sm:ml-1 sm:inline hidden">Convidar Todos</span>
            <Mail size={16} className="sm:hidden" />
          </Button>

          {/* Convidar Selecionados */}
          <Button
            disabled={selectedIds.length === 0}
            onClick={() => setIsBulkInviteOpen(true)}
          >
            <Mail size={16} className="sm:inline hidden" />
            <span className="sm:ml-1 sm:inline hidden">
              Convidar Selecionados ({selectedIds.length})
            </span>
            <Mail size={16} className="sm:hidden" />
          </Button>
        </div>

      </div>

      <Separator />


      {/* Filtros */}
      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList className="flex flex-wrap gap-2">
          {/* Todos */}
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Users size={16} />
            <span className="hidden sm:inline">Todos</span>
          </TabsTrigger>

          {/* Pendentes */}
          <TabsTrigger value="pending" className="flex items-center gap-1">
            <Clock size={16} />
            <span className="hidden sm:inline">Pendentes</span>
          </TabsTrigger>

          {/* Confirmados */}
          <TabsTrigger value="confirmed" className="flex items-center gap-1">
            <CheckCircle2 size={16} className="text-green-600" />
            <span className="hidden sm:inline">Confirmados</span>
          </TabsTrigger>

          {/* Recusados */}
          <TabsTrigger value="declined" className="flex items-center gap-1">
            <XCircle size={16} className="text-red-600" />
            <span className="hidden sm:inline">Recusados</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {/* Lista de convidados */}
      {filteredGuests.length === 0 ? (
        <p className="text-center text-muted-foreground">Nenhum convidado para exibir.</p>
      ) : (
        <ul className="space-y-4">
          {filteredGuests.map(guest => (
            <li
              key={guest.id}
              className="bg-card p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              {/* Conteúdo do convidado */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 w-full">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(guest.id)}
                    onChange={() => toggleSelect(guest.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold">{guest.name}</p>
                    <p className="text-sm text-muted-foreground">{guest.phone}</p>
                    <p className="text-sm">
                      Acompanhantes: <strong>{guest.accompany}</strong>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {guest.status === 'confirmed' && (
                        <span className="flex items-center text-green-600 text-sm">
                          <CheckCircle2 size={16} className="mr-1" />
                          Confirmado
                        </span>
                      )}
                      {guest.status === 'declined' && (
                        <span className="flex items-center text-red-600 text-sm">
                          <XCircle size={16} className="mr-1" />
                          Recusado
                        </span>
                      )}
                      {guest.status === 'pending' && (
                        <span className="text-sm text-muted-foreground">Pendente</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-2 justify-start sm:justify-end">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => updateGuest({ ...guest, status: 'confirmed' })}
                >
                  <CheckCircle2
                    size={16}
                    className={guest.status === 'confirmed' ? 'text-green-600' : 'text-muted-foreground'}
                  />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingGuest(guest)}
                >
                  <Edit3 size={16} />
                </Button>

                {invitingGuest === guest ? (
                  <SendInviteModal guest={guest} onClose={() => setInvitingGuest(null)} />
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setInvitingGuest(guest)}
                  >
                    <Mail size={16} />
                  </Button>
                )}

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    if (confirm(`Excluir ${guest.name}?`)) {
                      deleteGuest(guest.id);
                    }
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </li>

          ))}
        </ul>
      )}
    </div>
  );
}
