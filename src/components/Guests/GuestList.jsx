import React, { useState } from 'react';
import { useGuests } from './GuestContext.jsx';
import GuestForm from './GuestForm.jsx';
import SendInviteModal from './SendInviteModal.jsx';
import BulkInviteModal from './BulkInviteModal.jsx';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
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
          <div className="flex space-x-4">
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

        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button variant="outline" onClick={onBack}>Voltar</Button>
          <Button onClick={() => setIsAdding(true)}>
            <Plus size={16} className="mr-1" />
            Adicionar
          </Button>
          <Button onClick={() => { setSelectedIds([]); setIsBulkInviteOpen(true); }}>
            <Mail size={16} className="mr-1" />
            Convidar Todos
          </Button>
          <Button
            disabled={selectedIds.length === 0}
            onClick={() => setIsBulkInviteOpen(true)}
          >
            <Mail size={16} className="mr-1" />
            Convidar Selecionados ({selectedIds.length})
          </Button>
        </div>
      </div>

      <Separator />

      {/* Filtros */}
      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmados</TabsTrigger>
          <TabsTrigger value="declined">Recusados</TabsTrigger>
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
              className="bg-card p-4 rounded-lg shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(guest.id)}
                  onChange={() => toggleSelect(guest.id)}
                />
                <div>
                  <p className="font-semibold">{guest.name}</p>
                  <p className="text-sm text-muted-foreground">{guest.phone}</p>
                  <p className="text-sm">
                    Acompanhantes: <strong>{guest.accompany}</strong>
                  </p>
                  <div className="flex items-center space-x-2">
                    {guest.status === 'confirmed' && (
                      <span className="flex items-center text-green-600">
                        <CheckCircle2 size={16} /> Confirmado
                      </span>
                    )}
                    {guest.status === 'declined' && (
                      <span className="flex items-center text-red-600">
                        <XCircle size={16} /> Recusado
                      </span>
                    )}
                    {guest.status === 'pending' && (
                      <span className="text-muted-foreground">Pendente</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Marcar confirmado */}
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

                {/* Editar */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingGuest(guest)}
                >
                  <Edit3 size={16} />
                </Button>

                {/* Enviar convite individual */}
                {invitingGuest === guest ? (
                  <SendInviteModal
                    guest={guest}
                    onClose={() => setInvitingGuest(null)}
                  />
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setInvitingGuest(guest)}
                  >
                    <Mail size={16} />
                  </Button>
                )}

                {/* Excluir */}
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
