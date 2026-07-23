
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Check, Search, Users, User, AlertCircle } from "lucide-react";

interface Family {
  id: string;
  name: string;
  code: string;
  maxGuests: number;
  type: "FAMILY" | "FRIEND";
  isConfirmed: boolean;
  guests: any[];
}

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  
  // Edit State
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    maxGuests: 2,
    type: "FAMILY" as "FAMILY" | "FRIEND",
  });

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      const res = await fetch("/api/admin/families");
      const data = await res.json();
      setFamilies(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (family?: Family) => {
    setError("");
    if (family) {
      setEditingFamily(family);
      setFormData({
        name: family.name,
        code: family.code,
        maxGuests: family.maxGuests,
        type: family.type,
      });
    } else {
      setEditingFamily(null);
      setFormData({
        name: "",
        code: "",
        maxGuests: 2,
        type: "FAMILY",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const url = editingFamily?.id 
        ? `/api/admin/families/${editingFamily.id}`
        : "/api/admin/families";
      
      const method = editingFamily ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchFamilies();
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao salvar");
      }
    } catch (error) {
      setError("Erro de conexão");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir? Esta ação não pode ser desfeita.")) return;
    try {
      await fetch(`/api/admin/families/${id}`, { method: "DELETE" });
      setFamilies(families.filter((f) => f.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const filteredFamilies = families.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 relative max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-cinzel text-gold font-bold"
        >
          Gerenciar Lista
        </motion.h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="bg-gold text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-gold/20 transition-all"
        >
          <Plus size={20} /> Novo Cadastro
        </motion.button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:border-gold/50 outline-none"
          />
        </div>
        <div className="text-sm text-gray-400">
           {filteredFamilies.length} registros encontrados
        </div>
      </div>

      {/* Table */}
      <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 uppercase text-xs font-medium">
              <tr>
                <th className="px-6 py-4">Nome / Código</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-center">Vagas</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 animate-pulse">
                    Carregando dados...
                  </td>
                </tr>
              ) : filteredFamilies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                filteredFamilies.map((family) => (
                  <motion.tr
                    key={family.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{family.name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">{family.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        family.type === 'FAMILY' 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {family.type === 'FAMILY' ? <Users size={12} /> : <User size={12} />}
                        {family.type === 'FAMILY' ? 'Família' : 'Amigo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-300">
                        <span className={family.guests.length > 0 ? "text-white font-bold" : "text-gray-500"}>
                           {family.guests.length}
                        </span>
                        <span className="text-gray-600 mx-1">/</span>
                        <span className="text-gray-400">{family.maxGuests}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {family.isConfirmed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs">
                          <Check size={12} /> Confirmado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs">
                          <AlertCircle size={12} /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(family)}
                          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(family.id)}
                          className="p-2 hover:bg-ruby/10 rounded-lg text-gray-400 hover:text-ruby-light transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-cinzel text-gold mb-6">
                {editingFamily ? "Editar Cadastro" : "Novo Cadastro"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nome de Identificação</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Família Silva ou João da Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Código de Acesso (Único)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SILVA2024"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 outline-none font-mono uppercase"
                  />
                  <p className="text-xs text-gray-500 mt-1">Este código será usado para acessar o RSVP.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as "FAMILY" | "FRIEND" })}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 outline-none"
                    >
                      <option value="FAMILY">Família</option>
                      <option value="FRIEND">Amigo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Máx. Vagas</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.maxGuests}
                      onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-ruby/10 border border-ruby/20 rounded-lg text-ruby-light text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-gold text-black font-bold hover:bg-gold-light transition-colors shadow-lg shadow-gold/10"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
