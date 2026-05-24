import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastProvider } from './services/toastService.jsx';
import ToastContainer from './components/ToastContainer/ToastContainer';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import { getInfoSession } from './services/sessionService';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Login/Register';
import ResetPassword from './pages/Login/ResetPassword';
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
import OrdenCompra from './pages/Dashboard/OrdenCompra';
import DashboardRRHH from './pages/Dashboard/DashboardRRHH';
import DashboardRecepcionista from './pages/Dashboard/DashboardRecepcionista';
import DashboardFacturador from './pages/Dashboard/DashboardFacturador';
import DashboardDespacho from './pages/Dashboard/DashboardDespacho';

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
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rutas Privadas */}
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
                <Route path="orden-compra" element={<OrdenCompra />} />
              </Route>

              {/* Solo DISTRIBUIDOR */}
              <Route element={<RoleRoute allowedRoles={['DISTRIBUIDOR']} />}>
                <Route path="flota" element={<Flota />} />
                <Route path="historial" element={<Historial />} />
              </Route>

              {/* Solo RECURSOS_HUMANOS */}
              <Route element={<RoleRoute allowedRoles={['RECURSOS_HUMANOS']} />}>
                <Route path="gestion-consultoras" element={<DashboardRRHH />} />
                <Route path="capacitaciones-rrhh" element={<DashboardRRHH />} />
                <Route path="estadisticas" element={<DashboardRRHH />} />
              </Route>

              {/* Solo RECEPCIONISTA */}
              <Route element={<RoleRoute allowedRoles={['RECEPCIONISTA']} />}>
                <Route path="devoluciones" element={<DashboardRecepcionista />} />
              </Route>

              {/* Solo FACTURADOR */}
              <Route element={<RoleRoute allowedRoles={['FACTURADOR']} />}>
                <Route path="facturacion" element={<DashboardFacturador />} />
              </Route>

              {/* Solo DESPACHO */}
              <Route element={<RoleRoute allowedRoles={['DESPACHO']} />}>
                <Route path="ordenes-despacho" element={<DashboardDespacho />} />
                <Route path="inventario-despacho" element={<DashboardDespacho />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}