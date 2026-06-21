import { useState, useEffect } from 'react';
import { getToken } from '../../../services/authService';
import { environment } from '../../../environments/environment';
import { getInfoSession } from '../../../services/sessionService';
import './DashboardRRHH.css';

function fmtMonto(n) {
  return `S/. ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
}

export default function DashboardRRHH() {
  const session = getInfoSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentConsultoras, setRecentConsultoras] = useState([]);
  const [nivelStats, setNivelStats] = useState({ oro: 0, plata: 0, bronce: 0 });

  useEffect(() => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    Promise.all([
      fetch(`${environment.url}/home`, { headers }).then(r => r.json()),
      fetch(`${environment.url}/consultoras`, { headers }).then(r => r.json()),
    ]).then(([homeData, consultoras]) => {
      const lista = Array.isArray(consultoras) ? consultoras : [];

      const totalConsultoras = lista.length;
      const activas = lista.filter(c => c.estadoUsuario !== false).length;
      const inactivas = totalConsultoras - activas;

      const oro = lista.filter(c => c.nivel === 'Oro').length;
      const plata = lista.filter(c => c.nivel === 'Plata').length;
      const bronce = lista.filter(c => c.nivel === 'Bronce').length;

      setNivelStats({ oro, plata, bronce });

      const totalVentas = lista.reduce((acc, c) => acc + Number(c.ventasTotales || 0), 0);

      setStats({
        totalConsultoras,
        activas,
        inactivas,
        totalVentas,
        ventasPromedio: totalConsultoras > 0 ? totalVentas / totalConsultoras : 0,
        consultorasRecientes: homeData?.consultorasRecientes || 0,
        capacitacionesPendientes: homeData?.capacitacionesPendientes || 0,
        capacitacionesCompletadas: homeData?.capacitacionesCompletadas || 0,
      });

      const recent = lista
        .slice()
        .sort((a, b) => new Date(b.usuarioCreatedAt || 0) - new Date(a.usuarioCreatedAt || 0))
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          nombre: c.usuarioNombre || '—',
          email: c.usuarioEmail || '—',
          nivel: c.nivel || 'Bronce',
          ventas: c.ventasTotales || 0,
          estado: c.estadoUsuario !== false,
        }));
      setRecentConsultoras(recent);

    }).catch(() => {
      setStats(null);
      setRecentConsultoras([]);
    }).finally(() => setLoading(false));
  }, []);

  const getInitials = (nombre) => {
    if (!nombre) return '??';
    return nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (nombre) => {
    const colors = ['#E8956D', '#C94F7C', '#2563EB', '#059669', '#7C3AED', '#D97706'];
    let hash = 0;
    for (let c of (nombre || '')) hash += c.charCodeAt(0);
    return colors[hash % colors.length];
  };

  const getNivelClass = (nivel) => {
    const l = (nivel || 'Bronce').toLowerCase();
    if (l === 'oro') return 'nivel-oro';
    if (l === 'plata') return 'nivel-plata';
    return 'nivel-bronce';
  };

  if (loading) {
    return (
      <div className="dashboard-rrhh-loading">
        <div className="loading-spinner" />
        <p>Cargando panel de RRHH...</p>
      </div>
    );
  }

  const iniciales = session?.nombre
    ? session.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'RR';

  return (
    <div className="dashboard-rrhh">

      <div className="rrhh-left">

        <section className="rrhh-perfil-card">
          <div className="rrhh-perfil-header">
            <div className="rrhh-avatar">{iniciales}</div>
            <div className="rrhh-perfil-info">
              <h3>{session?.nombre || 'Recursos Humanos'}</h3>
              <span className="rrhh-badge">👥 RRHH</span>
            </div>
          </div>

          <div className="rrhh-kpis">
            <div className="rrhh-kpi">
              <span className="kpi-icon">👥</span>
              <div className="kpi-content">
                <span className="kpi-num">{stats?.totalConsultoras ?? 0}</span>
                <span className="kpi-lbl">Total Consultoras</span>
              </div>
            </div>
            <div className="rrhh-kpi">
              <span className="kpi-icon">✅</span>
              <div className="kpi-content">
                <span className="kpi-num">{stats?.activas ?? 0}</span>
                <span className="kpi-lbl">Activas</span>
              </div>
            </div>
            <div className="rrhh-kpi">
              <span className="kpi-icon">⏸️</span>
              <div className="kpi-content">
                <span className="kpi-num">{stats?.inactivas ?? 0}</span>
                <span className="kpi-lbl">Inactivas</span>
              </div>
            </div>
            <div className="rrhh-kpi accent">
              <span className="kpi-icon">💰</span>
              <div className="kpi-content">
                <span className="kpi-num">{fmtMonto(stats?.totalVentas)}</span>
                <span className="kpi-lbl">Ventas Totales</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rrhh-niveles-card">
          <h3>Distribución por Nivel</h3>
          <div className="niveles-bars">
            <div className="nivel-bar-item">
              <div className="nivel-bar-header">
                <span className="nivel-label">🥇 Oro</span>
                <span className="nivel-count">{nivelStats.oro}</span>
              </div>
              <div className="nivel-bar">
                <div
                  className="nivel-bar-fill oro"
                  style={{ width: `${stats?.totalConsultoras > 0 ? (nivelStats.oro / stats.totalConsultoras) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="nivel-bar-item">
              <div className="nivel-bar-header">
                <span className="nivel-label">🥈 Plata</span>
                <span className="nivel-count">{nivelStats.plata}</span>
              </div>
              <div className="nivel-bar">
                <div
                  className="nivel-bar-fill plata"
                  style={{ width: `${stats?.totalConsultoras > 0 ? (nivelStats.plata / stats.totalConsultoras) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="nivel-bar-item">
              <div className="nivel-bar-header">
                <span className="nivel-label">🥉 Bronce</span>
                <span className="nivel-count">{nivelStats.bronce}</span>
              </div>
              <div className="nivel-bar">
                <div
                  className="nivel-bar-fill bronce"
                  style={{ width: `${stats?.totalConsultoras > 0 ? (nivelStats.bronce / stats.totalConsultoras) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
          <p className="niveles-meta">
            💡 Ventas promedio por consultora: <strong>{fmtMonto(stats?.ventasPromedio)}</strong>
          </p>
        </section>

        <section className="rrhh-consultoras-section">
          <div className="section-header-row">
            <h3>Últimas Consultoras</h3>
            <button className="btn-ver-todos" onClick={() => window.location.href = '/dashboard/gestion-consultoras'}>
              Ver todas →
            </button>
          </div>

          {recentConsultoras.length === 0 ? (
            <div className="empty-state">No hay consultoras registradas</div>
          ) : (
            <div className="rrhh-table">
              <div className="table-header">
                <div>Consultora</div>
                <div>Nivel</div>
                <div>Ventas</div>
                <div>Estado</div>
              </div>
              {recentConsultoras.map(c => (
                <div key={c.id} className="table-row">
                  <div className="table-cell-consultora">
                    <div className="cell-avatar" style={{ backgroundColor: getAvatarColor(c.nombre) }}>
                      {getInitials(c.nombre)}
                    </div>
                    <div>
                      <p className="cell-name">{c.nombre}</p>
                      <p className="cell-email">{c.email}</p>
                    </div>
                  </div>
                  <div className="table-cell">
                    <span className={`level-badge ${getNivelClass(c.nivel)}`}>{c.nivel}</span>
                  </div>
                  <div className="table-cell fw-bold">{fmtMonto(c.ventas)}</div>
                  <div className="table-cell">
                    <span className={`status-badge ${c.estado ? 'status-active' : 'status-inactive'}`}>
                      <span className="status-dot" />
                      {c.estado ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="rrhh-right">

        <section className="rrhh-capacitaciones-card">
          <h3>Capacitaciones</h3>
          <div className="cap-stats-grid">
            <div className="cap-stat-item">
              <span className="cap-stat-num pending">{stats?.capacitacionesPendientes ?? 0}</span>
              <span className="cap-stat-lbl">Pendientes</span>
            </div>
            <div className="cap-stat-divider" />
            <div className="cap-stat-item">
              <span className="cap-stat-num done">{stats?.capacitacionesCompletadas ?? 0}</span>
              <span className="cap-stat-lbl">Completadas</span>
            </div>
          </div>
        </section>

        <section className="rrhh-info-card">
          <h3>Acciones Rápidas</h3>
          <div className="quick-actions">
            <button className="action-btn" onClick={() => window.location.href = '/dashboard/gestion-consultoras'}>
              ➕ Nueva Consultora
            </button>
            <button className="action-btn secondary" onClick={() => window.location.href = '/dashboard/capacitaciones-rrhh'}>
              🎓 Ver Capacitaciones
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}