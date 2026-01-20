
import React, { useState, useEffect } from 'react';
import { User, Registration, AppSettings } from '../types';
import { getWeekNumber } from '../utils';
import * as XLSX from 'xlsx';
import { 
  Users, 
  Settings, 
  Download, 
  Plus, 
  Edit3, 
  RefreshCcw, 
  Image as ImageIcon,
  Trash2,
  X,
  Save,
  UserPlus,
  Play,
  ShieldAlert,
  ShieldCheck,
  ClipboardList,
  Car as CarIcon,
  MapPin,
  FileSpreadsheet,
  FileText
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
  forcedTab?: 'weekly' | 'users' | 'settings' | 'export';
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
  const [activeTab, setActiveTab] = useState<'weekly' | 'users' | 'settings' | 'export'>(forcedTab || 'weekly');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  useEffect(() => {
    if (forcedTab) {
      setActiveTab(forcedTab);
    }
  }, [forcedTab]);

  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentYear = now.getFullYear();

  // Filter registrations for the current week
  const weeklyRegistrations = registrations.filter(
    r => r.weekNumber === currentWeek && r.year === currentYear
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Form State
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    password: '123'
  });

  const handleManualOpen = () => {
    onUpdateSettings({
      ...settings,
      manualOpenWeek: currentWeek,
      manualOpenYear: currentYear
    });
  };

  const prepareExportData = (data: Registration[]) => {
    return data.map(r => ({
      'Nome do Utilizador': r.userName,
      'Veículo': r.carDetails,
      'Data de Inscrição': new Date(r.date).toLocaleDateString('pt-PT'),
      'Hora': new Date(r.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      'Semana': r.weekNumber,
      'Mês': r.month,
      'Ano': r.year,
      'Lugar de Estacionamento': r.parkingSpot || 'N/A'
    }));
  };

  const exportToExcel = (data: Registration[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(prepareExportData(data));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registos");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const exportToCSV = (data: Registration[], fileName: string) => {
    let csv = "\uFEFFNome,Carro,Data,Lugar\n";
    data.forEach(r => {
      csv += `"${r.userName}","${r.carDetails}","${new Date(r.date).toLocaleDateString()}","${r.parkingSpot || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleResetPassword = (userId: string) => {
    if (confirm('Tem a certeza que deseja repor a password para "123"?')) {
      const updated = users.map(u => u.id === userId ? { ...u, password: '123' } : u);
      onUpdateUsers(updated);
      alert('Password resetada para 123');
    }
  };

  const openModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ ...user });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'user',
        password: '123'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const updatedUsers = users.map(u => u.id === editingUser.id ? { ...u, ...formData } as User : u);
      onUpdateUsers(updatedUsers);
    } else {
      const newUser: User = {
        ...formData,
        id: crypto.randomUUID(),
        cars: []
      } as User;
      onUpdateUsers([...users, newUser]);
    }
    closeModal();
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('TEM A CERTEZA? Esta ação irá eliminar o utilizador e todos os seus dados permanentemente.')) {
      onRemoveUser(userId);
    }
  };

  const handleCancelRegistration = (regId: string) => {
    if (confirm('Deseja cancelar esta inscrição de lavagem?')) {
      onRemoveRegistration(regId);
    }
  };

  return (
    <div className="space-y-8">
      {/* Visual Header (Breadcrumb style) */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
        <ShieldCheck size={14} />
        <span>Administração</span>
        <span>/</span>
        <span className="text-cyan-400">
          {activeTab === 'weekly' && 'Registos da Semana'}
          {activeTab === 'users' && 'Utilizadores'}
          {activeTab === 'settings' && 'Definições'}
          {activeTab === 'export' && 'Relatórios'}
        </span>
      </div>

      {activeTab === 'weekly' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList size={20} className="text-slate-500" />
              Inscrições da Semana Corrente (W{currentWeek})
            </h3>
            <div className="text-xs font-mono text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              {weeklyRegistrations.length} / {settings.weeklyCapacity} LUGARES OCUPADOS
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-400 text-xs font-mono uppercase tracking-widest">
                    <th className="px-6 py-4">Utilizador</th>
                    <th className="px-6 py-4">Veículo</th>
                    <th className="px-6 py-4">Lugar / Notas</th>
                    <th className="px-6 py-4">Data Inscrição</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {weeklyRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono">
                        Ainda não existem registos para esta semana operacional.
                      </td>
                    </tr>
                  ) : (
                    weeklyRegistrations.map(reg => (
                      <tr key={reg.id} className="hover:bg-slate-800/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-200">{reg.userName}</div>
                          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">ID: {reg.userId.split('-')[0]}...</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <CarIcon size={14} className="text-cyan-500" />
                            <span className="text-slate-300">{reg.carDetails}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs">
                            <MapPin size={12} className="text-amber-500" />
                            <span className="font-mono text-amber-500/80">{reg.parkingSpot || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                          {new Date(reg.date).toLocaleDateString('pt-PT')} {new Date(reg.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleCancelRegistration(reg.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Cancelar Inscrição"
                          >
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

      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users size={20} className="text-slate-500" />
              Gestão de Utilizadores
            </h3>
            <button
              onClick={() => openModal()}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <UserPlus size={16} />
              Adicionar Utilizador
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-400 text-xs font-mono uppercase tracking-widest">
                    <th className="px-6 py-4">Utilizador</th>
                    <th className="px-6 py-4">ID de Acesso (Email)</th>
                    <th className="px-6 py-4">Contacto</th>
                    <th className="px-6 py-4">Nível</th>
                    <th className="px-6 py-4 text-right">Ações de Segurança</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-200">{u.firstName} {u.lastName}</div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase">{u.cars.length} Carros Registados</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-cyan-500/80">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-400 font-mono">{u.phone || '---'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md font-mono ${u.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-400'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button 
                          onClick={() => handleResetPassword(u.id)}
                          className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                          title="Reset Password (123)"
                        >
                          <RefreshCcw size={16} />
                        </button>
                        <button 
                          onClick={() => openModal(u)}
                          className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                          title="Editar Perfil"
                        >
                          <Edit3 size={16} />
                        </button>
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar Utilizador"
                          >
                            <Trash2 size={16} />
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
      )}

      {/* User Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h4 className="text-xl font-bold flex items-center gap-2">
                {editingUser ? <Edit3 className="text-cyan-400" /> : <UserPlus className="text-cyan-400" />}
                {editingUser ? 'Editar Protocolo de Utilizador' : 'Novo Protocolo de Utilizador'}
              </h4>
              <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-500 uppercase">Primeiro Nome</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-500 uppercase">Último Nome</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-500 uppercase">E-mail (Login ID)</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-500 uppercase">Telemóvel</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                  placeholder="9XXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-500 uppercase">Nível de Acesso</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                >
                  <option value="user">Utilizador Comum</option>
                  <option value="admin">Administrador de Sistema</option>
                </select>
              </div>

              {!editingUser && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-500 font-mono">
                  INFO: A password por defeito para novos utilizadores é "123".
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-slate-700 text-slate-400 rounded-xl hover:bg-slate-800 font-bold transition-all"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  GUARDAR DADOS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-left-2">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Settings size={20} className="text-slate-500" />
              Parâmetros do Sistema
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400 font-mono">Capacidade Semanal (Vagas)</label>
                <input
                  type="number"
                  value={settings.weeklyCapacity}
                  onChange={(e) => onUpdateSettings({ ...settings, weeklyCapacity: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                   <ShieldAlert size={16} className="text-amber-500" />
                   Controlo Manual de Janela
                </h4>
                <p className="text-xs text-slate-500 mb-4">Override: Forçar abertura das inscrições antes do horário automático (Quinta às 08:00).</p>
                <button
                  onClick={handleManualOpen}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 py-3 rounded-xl border border-cyan-500/30 flex items-center justify-center gap-2 font-bold transition-all group"
                >
                  <Play size={18} className="group-hover:translate-x-1 transition-transform" />
                  ATIVAR ABERTURA ANTECIPADA
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ImageIcon size={20} className="text-slate-500" />
              Personalização de Interface
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400 font-mono">Asset de Autenticação (URL Imagem)</label>
                <input
                  type="text"
                  value={settings.loginImageUrl || ''}
                  onChange={(e) => onUpdateSettings({ ...settings, loginImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-cyan-500 outline-none text-xs font-mono"
                />
              </div>
              {settings.loginImageUrl && (
                <div className="rounded-xl overflow-hidden h-32 border border-slate-800 relative group">
                  <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-mono text-cyan-400 bg-slate-900/80 px-2 py-1 rounded">PREVIEW_MODE</span>
                  </div>
                  <img src={settings.loginImageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-2">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Relatório Semanal */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-cyan-500"></div>
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mx-auto mb-6 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <ClipboardList size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 font-mono">Relatório Semanal</h3>
              <p className="text-slate-400 max-w-xs mx-auto mb-8 text-sm">
                Registos da semana corrente (W{currentWeek}). Ideal para a equipa operacional.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => exportToExcel(weeklyRegistrations, `lavagens-semana-${currentWeek}`)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest font-mono text-xs"
                >
                  <FileSpreadsheet size={18} />
                  Exportar Excel (.XLSX)
                </button>
                <button
                  onClick={() => exportToCSV(weeklyRegistrations, `lavagens-semana-${currentWeek}`)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest font-mono text-xs"
                >
                  <FileText size={18} />
                  Exportar CSV (.CSV)
                </button>
              </div>
            </div>

            {/* Histórico Completo */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-emerald-500"></div>
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <RefreshCcw size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 font-mono">Histórico Global</h3>
              <p className="text-slate-400 max-w-xs mx-auto mb-8 text-sm">
                Todos os registos desde o início do serviço. Ideal para auditoria e métricas.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => exportToExcel(registrations, `historico-lavagens-completo`)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest font-mono text-xs"
                >
                  <FileSpreadsheet size={18} />
                  Exportar Histórico (.XLSX)
                </button>
                <button
                  onClick={() => exportToCSV(registrations, `historico-lavagens-completo`)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest font-mono text-xs"
                >
                  <FileText size={18} />
                  Exportar Histórico (.CSV)
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl text-center">
            <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
              Terminal de Extração de Dados Ativo • Protocolo de Auditoria v2.1
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
