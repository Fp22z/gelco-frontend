import { environment } from '../environments/environment';
import { getToken } from './authService';

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const getClientes = async () => {
  const res = await fetch(`${environment.url}/clientes`, { headers: headers() });
  if (!res.ok) throw new Error('Error al obtener clientes');
  return res.json();
};

export const getClienteById = async (id) => {
  const res = await fetch(`${environment.url}/clientes/${id}`, { headers: headers() });
  if (!res.ok) throw new Error('Error al obtener cliente');
  return res.json();
};

export const createCliente = async (datos) => {
  const res = await fetch(`${environment.url}/clientes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(datos)
  });
  if (!res.ok) throw new Error('Error al crear cliente');
  return res.json();
};

export const updateCliente = async (id, datos) => {
  const res = await fetch(`${environment.url}/clientes/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(datos)
  });
  if (!res.ok) throw new Error('Error al actualizar cliente');
  return res.json();
};

export const deleteCliente = async (id) => {
  const res = await fetch(`${environment.url}/clientes/${id}`, {
    method: 'DELETE',
    headers: headers()
  });
  if (!res.ok) throw new Error('Error al eliminar cliente');
  return res.json();
};