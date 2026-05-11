import { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import { getInfoSession } from '../../services/sessionService';
import { logout } from '../../services/authService';
import { useToast } from '../../services/toastService.jsx';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { show: showToast } = useToast();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const info = getInfoSession();
    if (info) {
      setUserInfo(info);
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
          { label: 'Productos', path: '/dashboard/productos' },
          { label: 'Usuarios', path: '/dashboard/usuarios' },
        ];
      case 'CONSULTORA':
        return [
          { label: 'Catálogo', path: '/dashboard/catalogo' },
          { label: 'Mis Pedidos', path: '/dashboard/pedidos' },
        ];
      case 'SUPERVISOR':
        return [
          { label: 'Reportes', path: '/dashboard/reportes' },
          { label: 'Consultoras', path: '/dashboard/consultoras' },
        ];
      default:
        return [];
    }
  };

  const menuLinks = getMenuLinks();

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src="/assets/logo-empresa.png" alt="GELCO" className="sidebar-logo" />
          <h2>Dashboard</h2>
        </div>
        <nav className="sidebar-menu">
          {menuLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="sidebar-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="dashboard-content">
        {/* TOPBAR */}
        <header className="dashboard-topbar">
          <div className="topbar-user-info">
            <span className="user-name">{userInfo.nombre}</span>
            <span className="user-role"> - {userInfo.perfil}</span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
