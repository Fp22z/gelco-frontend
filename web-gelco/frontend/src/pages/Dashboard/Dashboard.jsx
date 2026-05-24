import { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { getInfoSession } from '../../services/sessionService';
import { logout } from '../../services/authService';
import { useToast } from '../../services/toastService.jsx';
import { CartProvider } from '../../context/CartContext';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { show: showToast } = useToast();
  const [userInfo, setUserInfo] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const info = getInfoSession();
    if (info) {
      setUserInfo(info);
    } else {
      navigate('/login');
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    showToast('Sesión cerrada exitosamente', 'success');
    navigate('/login');
  };

  if (!userInfo) {
    return <div className="dashboard-loading"><div className="loading-spinner" /></div>;
  }

  const getMenuLinks = () => {
    switch (userInfo.perfil) {
      case 'ADMIN':
        return [
          { label: 'Dashboards', path: '/dashboard', icon: '' },
          { label: 'Usuarios', path: '/dashboard/usuarios', icon: '👥' },
          { label: 'Inventario', path: '/dashboard/inventario', icon: '📦' },
          { label: 'Reportes', path: '/dashboard/reportes', icon: '📈' },
          { label: 'Gestión de negocio', path: '/dashboard/gestion-negocio', icon: '🏢' },
        ];
      case 'CONSULTORA':
        return [
          { label: 'Panel de Control', path: '/dashboard', icon: '📊' },
          { label: 'Catálogo de Productos', path: '/dashboard/catalogo', icon: '📚' },
          { label: 'Mis Pedidos', path: '/dashboard/pedidos', icon: '📦' },
          { label: 'Mis Clientes', path: '/dashboard/clientes', icon: '👥' },
          { label: 'Capacitaciones', path: '/dashboard/capacitaciones', icon: '🎓' },
          { label: 'Orden de Compra',path: '/dashboard/orden-compra',  icon: '📤' }
        ];
      case 'DISTRIBUIDOR':
        return [
          { label: 'Rutas', path: '/dashboard', icon: '🗺️' },
          { label: 'Flota', path: '/dashboard/flota', icon: '🚚' },
          { label: 'Historial', path: '/dashboard/historial', icon: '📜' },
        ];

      case 'RECURSOS_HUMANOS':
        return [
          { label: 'Panel de Control',       path: '/dashboard',                      icon: '📊' },
          { label: 'Gestión Consultoras',    path: '/dashboard/gestion-consultoras',  icon: '👥' },
          { label: 'Capacitaciones',         path: '/dashboard/capacitaciones-rrhh',  icon: '🎓' },
          { label: 'Estadísticas de Ventas', path: '/dashboard/estadisticas',         icon: '📈' },
        ];

      case 'RECEPCIONISTA':
        return [
          { label: 'Panel de Control', path: '/dashboard',              icon: '📊' },
          { label: 'Devoluciones',     path: '/dashboard/devoluciones', icon: '↩️' },
        ];

      case 'FACTURADOR':
        return [
          { label: 'Panel de Control', path: '/dashboard',              icon: '📊' },
          { label: 'Facturación',      path: '/dashboard/facturacion',  icon: '🧾' },
        ];

      case 'DESPACHO':
        return [
          { label: 'Panel de Control',    path: '/dashboard',                       icon: '📊' },
          { label: 'Órdenes de Despacho', path: '/dashboard/ordenes-despacho',      icon: '📦' },
          { label: 'Inventario',          path: '/dashboard/inventario-despacho',   icon: '🏪' },
        ];

      default:
        return [];
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getInitials = () => userInfo.nombre.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  const menuLinks = getMenuLinks();

  return (
    <CartProvider userInfo={userInfo}>
      <div className={`dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
        {mobileSidebarOpen && <div className="mobile-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />}

        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <img src="/assets/logo-empresa.png" alt="GELCO" className="sidebar-logo" />
            {!sidebarCollapsed && <div className="sidebar-brand"><h3>GELCO</h3></div>}
          </div>
          
          <nav className="sidebar-menu">
            {menuLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`} onClick={() => setMobileSidebarOpen(false)}>
                <span className="link-icon">{link.icon}</span>
                {!sidebarCollapsed && <span className="link-label">{link.label}</span>}
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="sidebar-logout" onClick={handleLogout}>
              {!sidebarCollapsed ? 'Cerrar Sesión' : '🚪'}
            </button>
          </div>
        </aside>

        <div className="dashboard-content">
          <header className="dashboard-topbar">
            <div className="topbar-left">
              <button className="sidebar-toggle-btn" onClick={() => { setSidebarCollapsed(c => !c); setMobileSidebarOpen(o => !o); }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <h2 className="page-title">{getGreeting()}, {userInfo.nombre.split(' ')[0]}</h2>
            </div>
            <div className="topbar-right">
              <button className="topbar-icon-btn" title="Mensajes">💬</button>
              <button className="topbar-icon-btn" title="Notificaciones">🔔</button>
              <div className="avatar-wrapper">
                <div className="user-avatar" title={userInfo.nombre} onClick={() => setDropdownOpen(o => !o)}>
                  {getInitials()}
                </div>
                <span className="avatar-chevron" onClick={() => setDropdownOpen(o => !o)}>▾</span>
                {dropdownOpen && (
                  <>
                    <div className="dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
                    <div className="avatar-dropdown">
                      <div className="dropdown-header">
                        <div className="dropdown-avatar">{getInitials()}</div>
                        <div>
                          <p className="dropdown-name">{userInfo.nombre}</p>
                          <p className="dropdown-email">{userInfo.email}</p>
                        </div>
                      </div>
                      <hr className="dropdown-divider" />
                      <button className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/dashboard/mi-perfil'); }}> Mi perfil</button>
                      <button className="dropdown-item" onClick={() => setDropdownOpen(false)}>️ Configuración</button>
                      <hr className="dropdown-divider" />
                      <button className="dropdown-item dropdown-logout" onClick={handleLogout}> Cerrar Sesión</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="dashboard-main">
            <Outlet />
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
