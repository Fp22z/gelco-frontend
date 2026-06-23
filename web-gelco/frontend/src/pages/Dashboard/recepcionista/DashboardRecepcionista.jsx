import { useState, useEffect } from 'react';
import { getDevoluciones, getPedidosEntregados } from '../../../services/devolucionService';
import './DashboardRecepcionista.css';

function fmtFecha(f) {
  if (!f) return '-';
  return new Date(f).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function DashboardRecepcionista() {

  const [devoluciones, setDevoluciones]           = useState([]);
  const [pedidosEntregados, setPedidosEntregados] = useState([]);
  const [loading, setLoading]                     = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [devs, pedidos] = await Promise.all([
          getDevoluciones(),
          getPedidosEntregados()
        ]);
        setDevoluciones(Array.isArray(devs)    ? devs    : []);
        setPedidosEntregados(Array.isArray(pedidos) ? pedidos : []);
      } catch {
        // Si falla, muestra ceros
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const totalDevoluciones = devoluciones.length;
  const totalCambios      = devoluciones.filter(d => d.tipo === 'Cambio').length;
  const totalAptos        = devoluciones.filter(d => d.condicionProducto === 'Apto').length;
  const pendientes        = pedidosEntregados.length;

  const recientes = [...devoluciones]
    .sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))
    .slice(0, 5);

  return (
    <div className="rec-page">

      {/* KPIs */}
      <div className="rec-kpis">
        <div className="rec-kpi-card">
          <div className="rec-kpi-icon">📦</div>
          <div className="rec-kpi-content">
            <span className="rec-kpi-label">Pedidos Entregados</span>
            <span className="rec-kpi-value">{loading ? '—' : pendientes}</span>
          </div>
        </div>
        <div className="rec-kpi-card">
          <div className="rec-kpi-icon">↩️</div>
          <div className="rec-kpi-content">
            <span className="rec-kpi-label">Total Devoluciones</span>
            <span className="rec-kpi-value">{loading ? '—' : totalDevoluciones}</span>
          </div>
        </div>
        <div className="rec-kpi-card">
          <div className="rec-kpi-icon">🔁</div>
          <div className="rec-kpi-content">
            <span className="rec-kpi-label">Cambios</span>
            <span className="rec-kpi-value">{loading ? '—' : totalCambios}</span>
          </div>
        </div>
        <div className="rec-kpi-card">
          <div className="rec-kpi-icon">✅</div>
          <div className="rec-kpi-content">
            <span className="rec-kpi-label">Stock Repuesto</span>
            <span className="rec-kpi-value">{loading ? '—' : totalAptos}</span>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="rec-panel-accesos">
        <h3 className="rec-section-title">Acciones rápidas</h3>
        <div className="rec-accesos-grid">
          <div className="rec-acceso-card" onClick={() => navigate('/dashboard/devoluciones')}>
            <div className="rec-acceso-icon">↩️</div>
            <div className="rec-acceso-info">
              <strong>Procesar Devolución</strong>
              <span>Registra devoluciones y cambios de pedidos entregados</span>
            </div>
            <div className="rec-acceso-arrow">→</div>
          </div>
          <div className="rec-acceso-card" onClick={() => navigate('/dashboard/devoluciones')}>
            <div className="rec-acceso-icon">📋</div>
            <div className="rec-acceso-info">
              <strong>Ver Historial</strong>
              <span>Consulta el registro completo de devoluciones y cambios</span>
            </div>
            <div className="rec-acceso-arrow">→</div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="rec-card">
        <h3>Actividad reciente</h3>
        {loading ? (
          <div className="rec-loading">
            <div className="loading-spinner" />
            <p>Cargando...</p>
          </div>
        ) : recientes.length === 0 ? (
          <div className="rec-empty">No hay devoluciones registradas aún</div>
        ) : (
          <div className="rec-table-wrap" style={{ padding: 0 }}>
            <table className="rec-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Condición</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recientes.map(d => (
                  <tr key={d.id}>
                    <td><strong>#{d.pedidoId}</strong></td>
                    <td>{d.clienteNombre}</td>
                    <td className="rec-td-producto">{d.productoNombre}</td>
                    <td>
                      <span className={`rec-tipo-badge ${d.tipo === 'Cambio' ? 'cambio' : 'devolucion'}`}>
                        {d.tipo === 'Cambio' ? '🔁 Cambio' : '↩️ Devolución'}
                      </span>
                    </td>
                    <td>
                      <span className={`rec-cond-badge ${d.condicionProducto === 'Apto' ? 'apto' : 'no-apto'}`}>
                        {d.condicionProducto === 'Apto' ? '✅ Apto' : '❌ No apto'}
                      </span>
                    </td>
                    <td className="rec-td-fecha">{fmtFecha(d.fechaSolicitud)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}