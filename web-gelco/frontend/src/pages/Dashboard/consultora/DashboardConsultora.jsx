import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInfoSession } from '../../../services/sessionService';
import { getToken } from '../../../services/authService';
import { getMisPedidos } from '../../../services/pedidoService';
import { environment } from '../../../environments/environment';
import './DashboardConsultora.css';

function fmtMonto(n) {
  return `S/. ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
}

function fmtFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const STATUS_STYLES = {
  'Creado':            { bg: '#fef3c7', color: '#d97706' },
  'Enviado a Almacén': { bg: '#dbeafe', color: '#2563eb' },
  'En camino':         { bg: '#e0f2fe', color: '#0284c7' },
  'Entregado':         { bg: '#d1fae5', color: '#059669' },
  'Cancelado':         { bg: '#fee2e2', color: '#dc2626' },
};

export default function DashboardConsultora() {
  const navigate = useNavigate();
  const session = getInfoSession();

  const [homeData, setHomeData]         = useState(null);
  const [pedidos, setPedidos]           = useState([]);
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    Promise.all([
      fetch(`${environment.url}/home`, { headers }).then(r => r.json()),
      fetch(`${environment.url}/pedidos/mis-pedidos`, { headers }).then(r => r.json()),
    ]).then(([home, pedidosData]) => {
      setHomeData(home);
      const lista = Array.isArray(pedidosData) ? pedidosData : [];
      setPedidos(lista.slice(0, 5));

      // Cargar capacitaciones si hay consultoraId
      if (home?.consultoraId) {
        fetch(`${environment.url}/capacitaciones/consultora/${home.consultoraId}`, { headers })
          .then(r => r.json())
          .then(data => setCapacitaciones(Array.isArray(data) ? data.slice(0, 4) : []))
          .catch(() => setCapacitaciones([]));
      }
    }).catch(() => {
      setHomeData(null);
      setPedidos([]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '12px', color: '#6b7280' }}>
        <div className="loading-spinner" />
        Cargando tu panel...
      </div>
    );
  }

  const ventasTotales = Number(homeData?.ventasTotales || 0);
  const nivel = homeData?.nivel || 'Sin nivel';
  const meta = nivel === 'Oro' ? 5000 : nivel === 'Plata' ? 2000 : 1000;
  const porcentaje = Math.min(Math.round((ventasTotales / meta) * 100), 100);
  const iniciales = session?.nombre
    ? session.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'CO';

  const nivelClass = nivel?.toLowerCase() === 'oro' ? 'oro'
    : nivel?.toLowerCase() === 'plata' ? 'plata' : 'bronce';

  return (
    <div className="dashboard-consultora">

      {/* LEFT PANEL */}
      <div className="consultora-left">

        {/* PERFIL DE VENTAS */}
        <section className="perfil-ventas-card">
          <h3>Mi Perfil de Ventas</h3>
          <div className="perfil-header">
            <div className="perfil-avatar">{iniciales}</div>
            <div className="perfil-info">
              <p className="perfil-name">{session?.nombre || 'Consultora'}</p>
              <span className={`perfil-level ${nivelClass}`}>{nivel}</span>
            </div>
          </div>

          {/* KPI chips */}
          <div className="perfil-kpis">
            <div className="perfil-kpi">
              <span className="kpi-num">{homeData?.pedidosPendientes ?? 0}</span>
              <span className="kpi-lbl">Creados</span>
            </div>
            <div className="perfil-kpi">
              <span className="kpi-num">{homeData?.pedidosEnCamino ?? 0}</span>
              <span className="kpi-lbl">En camino</span>
            </div>
            <div className="perfil-kpi">
              <span className="kpi-num">{homeData?.pedidosEntregados ?? 0}</span>
              <span className="kpi-lbl">Entregados</span>
            </div>
            <div className="perfil-kpi accent">
              <span className="kpi-num">{fmtMonto(homeData?.ventasDelMes)}</span>
              <span className="kpi-lbl">Este mes</span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="perfil-progress">
            <div className="progress-label-row">
              <span>Ventas acumuladas</span>
              <span>{porcentaje}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${porcentaje}%` }} />
            </div>
            <p className="progress-text">
              {fmtMonto(ventasTotales)} / {fmtMonto(meta)} — Meta {nivel}
            </p>
          </div>
        </section>

        {/* ÚLTIMOS PEDIDOS */}
        <section className="pedidos-section">
          <div className="section-header-row">
            <h3>Últimos Pedidos</h3>
            <button className="btn-ver-todos" onClick={() => navigate('/dashboard/pedidos')}>
              Ver todos →
            </button>
          </div>

          {pedidos.length === 0 ? (
            <div className="empty-state">No tienes pedidos aún</div>
          ) : (
            <div className="pedidos-table">
              <div className="table-header">
                <div>#</div>
                <div>Cliente</div>
                <div>Fecha</div>
                <div>Total</div>
                <div>Estado</div>
              </div>
              {pedidos.map(p => {
                const st = STATUS_STYLES[p.estado] || { bg: '#f3f4f6', color: '#6b7280' };
                return (
                  <div key={p.id} className="table-row">
                    <div className="table-cell">#{p.id}</div>
                    <div className="table-cell">{p.clienteNombre || '—'}</div>
                    <div className="table-cell">{fmtFecha(p.fecha)}</div>
                    <div className="table-cell fw-bold">{fmtMonto(p.total)}</div>
                    <div className="table-cell">
                      <span className="status-badge" style={{ background: st.bg, color: st.color }}>
                        {p.estado}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* RIGHT PANEL */}
      <div className="consultora-right">       

        {/* MIS CAPACITACIONES */}
        <section className="capacitaciones-section">
          <h3>Mis Capacitaciones</h3>
          {capacitaciones.length === 0 ? (
            <div className="empty-state">No hay capacitaciones asignadas</div>
          ) : (
            <div className="capacitaciones-list">
              {capacitaciones.map(cap => {
                const progreso = cap.completado ? 100 : (cap.puntaje ? Math.round(Number(cap.puntaje)) : 0);
                return (
                  <div key={cap.id} className="capacitacion-item">
                    <div className="cap-header-row">
                      <p className="cap-title">{cap.capacitacionTitulo}</p>
                      {cap.completado && <span className="cap-done-badge">✓</span>}
                    </div>
                    <div className="cap-progress">
                      <div className="cap-progress-bar">
                        <div className="cap-progress-fill" style={{ width: `${progreso}%` }} />
                      </div>
                      <span className="cap-percentage">{cap.completado ? '100%' : `${progreso}%`}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* RESUMEN CAPACITACIONES */}
        {homeData && (
          <section className="cap-resumen-card">
            <div className="cap-resumen-item">
              <span className="cap-resumen-num pending">{homeData.capacitacionesPendientes ?? 0}</span>
              <span className="cap-resumen-lbl">Pendientes</span>
            </div>
            <div className="cap-resumen-divider" />
            <div className="cap-resumen-item">
              <span className="cap-resumen-num done">{homeData.capacitacionesCompletadas ?? 0}</span>
              <span className="cap-resumen-lbl">Completadas</span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}