import React from 'react';
import { PlayCircle, FileText, Lock } from 'lucide-react';

const ModuleCard = ({ title, duration, lessons, active }: any) => (
    <div className={`p-5 rounded-xl border transition-all cursor-pointer group ${active ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
        <div className="flex justify-between items-start mb-3">
            <div className={`p-2 rounded-lg ${active ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                <PlayCircle size={20} />
            </div>
            {active && <span className="bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">Em Progresso</span>}
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><FileText size={12}/> {lessons} aulas</span>
            <span>•</span>
            <span>{duration}</span>
        </div>
    </div>
);

export const Training: React.FC = () => {
  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-2xl font-bold text-slate-900">Centro de Treinamento</h1>
          <p className="text-slate-500">Módulos obrigatórios para operação COD no Sistema RAI.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                {/* Main Player */}
                <div className="bg-black rounded-xl overflow-hidden aspect-video relative group cursor-pointer shadow-lg">
                    <img src="https://picsum.photos/800/450?grayscale" alt="Thumbnail" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                             <PlayCircle size={40} className="text-white fill-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block">AULA 01</span>
                        <h2 className="text-white text-xl font-bold">O que é COD e como funciona o fluxo?</h2>
                        <p className="text-slate-300 text-sm mt-1">Entenda o pagamento na entrega e a importância do agendamento correto.</p>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Arquivos da Aula</h3>
                    <div className="space-y-3">
                        <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                            <div className="bg-red-100 p-2 rounded text-red-600"><FileText size={18} /></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">Script de Confirmação de Endereço.pdf</p>
                                <p className="text-xs text-slate-500">500 KB</p>
                            </div>
                            <span className="text-blue-600 text-sm font-medium">Baixar</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Sidebar List - Content from Part 3 Section 10 */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-900 px-1">Trilha de Aprendizado</h3>
                
                <ModuleCard title="Fundamentos do COD" duration="30 min" lessons={2} active={true} />
                <ModuleCard title="UTMs e Rastreamento" duration="45 min" lessons={3} active={false} />
                <ModuleCard title="Links Braip & Postbacks" duration="20 min" lessons={1} active={false} />
                <ModuleCard title="Análise de Dashboards" duration="40 min" lessons={4} active={false} />
                <ModuleCard title="Recuperação e Frustrados" duration="1h" lessons={5} active={false} />
                <ModuleCard title="Regras de Escala e ROI" duration="30 min" lessons={2} active={false} />

                <div className="bg-slate-100 p-4 rounded-lg flex items-start gap-3 mt-4">
                    <Lock size={16} className="text-slate-400 mt-1"/>
                    <div>
                        <p className="text-sm font-bold text-slate-700">Módulos Avançados</p>
                        <p className="text-xs text-slate-500 mt-1">Complete os módulos anteriores para desbloquear "Estratégia de Escala".</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};