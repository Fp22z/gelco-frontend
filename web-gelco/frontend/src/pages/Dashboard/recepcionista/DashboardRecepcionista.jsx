import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  getPedidosEntregados, 
  getPedidoById, 
  crearDevolucion, 
  getDevoluciones, 
  getDisponibleParaDevolucion // <-- Agregado en los imports
} from '../../../services/devolucionService';
import { useToast } from '../../../services/toastService';
import './DashboardRecepcionista.css';

function fmtFecha(f) {
  if (!f) return '-';
  return new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtMonto(n) {
  return `S/. ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
}

// ── Modal para registrar devolución de un ítem ──────────────────────────────
function DevolucionModal({ detalle, pedido, onSave, onClose }) {
  const { show } = useToast();
  const [form, setForm] = useState({
    tipo: 'Devolucion',
    cantidad: 1,
    motivo: '',
    condicionProducto: 'Apto',
    observaciones: ''
  });
  const [saving, setSaving] = useState(false);
  const maxDisponible = detalle.disponible ?? detalle.cantidad;

  const handleSubmit = async () => {
    if (form.cantidad < 1 || form.cantidad > maxDisponible) {
      show(`Cantidad debe ser entre 1 y ${maxDisponible}`, 'danger');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        detallePedidoId: detalle.id,
        cantidad: parseInt(form.cantidad),
        tipo: form.tipo,
        motivo: form.motivo,
        condicionProducto: form.condicionProducto,
        observaciones: form.observaciones
      });
      show('Devolución registrada correctamente', 'success');
      onClose();
    } catch (err) {
      show(err.message || 'Error al registrar', 'danger');
    } finally {
      setSaving(false);
    }
  };

  return createPortal((
    <div className="rec-modal-overlay" onClick={onClose}>
      <div className="rec-modal" onClick={e => e.stopPropagation()}>
        <div className="rec-modal-header">
          <div>
            <h3>Registrar Devolución</h3>
            <p className="rec-modal-sub">Pedido #{pedido.id} — {pedido.clienteNombre}</p>
          </div>
          <button className="rec-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="rec-modal-body">
          {/* Producto info */}
          <div className="rec-producto-info">
            <span className="rec-producto-nombre">{detalle.productoNombre}</span>
            <div className="rec-producto-meta">
              <span>Comprado: <strong>{detalle.cantidad}</strong></span>
              <span>Ya devuelto: <strong>{detalle.cantidad - maxDisponible}</strong></span>
              <span className="rec-disponible">Disponible: <strong>{maxDisponible}</strong></span>
            </div>
          </div>

          <div className="rec-form-row">
            <div className="rec-form-group">
              <label>Tipo *</label>
              <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                <option value="Devolucion">Devolución</option>
                <option value="Cambio">Cambio</option>
              </select>
            </div>
            <div className="rec-form-group">
              <label>Cantidad * (máx. {maxDisponible})</label>
              <input
                type="number"
                min={1}
                max={maxDisponible}
                value={form.cantidad}
                onChange={e => setForm({ ...form, cantidad: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="rec-form-group">
            <label>Condición del producto *</label>
            <div className="rec-radio-group">
              <label className={`rec-radio-btn ${form.condicionProducto === 'Apto' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="Apto"
                  checked={form.condicionProducto === 'Apto'}
                  onChange={() => setForm({ ...form, condicionProducto: 'Apto' })}
                />
                ✅ Apto — se repone stock
              </label>
              <label className={`rec-radio-btn ${form.condicionProducto === 'No apto' ? 'selected danger' : ''}`}>
                <input
                  type="radio"
                  value="No apto"
                  checked={form.condicionProducto === 'No apto'}
                  onChange={() => setForm({ ...form, condicionProducto: 'No apto' })}
                />
                ❌ No apto — no se repone stock
              </label>
            </div>
          </div>

          <div className="rec-form-group">
            <label>Motivo</label>
            <input
              type="text"
              placeholder="Ej: Producto defectuoso, talla incorrecta..."
              value={form.motivo}
              onChange={e => setForm({ ...form, motivo: e.target.value })}
            />
          </div>

          <div className="rec-form-group">
            <label>Observaciones</label>
            <textarea
              rows={3}
              placeholder="Notas adicionales para el registro..."
              value={form.observaciones}
              onChange={e => setForm({ ...form, observaciones: e.target.value })}
            />
          </div>
        </div>

        <div className="rec-modal-footer">
          <button className="rec-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="rec-btn-save" onClick={handleSubmit} disabled={saving || maxDisponible === 0}>
            {saving ? 'Guardando...' : 'Registrar Devolución'}
          </button>
        </div>
      </div>
    </div>
  ), document.body);
}

