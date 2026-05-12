import { useState, useEffect } from 'react';
import { getProductos } from '../../services/productoService';
import { useToast } from '../../services/toastService.jsx';
import './GestionProductos.css';

export default function GestionProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { show: showToast } = useToast();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const data = await getProductos();
        setProductos(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching productos:', err);
        setError('Error al cargar los productos');
        showToast('Error al cargar los productos', 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [showToast]);

  const handleNuevoProducto = () => {
    showToast('Funcionalidad en desarrollo', 'info');
  };

  if (loading) {
    return (
      <div className="gestion-productos">
        <h1>Gestión de Productos</h1>
        <div className="loading">Cargando productos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gestion-productos">
        <h1>Gestión de Productos</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="gestion-productos">
      <div className="gestion-header">
        <h1>Gestión de Productos</h1>
        <button className="btn-nuevo-producto" onClick={handleNuevoProducto}>
          + Nuevo Producto
        </button>
      </div>

      {productos.length === 0 ? (
        <div className="empty-state">
          <p>No hay productos disponibles</p>
        </div>
      ) : (
        <div className="productos-table-wrapper">
          <table className="productos-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio (S/.)</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td className="nombre">{producto.nombre}</td>
                  <td className="descripcion">{producto.descripcion}</td>
                  <td className="precio">{producto.precio.toFixed(2)}</td>
                  <td className="stock">{producto.stock}</td>
                  <td className="categoria">{producto.categoria?.nombre || 'N/A'}</td>
                  <td className="activo">
                    <span className={`status ${producto.activo ? 'activo' : 'inactivo'}`}>
                      {producto.activo ? 'Sí' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
