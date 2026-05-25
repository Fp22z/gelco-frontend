import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../../../context/CartContext'; 
import { getClientes, deleteCliente } from '../../../services/clienteService';
import { getMisPedidos } from '../../../services/pedidoService'; 
import { useToast } from '../../../services/toastService.jsx';
import RegistrarCliente from './RegistrarCliente';
import './MisClientes.css';
import RecomendarProductos from './RecomendarProductos';
import HistorialPedidosCliente from './HistorialPedidosCliente';

const PREFERENCIAS_COLORES = {
  'Maquillaje juvenil':     { bg: '#FEE2E2', color: '#DC2626', icon: '🏷️' },
  'Fragancias frutales':    { bg: '#D1FAE5', color: '#059669', icon: '🌿' },
  'Cuidado facial':         { bg: '#EDE9FE', color: '#7C3AED', icon: '💧' },
  'Cuidado corporal':       { bg: '#FEF3C7', color: '#D97706', icon: '✨' },
  'Cabello y tratamientos': { bg: '#DBEAFE', color: '#2563EB', icon: '💇' },
  'Perfumería':             { bg: '#FCE7F3', color: '#DB2777', icon: '🌸' },
};

function getInitials(nombre) {
  return (nombre || 'C').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  '#E8956D', '#C94F7C', '#2563EB', '#059669', '#7C3AED', '#D97706'
];

