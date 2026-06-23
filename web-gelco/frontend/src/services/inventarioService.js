import { environment } from '../environments/environment';
import { httpClient } from './httpClient';

const BASE = `/productos`;

export const getInventarioResumen = async () => {
  const res = await httpClient.get(`${BASE}/inventario/resumen`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener resumen de inventario');
  }
  return res.json();
};

export const getProductosStockBajo = async () => {
  const res = await httpClient.get(`${BASE}/inventario/alertas`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener alertas');
  }
  return res.json();
};

export const getTodosProductos = async () => {
  const res = await httpClient.get(`${BASE}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener productos');
  }
  return res.json();
};

export const getProductosMasVendidos = async (limit = 10) => {
  const res = await httpClient.get(`${BASE}/renovacion/mas-vendidos?limit=${limit}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener productos mas vendidos');
  }
  return res.json();
};

export const getSugerenciasReposicion = async () => {
  const res = await httpClient.get(`${BASE}/renovacion/sugerencias`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener sugerencias');
  }
  return res.json();
};

export const getMovimientos = async () => {
  const res = await httpClient.get(`/productos/inventario/movimientos`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener movimientos');
  }
  return res.json();
};