
import React from 'react';
import { 
  LayoutDashboard, 
  User as UserIcon, 
  History as HistoryIcon, 
  Settings as SettingsIcon, 
  LogOut,
  Car,
  ShieldCheck,
  ClipboardList,
  Users,
  X
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  activePage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  className?: string;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activePage, onPageChange, onLogout, className = '', isMobile = false }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'O Meu Perfil', icon: UserIcon },
    { id: 'history', label: 'Histórico', icon: HistoryIcon },
  ];

  const adminSubItems = [
    { id: 'admin-weekly', label: 'Registos da Semana', icon: ClipboardList },
    { id: 'admin-settings', label: 'Definições', icon: SettingsIcon },
    { id: 'admin-users', label: 'Utilizadores', icon: Users },
  ];

  return (
    <aside className={`h-full bg-slate-900 border-r border-slate-800 flex flex-col z-50 ${isMobile ? 'w-full' : 'fixed left-0 top-0 w-64'} ${className}`}>
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
            <Car size={24} />
          </div>
          <div>
            <span className="font-bold text-lg block leading-none">VDBAC</span>
            <span className="text-[10px] text-slate-500 font-mono">CORP WASH OPS</span>
          </div>
        </div>
        {isMobile && (
          <button onClick={() => onPageChange(activePage)} className="p-2 text-slate-500 hover:text-white lg:hidden">
             <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest px-4 mb-2">Principal</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon size={20} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        {user.role === 'admin' && (
          <div className="pt-4 space-y-2">
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest px-4 mb-2">Administração</div>
            <button
              onClick={() => onPageChange('admin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activePage === 'admin' 
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <ShieldCheck size={20} />
              <span className="truncate">Geral</span>
            </button>
            {adminSubItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium pl-8 ${
                    isActive 
                      ? 'text-cyan-400 bg-cyan-500/5 border-r-2 border-cyan-500' 
                      : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0 font-bold text-cyan-400">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-slate-200">{user.firstName} {user.lastName}</p>
            <p className="text-[10px] text-slate-500 truncate font-mono">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium"
        >
          <LogOut size={20} />
          <span className="truncate">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
