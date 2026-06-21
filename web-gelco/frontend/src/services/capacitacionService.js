import { environment } from '../environments/environment';
import { getToken } from './authService';

const BASE = `${environment.url}`;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// ── Listar todas las capacitaciones
export const getCapacitaciones = async () => {
  const res = await fetch(`${BASE}/capacitaciones`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener capacitaciones');
  return res.json();
};

// ── Obtener capacitaciones de una consultora
export const getCapacitacionesByConsultora = async (consultoraId) => {
  const res = await fetch(`${BASE}/capacitaciones/consultora/${consultoraId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener capacitaciones');
  return res.json();
};

// ── Obtener mis capacitaciones (deriva consultoraId del JWT)
export const getMisCapacitaciones = async () => {
  const res = await fetch(`${BASE}/capacitaciones/mis-capacitaciones`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener mis capacitaciones');
  return res.json();
};

// ── Obtener consultoras inscritas en una capacitación
export const getConsultorasByCapacitacion = async (capacitacionId) => {
  const res = await fetch(`${BASE}/capacitaciones/${capacitacionId}/consultoras`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener consultoras');
  return res.json();
};

// ── Obtener preguntas de evaluación de una capacitación
export const getPreguntasByCapacitacion = async (capacitacionId) => {
  const res = await fetch(`${BASE}/capacitaciones/${capacitacionId}/preguntas`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener preguntas');
  return res.json();
};

// ── Crear nueva capacitación
export const crearCapacitacion = async (datos) => {
  const res = await fetch(`${BASE}/capacitaciones`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(datos)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al crear capacitación');
  }
  return res.json();
};

// ── Actualizar capacitación
export const actualizarCapacitacion = async (id, datos) => {
  const res = await fetch(`${BASE}/capacitaciones/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(datos)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al actualizar capacitación');
  }
  return res.json();
};

// ── Eliminar capacitación
export const eliminarCapacitacion = async (id) => {
  const res = await fetch(`${BASE}/capacitaciones/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Error al eliminar capacitación');
  return res.json();
};

// ── Inscribir consultora en capacitación (con consultoraId)
export const inscribirConsultora = async (capacitacionId, consultoraId) => {
  const params = new URLSearchParams();
  params.append('capacitacionId', capacitacionId);
  params.append('consultoraId', consultoraId);
  const res = await fetch(`${BASE}/capacitaciones/inscribir?${params.toString()}`, {
    method: 'POST',
    headers: authHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al inscribir');
  }
  return res.json();
};

// ── Auto-inscribirse (deriva consultoraId del JWT)
export const inscribirse = async (capacitacionId) => {
  const res = await fetch(`${BASE}/capacitaciones/${capacitacionId}/inscribirse`, {
    method: 'POST',
    headers: authHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al inscribirse');
  }
  return res.json();
};

// ── Completar capacitación (marcar como completada con puntaje)
export const completarCapacitacion = async (inscripcionId, puntaje) => {
  const params = new URLSearchParams();
  params.append('puntaje', puntaje);
  const res = await fetch(`${BASE}/capacitaciones/${inscripcionId}/completar?${params.toString()}`, {
    method: 'PUT',
    headers: authHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al completar');
  }
  return res.json();
};

// ── Eliminar inscripción
export const eliminarInscripcion = async (inscripcionId) => {
  const res = await fetch(`${BASE}/capacitaciones/inscripcion/${inscripcionId}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Error al eliminar inscripción');
  return res.json();
};

// ── Cancelar mi inscripción (deriva consultoraId del JWT)
export const cancelarMiInscripcion = async (capacitacionId) => {
  const res = await fetch(`${BASE}/capacitaciones/${capacitacionId}/cancelar`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al cancelar inscripción');
  }
  return res.json();
};
