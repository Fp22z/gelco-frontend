import { httpClient } from './httpClient';

export const getConsultoraByUsuario = async (usuarioId) => {
  const res = await httpClient.get(`/consultoras/usuario/${usuarioId}`);
  if (!res.ok) throw new Error('Error al obtener consultora');
  return res.json();
};

export const updateUsuario = async (usuarioId, nombre) => {
  const res = await httpClient.put(`/usuarios/${usuarioId}`, { nombre });
  if (!res.ok) throw new Error('Error al actualizar usuario');
  return res.json();
};

export const updateConsultora = async (consultoraId, datos) => {
  const params = new URLSearchParams();
  if (datos.dni !== undefined) params.append('dni', datos.dni || '');
  if (datos.telefono) params.append('telefono', datos.telefono);
  if (datos.direccion) params.append('direccion', datos.direccion);

  const res = await httpClient.put(`/consultoras/${consultoraId}?${params}`);
  if (!res.ok) throw new Error('Error al actualizar consultora');
  return res.json();
};

export const actualizarFoto = async (usuarioId, file) => {
  const formData = new FormData();
  formData.append('foto', file);

  const res = await httpClient.putForm(`/usuarios/${usuarioId}/foto`, formData);
  if (!res.ok) throw new Error('Error al subir la foto');
  return res.json();
};