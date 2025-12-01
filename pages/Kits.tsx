import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Package, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { Kit } from '../types';

export const Kits: React.FC = () => {
  const { kits, addKit, updateKit, deleteKit } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);

  // Form
  const [nome, setNome] = useState('');
  const [codigoBraip, setCodigoBraip] = useState('');
  const [tipoComissao, setTipoComissao] = useState<'fixo' | 'percentual'>('percentual');
  const [valorComissao, setValorComissao] = useState('');

  const handleOpen = (kit?: Kit, e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      if (kit) {
          setEditingKit(kit);
          setNome(kit.nome);
          setCodigoBraip(kit.codigoBraip);
          if (kit.comissaoFixa > 0) {
              setTipoComissao('fixo');
              setValorComissao(kit.comissaoFixa.toString());
          } else {
              setTipoComissao('percentual');
              setValorComissao(kit.comissaoPercentual.toString());
          }
      } else {
          setEditingKit(null);
          setNome('');
          setCodigoBraip('');
          setTipoComissao('percentual');
          setValorComissao('');
      }
      setIsModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.confirm('Tem certeza que deseja excluir este kit? Esta ação não pode ser desfeita.')) {
          deleteKit(id);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const val = parseFloat(valorComissao) || 0;
      
      const kitData: any = {
          nome,
          codigoBraip,
          comissaoFixa: tipoComissao === 'fixo' ? val : 0,
          comissaoPercentual: tipoComissao === 'percentual' ? val : 0,
          ativo: true
      };

      if (editingKit) {
          updateKit(editingKit.id, kitData);
      } else {
          addKit({ id: `k-${Date.now()}`, ...kitData });
      }
      setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Kits & Produtos</h1>
                <p className="text-slate-500">Gerencie os produtos vendidos e suas comissões padrão.</p>
            </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           
           {/* Add New Card */}
           <button 
                onClick={(e) => handleOpen(undefined, e)}
                className="group relative aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer"
           >
               <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-transform duration-300">
                   <Plus size={32} />
               </div>
               <div className="text-center">
                   <h3 className="font-bold text-slate-700 group-hover:text-blue-700">Novo Kit</h3>
                   <p className="text-xs text-slate-400 mt-1">Definir Regras de Comissão</p>
               </div>
           </button>

           {/* Kit Cards */}
           {kits.map(kit => (
               <div key={kit.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow aspect-square flex flex-col overflow-hidden relative group">
                   
                   {/* Action Buttons - High Z-Index */}
                   <div className="absolute top-3 right-3 flex items-center gap-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            type="button"
                            onClick={(e) => handleOpen(kit, e)}
                            title="Editar Kit"
                            className="p-1.5 bg-white text-slate-400 hover:text-blue-600 rounded-full shadow-sm border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer"
                        >
                            <Edit2 size={14} className="pointer-events-none"/>
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => handleDelete(kit.id, e)}
                            title="Excluir Kit"
                            className="p-1.5 bg-white text-slate-400 hover:text-red-600 rounded-full shadow-sm border border-slate-200 hover:border-red-300 transition-colors cursor-pointer"
                        >
                            <Trash2 size={14} className="pointer-events-none"/>
                        </button>
                   </div>

                   {/* Status Label */}
                   <div className="absolute top-4 left-4 z-10">
                        {kit.ativo ? (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-green-50 text-green-700 border-green-200">
                                Ativo
                            </span>
                        ) : (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-slate-100 text-slate-500 border-slate-200">
                                Inativo
                            </span>
                        )}
                   </div>
                   
                   {/* Main Content */}
                   <div className="flex-1 p-6 pb-2 flex flex-col justify-center items-center text-center bg-gradient-to-b from-slate-50/50 to-white">
                       <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
                           <Package size={24} />
                       </div>
                       <h3 className="text-lg font-bold text-slate-900 w-full px-2 truncate">{kit.nome}</h3>
                       <p className="text-xs font-mono font-bold text-slate-500 mt-2 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                           {kit.codigoBraip}
                       </p>
                   </div>
                   
                   {/* Footer Stats */}
                   <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
                       <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide mb-1">Comissão Padrão</p>
                       <p className="text-xl font-bold text-slate-800">
                           {kit.comissaoFixa > 0 ? `R$ ${kit.comissaoFixa.toFixed(2)}` : `${kit.comissaoPercentual}%`}
                       </p>
                   </div>
               </div>
           ))}
       </div>

       {isModalOpen && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                       <h2 className="text-xl font-bold text-slate-900">{editingKit ? 'Editar Kit' : 'Novo Kit'}</h2>
                       <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500">
                           <X size={24} />
                       </button>
                   </div>
                   <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Produto</label>
                           <input 
                                type="text" required
                                value={nome} onChange={e => setNome(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                                placeholder="Kit 3 Meses"
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">Código Braip (Referência)</label>
                           <input 
                                type="text" required
                                value={codigoBraip} onChange={e => setCodigoBraip(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                                placeholder="K3M"
                           />
                       </div>
                       
                       <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                           <label className="block text-sm font-bold text-slate-700 mb-2">Regra de Comissão</label>
                           <div className="flex gap-4 mb-3">
                               <label className="flex items-center gap-2 cursor-pointer">
                                   <input 
                                    type="radio" 
                                    name="tipo" 
                                    checked={tipoComissao === 'percentual'} 
                                    onChange={() => setTipoComissao('percentual')}
                                    className="text-blue-600 focus:ring-blue-500"
                                   />
                                   <span className="text-sm text-slate-700">Percentual (%)</span>
                               </label>
                               <label className="flex items-center gap-2 cursor-pointer">
                                   <input 
                                    type="radio" 
                                    name="tipo" 
                                    checked={tipoComissao === 'fixo'} 
                                    onChange={() => setTipoComissao('fixo')}
                                    className="text-blue-600 focus:ring-blue-500"
                                   />
                                   <span className="text-sm text-slate-700">Valor Fixo (R$)</span>
                               </label>
                           </div>
                           <input 
                                type="number" required
                                value={valorComissao} onChange={e => setValorComissao(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                                placeholder={tipoComissao === 'fixo' ? "Ex: 50.00" : "Ex: 10"}
                           />
                       </div>

                       <div className="pt-2">
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                                Salvar Produto
                            </button>
                       </div>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};