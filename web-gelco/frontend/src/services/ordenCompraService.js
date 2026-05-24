import { environment } from '../environments/environment';
import { getToken } from './authService';

const BASE = `${environment.url}/ordenes-compra`;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const getPedidosDisponibles = async () => {
  const res = await fetch(`${BASE}/disponibles`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener pedidos disponibles');
  return res.json();
};

export const getMisOrdenes = async () => {
  const res = await fetch(`${BASE}/mis-ordenes`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener órdenes');
  return res.json();
};

export const generarOrdenes = async (pedidoIds) => {
  const res = await fetch(`${BASE}/generar`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(pedidoIds)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al generar órdenes');
  }
  return res.json();
};