
import React, { useState, useEffect } from 'react';
import { 
  getStoredUsers, 
  getStoredRegistrations, 
  getStoredSettings, 
  saveUsers, 
  saveRegistrations, 
  saveSettings,
  deleteRegistration,
  deleteUser
} from './storage';
import { User, Registration, AppSettings, AuthState } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import History from './pages/History';
import Sidebar from './components/Sidebar';
import { Shield, Cloud, Lock, Loader2, RefreshCw, Menu, X } from 'lucide-react';
import { getWeekNumber } from './utils';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [settings, setAppSettings] = useState<AppSettings | null>(null);
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString());

  const fetchData = async (manual = false) => {
    if (manual) setIsSyncing(true);
    try {
      const [u, r, s] = await Promise.all([
        getStoredUsers(),
        getStoredRegistrations(),
        getStoredSettings()
      ]);
      setUsers(u);
      setRegistrations(r);
      setAppSettings(s);
      const time = new Date().toLocaleTimeString();
      setLastSync(time);
      return { registrations: r, settings: s, time };
    } catch (err) {
      console.error("Failed to fetch data from Supabase:", err);
      return null;
    } finally {
      if (manual) setTimeout(() => setIsSyncing(false), 800);
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
    setIsMobileMenuOpen(false);
  };

  const updateUsers = async (newUsers: User[]) => {
    try {
      await saveUsers(newUsers);
      setUsers(newUsers);
    } catch (err) {
      console.error("Update users failed:", err);
    }
  };

  const removeUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error("Delete user failed:", err);
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

  const handleRegisterWithValidation = async (newReg: Registration): Promise<boolean> => {
    const latestData = await fetchData(true);
    if (!latestData || !settings) return false;

    const currentWeek = getWeekNumber(new Date());
    const currentYear = new Date().getFullYear();
    
    const weeklyTotal = latestData.registrations.filter(
      r => r.weekNumber === currentWeek && r.year === currentYear
    ).length;

    if (weeklyTotal >= settings.weeklyCapacity) {
      console.warn("Quota esgotada detetada na validação pré-registo.");
      return false; 
    }

    const updatedRegs = [...latestData.registrations, newReg];
    await updateRegistrations(updatedRegs);
    return true;
  };

  const handleUpdateRegistration = async (updatedReg: Registration) => {
    const newRegs = registrations.map(r => r.id === updatedReg.id ? updatedReg : r);
    await updateRegistrations(newRegs);
  };

  const removeRegistration = async (regId: string) => {
    try {
      await deleteRegistration(regId);
      setRegistrations(prev => prev.filter(r => r.id !== regId));
    } catch (err) {
      console.error("Remove registration failed:", err);
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

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    
    // Sincronização automática em todas as trocas de página
    fetchData(true);
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-400 font-mono p-4">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="animate-pulse text-center uppercase tracking-widest text-xs">A ligar aos servidores Cloud...</p>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Login onLogin={handleLogin} settings={settings} users={users} />;
  }

  const renderPage = () => {
    const isAdminPage = currentPage.startsWith('admin');
    
    if (isAdminPage) {
      if (auth.user?.role !== 'admin') return <div className="p-8 text-center text-red-500 font-bold">ACESSO NEGADO: PROTOCOLO DE SEGURANÇA ATIVADO</div>;
      
      let initialTab: 'general' | 'weekly' | 'users' | 'settings' = 'general';
      if (currentPage === 'admin-weekly') initialTab = 'weekly';
      if (currentPage === 'admin-users') initialTab = 'users';
      if (currentPage === 'admin-settings') initialTab = 'settings';

      return (
        <AdminDashboard 
          users={users} 
          registrations={registrations} 
          settings={settings}
          onUpdateUsers={updateUsers}
          onRemoveUser={removeUser}
          onUpdateRegistrations={updateRegistrations}
          onRemoveRegistration={removeRegistration}
          onUpdateSettings={updateSettings}
          forcedTab={initialTab}
          lastSyncTime={lastSync}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            user={auth.user!} 
            registrations={registrations} 
            settings={settings} 
            onRegister={handleRegisterWithValidation} 
            onUpdateRegistration={handleUpdateRegistration}
            onCancelRegistration={removeRegistration}
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
      default:
        return <Dashboard user={auth.user!} registrations={registrations} settings={settings} onRegister={handleRegisterWithValidation} onUpdateRegistration={handleUpdateRegistration} onCancelRegistration={removeRegistration} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 cyber-grid relative overflow-x-hidden">
      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none hidden md:block">
        <Cloud size={300} className="animate-pulse" />
      </div>
      <div className="absolute bottom-0 left-0 p-10 opacity-5 pointer-events-none hidden md:block">
        <Shield size={200} className="animate-float" />
      </div>

      <Sidebar 
        user={auth.user!} 
        activePage={currentPage} 
        onPageChange={handlePageChange} 
        onLogout={handleLogout} 
        className="hidden lg:flex"
      />

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 w-64 z-[70] transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          user={auth.user!} 
          activePage={currentPage} 
          onPageChange={handlePageChange} 
          onLogout={handleLogout} 
          isMobile
        />
      </div>
      
      <main className="flex-1 p-4 md:p-8 lg:ml-64 overflow-x-hidden z-10 w-full">
        <div className="max-w-6xl mx-auto">
          <header className="mb-6 md:mb-8 flex items-center justify-between border-b border-slate-800 pb-4 gap-2">
            <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg lg:hidden text-cyan-400 hover:bg-slate-800 transition-all shrink-0"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <h1 className="text-base md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 font-mono leading-tight truncate">
                  Vai Dar Banho ao Carro
                </h1>
                <p className="text-slate-500 font-mono text-[7px] md:text-xs uppercase tracking-widest mt-0.5 truncate">
                  Cloud Ops v2.5.0
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-end mr-1">
                <div className="flex items-center gap-1 text-emerald-400 text-[8px] md:text-[10px] font-mono uppercase tracking-tighter">
                  <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400 ${isSyncing ? 'animate-ping' : ''}`}></div>
                  <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizado'}</span>
                  <span className="sm:hidden">{isSyncing ? '...' : 'ON'}</span>
                </div>
                <div className="text-[7px] md:text-[9px] text-slate-600 font-mono hidden sm:block truncate">Última: {lastSync}</div>
              </div>

              <button
                onClick={() => fetchData(true)}
                disabled={isSyncing}
                className={`p-2 md:p-2.5 rounded-xl border transition-all flex items-center gap-2 group ${
                  isSyncing 
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 cursor-wait' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 shadow-lg shadow-cyan-500/5'
                }`}
                title="Sincronizar Cloud"
              >
                <RefreshCw size={18} className={`${isSyncing ? 'animate-spin' : ''}`} />
                <span className="text-[10px] font-bold font-mono hidden md:inline">SYNC CLOUD</span>
              </button>
            </div>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {renderPage()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
