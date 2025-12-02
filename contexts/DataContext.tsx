import React, { createContext, useContext, useState, useEffect } from 'react';
import { Venda, Atendente, Kit, Criativo, Despesa, User, DashboardMetrics, Log, SaleStatus, DiscountType, CreativeExpense, Client } from '../types';
import { mockAtendentes, mockKits, mockCriativos, mockUsers, mockVendasInitial, mockDespesas, mockCreativeExpenses, mockLogs, mockClients } from '../services/mockData';

interface DataContextType {
  sales: Venda[];
  atendentes: Atendente[];
  kits: Kit[];
  criativos: Criativo[];
  creativeExpenses: CreativeExpense[];
  despesas: Despesa[];
  users: User[];
  clients: Client[];
  logs: Log[];
  getMetrics: (atendenteId?: string, startDate?: Date, endDate?: Date) => DashboardMetrics;
  addSale: (sale: Venda) => void;
  updateSale: (id: string, updates: Partial<Venda>, modifiedBy: string) => void;
  addDespesa: (despesa: Despesa) => void;
  updateDespesa: (id: string, updates: Partial<Despesa>) => void;
  deleteDespesa: (id: string) => void;
  // Updated Signature for unified creation
  addAtendente: (atendenteData: Omit<Atendente, 'id' | 'userId' | 'clientId'>, loginData: {email: string, password: string}, clientId: string) => void;
  updateAtendente: (id: string, updates: Partial<Atendente>) => void;
  deleteAtendente: (id: string) => void;
  toggleAtendenteStatus: (id: string) => void;
  addKit: (kit: Kit) => void;
  updateKit: (id: string, updates: Partial<Kit>) => void;
  deleteKit: (id: string) => void;
  addCriativo: (criativo: Criativo) => void;
  updateCriativo: (id: string, updates: Partial<Criativo>) => void;
  deleteCriativo: (id: string) => void;
  addCreativeExpense: (expense: CreativeExpense) => void;
  deleteCreativeExpense: (id: string) => void;
  // Client Management
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  toggleClientStatus: (id: string) => void; // New function
  processBraipWebhook: (payload: any) => { success: boolean, message: string }; 
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize transactional data
  const [sales, setSales] = useState<Venda[]>(mockVendasInitial);
  const [logs, setLogs] = useState<Log[]>(mockLogs);
  const [creativeExpenses, setCreativeExpenses] = useState<CreativeExpense[]>(mockCreativeExpenses);
  const [despesas, setDespesas] = useState<Despesa[]>(mockDespesas);
  
  // Initialize configuration data
  const [atendentes, setAtendentes] = useState<Atendente[]>(mockAtendentes);
  const [kits, setKits] = useState<Kit[]>(mockKits);
  const [criativos, setCriativos] = useState<Criativo[]>(mockCriativos);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [clients, setClients] = useState<Client[]>(mockClients);
  
  const [isLoading, setIsLoading] = useState(false);

