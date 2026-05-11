/**
 * Decode JWT token manually without any library
 * @param {string} token
 * @returns {Object} decoded payload
 */
const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get user session information from JWT token in localStorage
 * @returns {Object|null} { email, userId, nombre, perfil } or null if not logged in
 */
export const getInfoSession = () => {
  const token = localStorage.getItem('user_token');
  
  if (!token) {
    return null;
  }

  const payload = decodeToken(token);
  
  if (!payload) {
    return null;
  }

  return {
    email: payload.sub,
    userId: payload.id,
    nombre: payload.nombre,
    perfil: payload.perfil
  };
};
