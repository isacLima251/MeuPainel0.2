import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Package, 
  GraduationCap, 
  Menu, 
  LogOut,
  Bell,
  Megaphone,
  ClipboardList,
  Settings
} from 'lucide-react';
import { useAuth } from '../App';

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1
      ${active 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xl tracking-tight">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                R
              </div>
              SISTEMA RAI
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <div className="mb-4 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Principal
            </div>
            
            <SidebarItem 
              to="/" 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={location.pathname === '/'} 
            />
            <SidebarItem 
              to="/vendas" 
              icon={ShoppingCart} 
              label="Vendas" 
              active={location.pathname === '/vendas'} 
            />

            {isAdmin && (
              <>
                <div className="mt-8 mb-4 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Gestão
                </div>
                <SidebarItem 
                  to="/financeiro" 
                  icon={DollarSign} 
                  label="Financeiro" 
                  active={location.pathname === '/financeiro'} 
                />
                <SidebarItem 
                  to="/equipe" 
                  icon={Users} 
                  label="Equipe" 
                  active={location.pathname === '/equipe'} 
                />
                <SidebarItem 
                  to="/kits" 
                  icon={Package} 
                  label="Kits & Produtos" 
                  active={location.pathname === '/kits'} 
                />
                <SidebarItem 
                  to="/criativos" 
                  icon={Megaphone} 
                  label="Criativos" 
                  active={location.pathname === '/criativos'} 
                />
                <SidebarItem 
                  to="/logs" 
                  icon={ClipboardList} 
                  label="Logs & Auditoria" 
                  active={location.pathname === '/logs'} 
                />
                <SidebarItem 
                  to="/config" 
                  icon={Settings} 
                  label="Configurações" 
                  active={location.pathname === '/config'} 
                />
              </>
            )}

            <div className="mt-8 mb-4 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ajuda
            </div>
            <SidebarItem 
              to="/treinamento" 
              icon={GraduationCap} 
              label="Treinamento" 
              active={location.pathname === '/treinamento'} 
            />
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                {user?.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 relative z-20">
          <div className="flex items-center gap-4">
            <button 
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu size={24} />
            </button>
          </div>

          {/* Dynamic Action Container (Portal Target) */}
          <div id="header-actions" className="flex-1 px-4 flex justify-end"></div>

          <div className="flex items-center gap-4 ml-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};