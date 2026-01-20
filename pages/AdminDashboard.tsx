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
  Loader2,
  Download
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

  const exportToExcel = (data: Registration[], fileName: string) => {
    const preparedData = data.map(r => ({
      'Nome do Utilizador': r.userName,
      'Veículo': r.carDetails,
      'Data de Inscrição': new Date(r.date).toLocaleDateString('pt-PT'),
      'Hora': new Date(r.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      'Semana': r.weekNumber,
      'Mês': r.month,
      'Ano': r.year,
      'Lugar': r.parkingSpot || 'N/A'
    }));
    const ws = XLSX.utils.json_to_sheet(preparedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registos");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const handleResetPassword = (userId: string) => {
    if (confirm('Repor password para "123"?')) {
      const updated = users.map(u => u.id === userId ? { ...u, password: '123' } : u);
      onUpdateUsers(updated);
    }
  };

  const openModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ ...user });
    } else {
      setEditingUser(null);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', role: 'user', password: '123' });
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } as User : u));
    } else {
      onUpdateUsers([...users, { ...formData, id: crypto.randomUUID(), cars: [] } as User]);
    }
    setIsModalOpen(false);
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
                        <td className="px-6 py-4 text-xs font-mono text-amber-500">{reg.parkingSpot || '---'}</td>
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

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-200">Exportar Registos</h4>
                <p className="text-xs text-slate-500 font-mono uppercase tracking-tight">W{currentWeek}_Report</p>
              </div>
            </div>
            <button onClick={() => exportToExcel(weeklyRegistrations, `lavagens-w${currentWeek}`)} className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/20 font-bold py-2.5 px-5 rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Download size={16} /> Exportar Excel
            </button>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users size={20} className="text-slate-500" />
              Gestão de Utilizadores
            </h3>
            <button onClick={() => openModal()} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20">
              <UserPlus size={16} /> Novo Utilizador
            </button>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 text-xs font-mono uppercase tracking-widest">
                  <th className="px-6 py-4">Utilizador</th>
                  <th className="px-6 py-4">E-mail</th>
                  <th className="px-6 py-4">Nível</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/20">
                    <td className="px-6 py-4 font-bold text-slate-200">{u.firstName} {u.lastName}</td>
                    <td className="px-6 py-4 text-sm font-mono text-cyan-500/80">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded font-mono ${u.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-1">
                      <button onClick={() => handleResetPassword(u.id)} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg"><RefreshCcw size={16} /></button>
                      <button onClick={() => openModal(u)} className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg"><Edit3 size={16} /></button>
                      {u.role !== 'admin' && <button onClick={() => onRemoveUser(u.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-2">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><Settings size={20} /> Parâmetros</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-mono uppercase">Vagas Semanais</label>
                  <input type="number" value={settings.weeklyCapacity} onChange={(e) => onUpdateSettings({ ...settings, weeklyCapacity: parseInt(e.target.value) || 0 })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 outline-none font-mono" />
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><ImageIcon size={20} /> Aspeto</h3>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-mono uppercase">URL Imagem Login</label>
                <input type="text" value={settings.loginImageUrl || ''} onChange={(e) => onUpdateSettings({ ...settings, loginImageUrl: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 outline-none text-xs font-mono" />
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h4 className="text-xl font-bold italic uppercase tracking-tight">Ficha de Utilizador</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveUser} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-mono">Nome</label>
                  <input type="text" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-sm outline-none focus:border-cyan-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-mono">Apelido</label>
                  <input type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-sm outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-mono">E-mail</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-sm outline-none focus:border-cyan-500 font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-mono">Função</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-sm outline-none focus:border-cyan-500">
                  <option value="user">Utilizador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2">
                <Save size={18} /> Guardar Dados
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;