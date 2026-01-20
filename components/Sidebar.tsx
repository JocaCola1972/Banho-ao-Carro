
import React from 'react';
import { 
  LayoutDashboard, 
  User as UserIcon, 
  History as HistoryIcon, 
  Settings as SettingsIcon, 
  LogOut,
  Car,
  ShieldCheck
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  activePage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activePage, onPageChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'O Meu Perfil', icon: UserIcon },
    { id: 'history', label: 'Histórico', icon: HistoryIcon },
  ];

  if (user.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Administração', icon: ShieldCheck });
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 hidden lg:flex flex-col z-50">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
          <Car size={24} />
        </div>
        <div>
          <span className="font-bold text-lg block leading-none">VDBAC</span>
          <span className="text-[10px] text-slate-500 font-mono">CORP WASH OPS</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
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
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-slate-500 truncate font-mono">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium"
        >
          <LogOut size={20} />
          Terminar Sessão
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
