import { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { getInfoSession } from '../../services/sessionService';
import { logout } from '../../services/authService';
import { useToast } from '../../services/toastService.jsx';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { show: showToast } = useToast();
  const [userInfo, setUserInfo] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

useEffect(() => {
  const info = getInfoSession();
  if (info) {
    setUserInfo(info);
  } else {
    navigate('/login');
  }
}, []);

  const handleLogout = () => {
    logout();
    showToast('Sesión cerrada exitosamente', 'success');
    navigate('/login');
  };

  if (!userInfo) {
    return <div className="dashboard-loading">Cargando...</div>;
  }

  const getMenuLinks = () => {
    switch (userInfo.perfil) {
      case 'ADMIN':
        return [
          { label: 'Dashboards', path: '/dashboard', icon: '📊' },
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
        ];
      case 'DISTRIBUIDOR':
        return [
          { label: 'Rutas', path: '/dashboard', icon: '🗺️' },
          { label: 'Flota', path: '/dashboard/flota', icon: '🚚' },
          { label: 'Historial', path: '/dashboard/historial', icon: '📜' },
        ];
      default:
        return [];
    }
  };

  const getPageTitle = () => {
    const menuLinks = getMenuLinks();
    const currentLink = menuLinks.find(link => link.path === location.pathname);
    return currentLink ? currentLink.label : 'Dashboard';
  };

  const getInitials = () => {
    return userInfo.nombre
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuLinks = getMenuLinks();
  const pageTitle = getPageTitle();

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src="/assets/logo-empresa.png" alt="GELCO" className="sidebar-logo" />
          <div className="sidebar-brand">
            <h3>Ventas por Catálogo Perú</h3>
          </div>
        </div>
        
        <nav className="sidebar-menu">
          {menuLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              <span className="link-icon">{link.icon}</span>
              <span className="link-label">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="dashboard-content">
        {/* TOPBAR */}
      <header className="dashboard-topbar">
        <div className="topbar-left">
          <h2 className="page-title">Bienvenido, {userInfo.nombre}</h2>
        </div>
        <div className="topbar-right">
          <button className="topbar-icon-btn">💬</button>
          <button className="topbar-icon-btn">🔔</button>
          <div className="avatar-wrapper">
            <div
              className="user-avatar"
              title={userInfo.nombre}
              onClick={() => setDropdownOpen(o => !o)}
            >
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
                  <button className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/dashboard/mi-perfil'); }}>
                    👤 Mi perfil
                  </button>
                  <button className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    ⚙️ Configuración
                  </button>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    ↪ Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

        {/* PAGE CONTENT */}
        <main className="dashboard-main">
          <Outlet context={{ userInfo }} />
        </main>
      </div>
    </div>
  );
}
