import React, { useEffect, useState } from 'react';
import { useGuests } from './GuestContext.jsx';
import { useParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function RSVPPage() {
  const { id } = useParams(); // id do convidado na URL
  const { guests, updateGuest } = useGuests();
  const [guest, setGuest] = useState(null);
  const [response, setResponse] = useState(null); // 'confirmed' ou 'declined'

  // Estatísticas globais
  const totalGuests = guests.length;
  const confirmedCount = guests.filter(g => g.status === 'confirmed').length;
  const notConfirmedCount = guests.filter(g => g.status !== 'confirmed').length;

  useEffect(() => {
    const found = guests.find(g => g.id === id);
    setGuest(found);
    if (found) {
      setResponse(found.status); // preenche status se já respondeu
    }
  }, [guests, id]);

  if (!guest) return <p className="p-4 text-center">Convite inválido ou não encontrado.</p>;

  const handleResponse = (status) => {
    updateGuest({ ...guest, status });
    setResponse(status);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 space-y-6 bg-background">
      {/* Estatísticas gerais */}
      <div className="w-full max-w-md bg-card p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Resumo de Convites</h2>
        <div className="grid grid-cols-3 text-center">
          <div>
            <p className="text-2xl font-bold">{totalGuests}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
            <p className="text-sm text-muted-foreground">Confirmados</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{notConfirmedCount}</p>
            <p className="text-sm text-muted-foreground">Não confirmados</p>
          </div>
        </div>
      </div>

      {/* Convite individual */}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow text-center">
        <h1 className="text-2xl font-bold mb-4">🎉 Convite de {guest.name}</h1>
        <p className="mb-6">Você está convidado(a)! Confirme sua presença:</p>
        <div className="flex justify-center space-x-4">
          {/* Botão "Vou sim!" */}
          <button
            onClick={() => handleResponse('confirmed')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold
              ${response === 'confirmed'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-800 hover:bg-green-200'}
            `}
          >
            <CheckCircle2 size={20} />
            <span>Vou sim!</span>
          </button>

          {/* Botão "Não poderei ir" */}
          <button
            onClick={() => handleResponse('declined')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold
              ${response === 'declined'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-800 hover:bg-red-200'}
            `}
          >
            <XCircle size={20} />
            <span>Não poderei ir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
