import { environment } from '../environments/environment';

export const login = async (credentials) => {
  const response = await fetch(`${environment.url}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Login failed');
  }
  return response.json();
};

export const register = async (data) => {
  const response = await fetch(`${environment.url}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Register failed');
  }
  return response.json();
};

export const registerWithPhoto = async (data) => {
  const formData = new FormData();
  formData.append('nombre', data.nombre);
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('perfil', data.perfil);
  formData.append('dni', data.dni);
  formData.append('telefono', data.telefono);
  if (data.direccion) formData.append('direccion', data.direccion);
  if (data.foto) formData.append('foto', data.foto);
  const response = await fetch(`${environment.url}/auth/register`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Register failed');
  }
  return response.json();
};

export const saveToken = (token) => { localStorage.setItem('user_token', token); };
export const logout = () => { localStorage.removeItem('user_token'); };
export const isLoggedIn = () => { return !!localStorage.getItem('user_token'); };
export const getToken = () => { return localStorage.getItem('user_token'); };
export const updateToken = (nuevoToken) => { localStorage.setItem('user_token', nuevoToken); };

export const forgotPassword = async (email) => {
  const response = await fetch(`${environment.url}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'No se pudo enviar el enlace de recuperacion');
  }
  return response.json();
};

export const resetPassword = async (data) => {
  const response = await fetch(`${environment.url}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'No se pudo restablecer la contrasena');
  }
  return response.json();
};

export const checkEmail = async (email) => {
  const response = await fetch(`${environment.url}/auth/check-email?email=${encodeURIComponent(email)}`);
  if (!response.ok) throw new Error('Error al verificar email');
  const data = await response.json();
  return data.exists;
};
