export type UserRole = 'super_admin' | 'admin' | 'atendente';

export type SaleStatus = 'AGENDADO' | 'AGUARDANDO_PAGAMENTO' | 'PAGAMENTO_ATRASADO' | 'PAGO' | 'FRUSTRADO' | 'CANCELADA';

export type DiscountType = 'proporcional' | 'zerar' | 'nao_afeta';

export interface Client {
  id: string;
  name: string;
  documento: string; // CNPJ/CPF
  plan: 'trial' | 'pro' | 'enterprise';
  active: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId?: string; // Null for Super Admin, required for others
  avatar?: string;
}

export interface CommissionOverride {
  kitId: string;
  tipo: 'fixo' | 'percentual';
  valor: number;
}

export interface Atendente {
  id: string;
  userId: string; // Link to User table
  clientId: string; // Tenant ID
  nome: string;
  codigo: string; // e.g., ISA, ANA
  telefone: string;
  salarioMensal: number;
  ativo: boolean;
  comissoesPersonalizadas?: CommissionOverride[]; // Custom commission per kit
  metaMensal?: {
      quantidade: number;
      valor: number;
  };
  criativosAutorizados?: string[]; // IDs of Creatives this attendant is allowed to sell
}

export interface Kit {
  id: string;
  clientId?: string;
  nome: string;
  codigoBraip: string;
  comissaoFixa: number;
  comissaoPercentual: number;
  ativo?: boolean;
}

export interface Criativo {
  id: string;
  clientId?: string;
  nome: string; // e.g., VID30_DOR
  campanha: string;
  status: 'teste' | 'aprovado' | 'ruim';
}

export interface CreativeExpense {
  id: string;
  clientId?: string;
  criativoId: string;
  valor: number;
  data: string; // ISO Date
}

export interface Log {
  id: string;
  clientId?: string;
  usuarioNome: string; // Quem fez a ação
  acao: string; // "Alterou status", "Editou venda"
  detalhes: string; // "De AGENDADO para PAGO"
  data: string; // ISO Date
  vendaId?: string;
}

export interface Venda {
  id: string;
  clientId?: string;
  pedidoIdBraip: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteCpf: string;
  clienteEstado: string;
  atendenteId?: string; // FK (Optional because it might be unidentified)
  criativoId?: string; // FK
  kitId: string; // FK
  status: SaleStatus;
  dataAgendamento: string; // ISO Date
  dataPagamento?: string; // ISO Date
  valor: number;
  comissaoGerada: number;
  observacoes?: string;
  descontoValor: number;
  descontoTipo?: DiscountType;
  utmCampaign?: string;
  utmContent?: string;
  utmAtendente?: string;
  semIdentificacao: boolean; // Flag for missing UTMs
  historico?: Log[]; // History of changes
}

export interface Despesa {
  id: string;
  clientId?: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
}

export interface DashboardMetrics {
  totalFaturamento: number;
  totalComissoes: number;
  totalLiquido: number;
  totalDespesas: number;
  investimento: number; 
  roi: number;
  roas: number; // New ROAS metric
  
  // Counts
  countAgendado: number;
  countAguardando: number;
  countAtrasado: number; // New Metric
  countPago: number;
  countFrustrado: number;

  // Monetary Values per Status (New)
  valorAgendado: number;
  valorAguardando: number;
  valorAtrasado: number; // New Metric
  valorPago: number;
  valorFrustrado: number;

  projecaoMaxima: number; // Comissoes (Pagas + Pendentes)
  projecaoRealista: number;
  projecaoGanhosTotal: number; // Salario + Comissoes (Pagas + Pendentes)
  taxaConversao: number;
  taxaFrustracao: number;
}