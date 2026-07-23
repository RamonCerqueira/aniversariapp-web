"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check, X } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  confirmed: boolean;
  ageGroup: string;
  family: {
    name: string;
    code: string;
  };
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending">("all");

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const res = await fetch("/api/admin/guests");
      const data = await res.json();
      setGuests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.family.name.toLowerCase().includes(search.toLowerCase());
    
    if (filter === "confirmed") return matchesSearch && g.confirmed;
    if (filter === "pending") return matchesSearch && !g.confirmed;
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-cinzel text-gold font-bold"
      >
        Lista de Convidados
      </motion.h1>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar convidado ou família..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:border-gold/50 focus:ring-1 focus:ring-gold/50 outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              filter === "all" ? "bg-gold text-black" : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              filter === "confirmed" ? "bg-green-500 text-black" : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            Confirmados
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              filter === "pending" ? "bg-ruby text-white" : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            Pendentes
          </button>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left">
          <thead className="bg-black/50 text-gray-400 text-sm uppercase">
            <tr>
              <th className="p-4 font-medium">Convidado</th>
              <th className="p-4 font-medium">Família</th>
              <th className="p-4 font-medium">Faixa Etária</th>
              <th className="p-4 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence>
              {filteredGuests.map((guest) => (
                <motion.tr
                  key={guest.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 font-medium text-white">{guest.name}</td>
                  <td className="p-4 text-gray-400">{guest.family.name}</td>
                  <td className="p-4 text-gray-400 capitalize">
                    {guest.ageGroup === "child" ? "Criança" : guest.ageGroup === "teen" ? "Jovem" : "Adulto"}
                  </td>
                  <td className="p-4 text-center">
                    {guest.confirmed ? (
                      <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-bold">
                        <Check size={12} /> Confirmado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-ruby/20 text-ruby-light px-2 py-1 rounded-full text-xs font-bold">
                        <X size={12} /> Pendente
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filteredGuests.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">
            Nenhum convidado encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