// ── Componente principal ────────────────────────────────────────────────────
export default function DashboardRecepcionista() {
  const { show } = useToast();

  // Pedidos
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [busquedaId, setBusquedaId] = useState('');
  const [loadingPedidos, setLoadingPedidos] = useState(true);

  // Historial
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);

  // Modal
  const [detalleModal, setDetalleModal] = useState(null);

  // Tabs
  const [activeTab, setActiveTab] = useState('pedidos');

  const cargarPedidos = async () => {
    setLoadingPedidos(true);
    try {
      const data = await getPedidosEntregados();
      setPedidos(Array.isArray(data) ? data : []);
    } catch {
      show('Error al cargar pedidos entregados', 'danger');
    } finally {
      setLoadingPedidos(false);
    }
  };

  const cargarHistorial = async () => {
    setLoadingHistorial(true);
    try {
      const data = await getDevoluciones();
      setHistorial(Array.isArray(data) ? data : []);
    } catch {
      show('Error al cargar historial', 'danger');
    } finally {
      setLoadingHistorial(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
    cargarHistorial();
  }, []);

  // CORRECCIÓN INTEGRADA: handleSeleccionarPedido con Promise.all
  const handleSeleccionarPedido = async (pedidoId) => {
    try {
      const data = await getPedidoById(pedidoId);
      
      const detallesConDisponible = await Promise.all(
        (data.detalles || []).map(async (det) => {
          try {
            const { disponible } = await getDisponibleParaDevolucion(det.id);
            return { ...det, disponible };
          } catch {
            return { ...det, disponible: det.cantidad };
          }
        })
      );

      setPedidoSeleccionado({ ...data, detalles: detallesConDisponible });
    } catch {
      show('Error al cargar detalle del pedido', 'danger');
    }
  };

  // CORRECCIÓN INTEGRADA: handleBuscar enriqueciendo los detalles
  const handleBuscar = async () => {
    if (!busquedaId.trim()) return;
    try {
      const data = await getPedidoById(busquedaId.trim());
      if (data.estado !== 'Entregado') {
        show(`El pedido está en estado "${data.estado}". Solo se procesan pedidos Entregados.`, 'danger');
        return;
      }
      const detallesConDisponible = await Promise.all(
        (data.detalles || []).map(async (det) => {
          try {
            const { disponible } = await getDisponibleParaDevolucion(det.id);
            return { ...det, disponible };
          } catch {
            return { ...det, disponible: det.cantidad };
          }
        })
      );
      setPedidoSeleccionado({ ...data, detalles: detallesConDisponible });
    } catch {
      show('Pedido no encontrado', 'danger');
    }
  };

  const handleRegistrarDevolucion = async (payload) => {
    await crearDevolucion(payload);
    // Refrescar usando el método corregido para traer los disponibles reales al instante
    if (pedidoSeleccionado) {
      await handleSeleccionarPedido(pedidoSeleccionado.id);
    }
    cargarHistorial();
  };

  // Pedidos filtrados por búsqueda de texto
  const pedidosFiltrados = pedidos.filter(p => {
    if (!busquedaId.trim()) return true;
    const q = busquedaId.toLowerCase();
    return String(p.id).includes(q) || (p.clienteNombre || '').toLowerCase().includes(q);
  });

  // KPIs del historial
  const totalDevoluciones = historial.length;
  const totalCambios = historial.filter(d => d.tipo === 'Cambio').length;
  const totalAptos = historial.filter(d => d.condicionProducto === 'Apto').length;

  return (
    <div className="rec-page">
      {/* Header */}
      <div className="rec-header">
        <div className="rec-header-text">
          <h2>Gestión de <em>Devoluciones</em></h2>
          <p>Valida y registra devoluciones y cambios de productos entregados</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="rec-kpis">
        <div className="rec-kpi-card">
          <div className="rec-kpi-icon">¼</div>
          <div className="rec-kpi-content">
            <span className="rec-kpi-label">Total Procesadas</span>
            <span className="rec-kpi-value">{totalDevoluciones}</span>
          </div>
        </div>
        <div className="rec-kpi-card">
          <div className="rec-kpi-icon">🔁</div>
          <div className="rec-kpi-content">
            <span className="rec-kpi-label">Cambios</span>
            <span className="rec-kpi-value">{totalCambios}</span>
          </div>
        </div>
        <div className="rec-kpi-card">
          <div className="rec-kpi-icon">✅</div>
          <div className="rec-kpi-content">
            <span className="rec-kpi-label">Stock Repuesto</span>
            <span className="rec-kpi-value">{totalAptos}</span>
          </div>
        </div>
        <div className="rec-kpi-card">
          <div className="rec-kpi-icon">📦</div>
          <div className="rec-kpi-content">
            <span className="rec-kpi-label">Pedidos Entregados</span>
            <span className="rec-kpi-value">{pedidos.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rec-tabs">
        <button className={`rec-tab ${activeTab === 'pedidos' ? 'active' : ''}`} onClick={() => setActiveTab('pedidos')}>
          Procesar Devolución
        </button>
        <button className={`rec-tab ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>
          Historial ({historial.length})
        </button>
      </div>

      {/* ── TAB: PROCESAR DEVOLUCIÓN ── */}
      {activeTab === 'pedidos' && (
        <div className="rec-split">

          {/* Panel izquierdo: lista de pedidos */}
          <div className="rec-panel-left">
            <div className="rec-panel-header">
              <h3>Pedidos Entregados</h3>
              <div className="rec-search-row">
                <input
                  type="text"
                  placeholder="Buscar por ID o cliente..."
                  value={busquedaId}
                  onChange={e => setBusquedaId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                />
                <button className="rec-btn-buscar" onClick={handleBuscar}>🔍</button>
              </div>
            </div>

            {loadingPedidos ? (
              <div className="rec-loading"><div className="loading-spinner" /><p>Cargando...</p></div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="rec-empty">No hay pedidos entregados</div>
            ) : (
              <div className="rec-pedidos-list">
                {pedidosFiltrados.map(p => (
                  <div
                    key={p.id}
                    className={`rec-pedido-item ${pedidoSeleccionado?.id === p.id ? 'selected' : ''}`}
                    onClick={() => handleSeleccionarPedido(p.id)}
                  >
                    <div className="rec-pedido-top">
                      <span className="rec-pedido-id">Pedido #{p.id}</span>
                      <span className="rec-pedido-total">{fmtMonto(p.total)}</span>
                    </div>
                    <div className="rec-pedido-cliente">{p.clienteNombre}</div>
                    <div className="rec-pedido-fecha">{fmtFecha(p.fecha)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel derecho: detalle del pedido seleccionado */}
          <div className="rec-panel-right">
            {!pedidoSeleccionado ? (
              <div className="rec-placeholder">
                <span className="rec-placeholder-icon">👈</span>
                <p>Selecciona un pedido para ver sus ítems y procesar devoluciones</p>
              </div>
            ) : (
              <>
                <div className="rec-detalle-header">
                  <div>
                    <h3>Pedido #{pedidoSeleccionado.id}</h3>
                    <p>{pedidoSeleccionado.clienteNombre} — {fmtFecha(pedidoSeleccionado.fecha)}</p>
                  </div>
                  <span className="rec-badge-entregado">Entregado</span>
                </div>

                <div className="rec-table-wrap">
                  <table className="rec-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cant.</th>
                        <th>Precio Unit.</th>
                        <th>Disponible</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pedidoSeleccionado.detalles || []).map(det => {
                        const disponible = det.disponible ?? det.cantidad;
                        const agotado = disponible === 0;
                        return (
                          <tr key={det.id} className={agotado ? 'rec-row-agotado' : ''}>
                            <td className="rec-td-producto">{det.productoNombre}</td>
                            <td>{det.cantidad}</td>
                            <td>{fmtMonto(det.precioUnitario)}</td>
                            <td>
                              <span className={`rec-disponible-badge ${agotado ? 'cero' : 'ok'}`}>
                                {disponible}
                              </span>
                            </td>
                            <td>
                              <button
                                className="rec-btn-devolver"
                                disabled={agotado}
                                onClick={() => setDetalleModal({ ...det, disponible })}
                              >
                                {agotado ? 'Completado' : '↩ Devolver'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: HISTORIAL ── */}
      {activeTab === 'historial' && (
        <div className="rec-card">
          <h3>Historial de Devoluciones</h3>
          {loadingHistorial ? (
            <div className="rec-loading"><div className="loading-spinner" /><p>Cargando...</p></div>
          ) : historial.length === 0 ? (
            <div className="rec-empty">No hay devoluciones registradas</div>
          ) : (
            <div className="rec-table-wrap">
              <table className="rec-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Tipo</th>
                    <th>Condición</th>
                    <th>Motivo</th>
                    <th>Recepcionista</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map(d => (
                    <tr key={d.id}>
                      <td>#{d.id}</td>
                      <td>#{d.pedidoId}</td>
                      <td>{d.clienteNombre}</td>
                      <td className="rec-td-producto">{d.productoNombre}</td>
                      <td>{d.cantidad}</td>
                      <td>
                        <span className={`rec-tipo-badge ${d.tipo === 'Cambio' ? 'cambio' : 'devolucion'}`}>
                          {d.tipo === 'Cambio' ? '🔁 Cambio' : '¼ Devolución'}
                        </span>
                      </td>
                      <td>
                        <span className={`rec-cond-badge ${d.condicionProducto === 'Apto' ? 'apto' : 'no-apto'}`}>
                          {d.condicionProducto === 'Apto' ? '✅ Apto' : '❌ No apto'}
                        </span>
                      </td>
                      <td className="rec-td-motivo">{d.motivo || '-'}</td>
                      <td>{d.recepcionistaNombre}</td>
                      <td className="rec-td-fecha">{fmtFecha(d.fechaSolicitud)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal devolución */}
      {detalleModal && (
        <DevolucionModal
          detalle={detalleModal}
          pedido={pedidoSeleccionado}
          onSave={handleRegistrarDevolucion}
          onClose={() => setDetalleModal(null)}
        />
      )}
    </div>
  );
}