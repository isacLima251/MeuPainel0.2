import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../App';
import { Plus, Phone, DollarSign, Save, X, Trash2, Edit2, AlertCircle, Target, Lock, Check, Mail, Key } from 'lucide-react';
import { Atendente, CommissionOverride } from '../types';

export const Team: React.FC = () => {
  const { atendentes, sales, kits, criativos, addAtendente, updateAtendente, deleteAtendente, toggleAtendenteStatus } = useData();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSalary, setNewSalary] = useState<string>('');
  
  // New Login Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Goals State
  const [goalQty, setGoalQty] = useState<string>('');
  const [goalValue, setGoalValue] = useState<string>('');

  const [customCommissions, setCustomCommissions] = useState<CommissionOverride[]>([]);
  const [allowedCreatives, setAllowedCreatives] = useState<string[]>([]);

  // Calculate Stats per Attendant
  const getAttendantStats = (attendantId: string) => {
      const mySales = sales.filter(s => s.atendenteId === attendantId);
      const totalSales = mySales.length;
      const paidSales = mySales.filter(s => s.status === 'PAGO').length;
      const scheduledSales = mySales.filter(s => s.status === 'AGENDADO').length;
      const frustratedSales = mySales.filter(s => s.status === 'FRUSTRADO').length;
      const totalFinished = paidSales + frustratedSales;
      
      const conversionRate = totalFinished > 0 ? (paidSales / totalFinished) * 100 : 0;
      const frustrationRate = totalFinished > 0 ? (frustratedSales / totalFinished) * 100 : 0;
      
      const totalCommission = mySales.filter(s => s.status === 'PAGO').reduce((acc, curr) => acc + curr.comissaoGerada, 0);

      return { totalSales, paidSales, scheduledSales, conversionRate, frustrationRate, totalCommission };
  };

  const handleOpenModal = () => {
      setEditingId(null);
      setNewName('');
      setNewCode('');
      setNewPhone('');
      setNewSalary('');
      setEmail('');
      setPassword('');
      setGoalQty('');
      setGoalValue('');
      setCustomCommissions([]);
      setAllowedCreatives([]);
      setIsModalOpen(true);
  };

  const handleEdit = (att: Atendente, e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      setEditingId(att.id);
      setNewName(att.nome);
      setNewCode(att.codigo);
      setNewPhone(att.telefone);
      setNewSalary(att.salarioMensal.toString());
      setGoalQty(att.metaMensal?.quantidade.toString() || '');
      setGoalValue(att.metaMensal?.valor.toString() || '');
      setCustomCommissions(att.comissoesPersonalizadas || []);
      setAllowedCreatives(att.criativosAutorizados || []);
      // Cannot edit email/password here in this basic version, simplified for creation only
      setEmail('registrado@sistema.com'); 
      setPassword('*****');
      setIsModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.confirm("Tem certeza que deseja excluir este atendente e remover o acesso dele? Esta ação é irreversível.")) {
          deleteAtendente(id);
      }
  };

  const handleCommissionChange = (kitId: string, type: 'fixo' | 'percentual', value: string) => {
      const numValue = parseFloat(value) || 0;
      setCustomCommissions(prev => {
          const existing = prev.find(c => c.kitId === kitId);
          if (existing) {
              return prev.map(c => c.kitId === kitId ? { ...c, tipo: type, valor: numValue } : c);
          }
          return [...prev, { kitId, tipo: type, valor: numValue }];
      });
  };

  const toggleAllowedCreative = (id: string) => {
      setAllowedCreatives(prev => {
          if (prev.includes(id)) {
              return prev.filter(cId => cId !== id);
          } else {
              return [...prev, id];
          }
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const attendantData = {
          nome: newName,
          codigo: newCode.toUpperCase(),
          telefone: newPhone,
          salarioMensal: parseFloat(newSalary) || 0,
          ativo: true,
          comissoesPersonalizadas: customCommissions,
          metaMensal: {
              quantidade: parseInt(goalQty) || 0,
              valor: parseFloat(goalValue) || 0
          },
          criativosAutorizados: allowedCreatives
      };

      if (editingId) {
          updateAtendente(editingId, attendantData);
      } else {
          // Unified Creation
          if (!user?.clientId && user?.role !== 'super_admin') {
              alert("Erro de segurança: ID da empresa não encontrado.");
              return;
          }

          addAtendente(
              attendantData, 
              { email, password },
              user?.clientId || 'c1' // Fallback for Super Admin testing
          );
      }
      setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestão de Equipe</h1>
                <p className="text-slate-500">Cadastre atendentes, defina metas e comissões personalizadas.</p>
            </div>
       </div>

       {/* Grid Layout - Squares */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           
           {/* Card 1: Add New (Action Card) */}
           <button 
                onClick={handleOpenModal}
                className="group relative aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer"
           >
               <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-transform duration-300">
                   <Plus size={32} />
               </div>
               <div className="text-center">
                   <h3 className="font-bold text-slate-700 group-hover:text-blue-700">Adicionar Atendente</h3>
                   <p className="text-xs text-slate-400 mt-1">Configurar Acesso e UTM</p>
               </div>
           </button>

           {/* Attendant Cards */}
           {atendentes.map(att => {
               const stats = getAttendantStats(att.id);
               return (
                   <div key={att.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow aspect-square flex flex-col overflow-hidden relative group">
                       
                       {/* Action Buttons (Edit/Delete) - Top Right - High Z-Index */}
                       <div className="absolute top-3 right-3 flex items-center gap-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                type="button"
                                onClick={(e) => handleEdit(att, e)}
                                title="Editar Atendente"
                                className="p-1.5 bg-white text-slate-400 hover:text-blue-600 rounded-full shadow-sm border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer"
                            >
                                <Edit2 size={14} className="pointer-events-none"/>
                            </button>
                            <button 
                                type="button"
                                onClick={(e) => handleDelete(att.id, e)}
                                title="Excluir Atendente"
                                className="p-1.5 bg-white text-slate-400 hover:text-red-600 rounded-full shadow-sm border border-slate-200 hover:border-red-300 transition-colors cursor-pointer"
                            >
                                <Trash2 size={14} className="pointer-events-none"/>
                            </button>
                       </div>

                       {/* Status Toggle - Absolute Top Left */}
                       <button 
                            onClick={() => toggleAtendenteStatus(att.id)}
                            title={att.ativo ? "Desativar Atendente" : "Ativar Atendente"}
                            className={`absolute top-4 left-4 w-3 h-3 rounded-full ${att.ativo ? 'bg-green-500' : 'bg-red-500'} ring-4 ring-white cursor-pointer hover:scale-125 transition-transform shadow-sm z-40`}
                       />
                       
                       {/* Main Info */}
                       <div className="p-5 pb-2 text-center flex-1 flex flex-col justify-center items-center bg-gradient-to-b from-slate-50/50 to-white">
                           <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl mb-2 shadow-lg shadow-blue-200">
                               {att.nome.charAt(0)}
                           </div>
                           <h3 className="text-lg font-bold text-slate-900 truncate w-full px-4">{att.nome}</h3>
                           <div className="flex items-center gap-2 mt-1 mb-2">
                                <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase">
                                    {att.codigo}
                                </span>
                           </div>
                           <div className="flex items-center gap-2 text-slate-500 text-[10px] bg-slate-100 px-2 py-1 rounded-full">
                               <Phone size={10} /> {att.telefone}
                           </div>
                       </div>
                       
                       {/* Financial Highlights */}
                       <div className="grid grid-cols-2 gap-2 px-2 pb-2">
                           <div className="bg-green-50 border border-green-100 rounded-lg p-2 text-center">
                               <p className="text-[9px] text-green-600 uppercase font-bold">Comissão</p>
                               <p className="text-xs font-bold text-green-700">R$ {stats.totalCommission.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                           </div>
                           <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-center">
                               <p className="text-[9px] text-blue-600 uppercase font-bold">Meta (Qtd)</p>
                               <p className="text-xs font-bold text-blue-700">{att.metaMensal?.quantidade || '-'}</p>
                           </div>
                       </div>

                       {/* Stats Grid - Compact to fit */}
                       <div className="grid grid-cols-2 gap-px bg-slate-100 border-t border-slate-100">
                           <div className="bg-white p-2 text-center group/stat hover:bg-blue-50 transition-colors">
                               <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Vendas</p>
                               <p className="text-base font-bold text-slate-800">{stats.totalSales}</p>
                           </div>
                           <div className="bg-white p-2 text-center group/stat hover:bg-green-50 transition-colors">
                               <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Pagos</p>
                               <p className="text-base font-bold text-green-600">{stats.paidSales}</p>
                           </div>
                           <div className="bg-white p-2 text-center group/stat hover:bg-indigo-50 transition-colors">
                               <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Conversão</p>
                               <p className="text-base font-bold text-indigo-600">{stats.conversionRate.toFixed(0)}%</p>
                           </div>
                           <div className="bg-white p-2 text-center group/stat hover:bg-red-50 transition-colors">
                               <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Frustração</p>
                               <p className="text-base font-bold text-red-500">{stats.frustrationRate.toFixed(0)}%</p>
                           </div>
                       </div>
                   </div>
               );
           })}
       </div>

       {/* Modal */}
       {isModalOpen && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
               <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-8 border border-slate-100 transform transition-all scale-100">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                       <div>
                           <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Editar Membro' : 'Novo Membro da Equipe'}</h2>
                           <p className="text-xs text-slate-500 mt-1">Preencha os dados para gerar o acesso e UTM.</p>
                       </div>
                       <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full">
                           <X size={24} />
                       </button>
                   </div>
                   
                   <form onSubmit={handleSubmit}>
                       <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                           
                           {/* Login & Access Section (New) */}
                           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                               <h3 className="text-sm font-bold text-yellow-800 flex items-center gap-2">
                                   <Key size={16} /> Credenciais de Acesso
                               </h3>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <div>
                                       <label className="block text-xs font-bold text-yellow-700 mb-1">E-mail de Login</label>
                                       <div className="relative">
                                           <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500"/>
                                           <input 
                                                type="email" required={!editingId}
                                                disabled={!!editingId} // Disable editing email after creation for now
                                                value={email} onChange={e => setEmail(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 border border-yellow-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-200 outline-none bg-white"
                                                placeholder="email@empresa.com"
                                           />
                                       </div>
                                   </div>
                                   <div>
                                       <label className="block text-xs font-bold text-yellow-700 mb-1">Senha Inicial</label>
                                       <input 
                                            type="text" required={!editingId}
                                            disabled={!!editingId}
                                            value={password} onChange={e => setPassword(e.target.value)}
                                            className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-200 outline-none bg-white"
                                            placeholder="******"
                                       />
                                   </div>
                               </div>
                           </div>

                           {/* UTM Warning */}
                           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3 items-start">
                               <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={18} />
                               <div>
                                   <p className="text-sm text-blue-800 font-bold">Atenção ao Código UTM</p>
                                   <p className="text-xs text-blue-600 mt-1">
                                       Este código (Ex: <strong>ANA</strong>) deve ser inserido na URL da campanha como <code>utm_atendente=ANA</code>.
                                   </p>
                               </div>
                           </div>

                           <div className="grid grid-cols-2 gap-5">
                               <div className="col-span-2">
                                   <label className="block text-sm font-bold text-slate-700 mb-1.5">Nome Completo</label>
                                   <input 
                                       type="text" required
                                       value={newName} onChange={e => setNewName(e.target.value)}
                                       className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                       placeholder="Ex: Ana Souza"
                                   />
                               </div>
                               <div>
                                   <label className="block text-sm font-bold text-slate-700 mb-1.5">Código UTM <span className="text-red-500">*</span></label>
                                   <div className="relative">
                                       <input 
                                           type="text" required
                                           value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())}
                                           className="w-full pl-4 pr-10 py-2.5 border border-slate-300 rounded-lg uppercase font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                           placeholder="ANA"
                                           maxLength={10}
                                       />
                                       <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                           UTM
                                       </div>
                                   </div>
                               </div>
                               <div>
                                   <label className="block text-sm font-bold text-slate-700 mb-1.5">Telefone</label>
                                   <input 
                                       type="text" required
                                       value={newPhone} onChange={e => setNewPhone(e.target.value)}
                                       className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                       placeholder="(11) 99999-9999"
                                   />
                               </div>
                               <div className="col-span-2">
                                   <label className="block text-sm font-bold text-slate-700 mb-1.5">Salário Base (R$)</label>
                                   <div className="relative">
                                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                                       <input 
                                           type="number" required
                                           value={newSalary} onChange={e => setNewSalary(e.target.value)}
                                           className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                           placeholder="1500.00"
                                       />
                                   </div>
                               </div>
                           </div>

                            {/* Metas Mensais */}
                           <div className="border-t border-slate-200 pt-5">
                               <div className="flex items-center justify-between mb-3">
                                   <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                       <div className="p-1.5 bg-indigo-100 rounded text-indigo-700"><Target size={16}/></div>
                                       Metas Mensais
                                   </h3>
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                   <div>
                                       <label className="block text-xs font-bold text-slate-500 mb-1">Meta de Vendas (Qtd)</label>
                                       <input 
                                           type="number"
                                           value={goalQty} onChange={e => setGoalQty(e.target.value)}
                                           className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
                                           placeholder="Ex: 50"
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-xs font-bold text-slate-500 mb-1">Meta Faturamento (R$)</label>
                                       <input 
                                           type="number"
                                           value={goalValue} onChange={e => setGoalValue(e.target.value)}
                                           className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
                                           placeholder="Ex: 15000.00"
                                       />
                                   </div>
                               </div>
                           </div>

                           {/* SECURITY / ATTRIBUTION SECTION */}
                           <div className="border-t border-slate-200 pt-5">
                                <div className="flex items-center justify-between mb-3">
                                   <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                       <div className="p-1.5 bg-red-100 rounded text-red-700"><Lock size={16}/></div>
                                       Segurança & Atribuição
                                   </h3>
                               </div>
                               <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded border border-slate-100">
                                   Selecione os criativos que este atendente está <strong>autorizado</strong> a vender. Vendas de criativos não marcados entrarão como "Sem Identificação".
                               </p>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar border border-slate-100 rounded-lg p-2">
                                   {criativos.map(c => {
                                       const isAllowed = allowedCreatives.includes(c.id);
                                       return (
                                           <label key={c.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${isAllowed ? 'bg-green-50 border-green-200' : 'hover:bg-slate-50 border-transparent'}`}>
                                               <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isAllowed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                    {isAllowed && <Check size={14} strokeWidth={3} />}
                                               </div>
                                               <input 
                                                    type="checkbox" 
                                                    className="hidden"
                                                    checked={isAllowed}
                                                    onChange={() => toggleAllowedCreative(c.id)}
                                               />
                                               <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-bold truncate ${isAllowed ? 'text-green-800' : 'text-slate-600'}`}>{c.nome}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">{c.campanha}</p>
                                               </div>
                                           </label>
                                       )
                                   })}
                                   {criativos.length === 0 && <p className="text-xs text-slate-400 italic p-2">Nenhum criativo cadastrado.</p>}
                               </div>
                           </div>

                           {/* Commission Override Section */}
                           <div className="border-t border-slate-200 pt-5">
                               <div className="flex items-center justify-between mb-3">
                                   <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                       <div className="p-1.5 bg-green-100 rounded text-green-700"><DollarSign size={16}/></div>
                                       Comissões Personalizadas
                                   </h3>
                                   <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">Opcional</span>
                               </div>
                               <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded border border-slate-100">
                                   Defina valores se este atendente ganhar diferente do padrão dos kits.
                               </p>
                               
                               <div className="space-y-3">
                                   {kits.map(kit => {
                                       const currentComm = customCommissions.find(c => c.kitId === kit.id);
                                       return (
                                           <div key={kit.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors bg-white">
                                               <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                                                   {kit.codigoBraip.substring(0,2)}
                                               </div>
                                               <div className="flex-1 min-w-0">
                                                   <p className="text-sm font-bold text-slate-700 truncate">{kit.nome}</p>
                                                   <p className="text-xs text-slate-400">Padrão: {kit.comissaoFixa > 0 ? `R$${kit.comissaoFixa}` : `${kit.comissaoPercentual}%`}</p>
                                               </div>
                                               <div className="flex gap-2 shrink-0">
                                                   <select 
                                                       value={currentComm?.tipo || 'percentual'}
                                                       onChange={(e) => handleCommissionChange(kit.id, e.target.value as any, currentComm?.valor.toString() || '0')}
                                                       className="text-xs py-1.5 px-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-100 outline-none"
                                                   >
                                                       <option value="percentual">%</option>
                                                       <option value="fixo">R$</option>
                                                   </select>
                                                   <input 
                                                       type="number"
                                                       value={currentComm?.valor || ''}
                                                       onChange={(e) => handleCommissionChange(kit.id, currentComm?.tipo || 'percentual', e.target.value)}
                                                       placeholder="0"
                                                       className="w-20 text-sm py-1.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                                                   />
                                               </div>
                                           </div>
                                       );
                                   })}
                               </div>
                           </div>
                       </div>

                       <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                           <button 
                               type="button"
                               onClick={() => setIsModalOpen(false)}
                               className="px-5 py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                               Cancelar
                           </button>
                           <button 
                               type="submit"
                               className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transform active:scale-95 transition-all">
                               <Save size={18} />
                               {editingId ? 'Salvar Alterações' : 'Criar Conta e Acesso'}
                           </button>
                       </div>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};