import { environment } from '../environments/environment';

const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getInfoSession = () => {
  const token = localStorage.getItem('user_token');
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload) return null;

  const exp = payload.exp;
  if (exp && Date.now() >= exp * 1000) {
    localStorage.removeItem('user_token');
    return null;
  }

  return {
    email: payload.sub,
    userId: payload.usuarioId,
    nombre: payload.nombre,
    perfil: payload.perfil
  };
};

export const isTokenExpired = () => {
  const token = localStorage.getItem('user_token');
  if (!token) return true;
  const payload = decodeToken(token);
  if (!payload) return true;
  const exp = payload.exp;
  if (!exp) return false;
  return Date.now() >= exp * 1000;
};

export const getTimeUntilExpiration = () => {
  const token = localStorage.getItem('user_token');
  if (!token) return 0;
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return 0;
  return Math.max(0, payload.exp * 1000 - Date.now());
};
