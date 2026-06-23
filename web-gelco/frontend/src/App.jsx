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
import MiPerfil from './pages/MiPerfil/MiPerfil';
import GestionProductos from './pages/GestionProductos/GestionProductos';
import Usuarios from './pages/Dashboard/admin/Usuarios';
import Inventario from './pages/Dashboard/admin/Inventario';
import Reportes from './pages/Dashboard/admin/Reportes';
import GestionNegocio from './pages/Dashboard/admin/GestionNegocio';
import Catalogo from './pages/Dashboard/consultora/Catalogo';
import Pedidos from './pages/Dashboard/consultora/Pedidos';
import Capacitaciones from './pages/Dashboard/consultora/Capacitaciones';
import MisClientes from './pages/Dashboard/consultora/MisClientes';
import OrdenCompra from './pages/Dashboard/consultora/OrdenCompra';
import Flota from './pages/Dashboard/distribuidor/Flota';
import Historial from './pages/Dashboard/distribuidor/Historial';
import GestionConsultoras from './pages/Dashboard/rrhh/GestionConsultoras';
import DashboardRRHH from './pages/Dashboard/rrhh/DashboardRRHH';
import CapacitacionesRRHH from './pages/Dashboard/rrhh/CapacitacionesRRHH';
import EstadisticasVentas from './pages/Dashboard/rrhh/EstadisticasVentas';
import EfektividadCapacitaciones from './pages/Dashboard/rrhh/EfektividadCapacitaciones';
import DashboardRecepcionista from './pages/Dashboard/recepcionista/DashboardRecepcionista';
import Devoluciones from './pages/Dashboard/recepcionista/Devoluciones';
import DashboardFacturador from './pages/Dashboard/facturador/DashboardFacturador';
import DashboardDespacho from './pages/Dashboard/despacho/DashboardDespacho';

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
                <Route path="gestion-consultoras" element={<GestionConsultoras />} />
                <Route path="capacitaciones-rrhh" element={<CapacitacionesRRHH />} />
                <Route path="efectividad-capacitaciones" element={<EfektividadCapacitaciones />} />
                <Route path="estadisticas"        element={<EstadisticasVentas />} />
              </Route>

              {/* Solo RECEPCIONISTA */}
              <Route element={<RoleRoute allowedRoles={['RECEPCIONISTA']} />}>
                <Route path="devoluciones" element={<Devoluciones />} />
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