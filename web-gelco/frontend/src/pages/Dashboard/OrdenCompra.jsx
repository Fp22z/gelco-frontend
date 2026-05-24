import { useState, useEffect } from 'react';
import { getPedidosDisponibles, getMisOrdenes, generarOrdenes } from '../../services/ordenCompraService';
import { useToast } from '../../services/toastService.jsx';
import './OrdenCompra.css';

function fmtFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtMonto(n) {
  return `S/. ${Number(n || 0).toFixed(2)}`;
}

export default function OrdenCompra() {
  const [tab, setTab] = useState('disponibles');
  const [disponibles, setDisponibles] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const { show: showToast } = useToast();

  const cargarDisponibles = async () => {
    setLoading(true);
    try {
      const data = await getPedidosDisponibles();
      setDisponibles(Array.isArray(data) ? data : []);
    } catch {
      showToast('Error al cargar pedidos disponibles', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const cargarOrdenes = async () => {
    setLoading(true);
    try {
      const data = await getMisOrdenes();
      setOrdenes(Array.isArray(data) ? data : []);
    } catch {
      showToast('Error al cargar órdenes', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'disponibles') cargarDisponibles();
    else cargarOrdenes();
  }, [tab]);

  const toggleSeleccion = (id) => {
    setSeleccionados(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTodos = () => {
    if (seleccionados.size === disponibles.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(disponibles.map(p => p.pedidoId)));
    }
  };

  const handleGenerar = async () => {
    if (seleccionados.size === 0) {
      showToast('Selecciona al menos un pedido', 'warning');
      return;
    }
    setGenerando(true);
    try {
      await generarOrdenes(Array.from(seleccionados));
      showToast(`${seleccionados.size} orden(es) generada(s) exitosamente`, 'success');
      setSeleccionados(new Set());
      setTab('ordenes');
    } catch (e) {
      showToast(e.message || 'Error al generar órdenes', 'danger');
    } finally {
      setGenerando(false);
    }
  };

  const totalSeleccionado = disponibles
    .filter(p => seleccionados.has(p.pedidoId))
    .reduce((acc, p) => acc + Number(p.total || 0), 0);

  return (
    <div className="oc-page">

      {/* HEADER */}
      <div className="oc-header">
        <div>
          <h2 className="oc-title">Orden de Compra</h2>
          <p className="oc-subtitle">Consolida tus pedidos y envíalos al almacén</p>
        </div>
      </div>

      {/* TABS */}
      <div className="oc-tabs">
        <button
          className={`oc-tab ${tab === 'disponibles' ? 'active' : ''}`}
          onClick={() => setTab('disponibles')}
        >
          📋 Pedidos Disponibles
          {disponibles.length > 0 && tab === 'disponibles' && (
            <span className="oc-tab-badge">{disponibles.length}</span>
          )}
        </button>
        <button
          className={`oc-tab ${tab === 'ordenes' ? 'active' : ''}`}
          onClick={() => setTab('ordenes')}
        >
          📦 Mis Órdenes
        </button>
      </div>

      {/* TAB: DISPONIBLES */}
      {tab === 'disponibles' && (
        <div className="oc-content">
          {loading && <div className="oc-loading">Cargando pedidos...</div>}

          {!loading && disponibles.length === 0 && (
            <div className="oc-empty">
              <p>No tienes pedidos en estado "Creado" para enviar.</p>
              <p className="oc-empty-hint">Los pedidos nuevos aparecerán aquí cuando los crees desde el catálogo.</p>
            </div>
          )}

          {!loading && disponibles.length > 0 && (
            <>
              {/* Selector todos */}
              <div className="oc-select-all-row">
                <label className="oc-check-label">
                  <input
                    type="checkbox"
                    checked={seleccionados.size === disponibles.length && disponibles.length > 0}
                    onChange={toggleTodos}
                  />
                  <span>Seleccionar todos ({disponibles.length} pedidos)</span>
                </label>
              </div>

              {/* Lista de pedidos */}
              <div className="oc-lista">
                {disponibles.map(p => (
                  <div
                    key={p.pedidoId}
                    className={`oc-pedido-card ${seleccionados.has(p.pedidoId) ? 'selected' : ''}`}
                    onClick={() => toggleSeleccion(p.pedidoId)}
                  >
                    <input
                      type="checkbox"
                      checked={seleccionados.has(p.pedidoId)}
                      onChange={() => toggleSeleccion(p.pedidoId)}
                      onClick={e => e.stopPropagation()}
                      className="oc-checkbox"
                    />
                    <div className="oc-pedido-info">
                      <div className="oc-pedido-top">
                        <span className="oc-pedido-id">Pedido #{p.pedidoId}</span>
                        <span className="oc-pedido-fecha">{fmtFecha(p.fecha)}</span>
                      </div>
                      <span className="oc-pedido-cliente">👤 {p.clienteNombre}</span>
                    </div>
                    <div className="oc-pedido-total">
                      {fmtMonto(p.total)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer con total y botón */}
              {seleccionados.size > 0 && (
                <div className="oc-footer">
                  <div className="oc-resumen">
                    <span>{seleccionados.size} pedido(s) seleccionado(s)</span>
                    <span className="oc-total-sel">Total: {fmtMonto(totalSeleccionado)}</span>
                  </div>
                  <button
                    className="btn-generar-oc"
                    onClick={handleGenerar}
                    disabled={generando}
                  >
                    {generando ? 'Generando...' : `📤 Enviar Orden de Compra (${seleccionados.size})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB: MIS ÓRDENES */}
      {tab === 'ordenes' && (
        <div className="oc-content">
          {loading && <div className="oc-loading">Cargando órdenes...</div>}

          {!loading && ordenes.length === 0 && (
            <div className="oc-empty">
              <p>Aún no has generado ninguna orden de compra.</p>
              <button className="btn-ir-disponibles" onClick={() => setTab('disponibles')}>
                Ver pedidos disponibles
              </button>
            </div>
          )}

          {!loading && ordenes.length > 0 && (
            <div className="oc-ordenes-lista">
              {ordenes.map(o => (
                <div key={o.id} className="oc-orden-card">
                  <div className="oc-orden-left">
                    <span className="oc-orden-id">OC #{o.id}</span>
                    <span className="oc-orden-pedido">Pedido #{o.pedidoId}</span>
                    <span className="oc-orden-cliente">👤 {o.clienteNombre}</span>
                    <span className="oc-orden-fecha">📅 {fmtFecha(o.fecha)}</span>
                  </div>
                  <div className="oc-orden-right">
                    <span className="oc-orden-total">{fmtMonto(o.total)}</span>
                    <span className={`oc-factura-badge ${o.estadoFactura === 'Pendiente de Pago' ? 'pendiente' : 'pagada'}`}>
                      🧾 {o.estadoFactura || 'Sin factura'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}