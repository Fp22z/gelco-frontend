import { httpClient } from './httpClient';

const BASE = `/clientes`;

export const getClientes = async () => {
  const res = await httpClient.get(BASE);
  if (!res.ok) throw new Error('Error al obtener clientes');
  return res.json();
};

export const getClienteById = async (id) => {
  const res = await httpClient.get(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Error al obtener cliente');
  return res.json();
};

export const createCliente = async (datos) => {
  const res = await httpClient.post(BASE, datos);
  if (!res.ok) throw new Error('Error al crear cliente');
  return res.json();
};

export const updateCliente = async (id, datos) => {
  const res = await httpClient.put(`${BASE}/${id}`, datos);
  if (!res.ok) throw new Error('Error al actualizar cliente');
  return res.json();
};

export const deleteCliente = async (id) => {
  const res = await httpClient.delete(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Error al eliminar cliente');
  return res.json();
};