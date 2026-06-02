import { environment } from '../environments/environment';
import { getToken } from './authService';

/**
 * Get all productos without authentication (public endpoint)
 * Used for the public home page
 * @returns {Promise<Array>} Array of productos
 */
export const getProductosPublic = async () => {
  const response = await fetch(`${environment.url}/productos`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch productos');
  }

  return response.json();
};

/**
 * Get all productos with authentication
 * @returns {Promise<Array>} Array of productos
 */
export const getProductos = async () => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${environment.url}/productos`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch productos');
  }

  return response.json();
};

/**
 * Register a new producto (stub - not fully implemented yet)
 * @param {Object} data - Producto data
 * @returns {Promise<Object>}
 */
export const registrarProducto = async (data) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  console.log('[Producto Service] Registrar producto:', data);
};

/**
 * Update an existing producto (stub - not fully implemented yet)
 * @param {Object} data - Producto data with id
 * @returns {Promise<Object>}
 */
export const actualizarProducto = async (data) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  console.log('[Producto Service] Actualizar producto:', data);
};

/**
 * Delete a producto (stub - not fully implemented yet)
 * @param {number} id - Producto ID
 * @returns {Promise<void>}
 */
export const eliminarProducto = async (id) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  console.log('[Producto Service] Eliminar producto:', id);
};
