import { User, Atendente, Kit, Criativo, Venda, Despesa, Log, CreativeExpense } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Administrador Silva', email: 'admin@rai.com', role: 'admin' },
  { id: 'u2', name: 'Isabela Atendente', email: 'isa@rai.com', role: 'atendente' },
  { id: 'u3', name: 'Ana Atendente', email: 'ana@rai.com', role: 'atendente' },
];

export const mockAtendentes: Atendente[] = [
  { id: 'a1', userId: 'u2', nome: 'Isabela', codigo: 'ISA', telefone: '11999999999', salarioMensal: 1500, ativo: true },
  { id: 'a2', userId: 'u3', nome: 'Ana', codigo: 'ANA', telefone: '11988888888', salarioMensal: 1500, ativo: true },
];

export const mockKits: Kit[] = [
  { id: 'k1', nome: 'Kit 3 Meses', codigoBraip: 'K3M', comissaoFixa: 0, comissaoPercentual: 10 },
  { id: 'k2', nome: 'Kit 5 Meses', codigoBraip: 'K5M', comissaoFixa: 0, comissaoPercentual: 15 },
  { id: 'k3', nome: 'Kit 12 Meses', codigoBraip: 'K12M', comissaoFixa: 50, comissaoPercentual: 0 },
];

export const mockCriativos: Criativo[] = [
  { id: 'c1', nome: 'VID01_DOR_COSTAS', campanha: 'Campanha Frio', status: 'aprovado' },
  { id: 'c2', nome: 'IMG05_ANTES_DEPOIS', campanha: 'Campanha Verão', status: 'teste' },
];

export const mockCreativeExpenses: CreativeExpense[] = [
    { id: 'ce1', criativoId: 'c1', valor: 50, data: new Date(Date.now() - 86400000).toISOString() }, // Yesterday
    { id: 'ce2', criativoId: 'c1', valor: 60, data: new Date().toISOString() }, // Today
    { id: 'ce3', criativoId: 'c2', valor: 30, data: new Date().toISOString() }, 
];

export const mockLogs: Log[] = [
  { id: 'l1', usuarioNome: 'Sistema', acao: 'Criação', detalhes: 'Venda recebida via Webhook', data: new Date().toISOString(), vendaId: 'v1' }
];

// Generate some mock sales
const generateSales = (): Venda[] => {
  const sales: Venda[] = [];
  const statuses = ['AGENDADO', 'AGUARDANDO_PAGAMENTO', 'PAGO', 'FRUSTRADO'] as const;
  
  for (let i = 1; i <= 50; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const kit = mockKits[Math.floor(Math.random() * mockKits.length)];
    const atendente = mockAtendentes[Math.floor(Math.random() * mockAtendentes.length)];
    const valor = kit.id === 'k1' ? 197 : kit.id === 'k2' ? 297 : 497;
    
    let comissao = 0;
    if (status === 'PAGO') {
        if (kit.comissaoFixa > 0) {
            comissao = kit.comissaoFixa;
        } else {
            comissao = valor * (kit.comissaoPercentual / 100);
        }
    }

    sales.push({
      id: `v${i}`,
      pedidoIdBraip: `BRAIP-${1000 + i}`,
      clienteNome: `Cliente ${i}`,
      clienteTelefone: `119${Math.floor(Math.random() * 100000000)}`,
      clienteCpf: '000.000.000-00',
      clienteEstado: ['SP', 'RJ', 'MG', 'RS', 'BA'][Math.floor(Math.random() * 5)],
      atendenteId: atendente.id,
      criativoId: mockCriativos[Math.floor(Math.random() * mockCriativos.length)].id,
      kitId: kit.id,
      status: status,
      dataAgendamento: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      dataPagamento: status === 'PAGO' ? new Date().toISOString() : undefined,
      valor: valor,
      comissaoGerada: comissao,
      descontoValor: 0,
      utmCampaign: 'facebook_ads',
      utmAtendente: atendente.codigo,
      semIdentificacao: false,
      historico: [{
          id: `log-init-${i}`,
          usuarioNome: 'Sistema',
          acao: 'Importação',
          detalhes: 'Venda importada via Postback',
          data: new Date().toISOString()
      }]
    });
  }

  // Add Unidentified Sales (No UTMs)
  sales.push({
    id: 'v-no-id-1',
    pedidoIdBraip: 'BRAIP-ERR-01',
    clienteNome: 'Cliente Sem UTM',
    clienteTelefone: '11900000000',
    clienteCpf: '111.222.333-44',
    clienteEstado: 'SP',
    atendenteId: undefined, // Missing
    criativoId: undefined, // Missing
    kitId: 'k1',
    status: 'AGENDADO',
    dataAgendamento: new Date().toISOString(),
    valor: 197,
    comissaoGerada: 0,
    descontoValor: 0,
    semIdentificacao: true,
    historico: []
  });

  return sales;
};

export const mockVendasInitial = generateSales();

export const mockDespesas: Despesa[] = [
    { id: 'd1', descricao: 'Facebook Ads', valor: 5000, categoria: 'Marketing', data: new Date().toISOString() },
    { id: 'd2', descricao: 'Ferramentas (Braip, etc)', valor: 200, categoria: 'Infra', data: new Date().toISOString() },
];