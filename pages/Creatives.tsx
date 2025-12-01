import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Megaphone, Plus, Save, X, Trash2, Edit2, TrendingUp, Calendar } from 'lucide-react';
import { Criativo } from '../types';

export const Creatives: React.FC = () => {
  const { criativos, sales, creativeExpenses, addCriativo, updateCriativo, deleteCriativo, addCreativeExpense, deleteCreativeExpense } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Tabs for Modal
  const [activeTab, setActiveTab] = useState<'info' | 'costs'>('info');

  // Form State
  const [nome, setNome] = useState('');
  const [campanha, setCampanha] = useState('');
  const [status, setStatus] = useState<'teste' | 'aprovado' | 'ruim'>('teste');

  // Expenses State
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseValue, setExpenseValue] = useState('');

  const getStats = (criativoId: string) => {
      const mySales = sales.filter(s => s.criativoId === criativoId);
      const total = mySales.length;
      const pagos = mySales.filter(s => s.status === 'PAGO').length;
      const frustrados = mySales.filter(s => s.status === 'FRUSTRADO').length;
      const conversion = (pagos + frustrados) > 0 ? (pagos / (pagos + frustrados)) * 100 : 0;
      const revenue = mySales.filter(s => s.status === 'PAGO').reduce((acc, curr) => acc + curr.valor, 0);

      // Sum manual expenses for this creative
      const investment = creativeExpenses
          .filter(e => e.criativoId === criativoId)
          .reduce((acc, curr) => acc + curr.valor, 0);

      // ROAS = Revenue / Investment (Multiplier)
      const roas = investment > 0 ? revenue / investment : 0;

      return { total, conversion, roas, revenue, investment };
  };

  const handleOpenModal = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      setEditingId(null);
      setNome('');
      setCampanha('');
      setStatus('teste');
      setActiveTab('info');
      setIsModalOpen(true);
  };

  const handleEdit = (c: Criativo, e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      setEditingId(c.id);
      setNome(c.nome);
      setCampanha(c.campanha);
      setStatus(c.status);
      setActiveTab('info');
      setIsModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if(window.confirm("Tem certeza que deseja excluir este criativo? Isso não apaga as vendas, mas remove o criativo da lista.")) {
          deleteCriativo(id);
      }
  };

  const handleAddExpense = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingId || !expenseValue) return;

      addCreativeExpense({
          id: `ce-${Date.now()}`,
          criativoId: editingId,
          data: new Date(expenseDate).toISOString(),
          valor: parseFloat(expenseValue)
      });
      setExpenseValue('');
  };

  const handleDeleteExpense = (expenseId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      deleteCreativeExpense(expenseId);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const data = {
          nome: nome.toUpperCase(),
          campanha,
          status
      };

      if (editingId) {
          updateCriativo(editingId, data);
      } else {
          addCriativo({
              id: `cr-${Date.now()}`,
              ...data
          });
      }
      setIsModalOpen(false);
  };

  const getStatusColor = (s: string) => {
      if (s === 'aprovado') return 'bg-green-100 text-green-700 border-green-200';
      if (s === 'ruim') return 'bg-red-100 text-red-700 border-red-200';
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestão de Criativos</h1>
                <p className="text-slate-500">Acompanhe ROAS, Receita e gerencie os custos diários dos anúncios.</p>
            </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           
           {/* Add New Card */}
           <button 
                onClick={(e) => handleOpenModal(e)}
                className="group relative aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer"
           >
               <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-transform duration-300">
                   <Plus size={32} />
               </div>
               <div className="text-center">
                   <h3 className="font-bold text-slate-700 group-hover:text-blue-700">Novo Criativo</h3>
                   <p className="text-xs text-slate-400 mt-1">Registrar utm_content</p>
               </div>
           </button>

           {/* Creative Cards */}
           {criativos.map(cr => {
               const stats = getStats(cr.id);
               return (
                   <div key={cr.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow aspect-square flex flex-col overflow-hidden relative group">
                        
                        {/* Status Label Absolute */}
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(cr.status)}`}>
                            {cr.status}
                        </div>

                        {/* Action Buttons (Hover) - High Z-Index */}
                        <div className="absolute top-3 right-3 flex items-center gap-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                type="button"
                                onClick={(e) => handleEdit(cr, e)}
                                title="Editar e Lançar Custos"
                                className="p-1.5 bg-white text-slate-400 hover:text-blue-600 rounded-full shadow-sm border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer"
                            >
                                <Edit2 size={14} className="pointer-events-none"/>
                            </button>
                            <button 
                                type="button"
                                onClick={(e) => handleDelete(cr.id, e)}
                                title="Excluir Criativo"
                                className="p-1.5 bg-white text-slate-400 hover:text-red-600 rounded-full shadow-sm border border-slate-200 hover:border-red-300 transition-colors cursor-pointer"
                            >
                                <Trash2 size={14} className="pointer-events-none"/>
                            </button>
                       </div>

                        {/* Content */}
                        <div className="flex-1 p-6 pb-2 flex flex-col justify-center items-center text-center bg-gradient-to-b from-slate-50/50 to-white">
                            <div className="w-14 h-14 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3 shadow-inner">
                                <Megaphone size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 break-all w-full leading-tight">{cr.nome}</h3>
                            <p className="text-xs text-slate-500 mt-2 bg-slate-100 px-2 py-1 rounded">{cr.campanha}</p>
                        </div>

                        {/* KPIs */}
                        <div className="grid grid-cols-2 gap-px bg-slate-100 border-t border-slate-100">
                           <div className="bg-white p-3 text-center group/stat hover:bg-blue-50 transition-colors">
                               <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Vendas</p>
                               <p className="text-lg font-bold text-slate-800">{stats.total}</p>
                           </div>
                           <div className="bg-white p-3 text-center group/stat hover:bg-green-50 transition-colors">
                               <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Investimento</p>
                               <p className="text-sm font-bold text-slate-600 mt-1">R${stats.investment.toLocaleString()}</p>
                           </div>
                           <div className="bg-white p-3 text-center group/stat hover:bg-indigo-50 transition-colors">
                               <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Receita</p>
                               <p className="text-sm font-bold text-indigo-600 mt-1">R$ {stats.revenue.toLocaleString('pt-BR')}</p>
                           </div>
                           <div className="bg-white p-3 text-center group/stat hover:bg-purple-50 transition-colors">
                               <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">ROAS</p>
                               <p className={`text-lg font-bold ${stats.roas >= 2 ? 'text-green-600' : 'text-purple-600'}`}>
                                   {stats.roas.toFixed(1)}x
                               </p>
                           </div>
                        </div>
                   </div>
               )
           })}
       </div>

       {/* Edit/Create Modal */}
       {isModalOpen && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                       <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Editar Criativo' : 'Novo Criativo'}</h2>
                       <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500">
                           <X size={24} />
                       </button>
                   </div>

                   {editingId && (
                       <div className="flex border-b border-slate-200">
                           <button 
                                onClick={() => setActiveTab('info')}
                                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                           >
                               Dados Básicos
                           </button>
                           <button 
                                onClick={() => setActiveTab('costs')}
                                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'costs' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                           >
                               Gestão de Custos
                           </button>
                       </div>
                   )}

                   <div className="overflow-y-auto p-6 space-y-4 flex-1">
                       {/* TAB: INFO */}
                       {activeTab === 'info' && (
                           <form id="creative-form" onSubmit={handleSubmit} className="space-y-4">
                               <div>
                                   <label className="block text-sm font-bold text-slate-700 mb-1">Nome (UTM Content)</label>
                                   <input 
                                        type="text" required
                                        value={nome} onChange={e => setNome(e.target.value.toUpperCase())}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none font-mono"
                                        placeholder="VID01_PROVA_SOCIAL"
                                   />
                               </div>
                               <div>
                                   <label className="block text-sm font-bold text-slate-700 mb-1">Campanha Associada</label>
                                   <input 
                                        type="text" required
                                        value={campanha} onChange={e => setCampanha(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                                        placeholder="Campanha Verão 2024"
                                   />
                               </div>
                               <div>
                                   <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                                   <select 
                                        value={status} onChange={(e) => setStatus(e.target.value as any)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none"
                                   >
                                       <option value="teste">Em Teste</option>
                                       <option value="aprovado">Aprovado</option>
                                       <option value="ruim">Ruim</option>
                                   </select>
                               </div>
                           </form>
                       )}

                       {/* TAB: COSTS */}
                       {activeTab === 'costs' && editingId && (
                           <div className="space-y-6">
                               <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                   <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                                       <TrendingUp size={16}/> Lançar Custo Diário
                                   </h4>
                                   <form onSubmit={handleAddExpense} className="flex gap-2">
                                       <div className="flex-1">
                                           <input 
                                                type="date" required
                                                value={expenseDate}
                                                onChange={e => setExpenseDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm"
                                           />
                                       </div>
                                       <div className="w-32 relative">
                                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                                           <input 
                                                type="number" required
                                                value={expenseValue}
                                                onChange={e => setExpenseValue(e.target.value)}
                                                className="w-full pl-8 pr-3 py-2 border border-blue-200 rounded-lg text-sm"
                                                placeholder="0.00"
                                           />
                                       </div>
                                       <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                                           <Plus size={20} />
                                       </button>
                                   </form>
                               </div>

                               <div>
                                   <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Histórico de Gastos</h4>
                                   <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                       {creativeExpenses.filter(e => e.criativoId === editingId).length === 0 ? (
                                           <p className="text-sm text-slate-400 italic text-center py-4">Nenhum custo lançado.</p>
                                       ) : (
                                           creativeExpenses
                                           .filter(e => e.criativoId === editingId)
                                           .sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                                           .map(exp => (
                                               <div key={exp.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                   <div className="flex items-center gap-2">
                                                       <Calendar size={14} className="text-slate-400"/>
                                                       <span className="text-sm font-medium text-slate-700">{new Date(exp.data).toLocaleDateString('pt-BR')}</span>
                                                   </div>
                                                   <div className="flex items-center gap-3">
                                                       <span className="text-sm font-bold text-slate-900">R$ {exp.valor.toFixed(2)}</span>
                                                       <button 
                                                            type="button"
                                                            onClick={(e) => handleDeleteExpense(exp.id, e)}
                                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                                       >
                                                           <Trash2 size={14} />
                                                       </button>
                                                   </div>
                                               </div>
                                           ))
                                       )}
                                   </div>
                               </div>
                           </div>
                       )}
                   </div>

                   {/* Footer Actions */}
                   <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                       <button 
                           onClick={() => setIsModalOpen(false)}
                           className="px-5 py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                           Fechar
                       </button>
                       {activeTab === 'info' && (
                           <button 
                               type="submit"
                               form="creative-form"
                               className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition-all">
                               <Save size={18} />
                               Salvar Criativo
                           </button>
                       )}
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};