/**
 * @typedef {Object} UserSesion
 * @property {string} email - User email
 * @property {number} userId - User ID
 * @property {string} nombre - User full name
 * @property {string} perfil - User role (ADMIN, CONSULTORA, SUPERVISOR)
 */

/**
 * Create a user session
 * @param {string} email
 * @param {number} userId
 * @param {string} nombre
 * @param {string} perfil
 * @returns {UserSesion}
 */
export const createUserSesion = (email, userId, nombre, perfil) => ({
  email,
  userId,
  nombre,
  perfil
});
