import { environment } from '../environments/environment';
import { getToken } from './authService'; // <-- Unificado para usar la misma función

const BASE = `${environment.url}/pedidos`;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}` // <-- Actualizado
});

export const getMisPedidos = async () => {
  const res = await fetch(`${BASE}/mis-pedidos`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener pedidos');
  return res.json();
};

export const getPedidoById = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener pedido');
  return res.json();
};

export const crearPedido = async (clienteId, items) => {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ clienteId, items })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al crear pedido');
  }
  return res.json();
};

export const updateEstadoPedido = async (id, estado) => {
  const res = await fetch(`${BASE}/${id}/estado?estado=${encodeURIComponent(estado)}`, {
    method: 'PUT',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Error al actualizar estado');
  return res.json();
};