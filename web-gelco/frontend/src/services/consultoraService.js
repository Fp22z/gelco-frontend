import { httpClient } from './httpClient';

const BASE = `/consultoras`;

export const getConsultoras = async () => {
  const res = await httpClient.get(BASE);
  if (!res.ok) throw new Error('Error al obtener consultoras');
  return res.json();
};

export const getConsultoraById = async (id) => {
  const res = await httpClient.get(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Consultora no encontrada');
  return res.json();
};

export const registrarConsultora = async (datos) => {
  const formData = new FormData();
  formData.append('nombre',   datos.nombre);
  formData.append('email',    datos.email);
  formData.append('password', datos.password);
  formData.append('perfil',   'CONSULTORA');
  formData.append('nivel',    datos.nivel || 'Bronce');
  formData.append('dni',      datos.dni);
  formData.append('telefono', datos.telefono);
  if (datos.direccion) formData.append('direccion', datos.direccion);

  const res = await httpClient.postForm(`/auth/register`, formData);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al registrar consultora');
  }
  return res.json();
};

export const actualizarConsultora = async (id, datos) => {
  const params = new URLSearchParams();
  if (datos.dni       !== undefined) params.append('dni',       datos.dni);
  if (datos.telefono  !== undefined) params.append('telefono',  datos.telefono);
  if (datos.direccion !== undefined) params.append('direccion', datos.direccion);
  if (datos.nivel     !== undefined) params.append('nivel',     datos.nivel);

  const res = await httpClient.put(`${BASE}/${id}?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status} al actualizar`);
  }
  return res.json();
};

export const toggleEstadoConsultora = async (usuarioId) => {
  const res = await httpClient.put(`/usuarios/${usuarioId}/estado`);
  if (!res.ok) throw new Error('Error al cambiar estado');
  return res.json();
};