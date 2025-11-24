import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useData } from '../contexts/DataContext'; // Acesso aos dados globais de usuários
import { AlertCircle, Loader2, Shield, Building2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { users } = useData(); // Buscando usuários do "Banco de Dados"
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('admin@rai.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulação de chamada de API (Delay de rede)
    setTimeout(() => {
        // Validação contra a base de dados (users do Context)
        const userFound = users.find(u => u.email === email);
        const validPassword = '123456'; // Em produção, usar hash/bcrypt no backend

        if (!userFound) {
            setError('Usuário não encontrado. Verifique o e-mail digitado.');
            setIsLoading(false);
            return;
        }

        if (password !== validPassword) {
            setError('Senha incorreta. Por favor, tente novamente.');
            setIsLoading(false);
            return;
        }
        
        // Success
        login({
            id: userFound.id,
            name: userFound.name,
            email: userFound.email,
            role: userFound.role
        });
        
    }, 1000);
  };

  const fillCredentials = (type: 'super' | 'admin') => {
      if (type === 'super') {
          setEmail('super@rai.com');
      } else {
          setEmail('admin@rai.com');
      }
      setPassword('123456');
      setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 relative overflow-hidden">
        
        {isLoading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center transition-all duration-300 animate-in fade-in">
                <div className="relative mb-4">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 size={20} className="text-blue-600 animate-pulse" />
                    </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Acessando Sistema</h3>
                <p className="text-slate-500 text-sm mt-1">Validando suas credenciais...</p>
            </div>
        )}

        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-2xl mb-4 shadow-lg shadow-blue-200">
                R
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Bem-vindo ao RAI</h1>
            <p className="text-slate-500 text-sm mt-2">Sistema de Registro Automático de Indicadores</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-pulse">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all ${error && error.includes('Usuário') ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} disabled:bg-slate-50 disabled:text-slate-400`}
                    placeholder="email@empresa.com"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all ${error && error.includes('Senha') ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} disabled:bg-slate-50 disabled:text-slate-400`}
                    placeholder="••••••••"
                />
            </div>

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" disabled={isLoading} />
                    <span className="text-slate-600">Lembrar-me</span>
                </label>
                <a href="#" className="text-blue-600 hover:underline">Esqueceu a senha?</a>
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-blue-100 hover:shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                Entrar na Plataforma
            </button>
        </form>

        {/* Demo Account Switcher */}
        <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-3">Acesso Rápido (Ambiente de Teste)</p>
            <div className="grid grid-cols-2 gap-3">
                <button 
                    type="button"
                    onClick={() => fillCredentials('super')}
                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-xs text-slate-600 hover:text-blue-700"
                >
                    <Shield size={16} className="mb-1" />
                    <span className="font-bold">Super Admin</span>
                    <span className="text-[10px] text-slate-400">(Dono SaaS)</span>
                </button>
                <button 
                    type="button"
                    onClick={() => fillCredentials('admin')}
                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-xs text-slate-600 hover:text-blue-700"
                >
                    <Building2 size={16} className="mb-1" />
                    <span className="font-bold">Admin Cliente</span>
                    <span className="text-[10px] text-slate-400">(Empresa)</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};