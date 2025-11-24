import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { ClipboardList, Search, User, Clock, AlertCircle } from 'lucide-react';

export const Logs: React.FC = () => {
  const { logs } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => 
    log.usuarioNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.detalhes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Auditoria & Logs</h1>
                <p className="text-slate-500">Rastreabilidade completa de todas as ações do sistema.</p>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar nos logs..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none w-full md:w-64"
                />
            </div>
       </div>

       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
               <table className="w-full text-left">
                   <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                       <tr>
                           <th className="px-6 py-4 font-semibold">Data / Hora</th>
                           <th className="px-6 py-4 font-semibold">Usuário</th>
                           <th className="px-6 py-4 font-semibold">Ação</th>
                           <th className="px-6 py-4 font-semibold">Detalhes</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                       {filteredLogs.map(log => (
                           <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                               <td className="px-6 py-4">
                                   <div className="flex items-center gap-2 text-sm text-slate-600">
                                       <Clock size={14} className="text-slate-400"/>
                                       {new Date(log.data).toLocaleString('pt-BR')}
                                   </div>
                               </td>
                               <td className="px-6 py-4">
                                   <div className="flex items-center gap-2">
                                       <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                           {log.usuarioNome.charAt(0)}
                                       </div>
                                       <span className="text-sm font-medium text-slate-900">{log.usuarioNome}</span>
                                   </div>
                               </td>
                               <td className="px-6 py-4">
                                   <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border
                                        ${log.acao.includes('Edição') ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                                          log.acao.includes('Criação') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                          'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}>
                                        {log.acao}
                                   </span>
                               </td>
                               <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">
                                   {log.detalhes}
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       </div>
    </div>
  );
};