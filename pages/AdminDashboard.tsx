
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
  Download,
  LayoutDashboard,
  BarChart3,
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap
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
  forcedTab?: 'general' | 'weekly' | 'users' | 'settings';
  lastSyncTime?: string;
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
  forcedTab,
  lastSyncTime
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'weekly' | 'users' | 'settings'>(forcedTab || 'general');
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
  );

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
    console.debug(`[Admin] A tentar abrir inscrições para W${currentWeek} Y${currentYear}`);
    
    try {
      await onUpdateSettings({
        ...settings,
        manualOpenWeek: currentWeek,
        manualOpenYear: currentYear,
        manualCloseWeek: null,
        manualCloseYear: null
      });
      console.debug(`[Admin] Sucesso ao abrir inscrições.`);
    } catch (err: any) {
      console.error(`[Admin] Erro ao abrir inscrições:`, err);
      alert(`Erro ao ativar inscrições: ${err.message || 'Verifique a consola.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualClose = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    console.debug(`[Admin] A tentar fechar inscrições para W${currentWeek} Y${currentYear}`);

    try {
      await onUpdateSettings({
        ...settings,
        manualOpenWeek: null,
        manualOpenYear: null,
        manualCloseWeek: currentWeek,
        manualCloseYear: currentYear
      });
      console.debug(`[Admin] Sucesso ao fechar inscrições.`);
    } catch (err: any) {
      console.error(`[Admin] Erro ao fechar inscrições:`, err);
      alert(`Erro ao encerrar inscrições: ${err.message || 'Verifique a consola.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const exportToExcel = (data: Registration[], fileName: string) => {
    const preparedData = data.map(r => ({
      'Utilizador': r.userName,
      'Veículo': r.carDetails,
      'Data': new Date(r.date).toLocaleDateString('pt-PT'),
      'Semana': r.weekNumber,
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
  const isOverCapacity = weeklyRegistrations.length > settings.weeklyCapacity;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
        <ShieldCheck size={14} />
        <span>Administração</span>
        <span>/</span>
        <span className="text-cyan-400">
          {activeTab === 'general' && 'Visão Geral'}
          {activeTab === 'weekly' && 'Registos da Semana'}
          {activeTab === 'users' && 'Utilizadores'}
          {activeTab === 'settings' && 'Definições'}
        </span>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                  <Users size={24} />
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Total Cloud</span>
              </div>
              <div className="text-3xl font-black text-white">{users.length}</div>
              <div className="text-xs text-slate-500 font-mono mt-1">Utilizadores Ativos</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
                  <Activity size={24} />
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Capacidade W{currentWeek}</span>
              </div>
              <div className="text-3xl font-black text-white">{weeklyRegistrations.length} / {settings.weeklyCapacity}</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${isOverCapacity ? 'bg-red-500' : 'bg-amber-500'}`} 
                  style={{ width: `${Math.min(100, (weeklyRegistrations.length / settings.weeklyCapacity) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${isOpen ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {isOpen ? <Play size={24} /> : <PowerOff size={24} />}
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Estado Porta</span>
              </div>
              <div className={`text-xl font-bold uppercase tracking-tighter ${isOpen ? 'text-emerald-400' : 'text-red-400'}`}>
                {isOpen ? 'Inscrições Abertas' : 'Sistema Trancado'}
              </div>
              <div className="text-[10px] text-slate-600 font-mono mt-1">
                {isOpen ? 'AGUARDANDO_SUBMISSÕES' : 'AGUARDANDO_ADMIN_START'}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex items-center justify-center min-h-[200px] group">
             <div className="text-center space-y-4">
                <BarChart3 size={48} className="mx-auto text-slate-700 group-hover:text-cyan-500 transition-colors" />
                <p className="text-slate-500 font-mono text-sm">Dashboard de Analytics em tempo real ativo.</p>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'weekly' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-2">
          {/* Cartão de Início de Ciclo Principal */}
          {!isOpen && (
            <div className="bg-emerald-600/10 border border-emerald-500/20 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl animate-in zoom-in-95 mb-4">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-emerald-500/20 rounded-2xl text-emerald-400 shadow-lg shadow-emerald-500/20">
                  <Zap size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Iniciar Ciclo Semanal</h3>
                  <p className="text-emerald-100/60 text-sm font-mono uppercase tracking-widest mt-1">Pronto para abrir as inscrições para a semana {currentWeek}?</p>
                </div>
              </div>
              <button 
                onClick={handleManualOpen}
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/30 transition-all flex items-center gap-3 uppercase tracking-widest text-sm hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} />}
                Iniciar Inscrições
              </button>
            </div>
          )}

          {/* Status Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${isOpen ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {isOpen ? <CheckCircle2 size={12}/> : <ShieldAlert size={12}/>}
                Portas: {isOpen ? 'Abertas' : 'Trancadas'}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                LATEST_SYNC: <span className="text-cyan-400">{lastSyncTime || '---'}</span>
              </div>
            </div>
            
            {isOverCapacity && (
              <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold animate-pulse">
                <AlertTriangle size={14} />
                ALERTA: CAPACIDADE EXCEDIDA
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList size={20} className="text-slate-500" />
              Janela Operacional W{currentWeek}
            </h3>
            
            <div className="flex gap-2">
              {isOpen && (
                <button 
                  onClick={handleManualClose}
                  disabled={isProcessing}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all"
                >
                  {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <PowerOff size={14} />}
                  Fechar Janela
                </button>
              )}
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
                    <th className="px-6 py-4">Data/Hora</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {weeklyRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono italic">
                        Nenhum registo para a semana {currentWeek}.
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
                        <td className="px-6 py-4 font-mono text-[10px] text-slate-400">
                          {new Date(reg.date).toLocaleDateString('pt-PT')} {new Date(reg.date).toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => onRemoveRegistration(reg.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
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
                <h4 className="font-bold text-slate-200">Exportar Inscrições</h4>
                <p className="text-xs text-slate-500 font-mono uppercase tracking-tight">Relatório_Semanal_W{currentWeek}</p>
              </div>
            </div>
            <button onClick={() => exportToExcel(weeklyRegistrations, `lavagens-w${currentWeek}`)} className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/20 font-bold py-2.5 px-5 rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/5">
              <Download size={16} /> Descarregar Excel
            </button>
          </div>
        </div>
      )}

      {/* VIEW: GESTÃO DE UTILIZADORES */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users size={20} className="text-slate-500" />
              Diretório de Utilizadores
            </h3>
            <button onClick={() => openModal()} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all">
              <UserPlus size={16} /> Novo Agente
            </button>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 text-xs font-mono uppercase tracking-widest">
                  <th className="px-6 py-4">Utilizador</th>
                  <th className="px-6 py-4">E-mail</th>
                  <th className="px-6 py-4">Nível de Acesso</th>
                  <th className="px-6 py-4 text-right">Ações de Segurança</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200">{u.firstName} {u.lastName}</td>
                    <td className="px-6 py-4 text-sm font-mono text-cyan-500/80">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded font-mono ${u.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-1">
                      <button title="Reset Password" onClick={() => handleResetPassword(u.id)} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"><RefreshCcw size={16} /></button>
                      <button title="Editar" onClick={() => openModal(u)} className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"><Edit3 size={16} /></button>
                      {u.role !== 'admin' && <button title="Remover" onClick={() => onRemoveUser(u.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: DEFINIÇÕES DO SISTEMA */}
      {activeTab === 'settings' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-2">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl">
              <h3 className="text-xl font-bold flex items-center gap-2"><Settings size={20} className="text-slate-500" /> Parâmetros Operacionais</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-mono uppercase tracking-widest">Quota de Vagas Semanais</label>
                  <input type="number" value={settings.weeklyCapacity} onChange={(e) => onUpdateSettings({ ...settings, weeklyCapacity: parseInt(e.target.value) || 0 })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 outline-none font-mono focus:border-cyan-500 transition-colors" />
                  <p className="text-[10px] text-slate-600 font-mono">Define o limite máximo de inscrições por janela temporal.</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl">
              <h3 className="text-xl font-bold flex items-center gap-2"><ImageIcon size={20} className="text-slate-500" /> Interface Visual</h3>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-mono uppercase tracking-widest">URL da Imagem de Background</label>
                <input type="text" value={settings.loginImageUrl || ''} onChange={(e) => onUpdateSettings({ ...settings, loginImageUrl: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 outline-none text-xs font-mono focus:border-cyan-500 transition-colors" placeholder="https://..." />
                <p className="text-[10px] text-slate-600 font-mono">Esta imagem será utilizada no ecrã de autenticação.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE UTILIZADOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h4 className="text-xl font-bold italic uppercase tracking-tight">Protocolo de Identidade</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveUser} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-mono">Nome</label>
                  <input type="text" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-cyan-500 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-mono">Apelido</label>
                  <input type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-cyan-500 transition-all" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-mono">ID de Acesso (E-mail)</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-cyan-500 font-mono transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-mono">Privilégios</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-cyan-500 transition-all">
                  <option value="user">Utilizador Comum</option>
                  <option value="admin">Administrador de Sistema</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2">
                <Save size={18} /> Validar e Guardar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
