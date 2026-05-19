import { useState, useEffect } from 'react';
import { getClientes, deleteCliente } from '../../services/clienteService';
import { useToast } from '../../services/toastService.jsx';
import RegistrarCliente from './RegistrarCliente';
import './MisClientes.css';
import RecomendarProductos from './RecomendarProductos';

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
  const [clientes, setClientes] = useState([]);
  const [clienteRecomendar, setClienteRecomendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEditar, setClienteEditar] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const POR_PAGINA = 6;
  const { show: showToast } = useToast();

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

  const clientesFiltrados = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono?.includes(busqueda)
  );

  const totalPaginas = Math.ceil(clientesFiltrados.length / POR_PAGINA);
  const clientesPagina = clientesFiltrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  const handleEliminar = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar este cliente?')) return;
    try {
      await deleteCliente(id);
      showToast('Cliente eliminado', 'success');
      fetchClientes();
    } catch {
      showToast('Error al eliminar cliente', 'danger');
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

  if (loading) return <div className="clientes-loading">Cargando clientes...</div>;

  return (
    <div className="mis-clientes">

      {/* HEADER */}
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
          <button className="btn-filtros">⚙ Filtros</button>
        </div>
        <button className="btn-nuevo-cliente" onClick={handleNuevo}>
          + Registrar Nuevo Cliente
        </button>
      </div>

      {/* GRID */}
      {clientesPagina.length === 0 ? (
        <div className="clientes-empty">
          <p>No se encontraron clientes.</p>
        </div>
      ) : (
        <div className="clientes-grid">
          {clientesPagina.map(cliente => {
            const prefs = getPreferenciasArray(cliente.preferencias);
            const avatarColor = getAvatarColor(cliente.nombre);

            return (
              <div key={cliente.id} className="cliente-card">

                {/* CARD HEADER */}
                <div className="card-header-row">
                  <div className="cliente-avatar" style={{ background: avatarColor }}>
                    {getInitials(cliente.nombre)}
                  </div>
                  <div className="cliente-info">
                    <h4>{cliente.nombre}</h4>
                    <span>{cliente.telefono || 'Sin teléfono'}</span>
                  </div>
                  <div className="card-actions">
                    <button className="btn-menu" onClick={() => handleEditar(cliente)}>···</button>
                    {cliente.telefono && (
                      <a
                        href={`https://wa.me/${cliente.telefono?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-whatsapp"
                      >
                        <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.527 5.845L.057 23.882l6.174-1.452A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.015-1.378l-.36-.214-3.664.862.878-3.57-.235-.368A9.818 9.818 0 1112 21.818z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>

                {/* DETALLES */}
                <div className="cliente-detalles">
                  {cliente.direccion && (
                    <div className="detalle-row">
                      <span className="detalle-icon">📍</span>
                      <span>{cliente.direccion}</span>
                    </div>
                  )}
                </div>

                {/* PREFERENCIAS */}
                {prefs.length > 0 && (
                  <div className="cliente-prefs">
                    {prefs.map(pref => {
                      const estilo = PREFERENCIAS_COLORES[pref] || { bg: '#F3F4F6', color: '#6B7280', icon: '🏷️' };
                      return (
                        <span
                          key={pref}
                          className="pref-tag"
                          style={{ background: estilo.bg, color: estilo.color }}
                        >
                          {estilo.icon} {pref}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* ALERTA PENDIENTE */}
                {cliente.tienePendiente && (
                  <p className="alerta-pendiente">⚠ Tiene un pedido pendiente de pago.</p>
                )}

                {/* FOOTER */}
                <div className="card-footer-row">
                  <span>📅 {cliente.totalPedidos ?? 0} pedidos</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-recomendar-card"
                      onClick={() => setClienteRecomendar(cliente)}
                      title="Recomendar productos"
                    >
                      ⭐
                    </button>
                    <button className="btn-eliminar-card" onClick={() => handleEliminar(cliente.id)}>
                      🗑
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* PAGINACIÓN */}
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
              <button
                key={n}
                className={paginaActual === n ? 'pag-activa' : ''}
                onClick={() => setPaginaActual(n)}
              >
                {n}
              </button>
            ))}
            <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}>›</button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <RegistrarCliente
          cliente={clienteEditar}
          onClose={handleModalClose}
        />
      )}

      {clienteRecomendar && (
        <RecomendarProductos
          cliente={clienteRecomendar}
          onClose={() => setClienteRecomendar(null)}
        />
      )}
    </div>
  );
}