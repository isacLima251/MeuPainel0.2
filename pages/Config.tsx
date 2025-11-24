import React, { useState } from 'react';
import { useAuth } from '../App';
import { User, Link, Copy, Check, Save, Webhook } from 'lucide-react';

export const Config: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations'>('profile');
  
  // States for Braip Integration
  const [braipToken, setBraipToken] = useState('bp_live_xxxxxxxxxxxx');
  const [webhookUrl] = useState('https://api.sistemarai.com/webhook/braip');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToken = () => {
    setIsSaving(true);
    // Mock save simulation
    setTimeout(() => setIsSaving(false), 1000);
  };

  const SidebarItem = ({ id, label, icon: Icon }: any) => (
    <button 
        onClick={() => setActiveTab(id)}
        className={`w-full text-left px-4 py-3 font-medium rounded-lg border flex items-center gap-3 transition-all
            ${activeTab === id 
                ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm' 
                : 'bg-white text-slate-600 border-transparent hover:bg-slate-50'
            }`}
    >
        <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
          <p className="text-slate-500">Gerencie seu perfil, preferências e integrações do sistema.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Sidebar */}
           <div className="lg:col-span-1 space-y-2">
               <SidebarItem id="profile" label="Perfil" icon={User} />
               <SidebarItem id="integrations" label="Integrações" icon={Link} />
           </div>

           {/* Content Area */}
           <div className="lg:col-span-3">
               
               {/* --- PROFILE TAB --- */}
               {activeTab === 'profile' && (
                   <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                       <h2 className="text-lg font-bold text-slate-900 mb-6">Informações do Perfil</h2>
                       
                       <div className="flex items-center gap-6 mb-8">
                           <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-2xl font-bold">
                               {user?.name.charAt(0)}
                           </div>
                           <div>
                               <button className="text-sm bg-white border border-slate-300 px-3 py-1.5 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                   Alterar Foto
                               </button>
                           </div>
                       </div>

                       <div className="space-y-4 max-w-md">
                           <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                               <input 
                                    type="text" 
                                    value={user?.name} 
                                    disabled
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                               />
                           </div>
                           <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                               <input 
                                    type="email" 
                                    value={user?.email} 
                                    disabled
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                               />
                           </div>
                           <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
                               <input 
                                    type="text" 
                                    value={user?.role === 'admin' ? 'Administrador' : 'Atendente'} 
                                    disabled
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed uppercase text-xs font-bold tracking-wide"
                               />
                           </div>
                       </div>
                   </div>
               )}

               {/* --- INTEGRATIONS TAB --- */}
               {activeTab === 'integrations' && (
                   <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                       
                       {/* Braip Integration Card */}
                       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                           <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                   <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                       <Webhook size={24} />
                                   </div>
                                   <div>
                                       <h3 className="text-lg font-bold text-slate-900">Integração Braip</h3>
                                       <p className="text-sm text-slate-500">Configuração de Postback e API para recebimento de vendas.</p>
                                   </div>
                               </div>
                               <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                                   ATIVO
                               </span>
                           </div>
                           
                           <div className="p-6 space-y-6">
                               {/* Webhook Section */}
                               <div>
                                   <label className="block text-sm font-bold text-slate-700 mb-2">
                                       URL do Webhook (Copie e cole na Braip)
                                   </label>
                                   <div className="flex gap-2">
                                       <div className="flex-1 bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 font-mono text-sm text-slate-600 truncate select-all">
                                           {webhookUrl}
                                       </div>
                                       <button 
                                            onClick={handleCopy}
                                            className={`px-4 py-2 rounded-lg font-medium border flex items-center gap-2 transition-all min-w-[120px] justify-center
                                            ${copied 
                                                ? 'bg-green-50 text-green-700 border-green-200' 
                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                            }`}
                                       >
                                           {copied ? <Check size={18} /> : <Copy size={18} />}
                                           {copied ? 'Copiado!' : 'Copiar'}
                                       </button>
                                   </div>
                                   <p className="text-xs text-slate-500 mt-2">
                                       Configure esta URL no menu <strong>Ferramentas {'>'} Postback</strong> da Braip. Marque todos os eventos.
                                   </p>
                               </div>

                               <div className="border-t border-slate-100 pt-6"></div>

                               {/* API Token Section */}
                               <div>
                                   <label className="block text-sm font-bold text-slate-700 mb-2">
                                       Token de Acesso / API Key
                                   </label>
                                   <div className="flex gap-2">
                                       <input 
                                            type="password"
                                            value={braipToken}
                                            onChange={(e) => setBraipToken(e.target.value)}
                                            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                            placeholder="Cole seu token aqui..."
                                       />
                                       <button 
                                            onClick={handleSaveToken}
                                            disabled={isSaving}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm min-w-[120px] justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                       >
                                           {isSaving ? (
                                               <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                           ) : (
                                               <Save size={18} />
                                           )}
                                           Salvar
                                       </button>
                                   </div>
                                   <p className="text-xs text-slate-500 mt-2">
                                       Utilizado para buscar detalhes adicionais do pedido se necessário.
                                   </p>
                               </div>
                           </div>
                       </div>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};