import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import des pages
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import SalariesPage from './pages/SalariesPage';
import FacturesPage from './pages/FacturesPage';
import Settings from './pages/Settings';
import SaisieCRAPage from './pages/SaisieCRAPage';
import LoginPage from './pages/LoginPage';

const { Header, Content, Sider } = Layout;

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  type MenuItem = Required<MenuProps>['items'][number];

  const menuItems: MenuItem[] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Tableau de bord</Link>,
    },
    {
      key: '/clients',
      icon: <UserOutlined />,
      label: <Link to="/clients">Clients</Link>,
    },
    {
      key: '/salaries',
      icon: <TeamOutlined />,
      label: <Link to="/salaries">Salariés</Link>,
    },
    {
      key: '/factures',
      icon: <FileTextOutlined />,
      label: <Link to="/factures">Factures</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">Paramètres</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 32,
            margin: 16,
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Facturation
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>

      <Layout style={{ marginLeft: 200 }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0 }}>Gestion de Facturation</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>{user?.nom}</span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={logout}
            >
              Déconnexion
            </Button>
          </div>
        </Header>

        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/salaries" element={<SalariesPage />} />
              <Route path="/factures" element={<FacturesPage />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            {/* Route publique : login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Route publique sans layout */}
            <Route path="/saisie-cra/:token" element={<SaisieCRAPage />} />

            {/* Routes protégées avec layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
