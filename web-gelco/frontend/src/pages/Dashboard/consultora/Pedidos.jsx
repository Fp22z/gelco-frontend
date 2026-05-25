import { useState, useEffect, useMemo } from 'react';
import { getMisPedidos, getPedidoById } from '../../../services/pedidoService.js';
import { useToast } from '../../../services/toastService.jsx';
import './Pedidos.css';
import Modal from "../../../components/Modal/Modal.jsx";

// ── Helpers ───────────────────────────────────────────────────────
const AVATAR_COLORS = ['#E8956D','#C94F7C','#2563EB','#059669','#7C3AED','#D97706'];

function avatarColor(nombre) {
  let h = 0;
  for (let c of (nombre || '')) h += c.charCodeAt(0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(nombre) {
  return (nombre || 'C').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function fmtFecha(fechaStr) {
  if (!fechaStr) return '—';
  const d = new Date(fechaStr);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtMonto(n) {
  return `S/. ${Number(n || 0).toFixed(2)}`;
}

function EstadoEntregaBadge({ estado }) {
  const cls = {
    'Creado':             'en-proceso',
    'Enviado a Almacén':  'en-camino',
    'En camino':          'en-camino',
    'Entregado':          'entregado',
    'Cancelado':          'cancelado',
  }[estado] || 'en-proceso';
    return (
    <span className={`modal-status-pill ${cls}`}>
      <span className="status-dot" />
      {estado}
    </span>
  );
}

function estadoPago(pedido) {
  return pedido.estado === 'Entregado' ? 'pagado' : 'pendiente-pago';
}

// ── Modal detalle ─────────────────────────────────────────────────
function ModalDetalle({ pedidoId, onClose }) {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPedidoById(pedidoId)
      .then(setPedido)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pedidoId]);

  return (
    <Modal onClose={onClose} size="lg">
      <div className="modal-pedido-inner">
        <div className="modal-pedido-header">
          <h3 className="modal-nombre">Detalle del Pedido #{pedidoId}</h3>
          <button className="btn-cerrar-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-pedido-body">
          {loading && <p className="pedidos-loading">Cargando detalles...</p>}

          {!loading && pedido && (<>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="lbl">Cliente</span>
                <span className="val">{pedido.clienteNombre}</span>
              </div>
              <div className="modal-info-item">
                <span className="lbl">Fecha</span>
                <span className="val">{fmtFecha(pedido.fecha)}</span>
              </div>
              <div className="modal-info-item">
                <span className="lbl">Estado</span>
                <EstadoEntregaBadge estado={pedido.estado} />
              </div>
              <div className="modal-info-item">
                <span className="lbl">Total</span>
                <span className="val modal-precio-destacado">{fmtMonto(pedido.total)}</span>
              </div>
            </div>

            {pedido.detalles?.length > 0 && (<>
              <p className="modal-detalles-title">Productos del Pedido</p>
              <div className="table-responsive">
                <table className="modal-detalles-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>P. Unit.</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.detalles.map(d => (
                      <tr key={d.id}>
                        <td><strong>{d.productoNombre}</strong></td>
                        <td>{d.cantidad}</td>
                        <td>{fmtMonto(d.precioUnitario)}</td>
                        <td className="text-right font-bold">{fmtMonto(d.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-total-row">
                <span>Total Final</span>
                <span className="modal-precio-destacado">{fmtMonto(pedido.total)}</span>
              </div>
            </>)}
          </>)}

          <div className="modal-actions">
            <button className="btn-modal-cerrar" onClick={onClose}>Cerrar Detalle</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Componente principal ──────────────────────────────────────────
const POR_PAGINA = 6;

export default function Pedidos() {
  const [pedidos, setPedidos]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [busqueda, setBusqueda]         = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos los Estados');
  const [paginaActual, setPaginaActual] = useState(1);
  const [modalId, setModalId]           = useState(null);
  const { show: showToast }             = useToast();

  useEffect(() => {
    getMisPedidos()
      .then(data => setPedidos(Array.isArray(data) ? data : []))
      .catch(() => showToast('Error al cargar pedidos', 'danger'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const pendientes  = pedidos.filter(p => p.estado === 'En proceso').length;
    const enCamino    = pedidos.filter(p => p.estado === 'En camino').length;
    const entregados  = pedidos.filter(p => p.estado === 'Entregado').length;
    const totalVenta  = pedidos.reduce((acc, p) => acc + Number(p.total || 0), 0);
    return { pendientes, enCamino, entregados, totalVenta };
  }, [pedidos]);

  const pedidosFiltrados = useMemo(() => {
    let lista = [...pedidos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(p =>
        p.clienteNombre?.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    }
    if (filtroEstado !== 'Todos los Estados')
      lista = lista.filter(p => p.estado === filtroEstado);
    return lista;
  }, [pedidos, busqueda, filtroEstado]);

  const totalPaginas    = Math.ceil(pedidosFiltrados.length / POR_PAGINA);
  const pedidosPagina   = pedidosFiltrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  const cambiarPagina = (n) => { if (n >= 1 && n <= totalPaginas) setPaginaActual(n); };

  const ESTADOS = ['Todos los Estados', 'Creado', 'Enviado a Almacén', 'En camino', 'Entregado', 'Cancelado'];

  return (
    <div className="mis-pedidos">

      {/* ── HEADER BÚSQUEDA ── */}
      <div className="pedidos-topbar">
        <div className="pedidos-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text" placeholder="Buscar por cliente o ID de pedido..."
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPaginaActual(1); }}
          />
        </div>
        <div className="pedidos-filtros">
          <select
            className="ordenar-select"
            value={filtroEstado}
            onChange={e => { setFiltroEstado(e.target.value); setPaginaActual(1); }}
          >
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      {loading ? (
        <div className="pedidos-stats-skeleton">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card-skeleton">
              <div className="skeleton-stat-icon" />
              <div className="skeleton-stat-info">
                <div className="skeleton-stat-number" />
                <div className="skeleton-stat-label" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pedidos-stats">
          <div className="stat-card">
            <div className="stat-icon pendiente">⏳</div>
            <div className="stat-info">
              <span className="stat-numero">{stats.pendientes}</span>
              <span className="stat-label">Pendientes</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon en-camino">🚚</div>
            <div className="stat-info">
              <span className="stat-numero">{stats.enCamino}</span>
              <span className="stat-label">En Camino</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon entregado">✅</div>
            <div className="stat-info">
              <span className="stat-numero">{stats.entregados}</span>
              <span className="stat-label">Entregados</span>
            </div>
          </div>
          <div className="stat-card total-venta-card">
            <span className="stat-label-top">Total Vendido en Campaña</span>
            <span className="stat-monto">{fmtMonto(stats.totalVenta)}</span>
          </div>
        </div>
      )}

      {/* ── TABLA ── */}
      <div className="pedidos-tabla-wrap">
        {loading && (
          <div className="pedidos-table-skeleton">
            <div className="skeleton-table-header">
              <div className="skeleton-th" style={{ flex: '0.5' }} />
              <div className="skeleton-th" />
              <div className="skeleton-th" style={{ flex: '0.7' }} />
              <div className="skeleton-th" style={{ flex: '0.6' }} />
              <div className="skeleton-th" />
              <div className="skeleton-th" />
              <div className="skeleton-th" style={{ flex: '0.7' }} />
            </div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-table-row">
                <div className="skeleton-td" style={{ flex: '0.5' }} />
                <div className="skeleton-td-avatar" />
                <div className="skeleton-td" style={{ flex: '1.5' }} />
                <div className="skeleton-td" style={{ flex: '0.7' }} />
                <div className="skeleton-td" style={{ flex: '0.6' }} />
                <div className="skeleton-td-badge" />
                <div className="skeleton-td-btn" />
              </div>
            ))}
          </div>
        )}

        {!loading && pedidosFiltrados.length === 0 && (
          <div className="pedidos-empty">No se encontraron pedidos con esos filtros.</div>
        )}

        {!loading && pedidosFiltrados.length > 0 && (
          <table className="pedidos-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado de Pago</th>
                <th>Estado de Entrega</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosPagina.map(p => {
                const pago = estadoPago(p);
                return (
                  <tr key={p.id}>
                    <td><strong>#{p.id}</strong></td>
                    <td>
                      <div className="cliente-cell">
                        <div
                          className="cliente-avatar"
                          style={{ background: avatarColor(p.clienteNombre) }}
                        >
                          {initials(p.clienteNombre)}
                        </div>
                        {p.clienteNombre}
                      </div>
                    </td>
                    <td>{fmtFecha(p.fecha)}</td>
                    <td className="font-bold" style={{color: 'var(--dark-text)'}}>{fmtMonto(p.total)}</td>
                    <td>
                      <span className={`modal-status-pill ${pago}`}>
                        <span className="status-dot" />
                        {pago === 'pagado' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                    <td><EstadoEntregaBadge estado={p.estado} /></td>
                    <td>
                      <button
                        className="btn-ver-detalles"
                        onClick={() => setModalId(p.id)}
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* ── PAGINACIÓN ── */}
        {!loading && totalPaginas > 1 && (
          <div className="pedidos-paginacion">
            <span>
              Mostrando del {((paginaActual - 1) * POR_PAGINA) + 1} al{' '}
              {Math.min(paginaActual * POR_PAGINA, pedidosFiltrados.length)} de {pedidosFiltrados.length}
            </span>
            <div className="paginacion-botones">
              <button
                className="btn-pagina"
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
              >‹</button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  className={`btn-pagina${paginaActual === n ? ' active' : ''}`}
                  onClick={() => cambiarPagina(n)}
                >{n}</button>
              ))}
              <button
                className="btn-pagina"
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
              >›</button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {modalId && (
        <ModalDetalle pedidoId={modalId} onClose={() => setModalId(null)} />
      )}
    </div>
  );
}