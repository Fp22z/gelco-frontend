import { environment } from '../environments/environment';
import { getToken } from './authService';

const BASE = `${environment.url}/devoluciones`;
const PEDIDOS_BASE = `${environment.url}/pedidos`;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const getPedidosEntregados = async () => {
  const res = await fetch(`${PEDIDOS_BASE}/estado/Entregado`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener pedidos entregados');
  return res.json();
};

export const getPedidoById = async (id) => {
  const res = await fetch(`${PEDIDOS_BASE}/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Pedido no encontrado');
  return res.json();
};

export const getDisponibleParaDevolucion = async (detallePedidoId) => {
  const res = await fetch(`${BASE}/detalle/${detallePedidoId}/disponible`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener disponible');
  return res.json(); // { disponible: N }
};

export const crearDevolucion = async ({ detallePedidoId, cantidad, tipo, motivo, condicionProducto, observaciones }) => {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ detallePedidoId, cantidad, tipo, motivo, condicionProducto, observaciones })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al registrar devolución');
  }
  return res.json();
};

export const getDevoluciones = async () => {
  const res = await fetch(BASE, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener historial de devoluciones');
  return res.json();
};

export const getDevolucionesByDetalle = async (detallePedidoId) => {
  const res = await fetch(`${BASE}/detalle/${detallePedidoId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener devoluciones del ítem');
  return res.json();
};