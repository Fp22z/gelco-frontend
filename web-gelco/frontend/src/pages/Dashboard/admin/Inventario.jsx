import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getInventarioResumen, getProductosMasVendidos, getSugerenciasReposicion, getTodosProductos } from '../../../services/inventarioService';
import { crearProducto, actualizarProducto, eliminarProducto } from '../../../services/productoService';
import { useToast } from '../../../services/toastService';
import './Inventario.css';

const STOCK_UMBRAL = 5;

function fmtMonto(n) {
  return `S/. ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
}

function getStockStatus(stock, activo) {
  if (!activo) return { label: 'Inactivo', cls: 'inactivo', color: '#64748b' };
  if (stock === 0) return { label: 'Agotado', cls: 'agotado', color: '#ef4444' };
  if (stock <= STOCK_UMBRAL) return { label: 'Stock bajo', cls: 'bajo', color: '#f59e0b' };
  return { label: 'Normal', cls: 'normal', color: '#22c55e' };
}

function ProductoModal({ producto, onSave, onClose, onDelete }) {
  const { show } = useToast();
  const [form, setForm] = useState({
    nombre: producto?.nombre || '',
    descripcion: producto?.descripcion || '',
    precio: producto?.precio || '',
    stock: producto?.stock ?? '',
    activo: producto?.activo ?? true,
    imagenUrl: producto?.imagenUrl || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio) {
      show('Nombre y precio son obligatorios', 'danger');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock) || 0
      });
      show(producto ? 'Producto actualizado' : 'Producto creado', 'success');
      onClose();
    } catch (err) {
      show(err.message || 'Error al guardar', 'danger');
    } finally {
      setSaving(false);
    }
  };

  return createPortal((
    <div className="inv-modal-overlay" onClick={onClose}>
      <div className="inv-modal" onClick={e => e.stopPropagation()}>
        <div className="inv-modal-header">
          <h3>{producto ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button className="inv-modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="inv-modal-body">
          <div className="inv-form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre del producto"
              required
            />
          </div>
          <div className="inv-form-group">
            <label>Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Descripción del producto"
              rows={3}
            />
          </div>
          <div className="inv-form-row">
            <div className="inv-form-group">
              <label>Precio (S/.) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.precio}
                onChange={e => setForm({ ...form, precio: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="inv-form-group">
              <label>Stock</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <div className="inv-form-group">
            <label>URL Imagen</label>
            <input
              type="url"
              value={form.imagenUrl}
              onChange={e => setForm({ ...form, imagenUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          {producto && (
            <div className="inv-form-group">
              <label className="inv-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={e => setForm({ ...form, activo: e.target.checked })}
                />
                Producto activo
              </label>
            </div>
          )}
          <div className="inv-modal-footer">
            {producto && (
              <button type="button" className="inv-btn-danger" onClick={onDelete}>
                Eliminar
              </button>
            )}
            <button type="button" className="inv-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="inv-btn-save" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ), document.body);
}

export default function Inventario() {
  const { show } = useToast();
  const [resumen, setResumen] = useState(null);
  const [productos, setProductos] = useState([]);
  const [masVendidos, setMasVendidos] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('productos');
  const [modalProducto, setModalProducto] = useState(null);
  const [filtroStock, setFiltroStock] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const cargarDatos = async () => {
    try {
      const [resumenData, productosData, masVendidosData, sugerenciasData] = await Promise.all([
        getInventarioResumen(),
        getTodosProductos(),
        getProductosMasVendidos(10),
        getSugerenciasReposicion()
      ]);
      setResumen(resumenData);
      setProductos(Array.isArray(productosData) ? productosData : []);
      setMasVendidos(Array.isArray(masVendidosData) ? masVendidosData : []);
      setSugerencias(Array.isArray(sugerenciasData) ? sugerenciasData : []);
    } catch {
      show('Error al cargar datos', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const productosFiltrados = productos.filter(p => {
    const status = getStockStatus(p.stock, p.activo !== false);
    if (filtroStock === 'agotado' && status.cls !== 'agotado') return false;
    if (filtroStock === 'bajo' && status.cls !== 'bajo') return false;
    if (filtroStock === 'normal' && status.cls !== 'normal') return false;
    if (filtroStock === 'inactivo' && status.cls !== 'inactivo') return false;
    if (busqueda) {
      const lower = busqueda.toLowerCase();
      return (p.nombre || '').toLowerCase().includes(lower) ||
             (p.descripcion || '').toLowerCase().includes(lower);
    }
    return true;
  });

  const handleGuardarProducto = async (data) => {
    if (modalProducto?.id) {
      await actualizarProducto(modalProducto.id, data);
    } else {
      await crearProducto(data);
    }
    cargarDatos();
  };

  const handleEliminarProducto = async () => {
    if (!modalProducto?.id) return;
    if (!window.confirm(`¿Eliminar "${modalProducto.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarProducto(modalProducto.id);
      show('Producto eliminado', 'success');
      setModalProducto(null);
      cargarDatos();
    } catch (err) {
      show(err.message || 'Error al eliminar', 'danger');
    }
  };

  if (loading) {
    return (
      <div className="inv-page">
        <div className="inv-loading">
          <div className="loading-spinner" />
          <p>Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inv-page">
      <div className="inv-header">
        <div className="inv-header-text">
          <h2>Gestión de <em>Inventario</em></h2>
          <p>Administra productos, controla stock y genera sugerencias de reposición</p>
        </div>
        <button className="inv-btn-primary" onClick={() => setModalProducto({})}>
          ➕ Nuevo Producto
        </button>
      </div>

      <div className="inv-kpis">
        <div className="inv-kpi-card">
          <div className="inv-kpi-icon">📦</div>
          <div className="inv-kpi-content">
            <span className="inv-kpi-label">Total</span>
            <span className="inv-kpi-value">{resumen?.totalProductos || 0}</span>
          </div>
        </div>
        <div className="inv-kpi-card">
          <div className="inv-kpi-icon">✅</div>
          <div className="inv-kpi-content">
            <span className="inv-kpi-label">Activos</span>
            <span className="inv-kpi-value">{resumen?.productosActivos || 0}</span>
          </div>
        </div>
        <div className="inv-kpi-card">
          <div className="inv-kpi-icon">⚠️</div>
          <div className="inv-kpi-content">
            <span className="inv-kpi-label">Stock Bajo</span>
            <span className="inv-kpi-value">{resumen?.productosStockBajo || 0}</span>
          </div>
        </div>
        <div className="inv-kpi-card">
          <div className="inv-kpi-icon">❌</div>
          <div className="inv-kpi-content">
            <span className="inv-kpi-label">Agotados</span>
            <span className="inv-kpi-value">{resumen?.productosAgotados || 0}</span>
          </div>
        </div>
      </div>

      <div className="inv-tabs">
        <button className={`inv-tab ${activeTab === 'productos' ? 'active' : ''}`} onClick={() => setActiveTab('productos')}>
          Productos ({productos.length})
        </button>
        <button className={`inv-tab ${activeTab === 'mas-vendidos' ? 'active' : ''}`} onClick={() => setActiveTab('mas-vendidos')}>
          Más Vendidos
        </button>
        <button className={`inv-tab ${activeTab === 'sugerencias' ? 'active' : ''}`} onClick={() => setActiveTab('sugerencias')}>
          Sugerencias ({sugerencias.length})
        </button>
      </div>

      {activeTab === 'productos' && (
        <>
          <div className="inv-toolbar">
            <div className="inv-search">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
            <div className="inv-filtros">
              <button className={`inv-filtro-btn ${filtroStock === 'todos' ? 'active' : ''}`} onClick={() => setFiltroStock('todos')}>
                Todos
              </button>
              <button className={`inv-filtro-btn ${filtroStock === 'normal' ? 'active' : ''}`} onClick={() => setFiltroStock('normal')}>
                Normal
              </button>
              <button className={`inv-filtro-btn ${filtroStock === 'bajo' ? 'active' : ''}`} onClick={() => setFiltroStock('bajo')}>
                Stock Bajo
              </button>
              <button className={`inv-filtro-btn ${filtroStock === 'agotado' ? 'active' : ''}`} onClick={() => setFiltroStock('agotado')}>
                Agotados
              </button>
              <button className={`inv-filtro-btn ${filtroStock === 'inactivo' ? 'active' : ''}`} onClick={() => setFiltroStock('inactivo')}>
                Inactivos
              </button>
            </div>
          </div>

          <div className="inv-card">
            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.length === 0 ? (
                    <tr><td colSpan="5" className="inv-empty">No hay productos</td></tr>
                  ) : productosFiltrados.map(p => {
                    const status = getStockStatus(p.stock, p.activo !== false);
                    return (
                      <tr key={p.id} className={status.cls}>
                        <td>
                          <div className="inv-producto-cell">
                            {p.imagenUrl ? (
                              <img src={p.imagenUrl} alt={p.nombre} className="inv-producto-img" />
                            ) : (
                              <div className="inv-producto-placeholder">📦</div>
                            )}
                            <div>
                              <span className="inv-producto-nombre">{p.nombre}</span>
                              <span className="inv-producto-desc">{p.descripcion?.slice(0, 40)}{p.descripcion?.length > 40 ? '...' : ''}</span>
                            </div>
                          </div>
                        </td>
                        <td className="inv-precio">{fmtMonto(p.precio)}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="inv-stock-input"
                            value={p.stock}
                            onChange={async (e) => {
                              const newStock = parseInt(e.target.value) || 0;
                              try {
                                await actualizarProducto(p.id, { stock: newStock });
                                cargarDatos();
                              } catch {
                                show('Error al actualizar stock', 'danger');
                              }
                            }}
                          />
                        </td>
                        <td>
                          <span className={`inv-status-badge ${status.cls}`} style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <button className="inv-btn-edit" onClick={() => setModalProducto(p)}>
                            ✏️ Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'mas-vendidos' && (
        <div className="inv-card">
          <h3>Productos Más Vendidos</h3>
          {masVendidos.length === 0 ? (
            <div className="inv-empty">No hay datos de ventas</div>
          ) : (
            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead>
                  <tr><th>#</th><th>Producto</th><th>Stock</th><th>Ventas</th><th>Precio</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {masVendidos.map((item, idx) => {
                    const status = getStockStatus(item.stockActual, true);
                    return (
                      <tr key={item.productoId}>
                        <td>{idx + 1}</td>
                        <td>{item.nombre}</td>
                        <td>{item.stockActual}</td>
                        <td className="inv-ventas">{item.cantidadVendida}</td>
                        <td className="inv-precio">{fmtMonto(item.precio)}</td>
                        <td>
                          <span className={`inv-status-badge ${status.cls}`} style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sugerencias' && (
        <div className="inv-card">
          <h3>Sugerencias de Reposición</h3>
          <div className="inv-info-box">
            <p>Productos con stock bajo (≤{STOCK_UMBRAL}) que tienen ventas. La cantidad sugerida = máximo(20 - stock, ventas × 2)</p>
          </div>
          {sugerencias.length === 0 ? (
            <div className="inv-empty">No hay sugerencias. Todos los productos tienen stock adecuado.</div>
          ) : (
            <div className="inv-sugerencias-grid">
              {sugerencias.map(item => (
                <div key={item.productoId} className="inv-sugerencia-card">
                  <div className="inv-sug-header">
                    <span className="inv-sug-nombre">{item.nombre}</span>
                    <span className={`inv-sug-stock ${item.stockActual === 0 ? 'agotado' : 'bajo'}`}>
                      Stock: {item.stockActual}
                    </span>
                  </div>
                  <div className="inv-sug-body">
                    <div className="inv-sug-item">
                      <span className="inv-sug-label">Ventas Totales</span>
                      <span className="inv-sug-value">{item.ventasTotales}</span>
                    </div>
                    <div className="inv-sug-item">
                      <span className="inv-sug-label">Cant. Sugerida</span>
                      <span className="inv-sug-value highlight">{item.cantidadSugerida} uds.</span>
                    </div>
                    <div className="inv-sug-item">
                      <span className="inv-sug-label">Inversión Est.</span>
                      <span className="inv-sug-value">{fmtMonto(item.precio * item.cantidadSugerida)}</span>
                    </div>
                  </div>
                  <button className="inv-sug-btn" onClick={() => setModalProducto(productos.find(p => p.id === item.productoId))}>
                    Reponer Stock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modalProducto !== null && (
        <ProductoModal
          producto={modalProducto.id ? modalProducto : null}
          onSave={handleGuardarProducto}
          onClose={() => setModalProducto(null)}
          onDelete={handleEliminarProducto}
        />
      )}
    </div>
  );
}
