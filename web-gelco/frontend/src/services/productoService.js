import { environment } from '../environments/environment';
import { getToken } from './authService';

const BASE = `${environment.url}/productos`;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const getProductosPublic = async () => {
  const response = await fetch(`${environment.url}/productos`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to fetch productos');
  return response.json();
};

export const getProductos = async () => {
  const res = await fetch(`${BASE}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener productos');
  return res.json();
};

export const crearProducto = async (data) => {
  const params = new URLSearchParams();
  params.append('nombre', data.nombre);
  if (data.descripcion) params.append('descripcion', data.descripcion);
  params.append('precio', data.precio);
  params.append('stock', data.stock || 0);
  if (data.imagenUrl) params.append('imagenUrl', data.imagenUrl);

  const res = await fetch(`${BASE}`, {
    method: 'POST',
    headers: authHeaders(),
    body: params
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al crear producto');
  }
  return res.json();
};

export const actualizarProducto = async (id, data) => {
  const params = new URLSearchParams();
  if (data.nombre) params.append('nombre', data.nombre);
  if (data.descripcion) params.append('descripcion', data.descripcion);
  if (data.precio) params.append('precio', data.precio);
  if (data.stock !== undefined) params.append('stock', data.stock);
  if (data.activo !== undefined) params.append('activo', data.activo);
  if (data.imagenUrl) params.append('imagenUrl', data.imagenUrl);

  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: params
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al actualizar producto');
  }
  return res.json();
};

export const eliminarProducto = async (id) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al eliminar producto');
  }
  return res.json();
};
