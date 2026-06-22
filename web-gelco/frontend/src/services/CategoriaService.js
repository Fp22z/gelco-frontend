import { environment } from '../environments/environment';
import { getToken } from './authService';

const BASE = `${environment.url}/categorias`;

export const getCategorias = async () => {
  const res = await fetch(`${BASE}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    }
  });
  if (!res.ok) throw new Error('Error al obtener categorías');
  return res.json();
};
