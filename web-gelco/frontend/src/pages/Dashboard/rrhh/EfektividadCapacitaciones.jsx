import { useState, useEffect } from 'react';
import { getCapacitaciones } from '../../../services/capacitacionService';
import { getEfektividadByCapacitacion } from '../../../services/capacitacionService';
import { useToast } from '../../../services/toastService';
import './EfektividadCapacitaciones.css';

function fmtMonto(n) {
  return `S/. ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
}

function fmtFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtPct(n) {
  return `${Number(n || 0).toFixed(1)}%`;
}

function getNivelBadge(nivel) {
  const icons = { 'Oro': '🥇', 'Plata': '🥈', 'Bronce': '🥉' };
  return icons[nivel] || '❓';
}

export default function EfektividadCapacitaciones() {
  const { show } = useToast();
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [efectividad, setEfectividad] = useState(null);
  const [loadingEf, setLoadingEf] = useState(false);

  useEffect(() => {
    getCapacitaciones()
      .then(data => {
        const activas = Array.isArray(data) ? data.filter(c => c.activo) : [];
        setCapacitaciones(activas);
        if (activas.length > 0 && !selectedId) {
          setSelectedId(activas[0].id);
        }
      })
      .catch(() => show('Error al cargar capacitaciones', 'danger'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingEf(true);
    getEfektividadByCapacitacion(selectedId)
      .then(data => setEfectividad(data))
      .catch(() => {
        show('Error al cargar efectividad', 'danger');
        setEfectividad(null);
      })
      .finally(() => setLoadingEf(false));
  }, [selectedId]);

  return (
    <div className="efk-page">
      <div className="efk-header">
        <div className="efk-header-text">
          <h2>Medición de <em>Efectividad</em></h2>
          <p>Evalúa el impacto de las capacitaciones en las ventas de las consultoras</p>
        </div>
      </div>

      <div className="efk-cap-selector">
        <label>Seleccionar Capacitación:</label>
        <select
          value={selectedId || ''}
          onChange={e => setSelectedId(Number(e.target.value))}
        >
          {capacitaciones.map(c => (
            <option key={c.id} value={c.id}>{c.titulo}</option>
          ))}
        </select>
      </div>

      {loadingEf ? (
        <div className="efk-loading">
          <div className="loading-spinner" />
          <p>Calculando efectividad...</p>
        </div>
      ) : efectividad ? (
        <>
          <div className="efk-cap-info">
            <h3>{efectividad.capacitacionTitulo}</h3>
            <p>{efectividad.capacitacionDescripcion}</p>
            <div className="efk-cap-meta">
              <span>📅 {fmtFecha(efectividad.capacitacionFecha)}</span>
              <span>⏱️ {efectividad.duracionMinutos || '—'} min</span>
              <span>🏷️ {efectividad.capacitacionTipo || 'General'}</span>
            </div>
          </div>

          <div className="efk-kpis">
            <div className="efk-kpi-card">
              <div className="efk-kpi-icon">👥</div>
              <div className="efk-kpi-content">
                <span className="efk-kpi-label">Inscripciones</span>
                <span className="efk-kpi-value">{efectividad.totalInscripciones}</span>
              </div>
            </div>
            <div className="efk-kpi-card">
              <div className="efk-kpi-icon">✅</div>
              <div className="efk-kpi-content">
                <span className="efk-kpi-label">Completadas</span>
                <span className="efk-kpi-value">{efectividad.totalCompletadas}</span>
              </div>
            </div>
            <div className="efk-kpi-card">
              <div className="efk-kpi-icon">📊</div>
              <div className="efk-kpi-content">
                <span className="efk-kpi-label">Tasa Completion</span>
                <span className="efk-kpi-value">{fmtPct(efectividad.tasaCompletacion)}</span>
              </div>
            </div>
            <div className="efk-kpi-card">
              <div className="efk-kpi-icon">🎯</div>
              <div className="efk-kpi-content">
                <span className="efk-kpi-label">Puntaje Promedio</span>
                <span className="efk-kpi-value">{efectividad.puntajePromedio}/100</span>
              </div>
            </div>
          </div>

          <div className="efk-ventas-comparison">
            <div className="efk-vc-card">
              <h4>💰 Ventas Promedio</h4>
              <div className="efk-vc-row">
                <div className="efk-vc-item">
                  <span className="efk-vc-label">Antes</span>
                  <span className="efk-vc-value antes">{fmtMonto(efectividad.ventasPromedioAntes)}</span>
                </div>
                <div className="efk-vc-arrow">→</div>
                <div className="efk-vc-item">
                  <span className="efk-vc-label">Después</span>
                  <span className="efk-vc-value despues">{fmtMonto(efectividad.ventasPromedioDespues)}</span>
                </div>
              </div>
            </div>
            <div className="efk-vc-card efk-mejora-card">
              <h4>📈 Mejora Promedio</h4>
              <span className={`efk-mejora-value ${Number(efectividad.porcentajeMejoraPromedio) >= 0 ? 'positiva' : 'negativa'}`}>
                {Number(efectividad.porcentajeMejoraPromedio) >= 0 ? '↑' : '↓'} {fmtPct(efectividad.porcentajeMejoraPromedio)}
              </span>
            </div>
          </div>

          <div className="efk-card efk-detalle-card">
            <h3>Detalle por Consultora</h3>
            {efectividad.detalleConsultoras && efectividad.detalleConsultoras.length > 0 ? (
              <div className="efk-table-wrap">
                <table className="efk-table">
                  <thead>
                    <tr>
                      <th>Consultora</th>
                      <th>Nivel</th>
                      <th>Estado</th>
                      <th>Puntaje</th>
                      <th>Ventas Antes</th>
                      <th>Ventas Después</th>
                      <th>Mejora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {efectividad.detalleConsultoras.map(item => (
                      <tr key={item.consultoraId}>
                        <td>{item.consultoraNombre}</td>
                        <td>
                          <span className={`efk-nivel-badge ${(item.nivel || 'Bronce').toLowerCase()}`}>
                            {getNivelBadge(item.nivel)} {item.nivel || 'Bronce'}
                          </span>
                        </td>
                        <td>
                          <span className={`efk-estado-badge ${item.completado ? 'completada' : 'pendiente'}`}>
                            {item.completado ? '✓ Completada' : '⏳ Pendiente'}
                          </span>
                        </td>
                        <td className="efk-num">
                          {item.puntaje != null ? `${Number(item.puntaje).toFixed(0)}/100` : '—'}
                        </td>
                        <td className="efk-num">{fmtMonto(item.ventasAntes)}</td>
                        <td className="efk-num">{fmtMonto(item.ventasDespues)}</td>
                        <td className={`efk-num ${Number(item.porcentajeMejora) > 0 ? 'positiva' : Number(item.porcentajeMejora) < 0 ? 'negativa' : ''}`}>
                          {item.porcentajeMejora != null && item.porcentajeMejora !== 0
                            ? `${Number(item.porcentajeMejora) > 0 ? '+' : ''}${fmtPct(item.porcentajeMejora)}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="efk-empty">No hay consultoras inscritas en esta capacitación</div>
            )}
          </div>
        </>
      ) : (
        <div className="efk-empty">Selecciona una capacitación para ver su efectividad</div>
      )}
    </div>
  );
}
