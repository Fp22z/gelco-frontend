import { httpClient } from './httpClient';

const BASE = `/capacitaciones`;

export const getCapacitaciones = async () => {
  const res = await httpClient.get(BASE);
  if (!res.ok) throw new Error('Error al obtener capacitaciones');
  return res.json();
};

export const getCapacitacionesByConsultora = async (consultoraId) => {
  const res = await httpClient.get(`${BASE}/consultora/${consultoraId}`);
  if (!res.ok) throw new Error('Error al obtener capacitaciones');
  return res.json();
};

export const getMisCapacitaciones = async () => {
  const res = await httpClient.get(`${BASE}/mis-capacitaciones`);
  if (!res.ok) throw new Error('Error al obtener mis capacitaciones');
  return res.json();
};

export const getConsultorasByCapacitacion = async (capacitacionId) => {
  const res = await httpClient.get(`${BASE}/${capacitacionId}/consultoras`);
  if (!res.ok) throw new Error('Error al obtener consultoras');
  return res.json();
};

export const getPreguntasByCapacitacion = async (capacitacionId) => {
  const res = await httpClient.get(`${BASE}/${capacitacionId}/preguntas`);
  if (!res.ok) throw new Error('Error al obtener preguntas');
  return res.json();
};

export const crearCapacitacion = async (datos) => {
  const res = await httpClient.post(BASE, datos);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al crear capacitación');
  }
  return res.json();
};

export const actualizarCapacitacion = async (id, datos) => {
  const res = await httpClient.put(`${BASE}/${id}`, datos);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al actualizar capacitación');
  }
  return res.json();
};

export const eliminarCapacitacion = async (id) => {
  const res = await httpClient.delete(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Error al eliminar capacitación');
  return res.json();
};

export const inscribirConsultora = async (capacitacionId, consultoraId) => {
  const params = new URLSearchParams({ capacitacionId, consultoraId });
  const res = await httpClient.post(`${BASE}/inscribir?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al inscribir');
  }
  return res.json();
};

export const inscribirse = async (capacitacionId) => {
  const res = await httpClient.post(`${BASE}/${capacitacionId}/inscribirse`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al inscribirse');
  }
  return res.json();
};

export const completarCapacitacion = async (inscripcionId, puntaje) => {
  const params = new URLSearchParams({ puntaje });
  const res = await httpClient.put(`${BASE}/${inscripcionId}/completar?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al completar');
  }
  return res.json();
};

export const eliminarInscripcion = async (inscripcionId) => {
  const res = await httpClient.delete(`${BASE}/inscripcion/${inscripcionId}`);
  if (!res.ok) throw new Error('Error al eliminar inscripción');
  return res.json();
};

export const cancelarMiInscripcion = async (capacitacionId) => {
  const res = await httpClient.delete(`${BASE}/${capacitacionId}/cancelar`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al cancelar inscripción');
  }
  return res.json();
};

export const getEfektividadByCapacitacion = async (capacitacionId) => {
  const res = await httpClient.get(`${BASE}/${capacitacionId}/efectividad`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener efectividad');
  }
  return res.json();
};