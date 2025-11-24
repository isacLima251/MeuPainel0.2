export const STATUS_COLORS = {
  AGENDADO: 'bg-blue-100 text-blue-800 border-blue-200',
  AGUARDANDO_PAGAMENTO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PAGO: 'bg-green-100 text-green-800 border-green-200',
  FRUSTRADO: 'bg-red-100 text-red-800 border-red-200',
};

export const STATUS_LABELS = {
  AGENDADO: 'Agendado',
  AGUARDANDO_PAGAMENTO: 'Aguardando Pagamento',
  PAGO: 'Pago',
  FRUSTRADO: 'Frustrado',
};

// Mock Investment for ROI calculation since it wasn't in DB schema but needed for formula
export const MOCK_MARKETING_INVESTMENT = 15000; 