  // --- Helper: Add Log ---
  const addLog = (usuarioNome: string, acao: string, detalhes: string) => {
      const newLog: Log = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          usuarioNome,
          acao,
          detalhes,
          data: new Date().toISOString()
      };
      // In production: await api.post('/logs', newLog);
      setLogs(prev => [newLog, ...prev]);
  };

  const calculateCommission = (sale: Venda, kit: Kit): number => {
      if (sale.status !== 'PAGO') return 0;

      let baseCommission = 0;

      const attendant = atendentes.find(a => a.id === sale.atendenteId);
      const override = attendant?.comissoesPersonalizadas?.find(c => c.kitId === kit.id);

      if (override) {
          if (override.tipo === 'fixo') {
              baseCommission = override.valor;
          } else {
              baseCommission = sale.valor * (override.valor / 100);
          }
      } else {
          if (kit.comissaoFixa > 0) {
              baseCommission = kit.comissaoFixa;
          } else {
              baseCommission = sale.valor * (kit.comissaoPercentual / 100);
          }
      }

      if (sale.descontoValor > 0 && sale.descontoTipo) {
          if (sale.descontoTipo === 'zerar') {
              return 0;
          } else if (sale.descontoTipo === 'proporcional') {
              const reduction = sale.descontoValor * (baseCommission / sale.valor);
              return Math.max(0, baseCommission - reduction);
          }
      }

      return baseCommission;
  };

  const getMetrics = (atendenteId?: string, startDate?: Date, endDate?: Date): DashboardMetrics => {
    // CRITICAL: Filter out 'CANCELADA' sales immediately. They should not exist for metrics.
    let relevantSales = sales.filter(s => s.status !== 'CANCELADA');
    
    let relevantExpenses = creativeExpenses;
    let relevantDespesas = despesas;
    let currentAttendantSalary = 0;

    // Filter by Specific Attendant
    if (atendenteId && atendenteId !== 'all') {
        relevantSales = relevantSales.filter(s => s.atendenteId === atendenteId);
        const att = atendentes.find(a => a.id === atendenteId);
        if (att) currentAttendantSalary = att.salarioMensal;
    }

    // Filter by Date Range
    if (startDate && endDate) {
        relevantSales = relevantSales.filter(s => {
            const saleDate = new Date(s.dataAgendamento);
            return saleDate >= startDate && saleDate <= endDate;
        });

        // Only filter expenses if viewing global metrics or irrelevant to attendant view logic
        if (!atendenteId || atendenteId === 'all') {
            relevantExpenses = creativeExpenses.filter(e => {
                const expDate = new Date(e.data);
                return expDate >= startDate && expDate <= endDate;
            });
            relevantDespesas = despesas.filter(d => {
                const despDate = new Date(d.data);
                return despDate >= startDate && despDate <= endDate;
            });
        }
    }

    const pagos = relevantSales.filter(s => s.status === 'PAGO');
    const frustrados = relevantSales.filter(s => s.status === 'FRUSTRADO');
    const agendados = relevantSales.filter(s => s.status === 'AGENDADO');
    const aguardando = relevantSales.filter(s => s.status === 'AGUARDANDO_PAGAMENTO');
    const atrasados = relevantSales.filter(s => s.status === 'PAGAMENTO_ATRASADO');

    const countPago = pagos.length;
    const countFrustrado = frustrados.length;
    const countAgendado = agendados.length;
    const countAguardando = aguardando.length;
    const countAtrasado = atrasados.length;

    const valorPago = pagos.reduce((acc, curr) => acc + curr.valor, 0);
    const valorFrustrado = frustrados.reduce((acc, curr) => acc + curr.valor, 0);
    const valorAgendado = agendados.reduce((acc, curr) => acc + curr.valor, 0);
    const valorAguardando = aguardando.reduce((acc, curr) => acc + curr.valor, 0);
    const valorAtrasado = atrasados.reduce((acc, curr) => acc + curr.valor, 0);

    const totalFaturamento = valorPago;
    const totalComissoes = pagos.reduce((acc, curr) => acc + curr.comissaoGerada, 0);
    
    // Global vs Attendant Metrics Logic
    let totalDespesas = 0;
    let investimento = 0;
    let totalLiquido = 0;

    // Calculate Fixed Salaries (Payroll)
    const totalSalarios = atendentes
        .filter(a => a.ativo) // Only active employees count towards cost
        .reduce((acc, curr) => acc + curr.salarioMensal, 0);

    if (atendenteId && atendenteId !== 'all') {
        // Attendant View: Focus on Performance Contribution
        // Profit = Revenue - Commissions (We do not subtract global overhead or salaries here for the individual view)
        totalLiquido = totalFaturamento - totalComissoes;
        
        // Expenses/Investment are 0 for specific attendant view unless we track per-attendant ads spend
        totalDespesas = 0;
        investimento = 0;
    } else {
        // Global View: Deduct everything to show Net Company Profit
        
        // 1. Operational Expenses (Tools, Rent, etc)
        const operationalExpenses = relevantDespesas.reduce((acc, curr) => acc + curr.valor, 0);
        
        // 2. Ads Investment
        investimento = relevantExpenses.reduce((acc, curr) => acc + curr.valor, 0);

        // 3. Total Expenses displayed on Dashboard = Op Expenses + Salaries
        // This ensures the "Despesas Operacionais" card reflects the true fixed cost
        totalDespesas = operationalExpenses + totalSalarios;

        // 4. Net Profit Calculation
        // Formula: Revenue - (Op Expenses + Salaries) - Commissions - Investment
        totalLiquido = totalFaturamento - totalDespesas - totalComissoes - investimento;
    }

    const roi = investimento > 0 ? ((totalFaturamento - investimento) / investimento) * 100 : 0;
    const roas = investimento > 0 ? totalFaturamento / investimento : 0;

    // Frustration rate denominator must only include finalized statuses (Pago + Frustrado)
    const totalFinished = countPago + countFrustrado;
    const taxaConversao = totalFinished > 0 ? countPago / totalFinished : 0;
    const taxaFrustracao = totalFinished > 0 ? countFrustrado / totalFinished : 0;

    // Calculates potential commission from pending sales
    // Included 'PAGAMENTO_ATRASADO' as potential since it can still be recovered
    const projecaoMaxima = relevantSales.reduce((acc, s) => {
        if (s.status === 'PAGO') return acc + s.comissaoGerada; 
        
        if (s.status === 'AGENDADO' || s.status === 'AGUARDANDO_PAGAMENTO' || s.status === 'PAGAMENTO_ATRASADO') {
            const kit = kits.find(k => k.id === s.kitId);
            if (!kit) return acc;
            
            let potential = 0;
            const attendant = atendentes.find(a => a.id === s.atendenteId);
            const override = attendant?.comissoesPersonalizadas?.find(c => c.kitId === kit.id);

            if (override) {
                 if (override.tipo === 'fixo') potential = override.valor;
                 else potential = s.valor * (override.valor / 100);
            } else {
                 if (kit.comissaoFixa > 0) potential = kit.comissaoFixa;
                 else potential = s.valor * (kit.comissaoPercentual / 100);
            }
            return acc + potential;
        }
        return acc;
    }, 0);

    const projecaoRealista = projecaoMaxima * taxaConversao;
    const projecaoGanhosTotal = currentAttendantSalary + projecaoMaxima;

    return {
      totalFaturamento,
      totalComissoes,
      totalLiquido,
      totalDespesas,
      investimento,
      roi,
      roas,
      countAgendado,
      countAguardando,
      countAtrasado,
      countPago,
      countFrustrado,
      valorAgendado,
      valorAguardando,
      valorAtrasado,
      valorPago,
      valorFrustrado,
      projecaoMaxima,
      projecaoRealista,
      projecaoGanhosTotal,
      taxaConversao,
      taxaFrustracao
    };
  };

  const addSale = (sale: Venda) => {
    // In production: await api.post('/sales', sale);
    setSales(prev => [sale, ...prev]);
    addLog('Sistema/Webhook', 'Criação', 'Venda importada via Postback');
  };

  const updateSale = (id: string, updates: Partial<Venda>, modifiedBy: string) => {
    // In production: await api.put(`/sales/${id}`, updates);
    setSales(prev => prev.map(s => {
      if (s.id !== id) return s;

      const updatedSale = { ...s, ...updates };
      
      if (updatedSale.status === 'PAGO' || updatedSale.status === 'FRUSTRADO') {
          const kit = kits.find(k => k.id === updatedSale.kitId);
          if (kit) {
              updatedSale.comissaoGerada = calculateCommission(updatedSale, kit);
          }
      }
      
      // Zero commission if status is CANCELADA
      if (updatedSale.status === 'CANCELADA') {
          updatedSale.comissaoGerada = 0;
      }

      if (updatedSale.status === 'PAGO' && !s.dataPagamento) {
          updatedSale.dataPagamento = new Date().toISOString();
      }

      if (s.semIdentificacao && updatedSale.atendenteId && updatedSale.criativoId) {
          updatedSale.semIdentificacao = false;
      }

      const changes = Object.keys(updates).map(k => `${k}: ${s[k as keyof Venda]} -> ${updates[k as keyof Venda]}`).join(', ');
      addLog(modifiedBy, 'Edição Manual', changes);

      return updatedSale;
    }));
  };

  const processBraipWebhook = (payload: any): { success: boolean, message: string } => {
    const { order_id, status, product, value, customer, utm_campaign, utm_content, utm_atendente } = payload;
    
    // Safety check for empty configuration
    if (kits.length === 0) {
        return { success: false, message: 'ERRO CRÍTICO: Nenhum Kit/Produto cadastrado no sistema.' };
    }

    const atendente = atendentes.find(a => a.codigo === utm_atendente?.toUpperCase());
    const criativo = criativos.find(c => c.nome === utm_content?.toUpperCase());
    
    const kit = kits.find(k => k.nome === product) || kits[0];

    // Normalize Status from Braip to Internal Status
    let internalStatus: SaleStatus = 'AGUARDANDO_PAGAMENTO'; // Default fallback
    const upperStatus = status.toUpperCase();
    
    if (upperStatus === 'PAGO' || upperStatus === 'APPROVED' || upperStatus === 'COMPLETED') internalStatus = 'PAGO';
    else if (upperStatus === 'AGUARDANDO_PAGAMENTO' || upperStatus === 'PENDING' || upperStatus === 'WAITING_PAYMENT') internalStatus = 'AGUARDANDO_PAGAMENTO';
    else if (upperStatus === 'FRUSTRADA' || upperStatus === 'REFUSED') internalStatus = 'FRUSTRADO';
    else if (upperStatus === 'CANCELADA' || upperStatus === 'CANCELED') internalStatus = 'CANCELADA';
    else if (upperStatus === 'AGENDADO' || upperStatus === 'SCHEDULED') internalStatus = 'AGENDADO';
    else internalStatus = status as SaleStatus; // Try direct mapping

    // Initial ID check
    let isUnidentified = !atendente || !criativo || !utm_campaign;

    // SECURITY CHECK: Attendant Authorization
    if (atendente && criativo) {
        if (atendente.criativosAutorizados && atendente.criativosAutorizados.length > 0) {
            const isAuthorized = atendente.criativosAutorizados.includes(criativo.id);
            if (!isAuthorized) {
                isUnidentified = true;
                addLog('Webhook/Security', 'Alerta', `Atendente ${atendente.codigo} não autorizado para criativo ${criativo.nome}. Venda marcada sem ID.`);
            }
        }
    }

    const existingSale = sales.find(s => s.pedidoIdBraip === order_id);

    if (existingSale) {
        updateSale(existingSale.id, {
            status: internalStatus,
            valor: value
        }, 'Webhook/Braip');
        return { success: true, message: `Venda ${order_id} atualizada para ${internalStatus}` };
    } else {
        const newSale: Venda = {
            id: `v-braip-${Date.now()}`,
            pedidoIdBraip: order_id,
            clienteNome: customer.name,
            clienteTelefone: customer.phone,
            clienteCpf: customer.cpf,
            clienteEstado: customer.state,
            atendenteId: atendente?.id,
            criativoId: criativo?.id,
            kitId: kit.id,
            status: internalStatus,
            dataAgendamento: new Date().toISOString(),
            valor: value,
            comissaoGerada: 0,
            descontoValor: 0,
            semIdentificacao: isUnidentified,
            utmCampaign: utm_campaign,
            utmContent: utm_content,
            utmAtendente: utm_atendente,
            historico: [{
                id: `log-braip-${Date.now()}`,
                usuarioNome: 'Webhook/Braip',
                acao: 'Postback',
                detalhes: 'Venda criada via integração',
                data: new Date().toISOString()
            }]
        };

        if (internalStatus === 'PAGO') {
            newSale.comissaoGerada = calculateCommission(newSale, kit);
            newSale.dataPagamento = new Date().toISOString();
        }

        addSale(newSale);
        return { success: true, message: isUnidentified ? `Venda ${order_id} criada SEM IDENTIFICAÇÃO (UTMs faltantes ou permissão negada)` : `Venda ${order_id} criada com sucesso` };
    }
  };

  const addDespesa = (despesa: Despesa) => {
      // In production: await api.post('/expenses', despesa);
      setDespesas(prev => [despesa, ...prev]);
      addLog('Admin', 'Criação', `Nova despesa: ${despesa.descricao} (R$ ${despesa.valor})`);
  };

  const updateDespesa = (id: string, updates: Partial<Despesa>) => {
    // In production: await api.put(`/expenses/${id}`, updates);
    setDespesas(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    addLog('Admin', 'Edição', `Despesa atualizada: ${id}`);
  };

  const deleteDespesa = (id: string) => {
      // In production: await api.delete(`/expenses/${id}`);
      const toDelete = despesas.find(d => d.id === id);
      if (toDelete) {
          addLog('Admin', 'Exclusão', `Despesa removida: ${toDelete.descricao}`);
          setDespesas(prev => prev.filter(d => d.id !== id));
      }
  };

  // UNIFIED CREATION: Creates Atendente AND User
  const addAtendente = (atendenteData: Omit<Atendente, 'id' | 'userId' | 'clientId'>, loginData: {email: string, password: string}, clientId: string) => {
    const userId = `u-${Date.now()}`;
    const atendenteId = `att-${Date.now()}`;

    // 1. Create User Login
    const newUser: User = {
        id: userId,
        name: atendenteData.nome,
        email: loginData.email,
        role: 'atendente',
        clientId: clientId
    };

    // 2. Create Atendente Record
    const newAtendente: Atendente = {
        id: atendenteId,
        userId: userId,
        clientId: clientId,
        ...atendenteData
    };

    setUsers(prev => [...prev, newUser]);
    setAtendentes(prev => [...prev, newAtendente]);

    addLog('Admin', 'Criação', `Atendente e Login criado: ${atendenteData.nome} (${loginData.email})`);
  };

  const updateAtendente = (id: string, updates: Partial<Atendente>) => {
    setAtendentes(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    addLog('Admin', 'Edição', `Atendente atualizado: ${id}`);
  };

  const deleteAtendente = (id: string) => {
    const atendente = atendentes.find(a => a.id === id);
    if(atendente) {
        addLog('Admin', 'Exclusão', `Atendente removido: ${atendente.nome}`);
        setAtendentes(prev => prev.filter(a => a.id !== id));
        setUsers(prev => prev.filter(u => u.id !== atendente.userId)); // Remove login access
    }
  };

  const toggleAtendenteStatus = (id: string) => {
      setAtendentes(prev => prev.map(a => a.id === id ? { ...a, ativo: !a.ativo } : a));
  };

  const addKit = (kit: Kit) => {
    setKits(prev => [...prev, kit]);
    addLog('Admin', 'Criação', `Kit adicionado: ${kit.nome}`);
  };

  const updateKit = (id: string, updates: Partial<Kit>) => {
    setKits(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k));
    addLog('Admin', 'Edição', `Kit atualizado: ${id}`);
  };

  const deleteKit = (id: string) => {
    const kit = kits.find(k => k.id === id);
    if (kit) {
        addLog('Admin', 'Exclusão', `Kit removido: ${kit.nome}`);
        setKits(prev => prev.filter(k => k.id !== id));
    }
  };

  const addCriativo = (criativo: Criativo) => {
    setCriativos(prev => [...prev, criativo]);
    addLog('Admin', 'Criação', `Criativo adicionado: ${criativo.nome}`);
  };

  const updateCriativo = (id: string, updates: Partial<Criativo>) => {
    setCriativos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    addLog('Admin', 'Edição', `Criativo atualizado: ${id}`);
  };

  const deleteCriativo = (id: string) => {
    const criativo = criativos.find(c => c.id === id);
    if(criativo) {
        addLog('Admin', 'Exclusão', `Criativo removido: ${criativo.nome}`);
        setCriativos(prev => prev.filter(c => c.id !== id));
    }
  };

  const addCreativeExpense = (expense: CreativeExpense) => {
    setCreativeExpenses(prev => [...prev, expense]);
    addLog('Admin', 'Custo', `Investimento lançado em criativo: R$ ${expense.valor}`);
  };

  const deleteCreativeExpense = (id: string) => {
      const expense = creativeExpenses.find(e => e.id === id);
      if (expense) {
        addLog('Admin', 'Exclusão', `Investimento removido de criativo: R$ ${expense.valor}`);
        setCreativeExpenses(prev => prev.filter(e => e.id !== id));
      }
  };

  // --- CLIENTS MANAGEMENT ---
  const addClient = (client: Client) => {
      setClients(prev => [...prev, client]);
      addLog('Super Admin', 'Criação', `Novo Cliente SaaS: ${client.name}`);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      addLog('Super Admin', 'Edição', `Cliente atualizado: ${id}`);
  };

  const toggleClientStatus = (id: string) => {
      setClients(prev => prev.map(c => {
          if (c.id === id) {
              const newStatus = !c.active;
              addLog('Super Admin', 'Alteração Status', `Cliente ${c.name} agora está ${newStatus ? 'ATIVO' : 'INATIVO'}`);
              return { ...c, active: newStatus };
          }
          return c;
      }));
  };

  return (
    <DataContext.Provider value={{
      sales, atendentes, kits, criativos, creativeExpenses, despesas, users, logs, clients,
      getMetrics,
      addSale, updateSale, addDespesa, updateDespesa, deleteDespesa,
      addAtendente, updateAtendente, deleteAtendente, toggleAtendenteStatus,
      addKit, updateKit, deleteKit,
      addCriativo, updateCriativo, deleteCriativo,
      addCreativeExpense, deleteCreativeExpense,
      addClient, updateClient, toggleClientStatus,
      processBraipWebhook,
      isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};