import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../../context/CartContext';
import { getProductos } from '../../../services/productoService';
import { useToast } from '../../../services/toastService.jsx';
import './Catalogo.css';
import Modal from "../../../components/Modal/Modal.jsx";

const CATEGORY_EMOJI = {
  'Maquillaje':       '💄',
  'Fragancias':       '🌸',
  'Cuidado Facial':   '✨',
  'Cuidado Corporal': '🧴',
  'Capilar':          '💆',
};
const DEFAULT_EMOJI = '🛍️';

function getStatus(stock, activo) {
  if (!activo || stock === 0) return { label: 'Agotado',          cls: 'agotado'        };
  if (stock <= 5)             return { label: 'Últimas unidades', cls: 'pocas-unidades' };
  return                             { label: 'Disponible',       cls: 'disponible'     };
}

function ModalDetalle({ producto, onClose, onAddProducto }) {
  if (!producto) return null;
  const status = getStatus(producto.stock, producto.activo);
  const emoji = CATEGORY_EMOJI[producto.categoriaNombre] ?? DEFAULT_EMOJI;
  const precioFinal = producto.enOferta ? producto.precioOferta : producto.precio;
  const descuentoPct = producto.enOferta ? Math.round(((producto.precio - producto.precioOferta) / producto.precio) * 100) : 0;

  return (
    <Modal onClose={onClose} size="md">
      <div className="modal-detalle-inner">
        <div className="modal-img-container">
          <div className="card-badges-container">
            {producto.enCampania && <span className="card-badge campania">⚡ Campaña</span>}
            {producto.enOferta && !producto.enCampania && <span className="card-badge oferta">🏷️ Oferta</span>}
          </div>
          {producto.imagenUrl ? <img src={producto.imagenUrl} alt={producto.nombre} className="modal-img" /> : <div className="modal-img-placeholder">{emoji}</div>}
        </div>
        <div className="modal-body">
          <span className="modal-categoria-badge">{producto.categoriaNombre ?? 'Sin categoría'}</span>
          <h2 className="modal-nombre">{producto.nombre}</h2>
          {(producto.marcaNombre || producto.lineaNombre) && (
            <p className="modal-marca-linea">
              {producto.marcaNombre && <span>Marca: <strong>{producto.marcaNombre}</strong></span>}
              {producto.lineaNombre && <span> · Línea: <strong>{producto.lineaNombre}</strong></span>}
            </p>
          )}
          <p className="modal-descripcion">{producto.descripcion || 'Sin descripción disponible.'}</p>
          <div className="modal-meta">
            <div className="modal-precio-seccion">
              <div className="modal-precio">S/. {Number(precioFinal).toFixed(2)}</div>
              {producto.enOferta && (
                <div className="modal-ahorro-wrap">
                  <span className="modal-precio-tachado">S/. {Number(producto.precio).toFixed(2)}</span>
                  <span className="descuento-badge">-{descuentoPct}%</span>
                </div>
              )}
            </div>
            <div className={`modal-status-pill ${status.cls}`}>
              <span className="status-dot" /> {status.label} • {producto.stock} uds.
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-modal-cerrar" onClick={onClose}>Cerrar</button>
            <button className="btn-modal-anadir" disabled={status.cls === 'agotado'} onClick={() => { onAddProducto(producto); onClose(); }}>
              {status.cls === 'agotado' ? 'Agotado' : '+ Añadir al pedido'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ProductoCard({ producto, onClick, onAddProducto }) {
  const status = getStatus(producto.stock, producto.activo);
  const emoji = CATEGORY_EMOJI[producto.categoriaNombre] ?? DEFAULT_EMOJI;
  const precioFinal = producto.enOferta ? producto.precioOferta : producto.precio;
  const descuentoPct = producto.enOferta ? Math.round(((producto.precio - producto.precioOferta) / producto.precio) * 100) : 0;

  return (
    <div className={`producto-card${status.cls === 'agotado' ? ' agotado' : ''}`} onClick={() => onClick(producto)}>
      <div className="producto-img-wrap">
        <div className="card-badges-container">
          {producto.enCampania && <span className="card-badge campania">⚡ Campaña</span>}
          {producto.enOferta && !producto.enCampania && <span className="card-badge oferta">🏷️ Oferta</span>}
        </div>
        {producto.imagenUrl ? <img src={producto.imagenUrl} alt={producto.nombre} className="producto-img" /> : <div className="producto-img-placeholder">{emoji}</div>}
      </div>
      <div className="producto-info">
        <p className="producto-nombre">{producto.nombre}</p>
        {producto.marcaNombre && <p className="producto-marca">{producto.marcaNombre}</p>}
        <div className="producto-precio-wrap">
          <p className="producto-precio">S/. {Number(precioFinal).toFixed(2)}</p>
          {producto.enOferta && (
            <div className="precio-original-wrap">
              <span className="producto-precio-tachado">S/. {Number(producto.precio).toFixed(2)}</span>
              <span className="descuento-badge">-{descuentoPct}%</span>
            </div>
          )}
        </div>
        <span className={`producto-status ${status.cls}`}><span className="status-dot" />{status.label}</span>
      </div>
      <button className="btn-agregar-carrito" disabled={status.cls === 'agotado'} onClick={e => { e.stopPropagation(); onAddProducto(producto); }}>
        {status.cls === 'agotado' ? 'Agotado' : '+ Añadir'}
      </button>
    </div>
  );
}

function CheckItem({ label, count, checked, onChange }) {
  return (
    <label className="check-filtro-item">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="check-label">{label}</span>
      {count !== undefined && <span className="marca-count">{count}</span>}
    </label>
  );
}

export default function Catalogo() {
  const { agregarAlCarrito } = useCart();
  const { show: showToast } = useToast();

  const handleAddProducto = (producto) => {
    if (!producto.activo || producto.stock <= 0) {
      showToast(`${producto.nombre} no tiene stock disponible`, 'warning');
      return;
    }
    agregarAlCarrito(producto);
  };

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [marcasActivas, setMarcasActivas] = useState(new Set());
  const [lineasActivas, setLineasActivas] = useState(new Set());
  const [soloEnDescuento, setSoloEnDescuento] = useState(false);
  const [soloEnCampania, setSoloEnCampania] = useState(false);
  const [soloConStock, setSoloConStock] = useState(false);
  const [maxPrecio, setMaxPrecio] = useState(200);
  const [ordenar, setOrdenar] = useState('precio-asc');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProductos()
      .then(data => { setProductos(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError('No se pudo cargar el catálogo. Intente de nuevo.'); setLoading(false); });
  }, []);

  const categorias = useMemo(() => {
    const cats = {};
    productos.forEach(p => { const n = p.categoriaNombre ?? 'Sin categoría'; cats[n] = (cats[n] ?? 0) + 1; });
    return cats;
  }, [productos]);

  const marcas = useMemo(() => {
    const m = {};
    productos.forEach(p => { if (p.marcaNombre) m[p.marcaNombre] = (m[p.marcaNombre] ?? 0) + 1; });
    return m;
  }, [productos]);

  const lineas = useMemo(() => {
    const l = {};
    productos.forEach(p => { if (p.lineaNombre) l[p.lineaNombre] = (l[p.lineaNombre] ?? 0) + 1; });
    return l;
  }, [productos]);

  const precioMax = useMemo(() => productos.length ? Math.ceil(Math.max(...productos.map(p => p.precio))) : 200, [productos]);

  const toggleSet = (setter, value) => setter(prev => {
    const next = new Set(prev);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  });

  const productosFiltrados = useMemo(() => {
    let lista = [...productos];
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(p => p.nombre?.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q) || p.categoriaNombre?.toLowerCase().includes(q) || p.marcaNombre?.toLowerCase().includes(q));
    }
    if (categoriaActiva !== 'Todas') lista = lista.filter(p => (p.categoriaNombre ?? 'Sin categoría') === categoriaActiva);
    if (marcasActivas.size > 0) lista = lista.filter(p => marcasActivas.has(p.marcaNombre));
    if (lineasActivas.size > 0) lista = lista.filter(p => lineasActivas.has(p.lineaNombre));
    if (soloEnDescuento) lista = lista.filter(p => p.enOferta);
    if (soloEnCampania) lista = lista.filter(p => p.enCampania);
    if (soloConStock) lista = lista.filter(p => p.stock > 0 && p.activo);
    lista = lista.filter(p => p.precio <= maxPrecio);
    if (ordenar === 'precio-asc')  lista.sort((a, b) => a.precio - b.precio);
    if (ordenar === 'precio-desc') lista.sort((a, b) => b.precio - a.precio);
    if (ordenar === 'nombre-asc')  lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return lista;
  }, [productos, busqueda, categoriaActiva, marcasActivas, lineasActivas, soloEnDescuento, soloEnCampania, soloConStock, maxPrecio, ordenar]);

  const porCategoria = useMemo(() => {
    const grupos = {};
    productosFiltrados.forEach(p => {
      const cat = p.categoriaNombre ?? 'Sin categoría';
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(p);
    });
    return grupos;
  }, [productosFiltrados]);

  const hayFiltrosActivos = categoriaActiva !== 'Todas' || marcasActivas.size > 0 || lineasActivas.size > 0 || soloEnDescuento || soloEnCampania || soloConStock;

  const limpiarFiltros = () => {
    setCategoriaActiva('Todas'); setMarcasActivas(new Set()); setLineasActivas(new Set());
    setSoloEnDescuento(false); setSoloEnCampania(false); setSoloConStock(false); setMaxPrecio(precioMax);
  };

  return (
    <div className="catalogo-page">
      
      {/* 1. CONTENIDO PRINCIPAL ARRIBA */}
      <div className="catalogo-main">
        <div className="catalogo-topbar">
          <div className="catalogo-search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Buscar productos..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          <span className="ordenar-label">Ordenar por:</span>
          <select className="ordenar-select" value={ordenar} onChange={e => setOrdenar(e.target.value)}>
            <option value="precio-asc">Precio (Menor a Mayor)</option>
            <option value="precio-desc">Precio (Mayor a Menor)</option>
            <option value="nombre-asc">Nombre (A-Z)</option>
          </select>
        </div>

        <div className="catalogo-grid-area">
          {loading && <div className="catalogo-loading">Cargando catálogo...</div>}
          {!loading && error && <div className="catalogo-error">{error}</div>}
          {!loading && !error && productosFiltrados.length === 0 && (
            <div className="catalogo-empty">
              No se encontraron productos con los filtros aplicados.
              {hayFiltrosActivos && <button className="btn-limpiar-inline" onClick={limpiarFiltros}>Limpiar filtros</button>}
            </div>
          )}
          {!loading && !error && Object.entries(porCategoria).map(([categoria, prods]) => (
            <div key={categoria} className="catalogo-section">
              <h3 className="catalogo-section-title">{categoria}</h3>
              <div className="catalogo-grid">
                {prods.map(p => (
                  <ProductoCard 
                    key={p.id} 
                    producto={p} 
                    onClick={setProductoSeleccionado} 
                    onAddProducto={handleAddProducto}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SIDEBAR ABAJO PARA QUE SE RENDERICE A LA DERECHA */}
      <aside className="catalogo-sidebar">
        <div className="filtro-section">
          <h4>Categorías</h4>
          <div className={`categoria-item${categoriaActiva === 'Todas' ? ' active' : ''}`} onClick={() => setCategoriaActiva('Todas')}>
            Todas <span className="categoria-count">{productos.length}</span>
          </div>
          {Object.entries(categorias).map(([nombre, count]) => (
            <div key={nombre} className={`categoria-item${categoriaActiva === nombre ? ' active' : ''}`} onClick={() => setCategoriaActiva(nombre)}>
              {nombre} <span className="categoria-count">{count}</span>
            </div>
          ))}
        </div>
        {Object.keys(marcas).length > 0 && (
          <div className="filtro-section">
            <h4>Marcas</h4>
            {Object.entries(marcas).map(([nombre, count]) => (
              <CheckItem key={nombre} label={nombre} count={count} checked={marcasActivas.has(nombre)} onChange={() => toggleSet(setMarcasActivas, nombre)} />
            ))}
          </div>
        )}
        {Object.keys(lineas).length > 0 && (
          <div className="filtro-section">
            <h4>Líneas de Producto</h4>
            {Object.entries(lineas).map(([nombre]) => (
              <CheckItem key={nombre} label={nombre} checked={lineasActivas.has(nombre)} onChange={() => toggleSet(setLineasActivas, nombre)} />
            ))}
          </div>
        )}
        <div className="filtro-section">
          <h4>Ofertas / Promociones</h4>
          <CheckItem label="En Descuento" checked={soloEnDescuento} onChange={e => setSoloEnDescuento(e.target.checked)} />
          <CheckItem label="Campaña Actual" checked={soloEnCampania} onChange={e => setSoloEnCampania(e.target.checked)} />
        </div>
        <div className="filtro-section">
          <h4>Filtrar por Precio</h4>
          <div className="precio-range">
            <div className="precio-labels"><span>S/. 0</span><span>S/. {precioMax}</span></div>
            <input type="range" min={0} max={precioMax || 200} value={maxPrecio} onChange={e => setMaxPrecio(Number(e.target.value))} />
            <div className="precio-max-label">Hasta S/. {maxPrecio}</div>
          </div>
        </div>
        <div className="filtro-section">
          <h4>Disponibilidad</h4>
          <CheckItem label="Solo disponibles" checked={soloConStock} onChange={e => setSoloConStock(e.target.checked)} />
        </div>
      </aside>

      {/* MODAL (AL FINAL) */}
      {productoSeleccionado && (
        <ModalDetalle 
          producto={productoSeleccionado} 
          onClose={() => setProductoSeleccionado(null)} 
          onAddProducto={handleAddProducto}
        />
      )}
    </div>
  );
}