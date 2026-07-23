
"use client";

import { useEffect, useState } from "react";
import { Printer, Download, Filter, CheckCircle, XCircle, Users } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  confirmed: boolean;
  ageGroup: string;
}

interface Family {
  id: string;
  name: string;
  code: string;
  type: "FAMILY" | "FRIEND";
  isConfirmed: boolean;
  message?: string;
  guests: Guest[];
  maxGuests: number;
}

export default function ReportsPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "CONFIRMED" | "PENDING">("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "FAMILY" | "FRIEND">("ALL");

  useEffect(() => {
    fetch("/api/admin/families")
      .then((res) => res.json())
      .then((data) => {
        setFamilies(data);
        setLoading(false);
      });
  }, []);

  const filteredData = families.filter((f) => {
    const statusMatch =
      filter === "ALL"
        ? true
        : filter === "CONFIRMED"
        ? f.isConfirmed
        : !f.isConfirmed;
    
    const typeMatch = typeFilter === "ALL" ? true : f.type === typeFilter;

    return statusMatch && typeMatch;
  });

  const totalGuests = filteredData.reduce((acc, f) => acc + f.guests.length, 0);
  const totalCapacity = filteredData.reduce((acc, f) => acc + f.maxGuests, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows = [
      ["Grupo", "Tipo", "Status", "Nome do Convidado", "Faixa Etaria", "Confirmado"],
    ];

    filteredData.forEach((family) => {
      if (family.guests.length > 0) {
        family.guests.forEach((guest) => {
          rows.push([
            family.name,
            family.type === "FAMILY" ? "Familia" : "Amigo",
            family.isConfirmed ? "Confirmado" : "Pendente",
            guest.name,
            guest.ageGroup,
            guest.confirmed ? "Sim" : "Nao",
          ]);
        });
      } else {
        rows.push([
          family.name,
          family.type === "FAMILY" ? "Familia" : "Amigo",
          family.isConfirmed ? "Confirmado" : "Pendente",
          "Nenhum convidado",
          "-",
          "-",
        ]);
      }
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      rows.map((e) => e.join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lista_convidados_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="text-gold p-8">Carregando dados...</div>;

  return (
    <div className="space-y-8">
      {/* Header - Hidden on Print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-cinzel text-gold font-bold">Relatórios de Convidados</h1>
          <p className="text-gray-400 text-sm mt-1">Gere listas para controle de entrada</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-white/10 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-white/20 transition-colors"
          >
            <Download size={20} /> Exportar CSV
          </button>
          <button
            onClick={handlePrint}
            className="bg-gold text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gold-light transition-colors"
          >
            <Printer size={20} /> Imprimir Lista
          </button>
        </div>
      </div>

      {/* Filters - Hidden on Print */}
      <div className="flex flex-wrap gap-4 bg-white/5 p-4 rounded-xl border border-white/10 print:hidden">
        <div className="flex items-center gap-2 text-sm text-gray-400 mr-2">
          <Filter size={16} /> Filtros:
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:border-gold/50 outline-none text-sm"
        >
          <option value="ALL">Todos os Status</option>
          <option value="CONFIRMED">Apenas Confirmados</option>
          <option value="PENDING">Apenas Pendentes</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:border-gold/50 outline-none text-sm"
        >
          <option value="ALL">Todos os Tipos</option>
          <option value="FAMILY">Famílias</option>
          <option value="FRIEND">Amigos</option>
        </select>
      </div>

      {/* Printable Content */}
      <div className="bg-white text-black p-8 rounded-xl shadow-xl print:shadow-none print:p-0 print:bg-transparent">
        {/* Print Header */}
        <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
          <h1 className="text-4xl font-serif font-bold mb-2">Marcelle 15 Anos</h1>
          <h2 className="text-xl uppercase tracking-widest text-gray-600">Lista de Convidados</h2>
          <div className="mt-4 flex justify-center gap-8 text-sm">
            <span>Data: {new Date().toLocaleDateString()}</span>
            <span>Total Listado: {totalGuests} pessoas</span>
          </div>
        </div>

        {/* List */}
        <div className="space-y-8">
          {filteredData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum registro encontrado para os filtros selecionados.</p>
          ) : (
            filteredData.map((family) => (
              <div key={family.id} className="break-inside-avoid border-b border-gray-200 pb-4 last:border-0">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-lg font-bold uppercase flex items-center gap-2">
                    {family.name}
                    <span className="text-xs font-normal bg-gray-100 px-2 py-0.5 rounded-full border border-gray-300">
                      {family.type === "FAMILY" ? "Família" : "Amigo"}
                    </span>
                    {!family.isConfirmed && (
                      <span className="text-xs font-normal text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 print:text-black print:border-black">
                        Pendente
                      </span>
                    )}
                  </h3>
                  <span className="text-sm text-gray-500 font-mono">
                    {family.guests.length} / {family.maxGuests} vagas
                  </span>
                </div>

                {family.message && (
                  <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-100 italic text-sm text-amber-900">
                    " {family.message} "
                  </div>
                )}

                {family.guests.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="py-1 w-10">#</th>
                        <th className="py-1">Nome do Convidado</th>
                        <th className="py-1 w-32">Faixa Etária</th>
                        <th className="py-1 w-24 text-center">Check-in</th>
                      </tr>
                    </thead>
                    <tbody>
                      {family.guests.map((guest, idx) => (
                        <tr key={guest.id} className="border-b border-gray-50 last:border-0">
                          <td className="py-2 text-gray-400">{idx + 1}</td>
                          <td className="py-2 font-medium">{guest.name}</td>
                          <td className="py-2 text-gray-600">
                            {guest.ageGroup === "ADULT" ? "Adulto" : guest.ageGroup === "CHILD" ? "Criança" : "Adolescente"}
                          </td>
                          <td className="py-2 text-center">
                            <div className="w-4 h-4 border border-gray-400 rounded mx-auto" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-400 italic pl-4">Nenhum convidado confirmado ainda.</p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          Relatório gerado em {new Date().toLocaleString()} - Sistema Marcelle 15 Anos
        </div>
      </div>
    </div>
  );
}
