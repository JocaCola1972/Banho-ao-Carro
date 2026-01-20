
import React, { useState } from 'react';
import { User, Registration, AppSettings } from '../types';
import { getWeekNumber } from '../utils';
import { 
  Users, 
  Settings, 
  Download, 
  Plus, 
  Edit3, 
  RefreshCcw, 
  Image as ImageIcon,
  CheckCircle,
  Play
} from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  registrations: Registration[];
  settings: AppSettings;
  onUpdateUsers: (users: User[]) => void;
  onUpdateRegistrations: (regs: Registration[]) => void;
  onUpdateSettings: (settings: AppSettings) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  users, 
  registrations, 
  settings, 
  onUpdateUsers, 
  onUpdateRegistrations, 
  onUpdateSettings 
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'export'>('users');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleManualOpen = () => {
    const now = new Date();
    onUpdateSettings({
      ...settings,
      manualOpenWeek: getWeekNumber(now),
      manualOpenYear: now.getFullYear()
    });
  };

  const exportCurrentWeek = () => {
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const weeklyRegs = registrations.filter(r => r.weekNumber === currentWeek && r.year === now.getFullYear());
    
    let csv = "Nome,Carro,Data,Lugar\n";
    weeklyRegs.forEach(r => {
      csv += `"${r.userName}","${r.carDetails}","${new Date(r.date).toLocaleDateString()}","${r.parkingSpot || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `lavagens-semana-${currentWeek}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleResetPassword = (userId: string) => {
    const updated = users.map(u => u.id === userId ? { ...u, password: '123' } : u);
    onUpdateUsers(updated);
    alert('Password resetada para 123');
  };

  const handleCreateUser = () => {
    const newUser: User = {
      id: crypto.randomUUID(),
      firstName: 'Novo',
      lastName: 'Utilizador',
      email: `user${Date.now()}@empresa.pt`,
      phone: '',
      role: 'user',
      password: '123',
      cars: []
    };
    onUpdateUsers([...users, newUser]);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-2">
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-2 px-4 font-bold transition-all ${activeTab === 'users' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
        >
          Utilizadores
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-2 px-4 font-bold transition-all ${activeTab === 'settings' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
        >
          Definições
        </button>
        <button 
          onClick={() => setActiveTab('export')}
          className={`pb-2 px-4 font-bold transition-all ${activeTab === 'export' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
        >
          Relatórios
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users size={20} className="text-slate-500" />
              Gestão de Utilizadores
            </h3>
            <button
              onClick={handleCreateUser}
              className="bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              <Plus size={16} />
              Adicionar Utilizador
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 text-xs font-mono">
                  <th className="px-6 py-3">NOME</th>
                  <th className="px-6 py-3">EMAIL</th>
                  <th className="px-6 py-3">CARROS</th>
                  <th className="px-6 py-3 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/20">
                    <td className="px-6 py-4 text-sm font-medium">{u.firstName} {u.lastName}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{u.cars.length}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleResetPassword(u.id)}
                        className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg"
                        title="Reset Password"
                      >
                        <RefreshCcw size={16} />
                      </button>
                      <button 
                        className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
                        title="Editar"
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h4 className="font-bold mb-2">Controlo Manual</h4>
                <p className="text-xs text-slate-500 mb-4">Forçar abertura das inscrições antes de Quinta às 08:00.</p>
                <button
                  onClick={handleManualOpen}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 py-3 rounded-xl border border-cyan-500/30 flex items-center justify-center gap-2 font-bold"
                >
                  <Play size={18} />
                  ABRIR INSCRIÇÕES AGORA
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ImageIcon size={20} className="text-slate-500" />
              Personalização
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400 font-mono">URL Imagem de Login</label>
                <input
                  type="text"
                  value={settings.loginImageUrl || ''}
                  onChange={(e) => onUpdateSettings({ ...settings, loginImageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              {settings.loginImageUrl && (
                <div className="rounded-xl overflow-hidden h-32 border border-slate-800">
                  <img src={settings.loginImageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center">
          <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mx-auto mb-6">
            <Download size={40} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Extração de Dados</h3>
          <p className="text-slate-400 max-w-sm mx-auto mb-8">
            Exportar a lista completa de inscritos para a semana atual em formato CSV.
          </p>
          <button
            onClick={exportCurrentWeek}
            className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-3 mx-auto"
          >
            <Download size={20} />
            EXPORTAR LISTA SEMANAL
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
