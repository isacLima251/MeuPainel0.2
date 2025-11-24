import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Sales } from './pages/Sales';
import { Training } from './pages/Training';
import { Login } from './pages/Login';
import { Financial } from './pages/Financial';
import { Team } from './pages/Team';
import { Kits } from './pages/Kits';
import { Creatives } from './pages/Creatives';
import { Logs } from './pages/Logs';
import { Config } from './pages/Config';
import { Clients } from './pages/Clients'; // New SaaS Page
import { User } from './types';
import { DataProvider } from './contexts/DataContext';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('rai_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rai_user');
  };

  useEffect(() => {
    const stored = localStorage.getItem('rai_user');
    if (stored) {
        setUser(JSON.parse(stored));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Authenticated Layout Wrapper ---
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <DataProvider>
            <Layout>{children}</Layout>
        </DataProvider>
    );
};

// --- Protected Route Wrapper ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" />;
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
};

// --- Admin Route Wrapper ---
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (user?.role !== 'admin' && user?.role !== 'super_admin') return <Navigate to="/" />;
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
};

// --- Super Admin Route Wrapper ---
const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (user?.role !== 'super_admin') return <Navigate to="/" />;
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
};

// --- Main App ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/vendas" element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          } />

          <Route path="/treinamento" element={
            <ProtectedRoute>
              <Training />
            </ProtectedRoute>
          } />

          {/* Super Admin Modules */}
          <Route path="/clientes" element={
            <SuperAdminRoute>
              <Clients />
            </SuperAdminRoute>
          } />

          {/* Admin Modules */}
          <Route path="/financeiro" element={
            <AdminRoute>
              <Financial />
            </AdminRoute>
          } />

          <Route path="/equipe" element={
            <AdminRoute>
              <Team />
            </AdminRoute>
          } />

          <Route path="/kits" element={
            <AdminRoute>
              <Kits />
            </AdminRoute>
          } />

          <Route path="/criativos" element={
            <AdminRoute>
              <Creatives />
            </AdminRoute>
          } />

          <Route path="/logs" element={
            <AdminRoute>
              <Logs />
            </AdminRoute>
          } />

          <Route path="/config" element={
            <ProtectedRoute>
              <Config />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
