import { httpClient } from './httpClient';

const BASE = `/ordenes-compra`;

export const getPedidosDisponibles = async () => {
  const res = await httpClient.get(`${BASE}/disponibles`);
  if (!res.ok) throw new Error('Error al obtener pedidos disponibles');
  return res.json();
};

export const getMisOrdenes = async () => {
  const res = await httpClient.get(`${BASE}/mis-ordenes`);
  if (!res.ok) throw new Error('Error al obtener órdenes');
  return res.json();
};

export const generarOrdenes = async (pedidoIds) => {
  const res = await httpClient.post(`${BASE}/generar`, pedidoIds);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al generar órdenes');
  }
  return res.json();
};