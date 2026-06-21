import { environment } from '../environments/environment';
import { getToken } from './authService';

const BASE = `${environment.url}/productos`;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const getInventarioResumen = async () => {
  const res = await fetch(`${BASE}/inventario/resumen`, { headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener resumen de inventario');
  }
  return res.json();
};

export const getProductosStockBajo = async () => {
  const res = await fetch(`${BASE}/inventario/alertas`, { headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener alertas');
  }
  return res.json();
};

export const getTodosProductos = async () => {
  const res = await fetch(`${BASE}`, { headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener productos');
  }
  return res.json();
};

export const getProductosMasVendidos = async (limit = 10) => {
  const res = await fetch(`${BASE}/renovacion/mas-vendidos?limit=${limit}`, { headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener productos mas vendidos');
  }
  return res.json();
};

export const getSugerenciasReposicion = async () => {
  const res = await fetch(`${BASE}/renovacion/sugerencias`, { headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener sugerencias');
  }
  return res.json();
};
