
import React, { useState } from 'react';
import { User, AppSettings } from '../types';
import { Shield, Key, Mail, Terminal, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface LoginProps {
  onLogin: (user: User) => void;
  settings: AppSettings;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, settings }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data && (data.password || '123') === password) {
        onLogin(data);
      } else {
        setError('Credenciais inválidas. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao conectar ao servidor. Verifique a sua ligação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side: Visual/Branding */}
      <div 
        className="hidden lg:block relative bg-cover bg-center"
        style={{ backgroundImage: `url(${settings.loginImageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-8 p-6 bg-cyan-500/20 rounded-full border border-cyan-500/30 animate-float">
            <Shield size={64} className="text-cyan-400" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">
            Vai Dar Banho ao Carro
          </h1>
          <p className="text-cyan-100 text-lg max-w-md">
            Plataforma Corporativa de Gestão de Lavagens. Mantenha a sua frota na Cloud e limpa.
          </p>
          
          <div className="mt-12 space-y-4 w-full max-w-sm text-left font-mono text-xs text-cyan-500/60 bg-black/40 p-6 rounded-lg border border-cyan-500/20">
            <div className="flex items-center gap-2">
              <Terminal size={14} />
              <span>Initializing secure protocol... [OK]</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal size={14} />
              <span>Verifying wash slots... [OK]</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal size={14} />
              <span>Awaiting user authentication...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex flex-col items-center justify-center p-8 bg-slate-950 cyber-grid">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400">
                <Shield size={40} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Login Seguro</h2>
            <p className="text-slate-400">Insira as suas credenciais para aceder ao portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block font-mono">Utilizador (E-mail)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@empresa.pt"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block font-mono">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              {isLoading ? 'A VERIFICAR...' : 'AUTENTICAR SISTEMA'}
            </button>

            <div className="pt-4 text-center">
              <p className="text-xs text-slate-500 font-mono">
                Dica: A password por defeito é "123"
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
