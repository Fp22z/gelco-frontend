import { httpClient } from './httpClient';

const BASE = `/devoluciones`;
const PEDIDOS_BASE = `/pedidos`;

export const getPedidosEntregados = async () => {
  const res = await httpClient.get(`${PEDIDOS_BASE}/estado/Entregado`);
  if (!res.ok) throw new Error('Error al obtener pedidos entregados');
  return res.json();
};

export const getPedidoById = async (id) => {
  const res = await httpClient.get(`${PEDIDOS_BASE}/${id}`);
  if (!res.ok) throw new Error('Pedido no encontrado');
  return res.json();
};

export const getDisponibleParaDevolucion = async (detallePedidoId) => {
  const res = await httpClient.get(`${BASE}/detalle/${detallePedidoId}/disponible`);
  if (!res.ok) throw new Error('Error al obtener disponible');
  return res.json();
};

export const crearDevolucion = async ({ detallePedidoId, cantidad, tipo, motivo, condicionProducto, observaciones }) => {
  const res = await httpClient.post(BASE, { detallePedidoId, cantidad, tipo, motivo, condicionProducto, observaciones });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al registrar devolución');
  }
  return res.json();
};

export const getDevoluciones = async () => {
  const res = await httpClient.get(BASE);
  if (!res.ok) throw new Error('Error al obtener historial de devoluciones');
  return res.json();
};

export const getDevolucionesByDetalle = async (detallePedidoId) => {
  const res = await httpClient.get(`${BASE}/detalle/${detallePedidoId}`);
  if (!res.ok) throw new Error('Error al obtener devoluciones del ítem');
  return res.json();
};