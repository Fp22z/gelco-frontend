import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './services/toastService.jsx';
import ToastContainer from './components/ToastContainer/ToastContainer';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import DashboardHome from './pages/Dashboard/DashboardHome';
import GestionProductos from './pages/GestionProductos/GestionProductos';
import Usuarios from './pages/Dashboard/Usuarios';
import Inventario from './pages/Dashboard/Inventario';
import Reportes from './pages/Dashboard/Reportes';
import GestionNegocio from './pages/Dashboard/GestionNegocio';
import Catalogo from './pages/Dashboard/Catalogo';
import Pedidos from './pages/Dashboard/Pedidos';
import Clientes from './pages/Dashboard/Clientes';
import Capacitaciones from './pages/Dashboard/Capacitaciones';
import Flota from './pages/Dashboard/Flota';
import Historial from './pages/Dashboard/Historial';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              {/* Home routes - role-specific home page */}
              <Route index element={<DashboardHome />} />
              
              {/* ADMIN Routes */}
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="inventario" element={<Inventario />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="gestion-negocio" element={<GestionNegocio />} />
              <Route path="productos" element={<GestionProductos />} />
              
              {/* CONSULTORA Routes */}
              <Route path="catalogo" element={<Catalogo />} />
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="capacitaciones" element={<Capacitaciones />} />
              
              {/* DISTRIBUIDOR Routes */}
              <Route path="flota" element={<Flota />} />
              <Route path="historial" element={<Historial />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
