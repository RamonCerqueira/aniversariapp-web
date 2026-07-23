"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, XCircle, Users, Music, RefreshCw } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  email: string;
  ticketCode: string;
  hasCheckedIn: boolean;
  musicSuggestion: string | null;
  numGuests: number;
}

export default function AdminCheckin() {
  const [ticketCode, setTicketCode] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [stats, setStats] = useState({ totalConfirmed: 0, totalPresent: 0 });
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/checkin/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Erro ao buscar estatísticas", err);
    }
  };

  const fetchGuests = async () => {
    try {
      const res = await fetch("/api/admin/guests"); // Precisaremos criar esta rota
      const data = await res.json();
      setGuests(data);
    } catch (err) {
      console.error("Erro ao buscar convidados", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchGuests();
  }, []);

  const handleCheckin = async (codeOverride?: string) => {
    const code = codeOverride || ticketCode;
    if (!code) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: code }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: `Check-in de ${data.guestName} realizado!` });
        setTicketCode("");
        fetchStats();
        fetchGuests();
      } else {
        setStatus({ type: "error", message: data.error || "Erro ao realizar check-in" });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Erro de conexão com o servidor" });
    } finally {
      setLoading(false);
    }
  };

  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-cinzel font-bold text-gold">Portaria Marcelle 15 Anos</h1>
            <p className="text-pearl/60">Controle de acesso e presença em tempo real</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-royal-dark border border-gold/20 p-4 rounded-xl flex items-center gap-4">
              <Users className="text-gold" />
              <div>
                <p className="text-xs uppercase tracking-widest opacity-50">Confirmados</p>
                <p className="text-2xl font-bold">{stats.totalConfirmed}</p>
              </div>
            </div>
            <div className="bg-royal-dark border border-gold/20 p-4 rounded-xl flex items-center gap-4">
              <CheckCircle className="text-green-500" />
              <div>
                <p className="text-xs uppercase tracking-widest opacity-50">Presentes</p>
                <p className="text-2xl font-bold">{stats.totalPresent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Input de Check-in Rápido */}
        <div className="bg-royal-dark border border-gold/30 p-8 rounded-2xl shadow-2xl">
          <label className="block text-sm font-cinzel text-gold mb-4 uppercase tracking-widest">Validar Ticket (QR Code ou Código)</label>
          <div className="flex gap-4">
            <input
              type="text"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
              placeholder="Digite o código do ticket..."
              className="flex-1 bg-black/50 border border-gold/20 rounded-lg px-6 py-4 text-xl focus:outline-none focus:border-gold transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleCheckin()}
            />
            <button
              onClick={() => handleCheckin()}
              disabled={loading}
              className="bg-gold hover:bg-gold-light text-royal-dark font-bold px-10 py-4 rounded-lg transition-all flex items-center gap-2"
            >
              {loading ? <RefreshCw className="animate-spin" /> : "VALIDAR"}
            </button>
          </div>

          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                status.type === "success" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {status.type === "success" ? <CheckCircle /> : <XCircle />}
              {status.message}
            </motion.div>
          )}
        </div>

        {/* Tabela de Convidados & Busca */}
        <div className="bg-royal-dark border border-gold/20 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gold/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-cinzel text-gold">Lista de Convidados</h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pearl/40" size={18} />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/30 border border-gold/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-gold/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/40 text-gold/60 text-xs uppercase tracking-widest">
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Presença</th>
                  <th className="px-6 py-4">Sugestão de Música</th>
                  <th className="px-6 py-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold">{guest.name}</p>
                      <p className="text-xs text-pearl/50">{guest.email}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-gold/80">{guest.ticketCode}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        guest.hasCheckedIn ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {guest.hasCheckedIn ? "Presente" : "Ausente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm italic text-pearl/70 max-w-xs truncate">
                      {guest.musicSuggestion || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {!guest.hasCheckedIn && (
                        <button
                          onClick={() => handleCheckin(guest.ticketCode)}
                          className="text-gold hover:text-gold-light transition-colors text-sm underline"
                        >
                          Check-in Manual
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
