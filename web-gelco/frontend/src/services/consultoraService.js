import { environment } from '../environments/environment';
import { getToken } from './authService';

const BASE = `${environment.url}`;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// ── Listar todas las consultoras
export const getConsultoras = async () => {
  const res = await fetch(`${BASE}/consultoras`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener consultoras');
  return res.json();
};

// ── Obtener consultora por ID
export const getConsultoraById = async (id) => {
  const res = await fetch(`${BASE}/consultoras/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Consultora no encontrada');
  return res.json();
};

// ── Registrar nueva consultora (crea usuario + consultora)
export const registrarConsultora = async (datos) => {
  const formData = new FormData();
  formData.append('nombre',    datos.nombre);
  formData.append('email',     datos.email);
  formData.append('password',  datos.password);
  formData.append('perfil',    'CONSULTORA');
  formData.append('nivel',      datos.nivel || 'Bronce');
  formData.append('dni',        datos.dni);
  formData.append('telefono',  datos.telefono);
  if (datos.direccion) formData.append('direccion', datos.direccion);

  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al registrar consultora');
  }
  return res.json();
};

// ── Actualizar datos de consultora (DNI, tel, dir, nivel)
export const actualizarConsultora = async (id, datos) => {
  const params = new URLSearchParams();

  // Enviamos siempre los campos, aunque estén vacíos
  if (datos.dni      !== undefined) params.append('dni',       datos.dni);
  if (datos.telefono !== undefined) params.append('telefono',  datos.telefono);
  if (datos.direccion!== undefined) params.append('direccion', datos.direccion);
  if (datos.nivel    !== undefined) params.append('nivel',     datos.nivel);

  const res = await fetch(`${BASE}/consultoras/${id}?${params.toString()}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status} al actualizar`);
  }

  return res.json();
};

// ── Activar / Desactivar consultora (toggle en usuario)
export const toggleEstadoConsultora = async (usuarioId) => {
  const res = await fetch(`${BASE}/usuarios/${usuarioId}/estado`, {
    method: 'PUT',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Error al cambiar estado');
  return res.json();
};