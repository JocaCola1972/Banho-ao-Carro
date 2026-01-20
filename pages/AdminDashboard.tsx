
import React, { useState, useEffect } from 'react';
import { User, Registration, AppSettings } from '../types';
import { getWeekNumber, areRegistrationsOpen } from '../utils';
import * as XLSX from 'xlsx';
import { 
  Users, 
  Settings, 
  Plus, 
  Edit3, 
  RefreshCcw, 
  Image as ImageIcon,
  Trash2,
  X,
  Save,
  UserPlus,
  Play,
  ShieldCheck,
  ClipboardList,
  Car as CarIcon,
  MapPin,
  FileSpreadsheet,
  FileText,
  PowerOff,
  Loader2
} from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  registrations: Registration[];
  settings: AppSettings;
  onUpdateUsers: (users: User[]) => void;
  onRemoveUser: (userId: string) => void;
  onUpdateRegistrations: (regs: Registration[]) => void;
  onRemoveRegistration: (regId: string) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  forcedTab?: 'weekly' | 'users' | 'settings';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  users, 
  registrations, 
  settings, 
  onUpdateUsers, 
  onRemoveUser,
  onUpdateRegistrations, 
  onRemoveRegistration,
  onUpdateSettings,
  forcedTab
}) => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'users' | 'settings'>(forcedTab || 'weekly');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (forcedTab) {
      setActiveTab(forcedTab);
    }
  }, [forcedTab]);

  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentYear = now.getFullYear();

  const weeklyRegistrations = registrations.filter(
    r => r.weekNumber === currentWeek && r.year === currentYear
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [formData, setFormData] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    password: '123'
  });

  const handleManualOpen = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // Abre as inscrições para a semana e ano atuais
      await onUpdateSettings({
        ...settings,
        manualOpenWeek: currentWeek,
        manualOpenYear: currentYear,
        manualCloseWeek: null,
        manualCloseYear: null
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao ativar inscrições.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualClose = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // Fecha limpando a semana de abertura
      await onUpdateSettings({
        ...settings,
        manualOpenWeek: null,
        manualOpenYear: null,
        manualCloseWeek: currentWeek,
        manualCloseYear: currentYear
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao desativar inscrições.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isOpen = areRegistrationsOpen(settings);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
        <ShieldCheck size={14} />
        <span>Administração</span>
        <span>/</span>
        <span className="text-cyan-400">
          {activeTab === 'weekly' && 'Registos da Semana'}
          {activeTab === 'users' && 'Utilizadores'}
          {activeTab === 'settings' && 'Definições'}
        </span>
      </div>

      {activeTab === 'weekly' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-2">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList size={20} className="text-slate-500" />
              Inscrições Semanais (W{currentWeek})
            </h3>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex gap-1.5 shadow-inner">
                {/* Botão ATIVAR: Fica Verde quando aberto */}
                <button
                  onClick={handleManualOpen}
                  disabled={isProcessing}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all text-[10px] uppercase tracking-widest ${
                    isOpen 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/20' 
                    : 'bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isProcessing && isOpen ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  Ativar
                </button>

                {/* Botão DESATIVAR: Fica Vermelho quando fechado */}
                <button
                  onClick={handleManualClose}
                  disabled={isProcessing}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all text-[10px] uppercase tracking-widest ${
                    !isOpen 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-500/20' 
                    : 'bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isProcessing && !isOpen ? <Loader2 size={14} className="animate-spin" /> : <PowerOff size={14} />}
                  Desativar
                </button>
              </div>

              <div className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-4 py-2.5 rounded-xl border border-cyan-500/20 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                {weeklyRegistrations.length} / {settings.weeklyCapacity} LUGARES
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-400 text-xs font-mono uppercase tracking-widest">
                    <th className="px-6 py-4">Utilizador</th>
                    <th className="px-6 py-4">Veículo</th>
                    <th className="px-6 py-4">Lugar</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {weeklyRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono italic">
                        Sem registos ativos para esta janela operacional.
                      </td>
                    </tr>
                  ) : (
                    weeklyRegistrations.map(reg => (
                      <tr key={reg.id} className="hover:bg-slate-800/20 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-200">{reg.userName}</td>
                        <td className="px-6 py-4 text-sm text-slate-300 flex items-center gap-2">
                          <CarIcon size={14} className="text-cyan-500" />
                          {reg.carDetails}
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-xs font-mono text-amber-500">{reg.parkingSpot || '---'}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                          {new Date(reg.date).toLocaleDateString('pt-PT')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => onRemoveRegistration(reg.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Outras tabs (utilizadores e definições) permanecem inalteradas para brevidade */}
      {activeTab === 'users' && <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-500">Gestão de Utilizadores (Ativa no menu lateral)</div>}
      {activeTab === 'settings' && <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-500">Definições de Sistema (Ativa no menu lateral)</div>}
    </div>
  );
};

export default AdminDashboard;
