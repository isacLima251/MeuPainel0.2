import { User, Atendente, Kit, Criativo, Venda, Despesa, Log, CreativeExpense, Client } from '../types';

// --- CONFIGURAÇÃO INICIAL (SEEDS) ---

export const mockClients: Client[] = [
  { id: 'c1', name: 'Empresa Exemplo LTDA', documento: '00.000.000/0001-00', plan: 'pro', active: true, createdAt: new Date().toISOString() }
];

export const mockUsers: User[] = [
  { id: 'u1', name: 'Super Admin', email: 'super@rai.com', role: 'super_admin' },
  { id: 'u2', name: 'Admin Empresa', email: 'admin@rai.com', role: 'admin', clientId: 'c1' },
];

// Listas vazias aguardando cadastro via interface ou banco de dados
export const mockKits: Kit[] = [];

export const mockAtendentes: Atendente[] = [];

export const mockCriativos: Criativo[] = [];

// --- DADOS TRANSACIONAIS (DB) ---
export const mockVendasInitial: Venda[] = [];
export const mockDespesas: Despesa[] = [];
export const mockCreativeExpenses: CreativeExpense[] = [];
export const mockLogs: Log[] = [];