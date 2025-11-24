import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Activity, Target, ArrowUpRight, ArrowDownRight, 
  Wallet, CheckCircle, XCircle, AlertOctagon, Calendar, Clock, User, Trophy, Percent 
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../App';
import { DashboardFilters, FilterType } from '../components/DashboardFilters';

const KpiCard = ({ title, value, subtext, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
        {trend && (
          <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend > 0 ? <ArrowUpRight size={12} className="mr-1"/> : <ArrowDownRight size={12} className="mr-1"/>}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
    {subtext && <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-50">{subtext}</p>}
  </div>
);

const StatusCard = ({ title, count, value, icon: Icon, colorClass, borderClass, bgClass, subLabel }: any) => (
    <div className={`p-5 rounded-xl border ${borderClass} ${bgClass} transition-shadow hover:shadow-md flex flex-col justify-between h-full`}>
        <div className="flex justify-between items-start mb-3">
            <h3 className={`text-xs font-bold uppercase tracking-wide opacity-80 ${colorClass}`}>{title}</h3>
            <Icon size={18} className={colorClass} />
        </div>
        
        {/* Value Highlighted at Top */}
        <div className="mb-2">
             <p className={`text-2xl font-extrabold ${colorClass}`}>R$ {value.toLocaleString('pt-BR')}</p>
        </div>

        {/* Count Below */}
        <div className="flex items-center justify-between pt-2 border-t border-white/20">
            <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-slate-800">{count}</span>
                <span className="text-xs text-slate-600 font-medium">pedidos</span>
            </div>
            {subLabel && (
                <div className="bg-white/60 px-2 py-0.5 rounded text-xs font-bold text-slate-700 border border-slate-100/50 shadow-sm">
                    {subLabel}
                </div>
            )}
        </div>
    </div>
);

type ChartMode = 'weekday' | 'hour';

export const Dashboard: React.FC = () => {
  const { getMetrics, sales, atendentes, isLoading } = useData();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  // Filter State
  const [filterType, setFilterType] = useState<FilterType>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  // Chart State
  const [chartMode, setChartMode] = useState<ChartMode>('weekday');

  // Attendant Selection State
  const myAttendantId = atendentes.find(a => a.userId === user?.id)?.id;
  const [selectedAttendantId, setSelectedAttendantId] = useState<string>(isAdmin ? 'all' : (myAttendantId || 'all'));

  useEffect(() => {
    setPortalTarget(document.getElementById('header-actions'));
  }, []);

  // Update dates when filter type changes
  useEffect(() => {
      const now = new Date();
      let start = new Date();
      let end = new Date();

      if (filterType === 'custom') {
          setShowCustomDate(true);
          return;
      }

      setShowCustomDate(false);

      switch(filterType) {
          case 'today':
              start = new Date(now.setHours(0,0,0,0));
              end = new Date(now.setHours(23,59,59,999));
              break;
          case 'yesterday':
              start.setDate(start.getDate() - 1);
              start.setHours(0,0,0,0);
              end.setDate(end.getDate() - 1);
              end.setHours(23,59,59,999);
              break;
          case 'month':
              start = new Date(now.getFullYear(), now.getMonth(), 1);
              end = new Date(now);
              break;
      }
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
  }, [filterType]);

  const metrics = getMetrics(
      selectedAttendantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
  );

  // --- Chart Data Logic ---
  const getChartData = () => {
      const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);

      let relevantSales = sales.filter(s => {
          const sDate = new Date(s.dataAgendamento);
          return sDate >= start && sDate <= end && (s.status === 'PAGO' || s.status === 'FRUSTRADO');
      });

      if (selectedAttendantId !== 'all') {
          relevantSales = relevantSales.filter(s => s.atendenteId === selectedAttendantId);
      }

      if (chartMode === 'weekday') {
          const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
          const counts = days.map(d => ({ name: d, vendas: 0 }));
          
          relevantSales.forEach(s => {
              if (s.status === 'PAGO') {
                  const dayIndex = new Date(s.dataAgendamento).getDay();
                  counts[dayIndex].vendas += 1;
              }
          });
          return counts;
      } else {
          // Hourly Mode
          const hours = Array.from({ length: 24 }, (_, i) => ({ name: `${i}h`, vendas: 0 }));
          relevantSales.forEach(s => {
              if (s.status === 'PAGO') {
                  const hourIndex = new Date(s.dataAgendamento).getHours();
                  hours[hourIndex].vendas += 1;
              }
          });
          return hours;
      }
  };

  const chartData = getChartData();

  // Calculate Frustration Rate for Card
  const totalSalesPeriod = metrics.countAgendado + metrics.countAguardando + metrics.countPago + metrics.countFrustrado;
  const frustrationRate = totalSalesPeriod > 0 ? (metrics.countFrustrado / totalSalesPeriod) * 100 : 0;

  if (isLoading) {
      return <div className="flex items-center justify-center h-full text-slate-500">Carregando indicadores...</div>;
  }

  const statusData = [
    { name: 'Pago', value: metrics.countPago, color: '#22c55e' },
    { name: 'Agendado', value: metrics.countAgendado, color: '#3b82f6' },
    { name: 'Aguardando', value: metrics.countAguardando, color: '#eab308' },
    { name: 'Frustrado', value: metrics.countFrustrado, color: '#ef4444' },
  ];

  // Logic for ranking
  const ranking = atendentes.map(at => {
      const mySales = sales.filter(s => s.atendenteId === at.id);
      const pagos = mySales.filter(s => s.status === 'PAGO');
      const countPagos = pagos.length;
      const countFrustrados = mySales.filter(s => s.status === 'FRUSTRADO').length;
      const total = countPagos + countFrustrados;
      const conv = total > 0 ? (countPagos / total) * 100 : 0;
      const totalValue = pagos.reduce((acc, curr) => acc + curr.valor, 0);
      
      return { ...at, countPagos, countFrustrados, conv, totalValue };
  }).sort((a, b) => b.totalValue - a.totalValue);

  // States Chart Data
  const salesByState = sales.filter(s => selectedAttendantId === 'all' || s.atendenteId === selectedAttendantId).reduce((acc: any, curr) => {
      if (curr.status === 'PAGO') {
        acc[curr.clienteEstado] = (acc[curr.clienteEstado] || 0) + 1;
      }
      return acc;
  }, {});
  const stateChartData = Object.keys(salesByState).map(key => ({ name: key, value: salesByState[key] })).sort((a,b) => b.value - a.value).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* PORTAL FOR FILTERS - Renders in Layout Header */}
      {portalTarget && createPortal(
        <DashboardFilters 
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          showCustomDate={showCustomDate}
          selectedAttendantId={selectedAttendantId}
          onAttendantChange={setSelectedAttendantId}
          atendentes={atendentes}
          isAdmin={isAdmin}
        />, 
        portalTarget
      )}

      {/* STATUS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <StatusCard 
                title="Agendado" 
                count={metrics.countAgendado} 
                value={metrics.valorAgendado} 
                icon={Calendar} 
                colorClass="text-blue-600"
                bgClass="bg-blue-50/50"
                borderClass="border-blue-100"
           />
           <StatusCard 
                title="Aguardando Pag." 
                count={metrics.countAguardando} 
                value={metrics.valorAguardando} 
                icon={Clock} 
                colorClass="text-yellow-600"
                bgClass="bg-yellow-50/50"
                borderClass="border-yellow-100"
           />
           <StatusCard 
                title="Total Pago" 
                count={metrics.countPago} 
                value={metrics.valorPago} 
                icon={CheckCircle} 
                colorClass="text-green-600"
                bgClass="bg-green-50/50"
                borderClass="border-green-100"
           />
           <StatusCard 
                title="Frustrado" 
                count={metrics.countFrustrado} 
                value={metrics.valorFrustrado} 
                icon={XCircle} 
                colorClass="text-red-600"
                bgClass="bg-red-50/50"
                borderClass="border-red-100"
                subLabel={`${frustrationRate.toFixed(1)}% Taxa`}
           />
      </div>

      {/* FINANCIAL KPIs */}
      {isAdmin && selectedAttendantId === 'all' ? (
          // GLOBAL ADMIN VIEW
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <KpiCard 
                title="Investimento (Ads)" 
                value={`R$ ${metrics.investimento.toLocaleString('pt-BR')}`}
                subtext="Custos lançados em Criativos"
                icon={TrendingUp}
                color="bg-slate-800"
            />
            <KpiCard 
                title="Despesas Operacionais" 
                value={`R$ ${metrics.totalDespesas.toLocaleString('pt-BR')}`}
                subtext="Ferramentas, Equipe, Infra"
                icon={TrendingDown}
                color="bg-red-500"
            />
            <KpiCard 
                title="Total Comissões"
                value={`R$ ${metrics.totalComissoes.toLocaleString('pt-BR')}`}
                subtext="Valor pago aos atendentes"
                icon={Wallet}
                color="bg-blue-500"
            />
            <KpiCard 
                title="Lucro Líquido" 
                value={`R$ ${metrics.totalLiquido.toLocaleString('pt-BR')}`}
                subtext={metrics.investimento > 0 ? `ROAS: ${metrics.roas.toFixed(2)}x` : "Sem investimento registrado"}
                icon={Target}
                color="bg-indigo-600"
                trend={metrics.roas > 1 ? 10 : -10}
            />
          </div>
      ) : (
          // ATTENDANT OR SINGLE VIEW (Performance Focus)
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <KpiCard 
                title="Taxa de Conversão" 
                value={`${(metrics.taxaConversao * 100).toFixed(1)}%`}
                subtext="Pagos sobre finalizados"
                icon={Activity}
                color="bg-indigo-500"
             />
             <KpiCard 
                title="Comissões Geradas"
                value={`R$ ${metrics.totalComissoes.toLocaleString('pt-BR')}`}
                subtext="Receita pessoal"
                icon={Wallet}
                color="bg-blue-500"
             />
             <KpiCard 
                title="Lucro da Operação"
                value={`R$ ${metrics.totalLiquido.toLocaleString('pt-BR')}`}
                subtext="Receita - Comissões (Margem)"
                icon={Target}
                color="bg-green-600"
             />
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - Performance Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
                 <h3 className="text-lg font-bold text-slate-800">Performance de Vendas Pagas</h3>
                 <p className="text-xs text-slate-500">Volume de vendas por período</p>
            </div>
            {/* Toggle Chart Mode */}
            <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-bold">
                <button 
                    onClick={() => setChartMode('weekday')}
                    className={`px-3 py-1.5 rounded-md transition-all ${chartMode === 'weekday' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Dia da Semana
                </button>
                <button 
                    onClick={() => setChartMode('hour')}
                    className={`px-3 py-1.5 rounded-md transition-all ${chartMode === 'hour' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Por Horário
                </button>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: chartMode === 'hour' ? 10 : 12}} 
                  dy={10} 
                  interval={chartMode === 'hour' ? 0 : 'preserveStartEnd'}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b'}} 
                  allowDecimals={false}
                />
                <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     cursor={{fill: '#f1f5f9'}}
                />
                <Bar 
                    dataKey="vendas" 
                    name="Vendas Pagas" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    barSize={chartMode === 'hour' ? 15 : 40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribuição</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
               <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                   <span className="text-sm text-slate-600 font-medium">Pagos</span>
               </div>
               <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                   <span className="text-sm text-slate-600 font-medium">Agendados</span>
               </div>
               <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                   <span className="text-sm text-slate-600 font-medium">Aguardando</span>
               </div>
               <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                   <span className="text-sm text-slate-600 font-medium">Frustrados</span>
               </div>
          </div>
        </div>
      </div>

      {/* Admin Only Sections - Ranking & States */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* RANKING CARD - Improved Visual Design */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-5 border-b border-slate-100 bg-slate-50/30">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Trophy size={18} className="text-yellow-500" /> Ranking de Performance
                    </h3>
                </div>
                <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                    {ranking.map((at, idx) => (
                        <div key={at.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                            {/* Rank Badge */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm shrink-0
                                ${idx === 0 ? 'bg-yellow-100 text-yellow-700 ring-4 ring-yellow-50' : 
                                  idx === 1 ? 'bg-slate-200 text-slate-600' :
                                  idx === 2 ? 'bg-amber-100 text-amber-800' : 'bg-white text-slate-400 border border-slate-200'}`}>
                                {idx + 1}º
                            </div>
                            
                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 truncate">{at.nome}</span>
                                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-500">{at.codigo}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><CheckCircle size={10} className="text-green-500"/> {at.countPagos} Vendas</span>
                                    <span className="flex items-center gap-1"><Percent size={10} className="text-blue-500"/> {at.conv.toFixed(0)}% Conv.</span>
                                </div>
                            </div>

                            {/* Money & Bar */}
                            <div className="text-right shrink-0">
                                <div className="text-sm font-extrabold text-slate-800">
                                    R$ {at.totalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                </div>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 ml-auto overflow-hidden">
                                     <div className="h-full bg-green-500 rounded-full" style={{ width: `${at.conv}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {ranking.length === 0 && (
                        <p className="text-center text-slate-400 py-8">Nenhum dado para o período.</p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                 <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertOctagon size={20} className="text-orange-500"/> Estados Mais Vendidos
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={stateChartData} margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={30} 
                                tick={{fontSize: 12, fontWeight: 'bold', fill: '#475569'}} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }}/>
                            <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
