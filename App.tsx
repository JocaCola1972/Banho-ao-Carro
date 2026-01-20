
import React, { useState, useEffect } from 'react';
import { 
  getStoredUsers, 
  getStoredRegistrations, 
  getStoredSettings, 
  saveUsers, 
  saveRegistrations, 
  saveSettings 
} from './storage';
import { User, Registration, AppSettings, AuthState } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import History from './pages/History';
import Sidebar from './components/Sidebar';
import { Shield, Cloud, Lock, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [settings, setAppSettings] = useState<AppSettings | null>(null);
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [u, r, s] = await Promise.all([
        getStoredUsers(),
        getStoredRegistrations(),
        getStoredSettings()
      ]);
      setUsers(u);
      setRegistrations(r);
      setAppSettings(s);
    } catch (err) {
      console.error("Failed to fetch data from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogin = (user: User) => {
    setAuth({ user, isAuthenticated: true });
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    setCurrentPage('login');
  };

  const updateUsers = async (newUsers: User[]) => {
    try {
      await saveUsers(newUsers);
      setUsers(newUsers);
    } catch (err) {
      console.error("Update users failed:", err);
    }
  };

  const updateRegistrations = async (newRegs: Registration[]) => {
    try {
      await saveRegistrations(newRegs);
      setRegistrations(newRegs);
    } catch (err) {
      console.error("Update registrations failed:", err);
    }
  };

  const updateSettings = async (newSettings: AppSettings) => {
    try {
      await saveSettings(newSettings);
      setAppSettings(newSettings);
    } catch (err) {
      console.error("Update settings failed:", err);
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-400 font-mono">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="animate-pulse">CARREGANDO SISTEMA SECURE CLOUD...</p>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Login onLogin={handleLogin} settings={settings} users={users} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            user={auth.user!} 
            registrations={registrations} 
            settings={settings} 
            onRegister={(reg) => updateRegistrations([...registrations, reg])} 
          />
        );
      case 'profile':
        return (
          <Profile 
            user={auth.user!} 
            onUpdateUser={async (updatedUser) => {
              const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
              await updateUsers(newUsers);
              setAuth({ ...auth, user: updatedUser });
            }} 
          />
        );
      case 'history':
        return (
          <History 
            registrations={registrations} 
            user={auth.user!} 
          />
        );
      case 'admin':
        if (auth.user?.role !== 'admin') return <div className="p-8 text-center text-red-500 font-bold">ACESSO NEGADO: PROTOCOLO DE SEGURANÇA ATIVADO</div>;
        return (
          <AdminDashboard 
            users={users} 
            registrations={registrations} 
            settings={settings}
            onUpdateUsers={updateUsers}
            onUpdateRegistrations={updateRegistrations}
            onUpdateSettings={updateSettings}
          />
        );
      default:
        return <Dashboard user={auth.user!} registrations={registrations} settings={settings} onRegister={(reg) => updateRegistrations([...registrations, reg])} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 cyber-grid relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
        <Cloud size={300} className="animate-pulse" />
      </div>
      <div className="absolute bottom-0 left-0 p-10 opacity-10 pointer-events-none">
        <Shield size={200} className="animate-float" />
      </div>

      <Sidebar 
        user={auth.user!} 
        activePage={currentPage} 
        onPageChange={setCurrentPage} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 p-4 md:p-8 lg:ml-64 overflow-auto z-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 font-mono">
                Vai Dar Banho ao Carro
              </h1>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-1">
                Protocolo de Higienização Automóvel v2.5.0 - Cloud Connected
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                Supabase Sync
              </div>
              <div className="flex items-center gap-1 text-cyan-400">
                <Lock size={12} />
                Encrypted Session
              </div>
            </div>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderPage()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
