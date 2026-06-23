import { httpClient } from './httpClient';

const BASE = `/pedidos`;

export const getMisPedidos = async () => {
  const res = await httpClient.get(`${BASE}/mis-pedidos`);
  if (!res.ok) throw new Error('Error al obtener pedidos');
  return res.json();
};

export const getPedidoById = async (id) => {
  const res = await httpClient.get(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Error al obtener pedido');
  return res.json();
};

export const crearPedido = async (clienteId, items) => {
  const res = await httpClient.post(BASE, { clienteId, items });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al crear pedido');
  }
  return res.json();
};

export const updateEstadoPedido = async (id, estado) => {
  const res = await httpClient.put(`${BASE}/${id}/estado?estado=${encodeURIComponent(estado)}`);
  if (!res.ok) throw new Error('Error al actualizar estado');
  return res.json();
};