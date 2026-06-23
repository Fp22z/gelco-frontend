import { httpClient } from './httpClient';

export const getCategorias = async () => {
  const res = await httpClient.get(`/categorias`);
  if (!res.ok) throw new Error('Error al obtener categorías');
  return res.json();
};