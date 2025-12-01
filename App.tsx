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
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('rai_user', JSON.stringify(userData));
    localStorage.setItem('rai_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rai_user');
    localStorage.removeItem('rai_token');
  };

  useEffect(() => {
    const stored = localStorage.getItem('rai_user');
    const storedToken = localStorage.getItem('rai_token');
    if (stored) {
        setUser(JSON.parse(stored));
    }
    if (storedToken) {
        setToken(storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Protected Route Wrapper ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" />;
    return <Layout>{children}</Layout>;
};

// --- Admin Route Wrapper ---
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (user?.role !== 'admin' && user?.role !== 'super_admin') return <Navigate to="/" />;
    return <Layout>{children}</Layout>;
};

// --- Super Admin Route Wrapper ---
const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (user?.role !== 'super_admin') return <Navigate to="/" />;
    return <Layout>{children}</Layout>;
};

// --- Home Dispatcher (Redirect Logic) ---
const HomeDispatcher: React.FC = () => {
  const { user } = useAuth();
  
  // If Super Admin, redirect to SaaS Dashboard (Clients)
  if (user?.role === 'super_admin') {
    return <Navigate to="/clientes" replace />;
  }
  
  // Otherwise, show standard Operational Dashboard
  return <Dashboard />;
};

// --- Main App ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Root Route with Dispatcher */}
            <Route path="/" element={
              <ProtectedRoute>
                <HomeDispatcher />
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
      </DataProvider>
    </AuthProvider>
  );
};

export default App;