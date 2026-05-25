import { environment } from '../environments/environment';
import { getToken } from './authService';

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// Obtener datos de consultora por usuarioId
export const getConsultoraByUsuario = async (usuarioId) => {
  const res = await fetch(`${environment.url}/consultoras/usuario/${usuarioId}`, {
    headers: headers()
  });
  if (!res.ok) throw new Error('Error al obtener consultora');
  return res.json();
};

// Actualizar nombre del usuario
export const updateUsuario = async (usuarioId, nombre) => {
  const res = await fetch(`${environment.url}/usuarios/${usuarioId}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ nombre })
  });
  if (!res.ok) throw new Error('Error al actualizar usuario');
  return res.json(); // ← ya devuelve { id, nombre, email, token }
};

// Actualizar datos de consultora
export const updateConsultora = async (consultoraId, datos) => {
  const params = new URLSearchParams();
  if (datos.dni !== undefined) params.append('dni', datos.dni || '');
  if (datos.telefono) params.append('telefono', datos.telefono);
  if (datos.direccion) params.append('direccion', datos.direccion);

  const res = await fetch(`${environment.url}/consultoras/${consultoraId}?${params}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Error al actualizar consultora');
  return res.json();
};

export const actualizarFoto = async (usuarioId, file) => {
  const formData = new FormData();
  formData.append('foto', file);

  const res = await fetch(`${environment.url}/usuarios/${usuarioId}/foto`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData
  });
  if (!res.ok) throw new Error('Error al subir la foto');
  return res.json();
};