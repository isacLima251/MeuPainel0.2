import { User, Atendente, Kit, Criativo, Venda, Despesa, Log, CreativeExpense } from '../types';

// --- CONFIGURAÇÃO INICIAL (SEEDS) ---
// Estes dados representam a configuração inicial do sistema.
// Para produção, apenas o usuário Admin deve existir inicialmente.

export const mockUsers: User[] = [
  { id: 'u1', name: 'Administrador', email: 'admin@rai.com', role: 'admin' },
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