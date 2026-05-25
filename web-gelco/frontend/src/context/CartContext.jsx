import { createContext, useContext, useState, useEffect } from 'react';
import { getClientes } from '../services/clienteService';
import { crearPedido } from '../services/pedidoService';
import { useToast } from '../services/toastService.jsx';

const CATEGORY_EMOJI = {
  'Maquillaje':       '💄',
  'Fragancias':       '🌸',
  'Cuidado Facial':   '✨',
  'Cuidado Corporal': '🧴',
  'Capilar':          '💆',
};
const DEFAULT_EMOJI = '🛍️';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children, userInfo }) {
  const [carrito, setCarrito] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientes, setClientes] = useState([]);
  const { show: showToast } = useToast();

  useEffect(() => {
    if (userInfo?.perfil === 'CONSULTORA') {
      getClientes()
        .then(data => setClientes(Array.isArray(data) ? data : []))
        .catch(e => console.error("Error al cargar clientes", e));
    }
  }, [userInfo]);

  // ── AHORA RECIBE EL CLIENTE OPCIONALMENTE ──
// ── AHORA RECIBE EL PARÁMETRO "SILENT" AL FINAL ──
  const agregarAlCarrito = (producto, clienteIdParaAutoSelect = null, silent = false) => {

    if (!producto.activo || producto.stock <= 0) {
      if (!silent) showToast(`${producto.nombre} no tiene stock disponible`, 'warning');
      return;
    }

    // LÓGICA DE AUTO-SELECCIÓN DE CLIENTE
    if (clienteIdParaAutoSelect) {
      const nuevoId = String(clienteIdParaAutoSelect);
      if (selectedClienteId && selectedClienteId !== nuevoId && carrito.length > 0 && !silent) {
        showToast('El cliente del pedido en curso ha sido actualizado', 'info');
      }
      setSelectedClienteId(nuevoId);
    }

    // LÓGICA DE AÑADIR PRODUCTO
    const existe = carrito.find(item => item.producto.id === producto.id);
    if (existe) {
      if (existe.cantidad >= producto.stock) {
        if (!silent) showToast(`Solo hay ${producto.stock} unidades de ${producto.nombre}`, 'warning');
        return;
      }
      if (!silent) showToast('Cantidad actualizada en el pedido', 'success');
      setCarrito(prev => prev.map(item =>
        item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      if (!silent) showToast('Producto añadido al pedido', 'success');
      setCarrito(prev => [...prev, { producto, cantidad: 1 }]);
    }
  };

  const modificarCantidad = (productoId, delta) => {
    const item = carrito.find(i => i.producto.id === productoId);
    if (!item) return;
    const nuevaCant = item.cantidad + delta;
    if (nuevaCant > item.producto.stock) {
      showToast('Stock máximo alcanzado', 'warning');
      return;
    }
    setCarrito(prev => prev.map(i =>
      i.producto.id === productoId ? { ...i, cantidad: nuevaCant } : i
    ).filter(i => i.cantidad > 0));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    setSelectedClienteId('');
    setIsCartOpen(false);
  };

  const handleConfirmarPedido = async () => {
    if (!selectedClienteId) {
      showToast('Por favor, selecciona un cliente para el pedido', 'warning');
      return;
    }
    setIsSubmitting(true);
    const itemsPayload = carrito.map(item => ({
      productoId: item.producto.id,
      cantidad: item.cantidad
    }));

    try {
      await crearPedido(selectedClienteId, itemsPayload);
      showToast('¡Pedido creado exitosamente!', 'success');
      setCarrito([]);
      setIsCartOpen(false);
      setSelectedClienteId('');
      window.location.reload(); 
    } catch (error) {
      showToast(error.message || 'Error al procesar el pedido', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCarrito = carrito.reduce((acc, item) => acc + ((item.producto.enOferta ? item.producto.precioOferta : item.producto.precio) * item.cantidad), 0);
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider value={{ agregarAlCarrito }}>
      {children}

      {userInfo?.perfil === 'CONSULTORA' && (
        <>
          {totalItems > 0 && (
            <button className="floating-cart-btn" onClick={() => setIsCartOpen(true)}>
              🛍️ <span className="cart-badge-count">{totalItems}</span>
            </button>
          )}

          {isCartOpen && (
            <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
              <div className="cart-drawer" onClick={e => e.stopPropagation()}>
                <div className="cart-header">
                  <h2>Bolsa de Pedido</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-close-cart" onClick={vaciarCarrito} title="Vaciar pedido">🗑️</button>
                    <button className="btn-close-cart" onClick={() => setIsCartOpen(false)}>✕</button>
                  </div>
                </div>

                <div className="cart-client-section">
                  <label>Seleccionar Cliente:</label>
                  <select 
                    className="cart-client-select" 
                    value={selectedClienteId}
                    onChange={(e) => setSelectedClienteId(e.target.value)}
                  >
                    <option value="">-- Elija un cliente --</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="cart-items-container">
                  {carrito.length === 0 ? (
                    <p className="cart-empty-text">El pedido está vacío.</p>
                  ) : (
                    carrito.map(item => {
                      const p = item.producto;
                      const precio = p.enOferta ? p.precioOferta : p.precio;
                      const emoji = CATEGORY_EMOJI[p.categoriaNombre] ?? DEFAULT_EMOJI;
                      
                      return (
                        <div className="cart-item" key={p.id}>
                          <div className="cart-item-img">
                            {p.imagenUrl ? <img src={p.imagenUrl} alt={p.nombre}/> : emoji}
                          </div>
                          <div className="cart-item-info">
                            <span className="cart-item-name">{p.nombre}</span>
                            <span className="cart-item-price">S/. {Number(precio).toFixed(2)}</span>
                            <div className="cart-item-controls">
                              <button onClick={() => modificarCantidad(p.id, -1)}>-</button>
                              <span>{item.cantidad}</span>
                              <button onClick={() => modificarCantidad(p.id, 1)}>+</button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="cart-footer">
                  <div className="cart-total-row">
                    <span>Total Estimado</span>
                    <span className="cart-total-price">S/. {Number(totalCarrito).toFixed(2)}</span>
                  </div>
                  <button 
                    className="btn-confirm-order" 
                    disabled={carrito.length === 0 || !selectedClienteId || isSubmitting}
                    onClick={handleConfirmarPedido}
                  >
                    {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </CartContext.Provider>
  );
}