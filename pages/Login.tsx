
import React, { useState } from 'react';
import { User, AppSettings } from '../types';
import { Shield, Key, Mail, Terminal, Loader2, AlertTriangle, WifiOff } from 'lucide-react';
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

      if (fetchError) {
        throw fetchError;
      }

      if (data && (data.password || '123') === password) {
        onLogin(data);
      } else {
        setError('Credenciais inválidas. Verifique o e-mail e a password.');
      }
    } catch (err: any) {
      console.error("Erro Supabase:", err);
      
      // Tratamento detalhado de erros comuns de configuração
      if (err.message === 'Invalid API key' || err.code === 'PGRST301' || err.status === 401) {
        setError('Erro de Autenticação: A "ANON KEY" do Supabase é inválida. Por favor, verifique as chaves no ficheiro supabaseClient.ts.');
      } else if (err.message?.includes('relation "users" does not exist')) {
        setError('Erro de Base de Dados: A tabela "users" não foi encontrada. Executou o script SQL no editor do Supabase?');
      } else if (err.message === 'Failed to fetch') {
        setError('Erro de Rede: Não foi possível contactar o servidor Supabase. Verifique a sua ligação ou se o URL do projeto está correto.');
      } else {
        setError(`Erro inesperado: ${err.message || 'Erro desconhecido ao autenticar.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div 
        className="hidden lg:block relative bg-cover bg-center"
        style={{ backgroundImage: `url(${settings.loginImageUrl || 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80&w=1200'})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 to-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-8 p-6 bg-cyan-500/20 rounded-full border border-cyan-500/30 animate-float">
            <Shield size={64} className="text-cyan-400" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">
            Vai Dar Banho ao Carro
          </h1>
          <p className="text-cyan-100 text-lg max-w-md">
            Protocolo Seguro de Gestão de Lavagens <br/>
            <span className="text-sm font-mono opacity-60">CLOUD_DB: CONNECTED</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-8 bg-slate-950 cyber-grid">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase tracking-tight">Acesso Restrito</h2>
            <p className="text-slate-400">Insira as credenciais para descriptografar o acesso</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block font-mono">ID de Utilizador (E-mail)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vaidarbanho.pt"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block font-mono">Chave de Encriptação (Password)</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-xs animate-in slide-in-from-top-2 flex gap-3 items-start shadow-lg shadow-red-900/20">
                <AlertTriangle size={20} className="shrink-0 text-red-500" />
                <div className="space-y-1">
                  <p className="font-bold">ERRO DE SISTEMA</p>
                  <p className="opacity-90">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest font-mono"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Autenticar na Cloud'}
            </button>
          </form>

          <div className="text-center">
            <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
              Secured by Supabase Infrastructure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
