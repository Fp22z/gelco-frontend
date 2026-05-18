import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastProvider } from './services/toastService.jsx';
import ToastContainer from './components/ToastContainer/ToastContainer';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import { getInfoSession } from './services/sessionService';
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
import Capacitaciones from './pages/Dashboard/Capacitaciones';
import Flota from './pages/Dashboard/Flota';
import Historial from './pages/Dashboard/Historial';
import MiPerfil from './pages/MiPerfil/MiPerfil';
import MisClientes from './pages/Dashboard/MisClientes';

function RoleRoute({ allowedRoles }) {
  const session = getInfoSession();
  if (!session) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(session.perfil)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="mi-perfil" element={<MiPerfil />} />

              {/* Solo ADMIN */}
              <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                <Route path="usuarios" element={<Usuarios />} />
                <Route path="inventario" element={<Inventario />} />
                <Route path="reportes" element={<Reportes />} />
                <Route path="gestion-negocio" element={<GestionNegocio />} />
                <Route path="productos" element={<GestionProductos />} />
              </Route>

              {/* Solo CONSULTORA */}
              
              <Route element={<RoleRoute allowedRoles={['CONSULTORA']} />}>
                <Route path="catalogo" element={<Catalogo />} />
                <Route path="pedidos" element={<Pedidos />} />
                <Route path="clientes" element={<MisClientes />} />
                <Route path="capacitaciones" element={<Capacitaciones />} />
              </Route>

              {/* Solo DISTRIBUIDOR */}
              <Route element={<RoleRoute allowedRoles={['DISTRIBUIDOR']} />}>
                <Route path="flota" element={<Flota />} />
                <Route path="historial" element={<Historial />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}