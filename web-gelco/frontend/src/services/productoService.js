import { httpClient } from './httpClient';

const BASE = `/productos`;

export const getProductosPublic = async () => {
  const response = await fetch(`http://localhost:8080/api/v1/productos`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to fetch productos');
  return response.json();
};

export const getProductos = async () => {
  const res = await httpClient.get(BASE);
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
  if (data.categoriaId) params.append('categoriaId', data.categoriaId);

  const res = await httpClient.post(`${BASE}?${params.toString()}`);
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
  if (data.categoriaId) params.append('categoriaId', data.categoriaId);

  const res = await httpClient.put(`${BASE}/${id}?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al actualizar producto');
  }
  return res.json();
};

export const eliminarProducto = async (id) => {
  const res = await httpClient.delete(`${BASE}/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al eliminar producto');
  }
  return { success: true };
};