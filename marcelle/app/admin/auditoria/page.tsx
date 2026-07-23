
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History, Calendar, User, Activity, Search } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  details: string;
  familyId: string | null;
  familyName: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/audit")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.familyName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
  );

  const formatDetails = (details: string) => {
    try {
      const parsed = JSON.parse(details);
      if (typeof parsed === 'object') {
        return (
          <div className="text-xs space-y-1 mt-1 text-gray-500 font-mono bg-black/20 p-2 rounded border border-white/5">
            {Object.entries(parsed).map(([k, v]) => (
              <div key={k}>
                <span className="text-gold/60">{k}:</span> {String(v)}
              </div>
            ))}
          </div>
        );
      }
    } catch (e) {}
    return <p className="text-xs text-gray-500 mt-1">{details}</p>;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-cinzel text-gold font-bold flex items-center gap-3">
            <History className="w-8 h-8" />
            Logs de Auditoria
          </h1>
          <p className="text-gray-400 text-sm mt-1">Rastreamento de todas as ações e confirmações no sistema</p>
        </div>
      </div>

      <div className="relative max-w-md bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Filtrar logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border-none py-2 pl-12 pr-4 text-white focus:outline-none"
        />
      </div>

      <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 uppercase text-xs font-medium">
              <tr>
                <th className="px-6 py-4">Data / Hora</th>
                <th className="px-6 py-4">Ação</th>
                <th className="px-6 py-4">Origem</th>
                <th className="px-6 py-4">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 animate-pulse">
                    Carregando histórico...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    Nenhum log encontrado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors align-top"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar size={14} className="text-gold/50" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/20 text-[10px] font-bold tracking-wider uppercase">
                        <Activity size={10} />
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-white font-cinzel">
                        <User size={14} className="text-gold/50" />
                        {log.familyName}
                      </div>
                    </td>
                    <td className="px-6 py-4 min-w-[300px]">
                      {formatDetails(log.details)}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
