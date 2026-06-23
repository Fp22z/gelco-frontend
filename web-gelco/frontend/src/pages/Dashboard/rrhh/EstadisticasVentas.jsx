import { useState, useEffect, useMemo } from 'react';
import { getConsultoras } from '../../../services/consultoraService';
import { useToast } from '../../../services/toastService';
import './EstadisticasVentas.css';

function fmtMonto(n) {
  return `S/. ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
}

function fmtNumero(n) {
  return Number(n || 0).toLocaleString('es-PE');
}

const NIVELES = ['Bronce', 'Plata', 'Oro'];
const COLORS = {
  oro: '#f59e0b',
  plata: '#64748b',
  bronce: '#e8956d'
};

export default function EstadisticasVentas() {
  const { show } = useToast();
  const [consultoras, setConsultoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNivel, setFiltroNivel] = useState('');
  const [ordenPor, setOrdenPor] = useState('ventas');
  const [ordenarAsc, setOrdenarAsc] = useState(false);

  useEffect(() => {
    getConsultoras()
      .then(data => setConsultoras(Array.isArray(data) ? data : []))
      .catch(() => show('Error al cargar consultoras', 'danger'))
      .finally(() => setLoading(false));
  }, []);

  const statsGlobales = useMemo(() => {
    const lista = filtroNivel ? consultoras.filter(c => c.nivel === filtroNivel) : consultoras;
    const totalVentas = lista.reduce((acc, c) => acc + Number(c.ventasTotales || 0), 0);
    const promedio = lista.length > 0 ? totalVentas / lista.length : 0;
    const maxVentas = lista.length > 0 ? Math.max(...lista.map(c => Number(c.ventasTotales || 0))) : 0;
    const minVentas = lista.length > 0 ? Math.min(...lista.map(c => Number(c.ventasTotales || 0))) : 0;

    const porNivel = NIVELES.map(nivel => {
      const delNivel = lista.filter(c => c.nivel === nivel);
      const ventasNivel = delNivel.reduce((acc, c) => acc + Number(c.ventasTotales || 0), 0);
      return {
        nivel,
        cantidad: delNivel.length,
        ventasTotales: ventasNivel,
        porcentaje: totalVentas > 0 ? (ventasNivel / totalVentas) * 100 : 0,
        promedio: delNivel.length > 0 ? ventasNivel / delNivel.length : 0
      };
    });

    return { totalVentas, promedio, maxVentas, minVentas, porNivel, totalConsultoras: lista.length };
  }, [consultoras, filtroNivel]);

  const consultorasOrdenadas = useMemo(() => {
    const lista = filtroNivel ? [...consultoras.filter(c => c.nivel === filtroNivel)] : [...consultoras];
    lista.sort((a, b) => {
      let aVal, bVal;
      switch (ordenPor) {
        case 'nombre':
          aVal = (a.usuarioNombre || '').toLowerCase();
          bVal = (b.usuarioNombre || '').toLowerCase();
          return ordenarAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'nivel':
          const ordenNivel = { Bronce: 1, Plata: 2, Oro: 3 };
          aVal = ordenNivel[a.nivel] || 0;
          bVal = ordenNivel[b.nivel] || 0;
          return ordenarAsc ? aVal - bVal : bVal - aVal;
        default:
          aVal = Number(a.ventasTotales || 0);
          bVal = Number(b.ventasTotales || 0);
          return ordenarAsc ? aVal - bVal : bVal - aVal;
      }
    });
    return lista;
  }, [consultoras, filtroNivel, ordenPor, ordenarAsc]);

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

  return (
    <div className="est-page">
      <div className="est-header">
        <div className="est-header-text">
          <h2>Estadísticas de <em>Ventas</em></h2>
          <p>Analiza el rendimiento de ventas por consultora y nivel</p>
        </div>
        <div className="est-filtro-nivel">
          <select value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)}>
            <option value="">Todos los niveles</option>
            {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="est-kpis">
        <div className="est-kpi-card">
          <div className="est-kpi-icon">💰</div>
          <div className="est-kpi-content">
            <span className="est-kpi-label">Ventas Totales</span>
            <span className="est-kpi-value">{fmtMonto(statsGlobales.totalVentas)}</span>
          </div>
        </div>
        <div className="est-kpi-card">
          <div className="est-kpi-icon">📊</div>
          <div className="est-kpi-content">
            <span className="est-kpi-label">Promedio</span>
            <span className="est-kpi-value">{fmtMonto(statsGlobales.promedio)}</span>
          </div>
        </div>
        <div className="est-kpi-card">
          <div className="est-kpi-icon">📈</div>
          <div className="est-kpi-content">
            <span className="est-kpi-label">Máximo</span>
            <span className="est-kpi-value">{fmtMonto(statsGlobales.maxVentas)}</span>
          </div>
        </div>
        <div className="est-kpi-card">
          <div className="est-kpi-icon">📉</div>
          <div className="est-kpi-content">
            <span className="est-kpi-label">Mínimo</span>
            <span className="est-kpi-value">{fmtMonto(statsGlobales.minVentas)}</span>
          </div>
        </div>
      </div>

      <div className="est-content-grid">
        <div className="est-card est-niveles-card">
          <h3>Resumen por Nivel</h3>
          <div className="est-niveles-table">
            <div className="est-table-header">
              <span>Nivel</span>
              <span>Consultoras</span>
              <span>Ventas Totales</span>
              <span>Promedio</span>
              <span>% del Total</span>
            </div>
            {statsGlobales.porNivel.map(n => (
              <div key={n.nivel} className="est-table-row">
                <span className={`est-nivel-badge ${n.nivel.toLowerCase()}`}>
                  {n.nivel === 'Oro' ? '🥇' : n.nivel === 'Plata' ? '🥈' : '🥉'} {n.nivel}
                </span>
                <span className="est-cell-num">{n.cantidad}</span>
                <span className="est-cell-monto">{fmtMonto(n.ventasTotales)}</span>
                <span className="est-cell-monto">{fmtMonto(n.promedio)}</span>
                <span className="est-cell-pct">
                  <div className="est-pct-bar">
                    <div
                      className="est-pct-fill"
                      style={{
                        width: `${n.porcentaje}%`,
                        background: COLORS[n.nivel.toLowerCase()]
                      }}
                    />
                  </div>
                  <span>{n.porcentaje.toFixed(1)}%</span>
                </span>
              </div>
            ))}
          </div>
          <div className="est-niveles-chart">
            {statsGlobales.porNivel.map(n => (
              <div key={n.nivel} className="est-chart-bar">
                <div className="est-chart-label">{n.nivel}</div>
                <div className="est-chart-track">
                  <div
                    className="est-chart-fill"
                    style={{
                      height: `${n.porcentaje}%`,
                      background: COLORS[n.nivel.toLowerCase()]
                    }}
                  />
                </div>
                <div className="est-chart-value">{n.porcentaje.toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="est-card est-ranking-card">
          <div className="est-ranking-header">
            <h3>Ranking de Consultoras</h3>
            <div className="est-sort-controls">
              <select value={ordenPor} onChange={e => setOrdenPor(e.target.value)}>
                <option value="ventas">Por ventas</option>
                <option value="nombre">Por nombre</option>
                <option value="nivel">Por nivel</option>
              </select>
              <button
                className={`est-sort-btn ${ordenarAsc ? 'asc' : 'desc'}`}
                onClick={() => setOrdenarAsc(!ordenarAsc)}
                title={ordenarAsc ? 'Ascendente' : 'Descendente'}
              >
                {ordenarAsc ? '↑' : '↓'}
              </button>
            </div>
          </div>
          <div className="est-ranking-list">
            {consultorasOrdenadas.length === 0 ? (
              <div className="est-empty">No hay consultoras</div>
            ) : consultorasOrdenadas.map((c, idx) => {
              const nivelKey = (c.nivel || 'Bronce').toLowerCase();
              return (
                <div key={c.id} className="est-ranking-item">
                  <span className="est-rank">#{idx + 1}</span>
                  <div
                    className="est-rank-avatar"
                    style={{ backgroundColor: getAvatarColor(c.usuarioNombre) }}
                  >
                    {getInitials(c.usuarioNombre)}
                  </div>
                  <div className="est-rank-info">
                    <span className="est-rank-nombre">{c.usuarioNombre}</span>
                    <span className={`est-rank-nivel ${nivelKey}`}>
                      {c.nivel || 'Bronce'}
                    </span>
                  </div>
                  <div className="est-rank-ventas">
                    <span className="est-rank-monto">{fmtMonto(c.ventasTotales)}</span>
                    <span className="est-rank-label">ventas totales</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="est-card est-detalle-card">
        <h3>Detalle de Ventas por Consultora</h3>
        <div className="est-detalle-table-wrap">
          <table className="est-detalle-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Consultora</th>
                <th>Nivel</th>
                <th>Ventas Totales</th>
                <th>% del Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {consultorasOrdenadas.map((c, idx) => (
                <tr key={c.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="est-td-consultora">
                      <div
                        className="est-td-avatar"
                        style={{ backgroundColor: getAvatarColor(c.usuarioNombre) }}
                      >
                        {getInitials(c.usuarioNombre)}
                      </div>
                      <div>
                        <span className="est-td-nombre">{c.usuarioNombre}</span>
                        <span className="est-td-email">{c.usuarioEmail}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`est-nivel-badge-sm ${(c.nivel || 'Bronce').toLowerCase()}`}>
                      {c.nivel || 'Bronce'}
                    </span>
                  </td>
                  <td className="est-td-monto">{fmtMonto(c.ventasTotales)}</td>
                  <td className="est-td-pct">
                    {statsGlobales.totalVentas > 0
                      ? ((Number(c.ventasTotales) / statsGlobales.totalVentas) * 100).toFixed(2)
                      : 0}%
                  </td>
                  <td>
                    <span className={`est-estado-badge ${c.estadoUsuario !== false ? 'activo' : 'inactivo'}`}>
                      <span className="est-estado-dot" />
                      {c.estadoUsuario !== false ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}