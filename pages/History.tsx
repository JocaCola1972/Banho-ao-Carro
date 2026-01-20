
import React, { useState } from 'react';
import { Registration, User } from '../types';
import { Search, Filter, Download, Car as CarIcon, Calendar, Clock } from 'lucide-react';

interface HistoryProps {
  registrations: Registration[];
  user: User;
}

const History: React.FC<HistoryProps> = ({ registrations, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Admin sees everything, user sees only theirs
  const visibleRegs = user.role === 'admin' 
    ? registrations 
    : registrations.filter(r => r.userId === user.id);

  const filteredRegs = visibleRegs.filter(r => 
    r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.carDetails.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <HistoryIcon className="text-cyan-400 shrink-0" />
          Registo de Atividade
        </h2>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Filtrar por veículo ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none text-sm transition-all"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-[10px] font-mono uppercase tracking-widest border-b border-slate-800">
                <th className="px-6 py-4 font-medium">Data / Hora</th>
                <th className="px-6 py-4 font-medium">Operador / User</th>
                <th className="px-6 py-4 font-medium">Ativo (Veículo)</th>
                <th className="px-6 py-4 font-medium">Janela Operacional</th>
                <th className="px-6 py-4 font-medium text-right">Localização</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRegs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500 font-mono">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <Clock size={32} />
                      <p>Nenhum registo de lavagem encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRegs.map(reg => (
                  <tr key={reg.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-200">{new Date(reg.date).toLocaleDateString('pt-PT')}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{new Date(reg.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-cyan-400/90">{reg.userName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CarIcon size={14} className="text-slate-500 group-hover:text-cyan-500 transition-colors" />
                        <span className="text-xs md:text-sm text-slate-300 truncate max-w-[150px]">{reg.carDetails}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[10px] md:text-xs text-slate-400 whitespace-nowrap">
                      W{reg.weekNumber.toString().padStart(2, '0')} · {reg.year}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 font-mono">
                        {reg.parkingSpot || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Mobile-only help text */}
      <div className="md:hidden text-center text-[10px] text-slate-600 font-mono italic">
        Deslize para os lados para ver mais detalhes da tabela
      </div>
    </div>
  );
};

// Internal Import helper
const HistoryIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="m12 7v5l4 2"/></svg>
);

export default History;
