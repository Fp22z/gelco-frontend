import { environment } from '../environments/environment';

/**
 * Login with email and password
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<Object>} { token }
 */
export const login = async (credentials) => {
  const response = await fetch(`${environment.url}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
};

/**
 * Register with email, password, and name
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.nombre
 * @returns {Promise<Object>} { token }
 */
export const register = async (data) => {
  const response = await fetch(`${environment.url}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Register failed');
  }

  return response.json();
};

/**
 * Save token to localStorage
 * @param {string} token
 */
export const saveToken = (token) => {
  localStorage.setItem('user_token', token);
};

/**
 * Remove token from localStorage
 */
export const logout = () => {
  localStorage.removeItem('user_token');
};

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem('user_token');
};

/**
 * Get token from localStorage
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem('user_token');
};