function getAvatarColor(nombre) {
  let hash = 0;
  for (let c of (nombre || '')) hash += c.charCodeAt(0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function MisClientes() {
  const { agregarAlCarrito } = useCart(); 

  const [clientes, setClientes] = useState([]);
  const [clienteRecomendar, setClienteRecomendar] = useState(null);
  const [clienteHistorial, setClienteHistorial] = useState(null);
  
  // === NUEVOS ESTADOS PARA EL MODAL DE ELIMINACIÓN ===
  const [clienteEliminar, setClienteEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEditar, setClienteEditar] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const POR_PAGINA = 6;
  const { show: showToast } = useToast();

  const [showFiltros, setShowFiltros] = useState(false);
  const [filtroPendiente, setFiltroPendiente] = useState(false);
  const [filtroPreferencia, setFiltroPreferencia] = useState('Todas');

  const fetchClientes = async () => {
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (e) {
      showToast('Error al cargar clientes', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClientes(); }, []);

  const preferenciasUnicas = useMemo(() => {
    const setPrefs = new Set();
    clientes.forEach(c => {
      if (c.preferencias) {
        c.preferencias.split(',').forEach(p => setPrefs.add(p.trim()));
      }
    });
    return ['Todas', ...Array.from(setPrefs).filter(Boolean).sort()];
  }, [clientes]);

  const clientesFiltrados = clientes.filter(c => {
    const matchBusqueda = c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || c.telefono?.includes(busqueda);
    if (!matchBusqueda) return false;
    if (filtroPendiente && !c.tienePendiente) return false;
    if (filtroPreferencia !== 'Todas') {
      const prefs = c.preferencias ? c.preferencias.split(',').map(p => p.trim()) : [];
      if (!prefs.includes(filtroPreferencia)) return false;
    }
    return true;
  });

  const totalPaginas = Math.ceil(clientesFiltrados.length / POR_PAGINA);
  const clientesPagina = clientesFiltrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  // === LÓGICA DEL NUEVO MODAL DE ELIMINACIÓN ===
  const confirmarEliminacion = async () => {
    if (!clienteEliminar) return;
    setIsDeleting(true);
    try {
      await deleteCliente(clienteEliminar.id);
      showToast('Cliente eliminado', 'success');
      fetchClientes();
      setClienteEliminar(null);
    } catch {
      showToast('Error al eliminar cliente', 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditar = (cliente) => {
    setClienteEditar(cliente);
    setModalOpen(true);
  };

  const handleNuevo = () => {
    setClienteEditar(null);
    setModalOpen(true);
  };

  const handleModalClose = (recarga = false) => {
    setModalOpen(false);
    setClienteEditar(null);
    if (recarga) fetchClientes();
  };

  const getPreferenciasArray = (pref) => {
    if (!pref) return [];
    return pref.split(',').map(p => p.trim()).filter(Boolean);
  };

  if (loading) return (
    <div className="mis-clientes">
      <div className="clientes-skeleton-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="cliente-card-skeleton">
            <div className="skeleton-header-row">
              <div className="skeleton-avatar-circle" />
              <div className="skeleton-info-block">
                <div className="skeleton-name" />
                <div className="skeleton-phone" />
              </div>
            </div>
            <div className="skeleton-detail-row" />
            <div className="skeleton-prefs-row">
              <div className="skeleton-pref-tag" />
              <div className="skeleton-pref-tag" />
            </div>
            <div className="skeleton-footer-row" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mis-clientes">

      <div className="clientes-header">
        <div className="clientes-search-row">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Buscar por nombre o teléfono..."
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPaginaActual(1); }}
            />
          </div>
          
          <div className="filtros-wrapper">
            <button 
              className={`btn-filtros ${filtroPendiente || filtroPreferencia !== 'Todas' ? 'filtros-activos' : ''}`} 
              onClick={() => setShowFiltros(!showFiltros)}
            >
              ⚙ Filtros {(filtroPendiente || filtroPreferencia !== 'Todas') ? '(Activos)' : ''}
            </button>

            {showFiltros && (
              <div className="filtros-dropdown">
                <h4 className="filtros-title">Filtrar clientes</h4>
                
                <label className="filtro-check">
                  <input 
                    type="checkbox" 
                    checked={filtroPendiente} 
                    onChange={e => { setFiltroPendiente(e.target.checked); setPaginaActual(1); }} 
                  />
                  Solo con pago pendiente ⚠
                </label>

                <div className="filtro-select-group">
                  <label>Preferencia principal:</label>
                  <select 
                    value={filtroPreferencia} 
                    onChange={e => { setFiltroPreferencia(e.target.value); setPaginaActual(1); }}
                  >
                    {preferenciasUnicas.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {(filtroPendiente || filtroPreferencia !== 'Todas') && (
                  <button 
                    className="btn-limpiar-filtros"
                    onClick={() => {
                      setFiltroPendiente(false);
                      setFiltroPreferencia('Todas');
                      setPaginaActual(1);
                    }}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <button className="btn-nuevo-cliente" onClick={handleNuevo}>
          + Registrar Nuevo Cliente
        </button>
      </div>

      {clientesPagina.length === 0 ? (
        <div className="clientes-empty">
          <p>No se encontraron clientes con estos filtros.</p>
          {(filtroPendiente || filtroPreferencia !== 'Todas' || busqueda) && (
            <button 
              className="btn-ver-todos" 
              onClick={() => { setBusqueda(''); setFiltroPendiente(false); setFiltroPreferencia('Todas'); }}
            >
              Limpiar búsqueda y filtros
            </button>
          )}
        </div>
      ) : (
        <div className="clientes-grid">
          {clientesPagina.map(cliente => {
            const prefs = getPreferenciasArray(cliente.preferencias);
            const avatarColor = getAvatarColor(cliente.nombre);

            return (
              <div 
                key={cliente.id} 
                className="cliente-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setClienteHistorial(cliente)} 
              >
                <div className="card-header-row">
                  <div className="cliente-avatar" style={{ background: avatarColor }}>
                    {getInitials(cliente.nombre)}
                  </div>
                  <div className="cliente-info">
                    <h4>{cliente.nombre}</h4>
                    <span>{cliente.telefono || 'Sin teléfono'}</span>
                  </div>
                  <div className="card-actions" onClick={e => e.stopPropagation()}> 
                    <button className="btn-menu" onClick={(e) => { e.stopPropagation(); handleEditar(cliente); }}>···</button>
                    {cliente.telefono && (
                      <a 
                        href={`https://wa.me/${cliente.telefono?.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn-whatsapp"
                        onClick={e => e.stopPropagation()} 
                      >
                        <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.527 5.845L.057 23.882l6.174-1.452A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.015-1.378l-.36-.214-3.664.862.878-3.57-.235-.368A9.818 9.818 0 1112 21.818z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>

                <div className="cliente-detalles">
                  {cliente.direccion && (
                    <div className="detalle-row">
                      <span className="detalle-icon">📍</span>
                      <span>{cliente.direccion}</span>
                    </div>
                  )}
                </div>

                {prefs.length > 0 && (
                  <div className="cliente-prefs">
                    {prefs.map(pref => {
                      const estilo = PREFERENCIAS_COLORES[pref] || { bg: '#F3F4F6', color: '#6B7280', icon: '🏷️' };
                      return (
                        <span key={pref} className="pref-tag" style={{ background: estilo.bg, color: estilo.color }}>
                          {estilo.icon} {pref}
                        </span>
                      );
                    })}
                  </div>
                )}

                {cliente.tienePendiente && (
                  <p className="alerta-pendiente">⚠ Tiene un pedido pendiente de pago.</p>
                )}

                <div className="card-footer-row" onClick={e => e.stopPropagation()}> 
                  <span>📅 {cliente.totalPedidos ?? 0} pedidos</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-recomendar-card"
                      onClick={(e) => { e.stopPropagation(); setClienteRecomendar(cliente); }} 
                    >
                      ⭐ Recomendar
                    </button>
                    {/* EN LUGAR DE LLAMAR A LA API DIRECTO, ABRIMOS EL MODAL */}
                    <button className="btn-eliminar-card" onClick={(e) => { e.stopPropagation(); setClienteEliminar(cliente); }}>🗑️</button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="paginacion">
          <span className="pag-info">
            Mostrando clientes del {(paginaActual - 1) * POR_PAGINA + 1} al{' '}
            {Math.min(paginaActual * POR_PAGINA, clientesFiltrados.length)} de un total de{' '}
            {clientesFiltrados.length}
          </span>
          <div className="pag-botones">
            <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1}>‹</button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
              <button key={n} className={paginaActual === n ? 'pag-activa' : ''} onClick={() => setPaginaActual(n)}>{n}</button>
            ))}
            <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}>›</button>
          </div>
        </div>
      )}

      {modalOpen && (
        <RegistrarCliente cliente={clienteEditar} onClose={handleModalClose} />
      )}

      {clienteRecomendar && (
        <RecomendarProductos
          cliente={clienteRecomendar}
          onClose={() => setClienteRecomendar(null)}
          onAddProducto={agregarAlCarrito}
        />
      )}

      {clienteHistorial && (
        <HistorialPedidosCliente
          cliente={clienteHistorial}
          onClose={() => setClienteHistorial(null)}
        />
      )}

      {/* === NUEVO MODAL DE CONFIRMACIÓN DE ELIMINACIÓN === */}
      {clienteEliminar && createPortal(
        <div className="modal-overlay" onClick={() => !isDeleting && setClienteEliminar(null)}>
          <div className="modal-confirmar" onClick={e => e.stopPropagation()}>
            <div className="modal-confirmar-icon">🗑️</div>
            <h3>Eliminar Cliente</h3>
            <p>¿Estás seguro que deseas eliminar a <strong>{clienteEliminar.nombre}</strong>? Esta acción no se puede deshacer.</p>
            <div className="modal-confirmar-btns">
              <button 
                className="btn-cancelar-eliminar" 
                disabled={isDeleting} 
                onClick={() => setClienteEliminar(null)}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirmar-eliminar" 
                disabled={isDeleting} 
                onClick={confirmarEliminacion}
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}