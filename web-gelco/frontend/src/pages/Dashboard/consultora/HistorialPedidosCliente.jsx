import { useState, useEffect, useMemo } from 'react';
import { getMisPedidos } from '../../../services/pedidoService';
import './HistorialPedidosCliente.css';

const STATUS_CONFIG = {
  'Entregado':  { label: 'Entregado',  cls: 'entregado' },
  'En camino':  { label: 'En camino',  cls: 'en-camino' },
  'En proceso': { label: 'En proceso', cls: 'en-proceso' },
};

export default function HistorialPedidosCliente({ cliente, onClose }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [pedidoExpandido, setPedidoExpandido] = useState(null);

  useEffect(() => {
    setLoading(true);
    getMisPedidos()
      .then(data => {
        const lista = Array.isArray(data) ? data : (data?.content || data?.data || []);
        const filtrados = lista.filter(p => 
          String(p.clienteId || p.cliente?.id) === String(cliente.id)
        );
        filtrados.sort((a, b) => new Date(b.fecha || b.fechaCreacion) - new Date(a.fecha || a.fechaCreacion));
        setPedidos(filtrados);
      })
      .catch(err => console.error("Error al cargar historial:", err))
      .finally(() => setLoading(false));
  }, [cliente.id]);

  const stats = useMemo(() => {
    let totalInvertido = 0;
    let pendientes = 0;

    pedidos.forEach(p => {
      const monto = p.total || 0;
      totalInvertido += monto;
      if (p.estado && (p.estado.includes('proceso') || p.estado.includes('camino'))) {
        pendientes++;
      }
    });

    return {
      totalInvertido,
      totalPedidos: pedidos.length,
      pendientes
    };
  }, [pedidos]);

  const pedidosFiltrados = useMemo(() => {
    if (filtroEstado === 'Todos') return pedidos;
    return pedidos.filter(p => p.estado === filtroEstado);
  }, [pedidos, filtroEstado]);

  const toggleExpandirPedido = (id) => {
    setPedidoExpandido(pedidoExpandido === id ? null : id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="historial-modal" onClick={e => e.stopPropagation()}>
        
        <div className="historial-header">
          <div>
            <span className="badge-historial">📋 Historial de Cuenta</span>
            <h2>Pedidos de {cliente.nombre}</h2>
          </div>
          <button className="btn-close-historial" onClick={onClose}>✕</button>
        </div>

        <div className="historial-body">
          {loading ? (
            <div className="historial-loading">Cargando línea de tiempo...</div>
          ) : (
            <>
              <div className="historial-stats-bar">
                <div className="stat-box">
                  <span className="stat-label">Total Invertido</span>
                  <span className="stat-value invertido">S/. {stats.totalInvertido.toFixed(2)}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">N° Pedidos</span>
                  <span className="stat-value">{stats.totalPedidos}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Por Entregar/Pagar</span>
                  <span className="stat-value deudas">{stats.pendientes}</span>
                </div>
              </div>

              <div className="historial-filter-pills">
                {['Todos', 'En proceso', 'En camino', 'Entregado'].map(est => (
                  <button
                    key={est}
                    className={`pill-btn ${filtroEstado === est ? 'active' : ''}`}
                    onClick={() => { setFiltroEstado(est); setPedidoExpandido(null); }}
                  >
                    {est === 'Todos' ? '🌐 Ver Todos' : est}
                  </button>
                ))}
              </div>

              {pedidosFiltrados.length === 0 ? (
                <div className="historial-empty">
                  No se registraron pedidos en el estado seleccionado.
                </div>
              ) : (
                <div className="historial-timeline">
                  {pedidosFiltrados.map(p => {
                    const conf = STATUS_CONFIG[p.estado] || { label: p.estado, cls: 'desconocido' };
                    const esExpandido = pedidoExpandido === p.id;
                    const fechaFormateada = p.fecha ? new Date(p.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha';

                    return (
                      <div 
                        key={p.id} 
                        className={`historial-card ${esExpandido ? 'expanded' : ''}`}
                        onClick={() => toggleExpandirPedido(p.id)}
                      >
                        <div className="historial-card-summary">
                          <div className="card-main-info">
                            <span className="historial-order-id">#{p.id}</span>
                            <span className="historial-date">{fechaFormateada}</span>
                          </div>
                          <div className="card-right-info">
                            <span className="historial-total">S/. {Number(p.total).toFixed(2)}</span>
                            <span className={`historial-status-badge ${conf.cls}`}>{conf.label}</span>
                            <span className="chevron-icon">{esExpandido ? '▲' : '▼'}</span>
                          </div>
                        </div>

                        {esExpandido && (
                          <div className="historial-card-details" onClick={e => e.stopPropagation()}>
                            <h4>Productos incluidos:</h4>
                            <div className="detalles-productos-list">
                              {p.detalles && p.detalles.length > 0 ? (
                                p.detalles.map((det, i) => (
                                  <div key={i} className="detalle-item-row">
                                    {/* CORRECCIÓN: Leemos directamente det.productoNombre y det.precioUnitario */}
                                    <span className="item-name">🛍️ {det.productoNombre || 'Producto Desconocido'}</span>
                                    <span className="item-qty">x{det.cantidad}</span>
                                    <span className="item-price">S/. {Number(det.precioUnitario || 0).toFixed(2)} c/u</span>
                                  </div>
                                ))
                              ) : (
                                <p className="no-products-text">No hay detalles de productos para este pedido.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}