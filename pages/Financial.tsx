import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Trash2, TrendingDown, Edit2, X, Save, TrendingUp, Megaphone } from 'lucide-react';
import { Despesa } from '../types';

export const Financial: React.FC = () => {
  const { despesas, addDespesa, updateDespesa, deleteDespesa, creativeExpenses, criativos, getMetrics } = useData();
  const metrics = getMetrics();

  // Tabs
  const [activeTab, setActiveTab] = useState<'expenses' | 'investments'>('expenses');

  // Form/Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [desc, setDesc] = useState('');
  const [val, setVal] = useState('');
  const [cat, setCat] = useState('Infra');

  const handleOpenModal = (despesa?: Despesa) => {
      if (despesa) {
          setEditingId(despesa.id);
          setDesc(despesa.descricao);
          setVal(despesa.valor.toString());
          setCat(despesa.categoria);
      } else {
          setEditingId(null);
          setDesc('');
          setVal('');
          setCat('Infra');
      }
      setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!desc || !val) return;

      const expenseData = {
          descricao: desc,
          valor: parseFloat(val),
          categoria: cat
      };

      if (editingId) {
          updateDespesa(editingId, expenseData);
      } else {
          addDespesa({
              id: `desp-${Date.now()}`,
              data: new Date().toISOString(),
              ...expenseData
          } as Despesa);
      }
      
      setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
      // Crucial: Stop propagation and prevent default to ensure button click registers correctly
      e.preventDefault();
      e.stopPropagation();
      
      if (window.confirm('Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.')) {
          deleteDespesa(id);
      }
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestão Financeira</h1>
                <p className="text-slate-500">Controle de custos operacionais e monitoramento de investimento em mídia.</p>
            </div>
            
            <div className="flex gap-3">
                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-100 flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg"><TrendingDown size={20}/></div>
                    <div>
                        <p className="text-xs font-semibold uppercase">Despesas Ops.</p>
                        <p className="text-xl font-bold">R$ {metrics.totalDespesas.toLocaleString('pt-BR')}</p>
                    </div>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg"><TrendingUp size={20}/></div>
                    <div>
                        <p className="text-xs font-semibold uppercase">Investimento Ads</p>
                        <p className="text-xl font-bold">R$ {metrics.investimento.toLocaleString('pt-BR')}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
            <button 
                onClick={() => setActiveTab('expenses')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'expenses' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <TrendingDown size={16}/> Despesas Operacionais
            </button>
            <button 
                onClick={() => setActiveTab('investments')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'investments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <Megaphone size={16}/> Investimento em Mídia (Ads)
            </button>
        </div>

        {/* Tab 1: Operational Expenses */}
        {activeTab === 'expenses' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-slate-800">Custos Fixos e Variáveis</h3>
                        <p className="text-xs text-slate-500">Não inclua gastos com tráfego aqui. Use a aba "Investimento".</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2 transition-colors"
                    >
                        <Plus size={16}/> Nova Despesa
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4">Valor</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {despesas.map((d) => (
                                <tr key={d.id} className="hover:bg-slate-50 group">
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(d.data).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{d.descricao}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <span className="bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">{d.categoria}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">R$ {d.valor.toLocaleString('pt-BR')}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => handleOpenModal(d)}
                                            className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} className="pointer-events-none"/>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={(e) => handleDelete(d.id, e)}
                                            className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} className="pointer-events-none"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {despesas.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Nenhuma despesa operacional registrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Tab 2: Media Investments (Read Only/Global View) */}
        {activeTab === 'investments' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-50/30">
                     <div>
                        <h3 className="font-bold text-blue-900">Extrato de Investimento em Mídia</h3>
                        <p className="text-xs text-blue-600">
                            Estes valores são lançados diretamente no módulo <strong>Criativos</strong> para calcular o ROAS.
                        </p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4">Data do Gasto</th>
                                <th className="px-6 py-4">Criativo (UTM Content)</th>
                                <th className="px-6 py-4">Valor Investido</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {creativeExpenses
                                .sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                                .map((expense) => {
                                    const creative = criativos.find(c => c.id === expense.criativoId);
                                    return (
                                        <tr key={expense.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm text-slate-500">{new Date(expense.data).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm font-mono text-slate-700">
                                                {creative ? creative.nome : <span className="text-red-400 italic">Desconhecido</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-blue-700">R$ {expense.valor.toLocaleString('pt-BR')}</td>
                                        </tr>
                                    );
                                })}
                             {creativeExpenses.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                        Nenhum investimento lançado. Vá em <strong>Criativos {'>'} Editar</strong> para lançar custos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Add/Edit Modal (For Operational Expenses Only) */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                       <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Editar Despesa' : 'Nova Despesa Operacional'}</h2>
                       <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                           <X size={24} />
                       </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                            <input 
                                type="text" required
                                value={desc} onChange={e => setDesc(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                placeholder="Ex: Aluguel do Escritório"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                            <input 
                                type="number" required
                                value={val} onChange={e => setVal(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                            <select 
                                value={cat} onChange={e => setCat(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                            >
                                <option value="Infra">Infraestrutura / Ferramentas</option>
                                <option value="Pessoal">Pessoal / Salários</option>
                                <option value="Outros">Outros Custos Fixos</option>
                                {/* Note: Marketing option removed to encourage using Investments tab */}
                            </select>
                        </div>

                        <div className="pt-2">
                             <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                <Save size={18}/> {editingId ? 'Salvar Alterações' : 'Adicionar Despesa'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};