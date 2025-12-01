import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Building2, XCircle, Edit2, CreditCard, Users } from 'lucide-react';
import { Client } from '../types';

const PLAN_PRICES: Record<string, number> = {
    trial: 0,
    pro: 297,
    enterprise: 997
};

const KpiCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${color} text-white`}>
                <Icon size={22} />
            </div>
        </div>
        <div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    </div>
);

export const Clients: React.FC = () => {
  const { clients, addClient, updateClient, toggleClientStatus, users } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [plan, setPlan] = useState<'trial' | 'pro' | 'enterprise'>('trial');
  const [active, setActive] = useState(true);

  // SaaS Metrics Calculation
  const activeClients = clients.filter(c => c.active).length;
  const totalUsers = users.filter(u => u.role !== 'super_admin').length; // Count only customers
  
  // MRR: Sum of plan prices for active clients
  const mrr = clients
      .filter(c => c.active)
      .reduce((acc, client) => acc + (PLAN_PRICES[client.plan] || 0), 0);

  const handleOpenModal = (client?: Client) => {
      if (client) {
          setEditingId(client.id);
          setName(client.name);
          setDocument(client.documento);
          setPlan(client.plan);
          setActive(client.active);
      } else {
          setEditingId(null);
          setName('');
          setDocument('');
          setPlan('trial');
          setActive(true);
      }
      setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (editingId) {
          updateClient(editingId, { name, documento: document, plan, active });
      } else {
          addClient({
              id: `c-${Date.now()}`,
              name,
              documento: document,
              plan,
              active,
              createdAt: new Date().toISOString()
          } as any);
      }
      setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestão de Clientes (SaaS)</h1>
                <p className="text-slate-500">Visão geral da operação, receita recorrente e base de clientes.</p>
            </div>
            <button 
                onClick={() => handleOpenModal()}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors"
            >
                <Plus size={18} /> Nova Empresa
            </button>
       </div>

       {/* SaaS Dashboard Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <KpiCard 
               title="MRR (Receita Mensal)" 
               value={`R$ ${mrr.toLocaleString('pt-BR')}`} 
               icon={CreditCard} 
               color="bg-emerald-600" 
           />
           <KpiCard 
               title="Clientes Ativos" 
               value={activeClients} 
               icon={Building2} 
               color="bg-blue-600" 
           />
           <KpiCard 
               title="Total Usuários Finais" 
               value={totalUsers} 
               icon={Users} 
               color="bg-indigo-600" 
           />
       </div>

       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <table className="w-full text-left">
               <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                   <tr>
                       <th className="px-6 py-4">Acesso</th>
                       <th className="px-6 py-4">Empresa</th>
                       <th className="px-6 py-4">Documento</th>
                       <th className="px-6 py-4">Plano</th>
                       <th className="px-6 py-4">Valor</th>
                       <th className="px-6 py-4 text-right">Ações</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                   {clients.map(client => (
                       <tr key={client.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4">
                               <button 
                                   onClick={() => toggleClientStatus(client.id)}
                                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${client.active ? 'bg-blue-600' : 'bg-slate-200'}`}
                               >
                                   <span
                                       className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${client.active ? 'translate-x-6' : 'translate-x-1'}`}
                                   />
                               </button>
                           </td>
                           <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded flex items-center justify-center text-white ${client.active ? 'bg-blue-500' : 'bg-slate-300'}`}>
                                       <Building2 size={16} />
                                   </div>
                                   <div>
                                       <p className={`font-bold ${client.active ? 'text-slate-900' : 'text-slate-400'}`}>{client.name}</p>
                                       <p className="text-xs text-slate-500">Desde {new Date(client.createdAt).toLocaleDateString()}</p>
                                   </div>
                               </div>
                           </td>
                           <td className="px-6 py-4 text-sm text-slate-600 font-mono">{client.documento}</td>
                           <td className="px-6 py-4">
                               <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border
                                    ${client.plan === 'enterprise' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                      client.plan === 'pro' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                      'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                   {client.plan}
                               </span>
                           </td>
                           <td className="px-6 py-4 text-sm font-bold text-slate-700">
                               R$ {PLAN_PRICES[client.plan].toLocaleString('pt-BR')}
                           </td>
                           <td className="px-6 py-4 text-right">
                               <button 
                                    onClick={() => handleOpenModal(client)}
                                    className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded transition-colors"
                               >
                                   <Edit2 size={16} />
                               </button>
                           </td>
                       </tr>
                   ))}
               </tbody>
           </table>
       </div>

       {isModalOpen && (
           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                       <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Editar Empresa' : 'Cadastrar Empresa'}</h2>
                       <button onClick={() => setIsModalOpen(false)}><XCircle className="text-slate-400 hover:text-slate-600" /></button>
                   </div>
                   <form onSubmit={handleSubmit} className="p-6 space-y-4">
                       <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">Nome da Empresa</label>
                           <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                       </div>
                       <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">CNPJ / CPF</label>
                           <input type="text" required value={document} onChange={e => setDocument(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                       </div>
                       <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">Plano</label>
                           <select value={plan} onChange={(e:any) => setPlan(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                               <option value="trial">Trial (Grátis)</option>
                               <option value="pro">Pro (R$ 297)</option>
                               <option value="enterprise">Enterprise (R$ 997)</option>
                           </select>
                       </div>
                       <div className="flex items-center gap-2">
                           <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} id="active" />
                           <label htmlFor="active" className="text-sm font-medium text-slate-700">Acesso Ativo</label>
                       </div>
                       <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800">
                           Salvar Dados
                       </button>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};