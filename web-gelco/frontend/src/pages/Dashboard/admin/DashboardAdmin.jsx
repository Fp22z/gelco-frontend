import { useState, useEffect, useMemo } from 'react';
import { environment } from '../../../environments/environment';
import { getToken } from '../../../services/authService';
import './DashboardAdmin.css';

function fmtMonto(n) {
  return `S/. ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
}

export default function DashboardAdmin() {
  const [kpis, setKpis] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topConsultoras, setTopConsultoras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    Promise.allSettled([
      fetch(`${environment.url}/home`, { headers }).then(r => r.json()),
      fetch(`${environment.url}/pedidos/mis-pedidos`, { headers }).then(r => r.json()),
      fetch(`${environment.url}/usuarios`, { headers }).then(r => r.json()),
    ]).then(([homeRes, pedidosRes, usuariosRes]) => {
      const home = homeRes.status === 'fulfilled' ? homeRes.value : null;
      const pedidos = pedidosRes.status === 'fulfilled' ? (Array.isArray(pedidosRes.value) ? pedidosRes.value : []) : [];
      const usuarios = usuariosRes.status === 'fulfilled' ? (Array.isArray(usuariosRes.value) ? usuariosRes.value : []) : [];

      const ventasTotales = Number(home?.ventasTotales || 0);
      const consultorasActivas = usuarios.filter(u => u.perfil === 'CONSULTORA').length;
      const pedidosPendientes = pedidos.filter(p => p.estado === 'Creado' || p.estado === 'En proceso').length;

      const now = new Date();
      const ventasMes = pedidos
        .filter(p => {
          const d = new Date(p.fecha);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((acc, p) => acc + Number(p.total || 0), 0);

      const meta = 75000;
      const crecimiento = meta > 0 ? Math.round(((ventasTotales - meta) / meta) * 100) : 0;

      setKpis({
        ventasMes: fmtMonto(ventasMes),
        crecimiento: `${crecimiento > 0 ? '+' : ''}${crecimiento}%`,
        consultorasActivas: String(consultorasActivas),
        pedidosPendientes: String(pedidosPendientes),
      });

      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const ultimos6 = [];
      for (let i = 5; i >= 0; i--) {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const ventas = pedidos
          .filter(p => {
            const d = new Date(p.fecha);
            return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
          })
          .reduce((acc, p) => acc + Number(p.total || 0), 0);
        ultimos6.push({ month: meses[m.getMonth()], sales: ventas });
      }
      setChartData(ultimos6);

      const consultoras = usuarios
        .filter(u => u.perfil === 'CONSULTORA')
        .map(u => {
          const pedidosConsultora = pedidos.filter(p => p.consultoraId === u.usuarioId || p.consultoraEmail === u.email);
          const total = pedidosConsultora.reduce((acc, p) => acc + Number(p.total || 0), 0);
          return {
            id: u.usuarioId,
            name: u.nombre || u.email,
            level: u.nivel || 'Bronce',
            amount: fmtMonto(total),
            initials: (u.nombre || 'C').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
            totalVentas: total,
          };
        })
        .sort((a, b) => b.totalVentas - a.totalVentas)
        .slice(0, 5);
      setTopConsultoras(consultoras);

      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const getLevelColor = (level) => {
    switch (level) {
      case 'Oro': return '#F59E0B';
      case 'Plata': return '#9CA3AF';
      case 'Bronce': return '#D97706';
      default: return '#6B7280';
    }
  };

  const maxSales = useMemo(() => Math.max(...chartData.map(d => d.sales), 1), [chartData]);

  if (loading) {
    return (
      <div className="dashboard-admin">
        <section className="kpi-section">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="kpi-card kpi-skeleton">
              <div className="skeleton-icon" />
              <div className="skeleton-content">
                <div className="skeleton-line skeleton-short" />
                <div className="skeleton-line skeleton-medium" />
              </div>
            </div>
          ))}
        </section>
        <div className="admin-content-grid">
          <section className="chart-section chart-skeleton">
            <div className="skeleton-line skeleton-medium" />
            <div className="skeleton-chart-area" />
          </section>
          <section className="top-consultoras-section consultoras-skeleton">
            <div className="skeleton-line skeleton-medium" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="consultora-item consultora-skeleton">
                <div className="skeleton-avatar" />
                <div className="skeleton-content">
                  <div className="skeleton-line skeleton-short" />
                  <div className="skeleton-line skeleton-xs" />
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-admin">
      <section className="kpi-section">
        <div className="kpi-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <p className="kpi-label">Ventas del Mes</p>
            <p className="kpi-value">{kpis?.ventasMes || 'S/. 0.00'}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">📈</div>
          <div className="kpi-content">
            <p className="kpi-label">Crecimiento vs Meta</p>
            <p className="kpi-value">{kpis?.crecimiento || '0%'}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <p className="kpi-label">Consultoras Activas</p>
            <p className="kpi-value">{kpis?.consultorasActivas || '0'}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">📦</div>
          <div className="kpi-content">
            <p className="kpi-label">Pedidos Pendientes</p>
            <p className="kpi-value">{kpis?.pedidosPendientes || '0'}</p>
          </div>
        </div>
      </section>

      <div className="admin-content-grid">
        <section className="chart-section">
          <h3>Ventas en los últimos 6 meses</h3>
          <div className="chart-container">
            <div className="css-bar-chart">
              <div className="chart-y-axis">
                <div className="y-axis-label">{fmtMonto(maxSales)}</div>
                <div className="y-axis-label">{fmtMonto(maxSales * 0.66)}</div>
                <div className="y-axis-label">{fmtMonto(maxSales * 0.33)}</div>
                <div className="y-axis-label">S/. 0</div>
              </div>
              <div className="chart-bars-wrapper">
                <div className="chart-grid-lines">
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                </div>
                <div className="chart-bars">
                  {chartData.map((data) => {
                    const heightPercent = maxSales > 0 ? (data.sales / maxSales) * 100 : 0;
                    return (
                      <div key={data.month} className="bar-group">
                        <div
                          className="bar"
                          style={{ height: `${heightPercent}%` }}
                          title={`${data.month}: ${fmtMonto(data.sales)}`}
                        ></div>
                        <p className="bar-label">{data.month}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="top-consultoras-section">
          <h3>Top 5 Consultoras</h3>
          <div className="consultoras-list">
            {topConsultoras.length === 0 ? (
              <div className="empty-state">No hay consultoras registradas</div>
            ) : (
              topConsultoras.map((consultora, idx) => (
                <div key={consultora.id} className="consultora-item">
                  <span className="consultora-rank">#{idx + 1}</span>
                  <div className="consultora-avatar" style={{ backgroundColor: '#E8956D' }}>
                    {consultora.initials}
                  </div>
                  <div className="consultora-info">
                    <p className="consultora-name">{consultora.name}</p>
                    <span className="level-badge" style={{ backgroundColor: getLevelColor(consultora.level) }}>
                      {consultora.level}
                    </span>
                  </div>
                  <p className="consultora-amount">{consultora.amount}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
