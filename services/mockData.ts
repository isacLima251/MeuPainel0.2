import { User, Atendente, Kit, Criativo, Venda, Despesa, Log, CreativeExpense } from '../types';

// --- CONFIGURAÇÃO INICIAL (SEEDS) ---
// Estes dados representam configurações que geralmente já existem no sistema
// ou são criadas no primeiro setup.

export const mockUsers: User[] = [
  { id: 'u1', name: 'Administrador Silva', email: 'admin@rai.com', role: 'admin' },
  { id: 'u2', name: 'Isabela Atendente', email: 'isa@rai.com', role: 'atendente' },
];

export const mockKits: Kit[] = [
  { id: 'k1', nome: 'Kit 3 Meses', codigoBraip: 'K3M', comissaoFixa: 0, comissaoPercentual: 10, ativo: true },
  { id: 'k2', nome: 'Kit 5 Meses', codigoBraip: 'K5M', comissaoFixa: 0, comissaoPercentual: 15, ativo: true },
  { id: 'k3', nome: 'Kit 12 Meses', codigoBraip: 'K12M', comissaoFixa: 50, comissaoPercentual: 0, ativo: true },
];

// Dados iniciais mínimos para que o sistema seja testável (Login e Webhook)
// Em produção, isso viria do banco de dados vazio ou populado via Admin.
export const mockAtendentes: Atendente[] = [
  { 
      id: 'a1', userId: 'u2', nome: 'Isabela', codigo: 'ISA', telefone: '11999999999', salarioMensal: 1500, ativo: true,
      metaMensal: { quantidade: 50, valor: 15000 },
      criativosAutorizados: [] 
  }
];

export const mockCriativos: Criativo[] = [
    // Deixando um exemplo para teste de webhook, mas pode ser removido pelo Admin
    { id: 'c1', nome: 'VID01_DOR_COSTAS', campanha: 'Campanha Frio', status: 'aprovado' }
];

// --- DADOS TRANSACIONAIS (LIMPOS PARA BACKEND) ---
// Estas listas devem ser populadas pelo banco de dados real.

export const mockVendasInitial: Venda[] = [];

export const mockDespesas: Despesa[] = [];

export const mockCreativeExpenses: CreativeExpense[] = [];

export const mockLogs: Log[] = [];
