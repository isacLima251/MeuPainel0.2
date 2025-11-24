import React from 'react';
import { User } from 'lucide-react';
import { Atendente } from '../types';

export type FilterType = 'today' | 'yesterday' | 'month' | 'custom';

interface DashboardFiltersProps {
  filterType: FilterType;
  onFilterTypeChange: (type: FilterType) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  showCustomDate: boolean;
  selectedAttendantId: string;
  onAttendantChange: (id: string) => void;
  atendentes: Atendente[];
  isAdmin: boolean;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filterType,
  onFilterTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  showCustomDate,
  selectedAttendantId,
  onAttendantChange,
  atendentes,
  isAdmin
}) => {
  return (
    <div className="flex items-center gap-2 md:gap-4 h-full">
      {/* Attendant Selector */}
      <div className="flex items-center">
        {isAdmin ? (
          <div className="relative min-w-[180px] lg:min-w-[220px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <User size={16} />
            </div>
            <select
              value={selectedAttendantId}
              onChange={(e) => onAttendantChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="all">Todos os Atendentes</option>
              {atendentes.map(att => (
                <option key={att.id} value={att.id}>{att.nome} ({att.codigo})</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l border-slate-200 pl-2">
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-500"></div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-100 flex items-center gap-2">
            <User size={16} /> Meu Painel
          </div>
        )}
      </div>

      {/* Date Filters - Cleaner Design */}
      <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
        <div className="flex">
          {['today', 'yesterday', 'month'].map((type) => (
            <button
              key={type}
              onClick={() => onFilterTypeChange(type as FilterType)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === type ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
              {type === 'today' ? 'Hoje' : type === 'yesterday' ? 'Ontem' : 'Mês'}
            </button>
          ))}
          <button
            onClick={() => onFilterTypeChange('custom')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === 'custom' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            Personalizado
          </button>
        </div>

        {showCustomDate && (
          <div className="flex items-center gap-2 border-l border-slate-200 ml-1 pl-2 pr-1 animate-in fade-in slide-in-from-right-4 duration-200">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-24 px-1 py-1 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700 focus:ring-1 focus:ring-blue-300 outline-none"
            />
            <span className="text-slate-400 text-[10px]">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-24 px-1 py-1 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700 focus:ring-1 focus:ring-blue-300 outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};
