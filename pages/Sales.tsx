import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../App';
import { 
  Filter, Plus, AlertTriangle, Edit2, X, Save, Search, 
  ChevronDown, ChevronUp, Megaphone, Tag, History, Clock, Webhook 
} from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { Venda, SaleStatus, DiscountType } from '../types';

export const Sales: React.FC = () => {
  const { sales, updateSale, processBraipWebhook, atendentes, kits, criativos } = useData();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnidentified, setShowUnidentified] = useState(false);
  
  // State for Expanded Rows (Details)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Edit Modal State
  const [editingSale, setEditingSale] = useState<Venda | null>(null);

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      // Logic 5 - Unidentified Filter
      if (showUnidentified) return s.semIdentificacao;
      if (s.semIdentificacao) return false; 

      // Role filter: Attendant only sees their own
      if (!isAdmin && user) {
          // Find attendant profile for this user
          const myAttendant = atendentes.find(a => a.userId === user.id);
          if (myAttendant && s.atendenteId !== myAttendant.id) return false;
      }

      const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
      const matchesSearch = s.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.pedidoIdBraip.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [sales, filterStatus, searchTerm, showUnidentified, isAdmin, user, atendentes]);

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setExpandedRows(newSet);
  };

  const handleEditSave = () => {
      if (!editingSale || !user) return;
      
      const { id, ...updates } = editingSale;
      updateSale(id, updates, user.name);
      setEditingSale(null);
  };

  const simulatePostback = () => {
      const orderId = `BRAIP-${Math.floor(Math.random() * 90000) + 10000}`;
      const isWrong = Math.random() > 0.7; // 30% chance of unidentified sale simulation
      
      // Simulating Raw JSON Payload from Braip
      const braipPayload = {
        order_id: orderId,
        status: "AGENDADO",
        product: "Kit 3 Meses", // Needs to match a Kit name
        value: 197.00,
        customer: {
            name: `Cliente Webhook ${Math.floor(Math.random() * 100)}`,
            phone: "11999990000",
            cpf: "123.456.789-00",
            state: "SP"
        },
        // UTMs (key for identification)
        utm_campaign: "Campanha Verão",
        utm_content: isWrong ? "CODIGO_ERRADO" : "VID01_DOR_COSTAS", // Needs to match Creative Name
        utm_atendente: isWrong ? "INVALIDO" : "ISA" // Needs to match Attendant Code
      };

      const result = processBraipWebhook(braipPayload);
      alert(`Simulação Postback:\n\nPayload Enviado: ${JSON.stringify(braipPayload, null, 2)}\n\nResultado: ${result.message}`);
  };

  // Configuration for Filter Pills
  const filterOptions = [
      { id: 'ALL', label: 'Todos', activeClass: 'bg-slate-800 text-white border-slate-800 ring-2 ring-slate-200' },
      { id: 'AGENDADO', label: 'Agendado', activeClass: 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200' },
      { id: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando Pag.', activeClass: 'bg-yellow-500 text-white border-yellow-500 ring-2 ring-yellow-200' },
      { id: 'PAGO', label: 'Pago', activeClass: 'bg-green-600 text-white border-green-600 ring-2 ring-green-200' },
      { id: 'FRUSTRADO', label: 'Frustrado', activeClass: 'bg-red-600 text-white border-red-600 ring-2 ring-red-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Vendas</h1>
          <p className="text-slate-500">
              {showUnidentified ? "Corrija vendas que chegaram sem UTMs." : "Acompanhe e atualize o status dos seus pedidos."}
          </p>
        </div>
        <div className="flex gap-2">
            {isAdmin && (
                <button 
                onClick={() => setShowUnidentified(!showUnidentified)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border
                    ${showUnidentified ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-white text-slate-700 border-slate-300'}`}>
                <AlertTriangle size={16} />
                Sem Identificação
                </button>
            )}
            
            <button 
                onClick={simulatePostback}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-slate-200">
                <Webhook size={16} />
                Simular Webhook Braip
            </button>
        </div>
      </div>

      {/* Filters Area */}
      {!showUnidentified && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar por nome do cliente ou ID do pedido..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mr-2">
                    <Filter size={16} />
                    <span>Filtrar:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setFilterStatus(option.id)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                filterStatus === option.id
                                    ? option.activeClass
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
          </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4 w-10"></th> {/* Expand Icon Column */}
                        <th className="px-6 py-4 font-semibold">ID / Data</th>
                        <th className="px-6 py-4 font-semibold">Cliente</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Atendente</th>
                        <th className="px-6 py-4 font-semibold">Valor / Comissão</th>
                        <th className="px-6 py-4 font-semibold text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredSales.map((sale) => {
                        const isExpanded = expandedRows.has(sale.id);
                        const creative = criativos.find(c => c.id === sale.criativoId);
                        
                        // Row styling for unidentified sales
                        const rowBackground = sale.semIdentificacao 
                            ? (isExpanded ? 'bg-orange-100' : 'bg-orange-50 hover:bg-orange-100 border-l-4 border-l-orange-400')
                            : (isExpanded ? 'bg-blue-50/50' : 'hover:bg-slate-50 group');

                        return (
                        <React.Fragment key={sale.id}>
                            <tr className={`transition-colors ${rowBackground}`}>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => toggleRow(sale.id)}
                                        className={`p-1 rounded-full transition-colors ${isExpanded ? 'bg-blue-200 text-blue-700' : 'text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm font-mono text-slate-500">{sale.pedidoIdBraip}</div>
                                        {sale.semIdentificacao && (
                                            <div title="Venda sem Identificação (Faltam UTMs)" className="text-orange-500 animate-pulse">
                                                <AlertTriangle size={14} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-400">{new Date(sale.dataAgendamento).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-slate-900">{sale.clienteNome}</div>
                                    <div className="text-xs text-slate-400">{sale.clienteTelefone}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[sale.status]}`}>
                                        {STATUS_LABELS[sale.status]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {sale.atendenteId ? (
                                        atendentes.find(a => a.id === sale.atendenteId)?.nome
                                    ) : (
                                        <span className="text-red-500 font-bold flex items-center gap-1">
                                            <AlertTriangle size={12}/> Não identificado
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-900 font-medium">R$ {sale.valor.toFixed(2)}</div>
                                    <div className="text-xs text-slate-500">
                                        Comissão: {sale.comissaoGerada > 0 ? `R$ ${sale.comissaoGerada.toFixed(2)}` : '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {isAdmin ? (
                                        <button 
                                            onClick={() => setEditingSale(sale)}
                                            className="text-slate-400 hover:text-blue-600 p-2 rounded hover:bg-slate-100 transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                    ) : (
                                        <div className="flex justify-end gap-2">
                                            {/* Attendant View Actions (Read Only Mode Trigger) */}
                                            <button 
                                                onClick={() => setEditingSale(sale)}
                                                className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1.5 rounded border border-slate-200 flex items-center gap-1"
                                            >
                                                Ver Detalhes
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                            
                            {/* EXPANDED DETAILS ROW */}
                            {isExpanded && (
                                <tr className="bg-slate-50/80">
                                    <td colSpan={7} className="px-6 py-4 border-b border-blue-100/50 shadow-inner">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200">
                                            
                                            {/* Section 1: Creative & Marketing */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                                    <Megaphone size={14} /> Detalhes do Criativo
                                                </h4>
                                                <div className="bg-white p-3 rounded-lg border border-slate-200">
                                                    <p className="text-sm font-medium text-slate-800">
                                                        {creative ? creative.nome : <span className="text-red-400 italic">Criativo não vinculado</span>}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Campanha: <span className="font-mono text-slate-600">{sale.utmCampaign || '-'}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Section 2: Financial & Discount */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                                    <Tag size={14} /> Financeiro
                                                </h4>
                                                <div className="bg-white p-3 rounded-lg border border-slate-200">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs text-slate-500">Valor Bruto:</span>
                                                        <span className="text-sm font-bold">R$ {sale.valor.toFixed(2)}</span>
                                                    </div>
                                                    {sale.descontoValor > 0 && (
                                                        <div className="flex justify-between items-center text-red-600">
                                                            <span className="text-xs">Desconto Aplicado:</span>
                                                            <span className="text-sm font-bold">- R$ {sale.descontoValor.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    <div className="border-t border-slate-100 my-2"></div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-slate-500">Comissão Final:</span>
                                                        <span className="text-sm font-bold text-green-600">
                                                            R$ {sale.comissaoGerada.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Section 3: History Log */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                                    <History size={14} /> Histórico de Alterações
                                                </h4>
                                                <div className="bg-white p-3 rounded-lg border border-slate-200 max-h-32 overflow-y-auto custom-scrollbar">
                                                    {sale.historico && sale.historico.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {sale.historico.map((log, idx) => (
                                                                <div key={idx} className="flex gap-2 items-start relative">
                                                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></div>
                                                                    <div>
                                                                        <p className="text-xs text-slate-800 font-medium">
                                                                            {log.acao} <span className="text-slate-400 font-normal">por {log.usuarioNome}</span>
                                                                        </p>
                                                                        <p className="text-[10px] text-slate-500">{log.detalhes}</p>
                                                                        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                                                                            <Clock size={10} /> {new Date(log.data).toLocaleString('pt-BR')}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-400 italic">Sem histórico registrado.</p>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    )})}
                    {filteredSales.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                Nenhuma venda encontrada.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Logic 6 - Manual Edit Modal */}
      {editingSale && isAdmin && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-slate-900">Editar Venda: {editingSale.pedidoIdBraip}</h2>
                      <button onClick={() => setEditingSale(null)} className="text-slate-400 hover:text-slate-600">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                              <select 
                                  value={editingSale.status}
                                  onChange={(e) => setEditingSale({...editingSale, status: e.target.value as SaleStatus})}
                                  className="w-full p-2 border border-slate-300 rounded-lg"
                              >
                                  <option value="AGENDADO">Agendado</option>
                                  <option value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</option>
                                  <option value="PAGO">Pago</option>
                                  <option value="FRUSTRADO">Frustrado</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Atendente</label>
                              <select 
                                  value={editingSale.atendenteId || ''}
                                  onChange={(e) => setEditingSale({...editingSale, atendenteId: e.target.value})}
                                  className="w-full p-2 border border-slate-300 rounded-lg"
                              >
                                  <option value="">Selecione...</option>
                                  {atendentes.map(a => (
                                      <option key={a.id} value={a.id}>{a.nome} ({a.codigo})</option>
                                  ))}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Criativo</label>
                              <select 
                                  value={editingSale.criativoId || ''}
                                  onChange={(e) => setEditingSale({...editingSale, criativoId: e.target.value})}
                                  className="w-full p-2 border border-slate-300 rounded-lg"
                              >
                                   <option value="">Selecione...</option>
                                  {criativos.map(c => (
                                      <option key={c.id} value={c.id}>{c.nome}</option>
                                  ))}
                              </select>
                          </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Kit</label>
                              <select 
                                  value={editingSale.kitId}
                                  onChange={(e) => setEditingSale({...editingSale, kitId: e.target.value})}
                                  className="w-full p-2 border border-slate-300 rounded-lg"
                              >
                                  {kits.map(k => (
                                      <option key={k.id} value={k.id}>{k.nome}</option>
                                  ))}
                              </select>
                          </div>
                      </div>
                      
                      {/* Logic 2.2 - Discount Area */}
                      <div className="border-t border-slate-100 pt-4">
                          <h3 className="text-sm font-bold text-slate-900 mb-3">Financeiro & Descontos</h3>
                          <div className="grid grid-cols-3 gap-4">
                              <div>
                                  <label className="block text-xs font-medium text-slate-500 mb-1">Valor Venda (R$)</label>
                                  <input 
                                    type="number"
                                    value={editingSale.valor}
                                    onChange={(e) => setEditingSale({...editingSale, valor: parseFloat(e.target.value)})}
                                    className="w-full p-2 border border-slate-300 rounded-lg"
                                  />
                              </div>
                               <div>
                                  <label className="block text-xs font-medium text-slate-500 mb-1">Valor Desconto (R$)</label>
                                  <input 
                                    type="number"
                                    value={editingSale.descontoValor}
                                    onChange={(e) => setEditingSale({...editingSale, descontoValor: parseFloat(e.target.value)})}
                                    className="w-full p-2 border border-slate-300 rounded-lg"
                                  />
                              </div>
                               <div>
                                  <label className="block text-xs font-medium text-slate-500 mb-1">Tipo Desconto</label>
                                  <select 
                                      value={editingSale.descontoTipo || 'nao_afeta'}
                                      onChange={(e) => setEditingSale({...editingSale, descontoTipo: e.target.value as DiscountType})}
                                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                                  >
                                      <option value="nao_afeta">Não Afeta Comissão</option>
                                      <option value="proporcional">Proporcional</option>
                                      <option value="zerar">Zerar Comissão</option>
                                  </select>
                              </div>
                          </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                          <textarea 
                              value={editingSale.observacoes || ''}
                              onChange={(e) => setEditingSale({...editingSale, observacoes: e.target.value})}
                              rows={3}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                              placeholder="Histórico de conversas..."
                          />
                      </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                      <button 
                          onClick={() => setEditingSale(null)}
                          className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">
                          Cancelar
                      </button>
                      <button 
                          onClick={handleEditSave}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                          <Save size={18} />
                          Salvar Alterações
                      </button>
                  </div>
              </div>
          </div>
      )}
      
      {/* View Only Modal for Attendants */}
      {editingSale && !isAdmin && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-slate-900">Detalhes do Pedido</h2>
                      <button onClick={() => setEditingSale(null)} className="text-slate-400 hover:text-slate-600">
                          <X size={24} />
                      </button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex justify-between mb-2">
                              <span className="text-slate-500 text-sm">Cliente</span>
                              <span className="font-bold text-slate-900">{editingSale.clienteNome}</span>
                          </div>
                           <div className="flex justify-between mb-2">
                              <span className="text-slate-500 text-sm">Status Atual</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${STATUS_COLORS[editingSale.status]}`}>
                                  {STATUS_LABELS[editingSale.status]}
                              </span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-slate-500 text-sm">Telefone</span>
                              <span className="font-mono text-slate-900">{editingSale.clienteTelefone}</span>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                          <textarea 
                              disabled
                              value={editingSale.observacoes || 'Nenhuma observação registrada.'}
                              rows={4}
                              className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
                          />
                      </div>
                      <div className="text-xs text-slate-400 text-center pt-2">
                          Para alterações de status ou dados, contate o administrador.
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};