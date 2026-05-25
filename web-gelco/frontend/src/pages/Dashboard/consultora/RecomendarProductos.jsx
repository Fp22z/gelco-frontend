import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getProductos } from '../../../services/productoService';
import { useToast } from '../../../services/toastService.jsx';
import './RecomendarProductos.css';

const PREFERENCIA_A_CATEGORIA = {
  'Maquillaje juvenil':     'Maquillaje',
  'Fragancias frutales':    'Fragancias',
  'Cuidado facial':         'Cuidado Facial',
  'Cuidado corporal':       'Cuidado Corporal',
  'Cabello y tratamientos': 'Capilar',
  'Perfumería':             'Fragancias',
};

const CATEGORY_EMOJI = {
  'Maquillaje':       '💄',
  'Fragancias':       '🌸',
  'Cuidado Facial':   '✨',
  'Cuidado Corporal': '🧴',
  'Capilar':          '💆',
};

export default function RecomendarProductos({ cliente, onClose, onAddProducto }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [filtroActivo, setFiltroActivo] = useState('recomendados');
  const { show: showToast } = useToast();

  const preferenciasCliente = cliente?.preferencias
    ? cliente.preferencias.split(',').map(p => p.trim()).filter(Boolean)
    : [];

  const categoriasRecomendadas = new Set(
    preferenciasCliente.map(p => PREFERENCIA_A_CATEGORIA[p]).filter(Boolean)
  );

  useEffect(() => {
    getProductos()
      .then(data => {
        const activos = (Array.isArray(data) ? data : []).filter(p => p.activo && p.stock > 0);
        setProductos(activos);
      })
      .catch(() => setProductos([]))
      .finally(() => setLoading(false));
  }, []);

  const productosFiltrados = productos.filter(p => {
    if (filtroActivo === 'recomendados') {
      return categoriasRecomendadas.has(p.categoriaNombre);
    }
    return true;
  });

  const toggleSeleccion = (id) => {
    setSeleccionados(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const productosSeleccionados = productos.filter(p => seleccionados.has(p.id));

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="recomendar-modal" onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div className="recomendar-header">
          <div>
            <span className="badge-experto">✨ Sistema Experto</span>
            <h3>Recomendaciones para {cliente?.nombre}</h3>
            <p className="recomendar-subtitle">
              Basado en sus preferencias:{' '}
              {preferenciasCliente.length > 0
                ? preferenciasCliente.join(', ')
                : 'Sin preferencias registradas'}
            </p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        {/* TABS */}
        <div className="recomendar-tabs">
          <button
            className={filtroActivo === 'recomendados' ? 'tab-activo' : ''}
            onClick={() => setFiltroActivo('recomendados')}
          >
            ⭐ Recomendados ({productos.filter(p => categoriasRecomendadas.has(p.categoriaNombre)).length})
          </button>
          <button
            className={filtroActivo === 'todos' ? 'tab-activo' : ''}
            onClick={() => setFiltroActivo('todos')}
          >
            🛍️ Todos los productos ({productos.length})
          </button>
        </div>

        {/* BODY */}
        <div className="recomendar-body">
          {loading && <div className="recomendar-loading">Cargando productos...</div>}

          {!loading && preferenciasCliente.length === 0 && filtroActivo === 'recomendados' && (
            <div className="recomendar-empty">
              <p>Este cliente no tiene preferencias registradas.</p>
              <button className="btn-ver-todos" onClick={() => setFiltroActivo('todos')}>
                Ver todos los productos
              </button>
            </div>
          )}

          {!loading && productosFiltrados.length === 0 && preferenciasCliente.length > 0 && (
            <div className="recomendar-empty">
              <p>No hay productos disponibles para las preferencias de este cliente.</p>
              <button className="btn-ver-todos" onClick={() => setFiltroActivo('todos')}>
                Ver todos los productos
              </button>
            </div>
          )}

          {!loading && productosFiltrados.length > 0 && (
            <div className="recomendar-grid">
              {productosFiltrados.map(p => {
                const seleccionado = seleccionados.has(p.id);
                const emoji = CATEGORY_EMOJI[p.categoriaNombre] ?? '🛍️';
                const esRecomendado = categoriasRecomendadas.has(p.categoriaNombre);

                return (
                  <div
                    key={p.id}
                    className={`recomendar-card ${seleccionado ? 'selected' : ''}`}
                    onClick={() => toggleSeleccion(p.id)}
                  >
                    {esRecomendado && filtroActivo === 'todos' && (
                      <span className="badge-recomendado">⭐ Recomendado</span>
                    )}
                    <div className="recomendar-card-img">
                      {p.imagenUrl
                        ? <img src={p.imagenUrl} alt={p.nombre} />
                        : <span>{emoji}</span>
                      }
                    </div>
                    <div className="recomendar-card-info">
                      <p className="recomendar-card-nombre">{p.nombre}</p>
                      <p className="recomendar-card-categoria">{p.categoriaNombre ?? 'Sin categoría'}</p>
                      <p className="recomendar-card-precio">S/. {Number(p.precio).toFixed(2)}</p>
                    </div>
                    <div className={`recomendar-check ${seleccionado ? 'checked' : ''}`}>
                      {seleccionado ? '✓' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="recomendar-footer">
          <span className="recomendar-seleccionados">
            {seleccionados.size > 0
              ? `${seleccionados.size} producto${seleccionados.size > 1 ? 's' : ''} seleccionado${seleccionados.size > 1 ? 's' : ''}`
              : 'Selecciona productos para recomendar'}
          </span>
<div className="recomendar-footer-btns">
            <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button
              className="btn-agregar-pedido"
              disabled={seleccionados.size === 0}
              onClick={() => {
                // 3. Pasamos "true" como tercer parámetro para silenciar los individuales
                productosSeleccionados.forEach(prod => {
                  onAddProducto(prod, cliente.id, true);
                });
                
                // 4. Lanzamos un único mensaje de resumen al usuario
                showToast(`${seleccionados.size} productos añadidos al pedido`, 'success');
                
                onClose();
              }}
            >
              + Añadir al pedido ({seleccionados.size})
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}