import { useState, useEffect, useMemo } from 'react';
import { getInventarioResumen, getTodosProductos } from '../../../services/inventarioService';
import { useToast } from '../../../services/toastService';
import './DashboardDespacho.css';

const STOCK_UMBRAL = 5;

function getStockStatus(stock, activo) {
  if (!activo || stock === 0) return { label: 'Agotado', cls: 'agotado', color: '#ef4444' };
  if (stock <= STOCK_UMBRAL) return { label: 'Stock bajo', cls: 'bajo', color: '#f59e0b' };
  return { label: 'Normal', cls: 'normal', color: '#22c55e' };
}

function fmtStock(stock) {
  return Number(stock || 0).toLocaleString('es-PE');
}

export default function DashboardDespacho() {
  const { show } = useToast();
  const [resumen, setResumen] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStock, setFiltroStock] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    Promise.all([
      getInventarioResumen(),
      getTodosProductos()
    ])
      .then(([resumenData, productosData]) => {
        setResumen(resumenData);
        setProductos(Array.isArray(productosData) ? productosData : []);
      })
      .catch(() => show('Error al cargar datos de inventario', 'danger'))
      .finally(() => setLoading(false));
  }, []);

  const productosFiltrados = useMemo(() => {
    let filtered = productos;

    if (busqueda) {
      const lower = busqueda.toLowerCase();
      filtered = filtered.filter(p =>
        (p.nombre || '').toLowerCase().includes(lower) ||
        (p.descripcion || '').toLowerCase().includes(lower)
      );
    }

    if (filtroStock === 'agotado') {
      filtered = filtered.filter(p => p.stock === 0 || !p.activo);
    } else if (filtroStock === 'bajo') {
      filtered = filtered.filter(p => p.stock > 0 && p.stock <= STOCK_UMBRAL && p.activo);
    } else if (filtroStock === 'normal') {
      filtered = filtered.filter(p => p.stock > STOCK_UMBRAL && p.activo);
    }

    return filtered;
  }, [productos, filtroStock, busqueda]);

  if (loading) {
    return (
      <div className="despacho-page">
        <div className="despacho-loading">
          <div className="loading-spinner" />
          <p>Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="despacho-page">
      <div className="despacho-header">
        <div className="despacho-header-text">
          <h2>Control de <em>Inventario</em></h2>
          <p>Gestiona el stock de productos y recibe alertas de inventario bajo</p>
        </div>
      </div>

      <div className="despacho-kpis">
        <div className="despacho-kpi-card">
          <div className="despacho-kpi-icon">📦</div>
          <div className="despacho-kpi-content">
            <span className="despacho-kpi-label">Total Productos</span>
            <span className="despacho-kpi-value">{resumen?.totalProductos || 0}</span>
          </div>
        </div>
        <div className="despacho-kpi-card">
          <div className="despacho-kpi-icon">✅</div>
          <div className="despacho-kpi-content">
            <span className="despacho-kpi-label">Activos</span>
            <span className="despacho-kpi-value">{resumen?.productosActivos || 0}</span>
          </div>
        </div>
        <div className="despacho-kpi-card agotado">
          <div className="despacho-kpi-icon">❌</div>
          <div className="despacho-kpi-content">
            <span className="despacho-kpi-label">Agotados</span>
            <span className="despacho-kpi-value">{resumen?.productosAgotados || 0}</span>
          </div>
        </div>
        <div className="despacho-kpi-card alerta">
          <div className="despacho-kpi-icon">⚠️</div>
          <div className="despacho-kpi-content">
            <span className="despacho-kpi-label">Stock Bajo</span>
            <span className="despacho-kpi-value">{resumen?.productosStockBajo || 0}</span>
          </div>
        </div>
      </div>

      <div className="despacho-toolbar">
        <div className="despacho-search">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <div className="despacho-filtros">
          <button
            className={`despacho-filtro-btn ${filtroStock === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroStock('todos')}
          >
            Todos ({productos.length})
          </button>
          <button
            className={`despacho-filtro-btn ${filtroStock === 'agotado' ? 'active' : ''}`}
            onClick={() => setFiltroStock('agotado')}
          >
            Agotados ({productos.filter(p => p.stock === 0 || !p.activo).length})
          </button>
          <button
            className={`despacho-filtro-btn ${filtroStock === 'bajo' ? 'active' : ''}`}
            onClick={() => setFiltroStock('bajo')}
          >
            Stock Bajo ({productos.filter(p => p.stock > 0 && p.stock <= STOCK_UMBRAL && p.activo).length})
          </button>
          <button
            className={`despacho-filtro-btn ${filtroStock === 'normal' ? 'active' : ''}`}
            onClick={() => setFiltroStock('normal')}
          >
            Normal ({productos.filter(p => p.stock > STOCK_UMBRAL && p.activo).length})
          </button>
        </div>
      </div>

      <div className="despacho-card">
        <div className="despacho-table-wrap">
          <table className="despacho-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="despacho-empty">
                    No hay productos que mostrar
                  </td>
                </tr>
              ) : productosFiltrados.map(p => {
                const status = getStockStatus(p.stock, p.activo);
                return (
                  <tr key={p.id} className={status.cls}>
                    <td>
                      <div className="despacho-producto-cell">
                        {p.imagenUrl ? (
                          <img src={p.imagenUrl} alt={p.nombre} className="despacho-producto-img" />
                        ) : (
                          <div className="despacho-producto-placeholder">📦</div>
                        )}
                        <div>
                          <span className="despacho-producto-nombre">{p.nombre}</span>
                          <span className="despacho-producto-desc">{p.descripcion?.slice(0, 50)}{p.descripcion?.length > 50 ? '...' : ''}</span>
                        </div>
                      </div>
                    </td>
                    <td>{p.categoriaNombre || '—'}</td>
                    <td className="despacho-precio">S/. {Number(p.precio || 0).toFixed(2)}</td>
                    <td className="despacho-stock">
                      <span className={`despacho-stock-badge ${status.cls}`}>
                        {fmtStock(p.stock)}
                      </span>
                    </td>
                    <td>
                      <span
                        className="despacho-status-badge"
                        style={{ backgroundColor: `${status.color}20`, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {(resumen?.productosAgotados > 0 || resumen?.productosStockBajo > 0) && (
        <div className="despacho-alertas">
          <h3>⚠️ Alertas de Inventario</h3>
          <p>
            Hay <strong>{resumen.productosAgotados}</strong> productos agotados y{' '}
            <strong>{resumen.productosStockBajo}</strong> con stock bajo (≤{STOCK_UMBRAL} unidades).
          </p>
        </div>
      )}
    </div>
  );
}
